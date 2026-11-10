import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";

export type AuthAuditAction =
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILED"
  | "AUTH_LOGOUT"
  | "AUTH_PASSWORD_CHANGE"
  | "AUTH_STATUS_CHANGE"
  | "AUTH_USER_PROVISIONED";

export interface CreateAuditLogParams {
  userId?: string | null;
  action: AuthAuditAction;
  entityType: "User" | "Session" | "System";
  entityId: string;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

/**
 * Strips sensitive keys (passwords, tokens, cookies, secrets) from any metadata object
 * to prevent accidental security leakage into audit logs.
 */
function sanitizeAuditMetadata(
  meta?: Record<string, unknown> | null
): Prisma.InputJsonValue | undefined {
  if (!meta) return undefined;

  const forbiddenKeys = new Set([
    "password",
    "passwordhash",
    "token",
    "rawtoken",
    "sessiontoken",
    "cookie",
    "cookies",
    "secret",
    "credential",
    "authorization",
  ]);

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (forbiddenKeys.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeAuditMetadata(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as Prisma.InputJsonValue;
}

/**
 * Records an immutable audit log entry.
 * If a transaction client (tx) is supplied, writes within that transaction.
 *
 * Handling failed logins:
 * If the user does not exist in the database, userId is set to null, ensuring
 * foreign key constraints (users.id) are not violated.
 */
export async function recordAuditEvent(
  params: CreateAuditLogParams,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx ?? prisma;

  await db.auditLog.create({
    data: {
      userId: params.userId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: sanitizeAuditMetadata(params.metadata),
      ipAddress: params.ipAddress ?? null,
    },
  });
}
