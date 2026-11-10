import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Role } from "@prisma/client";
import {
  getSessionCookieToken,
  validateSessionToken,
  type SafeUser,
  type SessionValidationResult,
} from "@/lib/server/session";

export class AuthorizationError extends Error {
  public readonly requiredRoles: Role[];
  public readonly userRole: Role;

  constructor(message: string, requiredRoles: Role[], userRole: Role) {
    super(message);
    this.name = "AuthorizationError";
    this.requiredRoles = requiredRoles;
    this.userRole = userRole;
  }
}

/**
 * Retrieves the currently active session and user from the incoming cookie.
 * Returns null if the cookie is missing, invalid, expired, or the user is inactive.
 *
 * CACHING ARCHITECTURE:
 * Wrapped in React's request-scoped cache() utility. This provides request-level
 * deduplication so multiple callers (AdminLayout, AdminWorkspacePage, action guards)
 * within the same HTTP render pass do not execute duplicate database queries.
 * It is automatically discarded at the conclusion of the request and is NEVER
 * shared across multiple requests or different users.
 */
export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult | null> => {
    const token = await getSessionCookieToken();
    if (!token) return null;
    return validateSessionToken(token);
  }
);

/**
 * Retrieves the currently active user, or null if unauthenticated.
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const result = await getCurrentSession();
  return result?.user ?? null;
}

/**
 * Enforces that a request has an active, valid administrator session.
 * If unauthenticated or expired, redirects to /login.
 */
export async function requireUser(returnUrl?: string): Promise<SafeUser> {
  const current = await getCurrentUser();
  if (!current) {
    const loginTarget = returnUrl
      ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
      : "/login";
    redirect(loginTarget);
  }
  return current;
}

/**
 * Enforces that the authenticated user possesses one of the required administrative roles.
 */
export async function requireRole(
  allowedRoles: Role[],
  returnUrl?: string
): Promise<SafeUser> {
  const user = await requireUser(returnUrl);

  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError(
      `Access denied. Role '${user.role}' is not authorized for this operation.`,
      allowedRoles,
      user.role
    );
  }

  return user;
}
