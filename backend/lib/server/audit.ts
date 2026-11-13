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

export type TopperAuditAction =
  | "TOPPER_CREATED"
  | "TOPPER_UPDATED"
  | "TOPPER_DELETED";

export type NoticeAuditAction =
  | "NOTICE_CREATED"
  | "NOTICE_UPDATED"
  | "NOTICE_DELETED"
  | "NOTICE_STATUS_CHANGED";

export type AuditAction = AuthAuditAction | TopperAuditAction | NoticeAuditAction;

export interface CreateAuditLogParams {
  userId?: string | null;
  action: AuditAction;
  entityType: "User" | "Session" | "System" | "BoardResultTopper" | "Notice";
  entityId: string;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

/**
 * Strips sensitive keys (passwords, tokens, cookies, secrets) from any metadata object
 * to prevent accidental security leakage into audit logs.
 */
export function sanitizeAuditMetadata(
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
    "secretkey",
    "credential",
    "authorization",
    "apikey",
    "api_key",
  ]);

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    const lowerKey = key.toLowerCase();
    const isForbidden =
      forbiddenKeys.has(lowerKey) ||
      lowerKey.includes("password") ||
      lowerKey.includes("token") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("cookie");

    if (isForbidden) {
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
