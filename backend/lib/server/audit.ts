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
  | "NOTICE_STATUS_CHANGED"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_REPLACED"
  | "DOCUMENT_REMOVED"
  | "DOCUMENT_DELETED";

export type ProfileAuditAction =
  | "SITE_PROFILE_UPDATED"
  | "DIRECTORY_ENTRY_CREATED"
  | "DIRECTORY_ENTRY_UPDATED"
  | "DIRECTORY_ENTRY_DELETED"
  | "DIRECTORY_ENTRY_STATUS_CHANGED"
  | "DIRECTORY_ENTRIES_REORDERED";

export type NavigationAuditAction =
  | "NAVIGATION_ITEM_CREATED"
  | "NAVIGATION_ITEM_UPDATED"
  | "NAVIGATION_ITEM_DELETED"
  | "NAVIGATION_ITEM_STATUS_CHANGED"
  | "NAVIGATION_ITEMS_REORDERED"
  | "NAVIGATION_COLUMN_CREATED"
  | "NAVIGATION_COLUMN_UPDATED"
  | "NAVIGATION_COLUMN_DELETED"
  | "NAVIGATION_COLUMN_STATUS_CHANGED"
  | "NAVIGATION_COLUMNS_REORDERED"
  | "NAVIGATION_LINK_CREATED"
  | "NAVIGATION_LINK_UPDATED"
  | "NAVIGATION_LINK_DELETED"
  | "NAVIGATION_LINK_STATUS_CHANGED"
  | "NAVIGATION_LINKS_REORDERED";

export type HomepageAuditAction =
  | "HOMEPAGE_HERO_UPDATED"
  | "HOMEPAGE_PRINCIPAL_UPDATED"
  | "HOMEPAGE_STATISTIC_CREATED"
  | "HOMEPAGE_STATISTIC_UPDATED"
  | "HOMEPAGE_STATISTIC_DELETED"
  | "HOMEPAGE_STATISTIC_STATUS_CHANGED"
  | "HOMEPAGE_STATISTICS_REORDERED"
  | "HOMEPAGE_HIGHLIGHT_CREATED"
  | "HOMEPAGE_HIGHLIGHT_UPDATED"
  | "HOMEPAGE_HIGHLIGHT_DELETED"
  | "HOMEPAGE_HIGHLIGHT_STATUS_CHANGED"
  | "HOMEPAGE_HIGHLIGHTS_REORDERED";

export type AuditAction =
  | AuthAuditAction
  | TopperAuditAction
  | NoticeAuditAction
  | ProfileAuditAction
  | NavigationAuditAction
  | HomepageAuditAction;

export interface CreateAuditLogParams {
  userId?: string | null;
  action: AuditAction;
  entityType:
    | "User"
    | "Session"
    | "System"
    | "BoardResultTopper"
    | "Notice"
    | "SiteProfile"
    | "CampusDirectoryEntry"
    | "NavigationItem"
    | "NavigationColumn"
    | "NavigationLinkItem"
    | "HomepageHero"
    | "HomepagePrincipalMessage"
    | "HomepageStatistic"
    | "HomepageHighlight";
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

  const cleanObject = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(cleanObject);

    const record = obj as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(record)) {
      if (forbiddenKeys.has(key.toLowerCase())) {
        result[key] = "[REDACTED]";
      } else if (typeof val === "object" && val !== null) {
        result[key] = cleanObject(val);
      } else {
        result[key] = val;
      }
    }

    return result;
  };

  return cleanObject(meta) as Prisma.InputJsonValue;
}

/**
 * Records an immutable audit log entry.
 * If a transaction client (tx) is supplied, writes within that transaction.
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
