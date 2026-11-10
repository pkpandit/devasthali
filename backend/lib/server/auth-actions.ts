"use server";

import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { recordAuditEvent } from "@/lib/server/audit";
import { DUMMY_ARGON2_HASH, verifyPassword } from "@/lib/server/password";
import { prisma } from "@/lib/server/prisma";
import { loginRateLimiter } from "@/lib/server/rate-limit";
import {
  clearSessionCookie,
  createDatabaseSession,
  getSessionCookieToken,
  hashToken,
  invalidateSessionByToken,
  setSessionCookie,
} from "@/lib/server/session";
import { loginInputSchema } from "@/lib/validation/auth";

export interface LoginActionState {
  error?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
}

/**
 * Sanitizes and validates internal return URLs to prevent open-redirect vulnerabilities.
 * Enforces single-slash internal relative paths and rejects external/escaped protocols.
 */
export async function sanitizeReturnUrl(url?: string | null): Promise<string> {
  if (!url || typeof url !== "string") {
    return "/admin";
  }

  const trimmed = url.trim();

  // Enforce internal-only paths: must start with single '/', must not start with '//' or '/\'
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return trimmed;
  }

  return "/admin";
}

/**
 * Extracts client IP for rate limiting and audit logging.
 *
 * TRUSTED-PROXY ARCHITECTURAL ASSUMPTION:
 * In local development, direct connections are used and x-forwarded-for may be absent
 * or client-provided. In production, Next.js MUST be deployed behind a trusted reverse
 * proxy (e.g. Nginx, Cloudflare, AWS ALB) that explicitly overwrites or validates the
 * X-Forwarded-For header to prevent client IP spoofing.
 */
async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return headerList.get("x-real-ip") || "127.0.0.1";
}

/**
 * Authenticates administrator credentials using Zod validation at the server boundary
 * and establishes a database-backed session upon credential verification.
 */
