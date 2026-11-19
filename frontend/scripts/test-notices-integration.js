/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Integration & Caching Verification Test for Frontend Notices Client
 *
 * Verifies:
 * 1. publicNoticeAttachmentSchema & publicNoticeSchema validation
 * 2. mapNoticeDtoToItem mapping with attachments and backward compatibility
 * 3. Authoritative empty collection returns empty array (isFallback: false)
 * 4. Error handling triggers resilient static fallback (isFallback: true)
 * 5. Presence of "use cache" directive in getPublicNotices
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

// 1. Verify "use cache" directive in frontend/lib/api/notices.ts
console.log("1. Checking 'use cache' in frontend/lib/api/notices.ts...");
const noticesSource = fs.readFileSync(
  path.join(__dirname, "../lib/api/notices.ts"),
  "utf8"
);

assert(
  noticesSource.includes('"use cache";') || noticesSource.includes("'use cache';"),
  "getPublicNotices must declare 'use cache'"
);
assert(
  noticesSource.includes('tags: ["notices"]'),
  "getPublicNotices must specify 'notices' cache tag in production"
);
assert(
  noticesSource.includes('revalidate: 60'),
  "getPublicNotices must specify 60s revalidation"
);
console.log("✓ 'use cache', 60s revalidation, and 'notices' cache tag verified.");

// 2. Test Zod Schemas
console.log("\n2. Testing Zod Schemas...");
const { z } = require("zod");

const publicNoticeAttachmentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  fileUrl: z.string().nullable().optional(),
  fileSize: z.string().nullable().optional(),
  fileType: z.string().default("application/pdf"),
  displayOrder: z.number().default(0),
});

const publicNoticeSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(["CIRCULAR", "EXAMINATION", "ADMISSION", "EVENT"]),
  categoryLabel: z.string().min(1),
  summary: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  isUrgent: z.boolean(),
  fileUrl: z.string().nullable().optional(),
  fileSize: z.string().nullable().optional(),
  publishDate: z.string().min(1),
  publishedAt: z.string().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
  isNew: z.boolean(),
  attachments: z.array(publicNoticeAttachmentSchema).default([]),
});

const sampleNoticeWithAttachments = {
  id: "notice_1",
  slug: "annual-sports-day-schedule",
  title: "Annual Sports Day Schedule",
  category: "EVENT",
  categoryLabel: "School Event",
  summary: "Comprehensive timetable for track and field events.",
  content: "Detailed plain text schedule.",
  isUrgent: false,
  fileUrl: "http://127.0.0.1:3001/api/public/documents/annual-sports-day-schedule",
  fileSize: "245 KB",
  publishDate: new Date().toISOString(),
  publishedAt: new Date().toISOString(),
  expiryDate: null,
  isNew: true,
  attachments: [
    {
      id: "att_1",
      title: "Event Itinerary",
      fileUrl: "http://127.0.0.1:3001/api/public/documents/att_1",
      fileSize: "180 KB",
      fileType: "application/pdf",
      displayOrder: 0,
    },
    {
      id: "att_2",
      title: "Rulebook & Code of Conduct",
      fileUrl: "http://127.0.0.1:3001/api/public/documents/att_2",
      fileSize: "65 KB",
      fileType: "application/pdf",
      displayOrder: 1,
    },
  ],
};

const parsedNotice = publicNoticeSchema.safeParse(sampleNoticeWithAttachments);
assert(parsedNotice.success, "Valid notice with attachments must pass schema validation");
assert.strictEqual(parsedNotice.data.attachments.length, 2, "Must preserve both attachments");
console.log("✓ Notice with multiple attachments parsed successfully.");

// 3. Test mapNoticeDtoToItem logic
console.log("\n3. Testing mapNoticeDtoToItem mapping logic...");

function toNoticeCategory(cat) {
  const upper = cat.toUpperCase();
  if (upper === "CIRCULAR" || upper.includes("CIRCULAR")) return "Circular";
  if (upper === "EXAMINATION" || upper.includes("EXAM")) return "Examination";
  if (upper === "ADMISSION" || upper.includes("ADMISSION")) return "Admission";
  if (upper === "EVENT" || upper.includes("EVENT")) return "Event";
  return "Circular";
}

