/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const { z } = require("zod");

console.log("===============================================================");
console.log("  Running Frontend Notices Integration Unit Tests");
console.log("===============================================================");

// 1. Replicate Zod schemas from frontend/lib/api/notices.ts
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
});

const publicNoticesResponseSchema = z.object({
  data: z.array(publicNoticeSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().positive(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
  }),
});

function formatNoticeDate(isoString) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

function toNoticeCategory(cat) {
  const upper = String(cat).toUpperCase();
  if (upper === "CIRCULAR") return "Circular";
  if (upper === "EXAMINATION") return "Examination";
  if (upper === "ADMISSION") return "Admission";
  if (upper === "EVENT") return "Event";
  return "Circular";
}

function mapNoticeDtoToItem(dto) {
  return {
    id: dto.id,
    title: dto.title,
    category: toNoticeCategory(dto.categoryLabel || dto.category),
    date: formatNoticeDate(dto.publishDate),
    isNew: dto.isNew,
    fileUrl: dto.fileUrl || undefined,
    fileSize: dto.fileSize || undefined,
    summary: dto.summary || undefined,
    content: dto.content || undefined,
  };
}

function getBackendOrigin(env = process.env) {
  const envUrl = env.BACKEND_INTERNAL_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }

  if (env.NODE_ENV === "development") {
    return "http://127.0.0.1:3001";
  }

  return null;
}

const mockStaticNotices = [
  {
    id: "not-01",
    title: "Result of Entrance Exam held on 29.03.2026 Class – XI",
    category: "Examination",
    date: "29 Mar 2026",
    isNew: true,
    fileUrl: "/documents/original/entrance-2026-29th-march-2026-class-11.pdf",
    fileSize: "145 KB",
  },
];

async function simulateGetPublicNotices(mockFetchFn, env = { NODE_ENV: "development" }) {
  const backendOrigin = getBackendOrigin(env);
  if (!backendOrigin) {
    return {
      success: false,
      notices: mockStaticNotices,
      total: mockStaticNotices.length,
      isFallback: true,
    };
  }

  try {
    const res = await mockFetchFn();
    if (!res.ok) {
      return {
        success: false,
        notices: mockStaticNotices,
        total: mockStaticNotices.length,
        isFallback: true,
      };
    }

    const json = await res.json();
    const parseResult = publicNoticesResponseSchema.safeParse(json);
    if (!parseResult.success) {
      return {
        success: false,
        notices: mockStaticNotices,
        total: mockStaticNotices.length,
        isFallback: true,
      };
    }

    const dynamicNotices = parseResult.data.data.map(mapNoticeDtoToItem);
    if (dynamicNotices.length === 0) {
      return {
        success: true,
        notices: mockStaticNotices,
        total: mockStaticNotices.length,
        isFallback: true,
      };
    }

    return {
      success: true,
      notices: dynamicNotices,
      total: parseResult.data.pagination.totalItems,
      isFallback: false,
    };
  } catch {
    return {
      success: false,
      notices: mockStaticNotices,
      total: mockStaticNotices.length,
      isFallback: true,
    };
  }
}

// -------------------------------------------------------------
// 1. Environment & Origin Resolution Tests
// -------------------------------------------------------------
console.log("--- 1. Backend Origin Resolution Rules ---");
{
  assert.strictEqual(
    getBackendOrigin({ NODE_ENV: "development" }),
    "http://127.0.0.1:3001",
    "Defaults to loopback 3001 in development when unset"
  );

  assert.strictEqual(
    getBackendOrigin({ NODE_ENV: "production" }),
    null,
    "Strictly returns null in production when unset (no loopback fallback)"
  );

  assert.strictEqual(
    getBackendOrigin({
      NODE_ENV: "production",
      BACKEND_INTERNAL_URL: "https://backend.internal.devasthali.edu.in///",
    }),
    "https://backend.internal.devasthali.edu.in",
    "Strips trailing slashes and uses configured production URL"
  );
  console.log("  [PASS] Origin resolution rules verified");
}

