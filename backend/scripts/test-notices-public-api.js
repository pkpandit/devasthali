/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Public Notices Endpoint Logic & Response Contract with Attachments.
 * Validates:
 * 1. Filtering logic: category matching, urgentOnly flag.
 * 2. Status & timestamp exclusion boundaries:
 *    - Drafts (isPublished: false) strictly excluded.
 *    - Scheduled notices (publishDate > now) strictly excluded.
 *    - Expired notices (expiryDate <= now) strictly excluded.
 *    - Active notices (isPublished: true, publishDate <= now, expiryDate > now or null) included.
 * 3. Computed isNew flag (< 7 days or isUrgent).
 * 4. Pagination metadata (page, limit, totalItems, totalPages, hasNextPage, hasPrevPage).
 * 5. Strict DTO projection whitelist (no sensitive internal fields exposed).
 * 6. Attachments array projection and ordering.
 * 7. Live database integration with Prisma.
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: ".env" });

const CATEGORY_LABEL_MAP = {
  CIRCULAR: "Circular",
  EXAMINATION: "Examination",
  ADMISSION: "Admission",
  EVENT: "Event",
};

function buildWhereClause(query, now = new Date()) {
  const where = {
    isPublished: true,
    publishDate: { lte: now },
    OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
  };

  if (query.category && Object.keys(CATEGORY_LABEL_MAP).includes(query.category.toUpperCase())) {
    where.category = query.category.toUpperCase();
  }

  if (query.urgentOnly === true || query.urgentOnly === "true") {
    where.isUrgent = true;
  }

  return where;
}

function matchesWhere(notice, where, now = new Date()) {
  if (where.isPublished !== undefined && notice.isPublished !== where.isPublished) {
    return false;
  }
  if (where.publishDate?.lte && notice.publishDate > where.publishDate.lte) {
    return false;
  }
  if (where.OR) {
    const isExpiryNull = notice.expiryDate === null || notice.expiryDate === undefined;
    const isExpiryFuture = notice.expiryDate && notice.expiryDate > now;
    if (!isExpiryNull && !isExpiryFuture) {
      return false;
    }
  }
  if (where.category && notice.category !== where.category) {
    return false;
  }
  if (where.isUrgent && notice.isUrgent !== true) {
    return false;
  }
  return true;
}

function projectPublicNoticeDto(n, now = new Date()) {
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const mappedAttachments = (n.attachments || []).map((att) => ({
    id: att.id,
    title: att.title,
    fileUrl: att.fileStorageKey ? `/api/public/documents/${att.id}` : att.fileUrl,
    fileSize: att.fileSize || null,
    fileType: att.fileType || "application/pdf",
    displayOrder: att.displayOrder ?? 0,
  }));

  const finalAttachments = mappedAttachments.length > 0
    ? mappedAttachments
    : (n.fileUrl ? [{
        id: `att_${n.id}`,
        title: n.title,
        fileUrl: n.fileUrl,
        fileSize: n.fileSize || null,
        fileType: "application/pdf",
        displayOrder: 0,
      }] : []);

  return {
    id: n.id,
    slug: n.slug,
    title: n.title,
    category: n.category,
    categoryLabel: CATEGORY_LABEL_MAP[n.category] || n.category,
    summary: n.summary,
    content: n.content,
    isUrgent: n.isUrgent,
    fileUrl: n.fileUrl || (finalAttachments[0]?.fileUrl ?? null),
    fileSize: n.fileSize || (finalAttachments[0]?.fileSize ?? null),
    attachments: finalAttachments,
    publishDate: n.publishDate.toISOString(),
    publishedAt: n.publishedAt ? n.publishedAt.toISOString() : null,
    expiryDate: n.expiryDate ? n.expiryDate.toISOString() : null,
    isNew: n.isUrgent || n.publishDate >= sevenDaysAgo,
  };
}