export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  // Safely extract raw FormData values (distinguish string from File / null)
  const emailEntry = formData.get("email");
  const passwordEntry = formData.get("password");
  const returnUrlEntry = formData.get("returnUrl");

  const rawInput = {
    email: typeof emailEntry === "string" ? emailEntry : "",
    password: typeof passwordEntry === "string" ? passwordEntry : "",
    returnUrl: typeof returnUrlEntry === "string" ? returnUrlEntry : undefined,
  };

  // Validate untrusted input using Zod safeParse
  const parseResult = loginInputSchema.safeParse(rawInput);

  if (!parseResult.success) {
    const fieldErrors: { email?: string; password?: string } = {};
    for (const issue of parseResult.error.issues) {
      const field = issue.path[0];
      if (field === "email" && !fieldErrors.email) {
        fieldErrors.email = issue.message;
      } else if (field === "password" && !fieldErrors.password) {
        fieldErrors.password = issue.message;
      }
    }
    return { fieldErrors };
  }

  // Use the validated/transformed values (email is automatically trimmed and lowercased)
  const { email: normalizedEmail, password, returnUrl: unvalidatedReturnUrl } = parseResult.data;

  // A basic Zod string check must not replace returnUrl security checks
  const returnUrl = await sanitizeReturnUrl(unvalidatedReturnUrl);

  const clientIp = await getClientIp();

  // Rate limit / throttling check (enforces both IP-tier and combined IP+Email tier)
  const rateCheck = loginRateLimiter.check(clientIp, normalizedEmail);
  if (!rateCheck.allowed) {
    return {
      error: `Too many failed login attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
    };
  }

  const headerList = await headers();
  const userAgent = headerList.get("user-agent") || undefined;

  // Query user by normalized email
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Verify credentials with timing attack mitigation:
  // If the user does not exist, compute verification against an authentic dummy Argon2id hash
  // so the network response time is comparable (~50ms) regardless of email existence.
  let isValidPassword = false;
  if (user) {
    isValidPassword = await verifyPassword(password, user.passwordHash);
  } else {
    await verifyPassword(password, DUMMY_ARGON2_HASH);
    isValidPassword = false;
  }

  // If user does not exist or password verification failed
  if (!user || !isValidPassword) {
    loginRateLimiter.recordFailure(clientIp, normalizedEmail);

    // Record audit failure without exposing password or raw token
    // If user is null, userId is null to respect foreign key constraints
    await recordAuditEvent({
      userId: user?.id ?? null,
      action: "AUTH_LOGIN_FAILED",
      entityType: "User",
      entityId: user ? user.id : "anonymous",
      metadata: {
        reason: "INVALID_CREDENTIALS",
        attemptedEmailDomain: normalizedEmail.includes("@")
          ? normalizedEmail.split("@")[1]
          : "unknown",
      },
      ipAddress: clientIp,
    });

    return {
      error: "Invalid email or password.",
    };
  }

  // Account active check: generic failure message shown to user to prevent account enumeration,
  // while the precise reason (ACCOUNT_DEACTIVATED) is preserved exclusively in internal audit logs.
  if (!user.isActive) {
    loginRateLimiter.recordFailure(clientIp, normalizedEmail);

    await recordAuditEvent({
      userId: user.id,
      action: "AUTH_LOGIN_FAILED",
      entityType: "User",
      entityId: user.id,
      metadata: { reason: "ACCOUNT_DEACTIVATED" },
      ipAddress: clientIp,
    });

    return {
      error: "Invalid email or password.",
    };
  }

  // Establish session and update lastLoginAt atomically inside a database transaction
  let rawSessionToken: string;
  let sessionExpiresAt: Date;

  try {
    const sessionData = await prisma.$transaction(async (tx) => {
      // 1. Create database session using the transaction client
      const { rawToken, session } = await createDatabaseSession(
        user.id,
        {
          ipAddress: clientIp,
          userAgent,
        },
        tx
      );

      // 2. Update user lastLoginAt
      await tx.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // 3. Record audit event
      await recordAuditEvent(
        {
          userId: user.id,
          action: "AUTH_LOGIN_SUCCESS",
          entityType: "Session",
          entityId: session.id,
          metadata: { role: user.role },
          ipAddress: clientIp,
        },
        tx
      );

      return { rawToken, expiresAt: session.expiresAt };
    });

    rawSessionToken = sessionData.rawToken;
    sessionExpiresAt = sessionData.expiresAt;
  } catch {
    // If the transaction fails, no session is left active in the database
    return {
      error: "An unexpected error occurred during login. Please try again.",
    };
  }

  // Set HTTP-only session cookie
  await setSessionCookie(rawSessionToken, sessionExpiresAt);

  // Clear failed rate limit attempts on success
  loginRateLimiter.reset(clientIp, normalizedEmail);

  // Redirect to verified internal return target
  redirect(returnUrl);
}

/**
 * Idempotently terminates an active administrator session and clears the cookie.
 * Ensures audit write failure does not prevent session invalidation or cookie clearing.
 */
export async function logoutAction(): Promise<void> {
  const rawToken = await getSessionCookieToken();
  const clientIp = await getClientIp();

  if (rawToken) {
    try {
      // Check session to log audit trail before deletion
      const sessionResult = await prisma.session.findUnique({
        where: { sessionTokenHash: hashToken(rawToken) },
        select: { id: true, userId: true },
      });

      if (sessionResult) {
        try {
          await recordAuditEvent({
            userId: sessionResult.userId,
            action: "AUTH_LOGOUT",
            entityType: "Session",
            entityId: sessionResult.id,
            ipAddress: clientIp,
          });
        } catch {
          // Non-blocking: audit failure must NOT prevent session invalidation
        }
      }

      await invalidateSessionByToken(rawToken);
    } catch {
      // Invalidation is idempotent
    }
  }

  await clearSessionCookie();
  redirect("/login");
}