// -------------------------------------------------------------
// 2. Schema Validation Tests
// -------------------------------------------------------------
console.log("\n--- 2. Public API Response Schema Validation ---");
{
  const validBackendResponse = {
    data: [
      {
        id: "notice-cuid-1",
        slug: "pre-board-examination-2026-datesheet",
        title: "Pre-Board Examination 2026 Date Sheet",
        category: "EXAMINATION",
        categoryLabel: "Examination",
        summary: "Timetable for Class 10 and 12 pre-boards",
        content: "<p>Begins Dec 1, 2026</p>",
        isUrgent: true,
        fileUrl: "/documents/exams/datesheet-2026.pdf",
        fileSize: "340 KB",
        publishDate: "2026-11-10T09:00:00.000Z",
        publishedAt: "2026-11-10T09:00:00.000Z",
        expiryDate: "2026-12-20T17:00:00.000Z",
        isNew: true,
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      totalItems: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };

  const parsed = publicNoticesResponseSchema.safeParse(validBackendResponse);
  assert.strictEqual(parsed.success, true, "Valid response parsed successfully");

  // Rejection of invalid category
  const badCategory = {
    ...validBackendResponse,
    data: [{ ...validBackendResponse.data[0], category: "SPORTS_DAY" }],
  };
  assert.strictEqual(publicNoticesResponseSchema.safeParse(badCategory).success, false);

  // Rejection of missing pagination
  const missingPagination = { data: validBackendResponse.data };
  assert.strictEqual(publicNoticesResponseSchema.safeParse(missingPagination).success, false);

  console.log("  [PASS] Zod schema acceptance and rejection rules verified");
}

// -------------------------------------------------------------
// 3. DTO to NoticeItem Mapping Tests
// -------------------------------------------------------------
console.log("\n--- 3. DTO Domain Mapping ---");
{
  const dto = {
    id: "not-101",
    slug: "annual-sports-meet-2026",
    title: "Annual Sports Meet 2026",
    category: "EVENT",
    categoryLabel: "Event",
    summary: "Track & field event details",
    content: "<p>Event details</p>",
    isUrgent: false,
    fileUrl: "/documents/events/sports.pdf",
    fileSize: "1.2 MB",
    publishDate: "2026-11-12T10:30:00.000Z",
    publishedAt: "2026-11-12T10:30:00.000Z",
    expiryDate: null,
    isNew: false,
  };

  const item = mapNoticeDtoToItem(dto);
  assert.strictEqual(item.id, "not-101");
  assert.strictEqual(item.title, "Annual Sports Meet 2026");
  assert.strictEqual(item.category, "Event");
  assert.strictEqual(item.isNew, false);
  assert.strictEqual(item.fileUrl, "/documents/events/sports.pdf");
  assert.strictEqual(item.fileSize, "1.2 MB");
  assert.strictEqual(item.summary, "Track & field event details");
  assert(item.date.includes("2026"), "Formatted date includes year");
  console.log("  [PASS] Mapping to NoticeItem verified");
}

// -------------------------------------------------------------
// 4. Static Fallback Resiliency Tests
// -------------------------------------------------------------
console.log("\n--- 4. Resilient Static Fallback Under Failure ---");
(async () => {
  // Case A: HTTP 500 error from backend
  const res500 = await simulateGetPublicNotices(async () => ({
    ok: false,
    status: 500,
  }));
  assert.strictEqual(res500.isFallback, true);
  assert.strictEqual(res500.notices.length, mockStaticNotices.length);

  // Case B: Network connection refused
  const resRefused = await simulateGetPublicNotices(async () => {
    throw new Error("ECONNREFUSED 127.0.0.1:3001");
  });
  assert.strictEqual(resRefused.isFallback, true);
  assert.strictEqual(resRefused.notices.length, mockStaticNotices.length);

  // Case C: Abort timeout error
  const resTimeout = await simulateGetPublicNotices(async () => {
    const err = new Error("The operation was aborted");
    err.name = "TimeoutError";
    throw err;
  });
  assert.strictEqual(resTimeout.isFallback, true);
  assert.strictEqual(resTimeout.notices.length, mockStaticNotices.length);

  // Case D: Zero published notices from backend returns static fallback
  const resEmpty = await simulateGetPublicNotices(async () => ({
    ok: true,
    json: async () => ({
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    }),
  }));
  assert.strictEqual(resEmpty.isFallback, true);
  assert.strictEqual(resEmpty.notices.length, mockStaticNotices.length);

  // Case E: Successful live response returns dynamic notices
  const resLive = await simulateGetPublicNotices(async () => ({
    ok: true,
    json: async () => ({
      data: [
        {
          id: "live-1",
          slug: "live-notice",
          title: "Live Active Notice",
          category: "CIRCULAR",
          categoryLabel: "Circular",
          summary: "Live announcement",
          content: null,
          isUrgent: true,
          fileUrl: null,
          fileSize: null,
          publishDate: "2026-11-13T00:00:00.000Z",
          publishedAt: "2026-11-13T00:00:00.000Z",
          expiryDate: null,
          isNew: true,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    }),
  }));
  assert.strictEqual(resLive.isFallback, false);
  assert.strictEqual(resLive.notices.length, 1);
  assert.strictEqual(resLive.notices[0].title, "Live Active Notice");

  console.log("  [PASS] All failure modes safely fall back to static notices");
  console.log("\n===============================================================");
  console.log("  All Frontend Notices Integration Unit Tests Passed Successfully!");
  console.log("===============================================================");
})();