async function runSuite() {
  const results = [];

  function assert(name, condition, details = "") {
    results.push({ name, passed: Boolean(condition), details });
    if (!condition) {
      console.error(`  [FAIL] ${name}: ${details}`);
    } else {
      console.log(`  [PASS] ${name}`);
    }
  }

  console.log("==================================================================");
  console.log("  Running Test Suite: Public Notices Endpoint Contract & Attachments");
  console.log("==================================================================\n");

  const now = new Date("2026-11-13T12:00:00Z");
  const past3Days = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const past10Days = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const future5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

  const sampleNotices = [
    {
      id: "notice_1",
      slug: "active-circular-no-expiry",
      title: "Active Circular No Expiry",
      category: "CIRCULAR",
      summary: "Active summary",
      content: "Active content",
      isUrgent: false,
      isPublished: true,
      fileUrl: "/documents/sample.pdf",
      fileSize: "150 KB",
      publishDate: past3Days,
      publishedAt: past3Days,
      expiryDate: null,
      attachments: [
        { id: "att_1", title: "Document A", fileUrl: "/documents/sample.pdf", fileSize: "150 KB", fileType: "application/pdf", displayOrder: 0 },
      ],
    },
    {
      id: "notice_2",
      slug: "active-admission-future-expiry",
      title: "Active Admission Future Expiry",
      category: "ADMISSION",
      summary: "Admission open",
      content: "Details",
      isUrgent: true,
      isPublished: true,
      fileUrl: null,
      fileSize: null,
      publishDate: past10Days,
      publishedAt: past10Days,
      expiryDate: future5Days,
      attachments: [],
    },
    {
      id: "notice_3",
      slug: "draft-notice",
      title: "Draft Notice",
      category: "CIRCULAR",
      summary: "Draft",
      content: "Draft",
      isUrgent: false,
      isPublished: false,
      fileUrl: null,
      fileSize: null,
      publishDate: past3Days,
      publishedAt: null,
      expiryDate: null,
      attachments: [],
    },
    {
      id: "notice_4",
      slug: "scheduled-future-notice",
      title: "Scheduled Future Notice",
      category: "EVENT",
      summary: "Upcoming",
      content: "Upcoming",
      isUrgent: false,
      isPublished: true,
      fileUrl: null,
      fileSize: null,
      publishDate: future5Days,
      publishedAt: past3Days,
      expiryDate: null,
      attachments: [],
    },
    {
      id: "notice_5",
      slug: "expired-exam-notice",
      title: "Expired Exam Notice",
      category: "EXAMINATION",
      summary: "Exam date passed",
      content: "Passed",
      isUrgent: true,
      isPublished: true,
      fileUrl: "/documents/exam.pdf",
      fileSize: "200 KB",
      publishDate: past10Days,
      publishedAt: past10Days,
      expiryDate: past3Days,
      attachments: [],
    },
  ];

  // 1. Lifecycle & Timestamp Exclusion Boundaries
  console.log("--- 1. Lifecycle & Timestamp Exclusion Boundaries ---");
  const activeWhere = buildWhereClause({}, now);
  const activeNotices = sampleNotices.filter((n) => matchesWhere(n, activeWhere, now));

  assert("Includes active notice without expiry", activeNotices.some((n) => n.id === "notice_1"));
  assert("Includes active notice with future expiry", activeNotices.some((n) => n.id === "notice_2"));
  assert("Strictly excludes draft notice (isPublished: false)", !activeNotices.some((n) => n.id === "notice_3"));
  assert("Strictly excludes scheduled notice (publishDate > now)", !activeNotices.some((n) => n.id === "notice_4"));
  assert("Strictly excludes expired notice (expiryDate <= now)", !activeNotices.some((n) => n.id === "notice_5"));
  assert("Only exactly 2 active notices matched", activeNotices.length === 2);

  // 2. Query Filtering
  console.log("\n--- 2. Category & UrgentOnly Query Filtering ---");
  const categoryWhere = buildWhereClause({ category: "CIRCULAR" }, now);
  const circulars = sampleNotices.filter((n) => matchesWhere(n, categoryWhere, now));
  assert("Category filter CIRCULAR returns only circulars", circulars.length === 1 && circulars[0].id === "notice_1");

  const urgentWhere = buildWhereClause({ urgentOnly: true }, now);
  const urgentNotices = sampleNotices.filter((n) => matchesWhere(n, urgentWhere, now));
  assert("urgentOnly filter returns only urgent notices", urgentNotices.length === 1 && urgentNotices[0].id === "notice_2");

  // 3. Computed isNew Flag
  console.log("\n--- 3. Computed isNew Flag ---");
  const dto1 = projectPublicNoticeDto(sampleNotices[0], now);
  assert("Notice published 3 days ago (< 7 days) has isNew: true", dto1.isNew === true);

  const nonUrgentOldNotice = {
    ...sampleNotices[0],
    id: "notice_old",
    publishDate: past10Days,
    isUrgent: false,
  };
  const dtoOld = projectPublicNoticeDto(nonUrgentOldNotice, now);
  assert("Non-urgent notice published 10 days ago (> 7 days) has isNew: false", dtoOld.isNew === false);

  // 4. DTO Whitelist Projection & Attachments
  console.log("\n--- 4. DTO Whitelist Projection & Attachments ---");
  const projectedKeys = Object.keys(dto1);
  const forbiddenKeys = ["authorId", "author", "internalAuditId", "password", "role", "fileStorageKey", "fileSha256"];

  for (const fKey of forbiddenKeys) {
    assert(`DTO does not expose forbidden key '${fKey}'`, !projectedKeys.includes(fKey));
  }
  assert("DTO includes categoryLabel", dto1.categoryLabel === "Circular");
  assert("DTO serializes publishDate to ISO string", typeof dto1.publishDate === "string");
  assert("DTO includes attachments array", Array.isArray(dto1.attachments));
  assert("Attachment contains id, title, fileUrl, fileSize, displayOrder",
    Boolean(dto1.attachments[0].id && dto1.attachments[0].title && dto1.attachments[0].fileUrl && dto1.attachments[0].displayOrder !== undefined)
  );

  const attKeys = Object.keys(dto1.attachments[0]);
  assert("Attachment does not leak fileStorageKey", !attKeys.includes("fileStorageKey"));
  assert("Attachment does not leak fileSizeBytes", !attKeys.includes("fileSizeBytes"));

  // 5. Pagination Calculations
  console.log("\n--- 5. Pagination Calculations ---");
  function calcPagination(totalItems, page, limit) {
    const totalPages = Math.ceil(totalItems / limit) || 1;
    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  const p1 = calcPagination(45, 1, 10);
  assert("Page 1 of 5 has totalPages 5", p1.totalPages === 5);
  assert("Page 1 hasNextPage true", p1.hasNextPage === true);
  assert("Page 1 hasPrevPage false", p1.hasPrevPage === false);

  // 6. Live Database Verification
  console.log("\n--- 6. Live Database Integration ---");
  const prisma = new PrismaClient();
  try {
    const dbNotices = await prisma.notice.findMany({
      where: { isPublished: true },
      include: {
        attachments: {
          where: { isPublished: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    assert("Live DB query returns notices", dbNotices.length > 0);
    const noticesWithAtts = dbNotices.filter((n) => n.attachments.length > 0);
    assert("Live DB notices have related NoticeAttachment records", noticesWithAtts.length > 0);
    assert("NoticeAttachment records have valid titles and URLs",
      noticesWithAtts.every((n) => n.attachments.every((a) => a.title && (a.fileUrl || a.fileStorageKey)))
    );
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n==================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`  Tests completed: ${passed}/${total} passed (${failed} failed)`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite();
