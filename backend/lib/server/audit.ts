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
  | "TOPPER_DELETED"
  | "TOPPER_STATUS_CHANGED"
  | "TOPPERS_REORDERED";

export type NoticeAuditAction =
  | "NOTICE_CREATED"
  | "NOTICE_UPDATED"
  | "NOTICE_DELETED"
  | "NOTICE_STATUS_CHANGED"
  | "NOTICES_REORDERED"
  | "NOTICE_ATTACHMENT_CREATED"
  | "NOTICE_ATTACHMENT_UPDATED"
  | "NOTICE_ATTACHMENT_DELETED"
  | "NOTICE_ATTACHMENT_STATUS_CHANGED"
  | "NOTICE_ATTACHMENTS_REORDERED"
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

export type AboutLeadershipAuditAction =
  | "ABOUT_SETTING_UPDATED"
  | "ABOUT_CREDENTIAL_CREATED"
  | "ABOUT_CREDENTIAL_UPDATED"
  | "ABOUT_CREDENTIAL_DELETED"
  | "ABOUT_CREDENTIAL_STATUS_CHANGED"
  | "ABOUT_CREDENTIALS_REORDERED"
  | "ABOUT_NARRATIVE_CREATED"
  | "ABOUT_NARRATIVE_UPDATED"
  | "ABOUT_NARRATIVE_DELETED"
  | "ABOUT_NARRATIVE_STATUS_CHANGED"
  | "ABOUT_NARRATIVES_REORDERED"
  | "VISION_MISSION_SETTING_UPDATED"
  | "CORE_VALUE_CREATED"
  | "CORE_VALUE_UPDATED"
  | "CORE_VALUE_DELETED"
  | "CORE_VALUE_STATUS_CHANGED"
  | "CORE_VALUES_REORDERED"
  | "LEADERSHIP_MEMBER_UPDATED"
  | "LEADERSHIP_MEMBER_STATUS_CHANGED"
  | "LEADERSHIP_MEMBERS_REORDERED";

export type FacultyAuditAction =
  | "FACULTY_MEMBER_CREATED"
  | "FACULTY_MEMBER_UPDATED"
  | "FACULTY_MEMBER_DELETED"
  | "FACULTY_MEMBER_STATUS_CHANGED"
  | "FACULTY_MEMBERS_REORDERED";

export type GalleryAuditAction =
  | "GALLERY_ALBUM_CREATED"
  | "GALLERY_ALBUM_UPDATED"
  | "GALLERY_ALBUM_DELETED"
  | "GALLERY_ALBUM_STATUS_CHANGED"
  | "GALLERY_ALBUMS_REORDERED"
  | "GALLERY_IMAGE_CREATED"
  | "GALLERY_IMAGE_UPDATED"
  | "GALLERY_IMAGE_DELETED"
  | "GALLERY_IMAGE_STATUS_CHANGED"
  | "GALLERY_IMAGES_REORDERED";

export type EventAuditAction =
  | "SCHOOL_EVENT_CREATED"
  | "SCHOOL_EVENT_UPDATED"
  | "SCHOOL_EVENT_DELETED"
  | "SCHOOL_EVENT_STATUS_CHANGED"
  | "SCHOOL_EVENTS_REORDERED";

export type DownloadAuditAction =
  | "DOWNLOAD_CATEGORY_CREATED"
  | "DOWNLOAD_CATEGORY_UPDATED"
  | "DOWNLOAD_CATEGORY_DELETED"
  | "DOWNLOAD_CATEGORY_STATUS_CHANGED"
  | "DOWNLOAD_CATEGORIES_REORDERED"
  | "DOWNLOAD_DOCUMENT_CREATED"
  | "DOWNLOAD_DOCUMENT_UPDATED"
  | "DOWNLOAD_DOCUMENT_DELETED"
  | "DOWNLOAD_DOCUMENT_STATUS_CHANGED"
  | "DOWNLOAD_DOCUMENTS_REORDERED";

export type AuditAction =
  | AuthAuditAction
  | TopperAuditAction
  | NoticeAuditAction
  | ProfileAuditAction
  | NavigationAuditAction
  | HomepageAuditAction
  | AboutLeadershipAuditAction
  | FacultyAuditAction
  | GalleryAuditAction
  | EventAuditAction
  | DownloadAuditAction;

export interface CreateAuditLogParams {
  userId?: string | null;
  action: AuditAction;
  entityType:
    | "User"
    | "Session"
    | "System"
    | "BoardResultTopper"
    | "Notice"
    | "NoticeAttachment"
    | "SiteProfile"
    | "CampusDirectoryEntry"
    | "NavigationItem"
    | "NavigationColumn"
    | "NavigationLinkItem"
    | "HomepageHero"
    | "HomepagePrincipalMessage"
    | "HomepageStatistic"
    | "HomepageHighlight"
    | "AboutPageSetting"
    | "AboutCredential"
    | "AboutNarrativeSection"
    | "VisionMissionSetting"
    | "InstitutionalCoreValue"
    | "LeadershipMember"
    | "FacultyMember"
    | "GalleryAlbum"
    | "GalleryImage"
    | "SchoolEvent"
    | "DownloadCategory"
    | "DownloadDocument";
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
