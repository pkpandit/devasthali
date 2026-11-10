import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { Prisma, Role, Session, User } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";

export const SESSION_COOKIE_NAME = "dvp_admin_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours absolute lifetime

/**
 * Safe user DTO strictly stripped of sensitive fields (passwordHash, etc.)
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  image: string | null;
  phoneNumber: string | null;
  lastLoginAt: Date | null;
}

export interface SessionValidationResult {
  session: {
    id: string;
    expiresAt: Date;
    createdAt: Date;
  };
  user: SafeUser;
}

/**
 * Transforms a Prisma User record into a SafeUser DTO.
 */
export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    image: user.image,
    phoneNumber: user.phoneNumber,
    lastLoginAt: user.lastLoginAt,
  };
}

/**
 * Generates a 32-byte cryptographically random bearer token (64 hex characters).
 */
export function generateBearerToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Computes the SHA-256 hex digest of a bearer token for safe database persistence.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a database session record and calculates the absolute expiration time.
 * Supports running within an existing Prisma transaction.
 */
export async function createDatabaseSession(
  userId: string,
  metadata?: { ipAddress?: string; userAgent?: string },
  tx?: Prisma.TransactionClient
): Promise<{ rawToken: string; session: Session }> {
  const db = tx ?? prisma;
  const rawToken = generateBearerToken();
  const sessionTokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  const session = await db.session.create({
    data: {
      sessionTokenHash,
      userId,
      expiresAt,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    },
  });

  return { rawToken, session };
}

/**
 * Validates a raw bearer token against the database:
 * 1. Computes SHA-256 digest of incoming raw token.
 * 2. Fetches Session joined with User.
 * 3. Enforces session expiration against current database/server time.
 * 4. Enforces user.isActive status.
 * 5. Returns a SafeUser DTO with live database role.
 */
export async function validateSessionToken(
  rawToken: string
): Promise<SessionValidationResult | null> {
  if (typeof rawToken !== "string" || rawToken.trim().length === 0) {
    return null;
  }

  const tokenHash = hashToken(rawToken);

  const sessionWithUser = await prisma.session.findUnique({
    where: { sessionTokenHash: tokenHash },
    include: { user: true },
  });

  if (!sessionWithUser) {
    return null;
  }

  const now = new Date();

  // Enforce session expiration
  if (sessionWithUser.expiresAt <= now) {
    // Proactively clean up expired session
    try {
      await prisma.session.delete({ where: { id: sessionWithUser.id } });
    } catch {
      // Ignore cleanup error if already deleted
    }
    return null;
  }

  // Enforce user active status
  if (!sessionWithUser.user.isActive) {
    // If account has been deactivated, revoke session immediately
    try {
      await prisma.session.delete({ where: { id: sessionWithUser.id } });
    } catch {
      // Ignore cleanup error
    }
    return null;
  }

  return {
    session: {
      id: sessionWithUser.id,
      expiresAt: sessionWithUser.expiresAt,
      createdAt: sessionWithUser.createdAt,
    },
    user: toSafeUser(sessionWithUser.user),
  };
}

/**
 * Deletes a session by its raw bearer token.
 * Returns the number of session rows deleted.
 */
export async function invalidateSessionByToken(rawToken: string): Promise<number> {
  if (typeof rawToken !== "string" || rawToken.trim().length === 0) return 0;
  const tokenHash = hashToken(rawToken);
  try {
    const result = await prisma.session.deleteMany({
      where: { sessionTokenHash: tokenHash },
    });
    return result.count;
  } catch {
    return 0;
  }
}

/**
 * Invalidates all active sessions for a user (used on password change or role modification).
 */
export async function invalidateAllUserSessions(userId: string): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: { userId },
  });
  return result.count;
}

/**
 * Applies the session cookie to the incoming response.
 * Cookie settings:
 * - httpOnly: true (prevents client-side JavaScript access)
 * - sameSite: "lax" (appropriate for same-origin admin navigation)
 * - path: "/"
 * - secure: true in HTTPS production, false in local HTTP development (127.0.0.1/localhost)
 * - maxAge: 8 hours (consistent with database expiresAt)
 */
export async function setSessionCookie(rawToken: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    expires: expiresAt,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Clears the session cookie safely.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });
}

/**
 * Reads the raw session token from incoming cookies.
 */
export async function getSessionCookieToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}