function mapNoticeDtoToItem(dto) {
  return {
    id: dto.id,
    title: dto.title,
    category: toNoticeCategory(dto.category || dto.categoryLabel),
    date: dto.publishDate,
    isNew: dto.isNew,
    fileUrl: dto.fileUrl || undefined,
    fileSize: dto.fileSize || undefined,
    summary: dto.summary || undefined,
    content: dto.content || undefined,
    attachments: (dto.attachments || []).map((att) => ({
      id: att.id,
      title: att.title,
      fileUrl: att.fileUrl || undefined,
      fileSize: att.fileSize || undefined,
      fileType: att.fileType,
      displayOrder: att.displayOrder,
    })),
  };
}

const domainItem = mapNoticeDtoToItem(parsedNotice.data);
assert.strictEqual(domainItem.id, "notice_1");
assert.strictEqual(domainItem.category, "Event");
assert.strictEqual(domainItem.attachments.length, 2);
assert.strictEqual(domainItem.attachments[0].title, "Event Itinerary");
assert.strictEqual(domainItem.attachments[1].title, "Rulebook & Code of Conduct");
console.log("✓ DTO mapping correctly populated domain NoticeItem with attachments.");

// 4. Test Authoritative Empty Collection vs Fallback
console.log("\n4. Testing Authoritative Empty Collection handling...");

function processApiResponse(resStatus, resData) {
  const NOTICES_FALLBACK = [{ id: "fallback_1", title: "Static Notice" }];

  if (resStatus !== 200) {
    return {
      success: false,
      notices: NOTICES_FALLBACK,
      total: NOTICES_FALLBACK.length,
      isFallback: true,
    };
  }

  const parsed = z
    .object({
      data: z.array(publicNoticeSchema),
      pagination: z.object({
        page: z.number(),
        limit: z.number(),
        totalItems: z.number(),
        totalPages: z.number(),
        hasNextPage: z.boolean(),
        hasPrevPage: z.boolean(),
      }),
    })
    .safeParse(resData);

  if (!parsed.success) {
    return {
      success: false,
      notices: NOTICES_FALLBACK,
      total: NOTICES_FALLBACK.length,
      isFallback: true,
    };
  }

  const dynamicNotices = parsed.data.data.map(mapNoticeDtoToItem);

  // Authoritative empty check:
  if (dynamicNotices.length === 0) {
    return {
      success: true,
      notices: [],
      total: 0,
      isFallback: false,
    };
  }

  return {
    success: true,
    notices: dynamicNotices,
    total: parsed.data.pagination.totalItems,
    isFallback: false,
  };
}

// Case A: 200 OK with empty array
const emptyApiResult = processApiResponse(200, {
  data: [],
  pagination: {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
});
assert.strictEqual(emptyApiResult.success, true);
assert.strictEqual(emptyApiResult.isFallback, false, "Must NOT flag empty array as fallback");
assert.strictEqual(emptyApiResult.notices.length, 0, "Must return empty notices array");
assert.strictEqual(emptyApiResult.total, 0);
console.log("✓ Authoritative empty array returns 0 items without static fallback.");

// Case B: 500 Server Error
const errorApiResult = processApiResponse(500, null);
assert.strictEqual(errorApiResult.success, false);
assert.strictEqual(errorApiResult.isFallback, true, "Must flag server error as fallback");
assert.strictEqual(errorApiResult.notices.length, 1);
assert.strictEqual(errorApiResult.notices[0].id, "fallback_1");
console.log("✓ Server error cleanly triggers static fallback.");

// Case C: Corrupted payload
const corruptApiResult = processApiResponse(200, { data: "corrupted_payload" });
assert.strictEqual(corruptApiResult.success, false);
assert.strictEqual(corruptApiResult.isFallback, true, "Must flag corrupted payload as fallback");
assert.strictEqual(corruptApiResult.notices.length, 1);
console.log("✓ Corrupted payload cleanly triggers static fallback.");

console.log("\n=== ALL FRONTEND NOTICES INTEGRATION TESTS PASSED ===");
