/**
 * Test Suite: Public Notices Endpoint Logic & Response Contract.
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
 */

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

  return {
    id: n.id,
    slug: n.slug,
    title: n.title,
    category: n.category,
    categoryLabel: CATEGORY_LABEL_MAP[n.category] || n.category,
    summary: n.summary,
    content: n.content,
    isUrgent: n.isUrgent,
    fileUrl: n.fileUrl,
    fileSize: n.fileSize,
    publishDate: n.publishDate.toISOString(),
    publishedAt: n.publishedAt ? n.publishedAt.toISOString() : null,
    expiryDate: n.expiryDate ? n.expiryDate.toISOString() : null,
    isNew: n.isUrgent || n.publishDate >= sevenDaysAgo,
  };
}

function runSuite() {
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
  console.log("  Running Test Suite: Public Notices Endpoint Contract & Logic");
  console.log("==================================================================\n");

  const now = new Date("2026-11-13T12:00:00Z");
  const past3Days = new Date("2026-11-10T12:00:00Z");
  const past10Days = new Date("2026-11-03T12:00:00Z");
  const future5Days = new Date("2026-11-18T12:00:00Z");
  const past1Day = new Date("2026-11-12T12:00:00Z");

  // Sample notice records
  const sampleNotices = [
    {
      id: "notice_1",
      slug: "active-circular",
      title: "Active General Circular",
      category: "CIRCULAR",
      summary: "School holiday notification",
      content: "<p>School remains closed on Monday.</p>",
      isUrgent: false,
      isPublished: true,
      publishDate: past3Days,
      publishedAt: past3Days,
      expiryDate: null,
      authorId: "user_secret_1",
      displayOrder: 0,
    },
    {
      id: "notice_2",
      slug: "draft-notice",
      title: "Draft Notice in Preparation",
      category: "CIRCULAR",
      summary: "Draft preview",
      content: "<p>Internal only</p>",
      isUrgent: false,
      isPublished: false, // Draft
      publishDate: past3Days,
      publishedAt: null,
      expiryDate: null,
      authorId: "user_secret_2",
      displayOrder: 1,
    },
    {
      id: "notice_3",
      slug: "scheduled-exam-schedule",
      title: "Scheduled Exam Schedule",
      category: "EXAMINATION",
      summary: "Upcoming exam details",
      content: "<p>Future release</p>",
      isUrgent: false,
      isPublished: true,
      publishDate: future5Days, // Scheduled in future
      publishedAt: past3Days,
      expiryDate: null,
      authorId: "user_secret_3",
      displayOrder: 2,
    },
    {
      id: "notice_4",
      slug: "expired-event",
      title: "Expired Event Notice",
      category: "EVENT",
      summary: "Past sports meet",
      content: "<p>Concluded event</p>",
      isUrgent: false,
      isPublished: true,
      publishDate: past10Days,
      publishedAt: past10Days,
      expiryDate: past1Day, // Expired yesterday
      authorId: "user_secret_4",
      displayOrder: 3,
    },
    {
      id: "notice_5",
      slug: "urgent-admission-open",
      title: "Urgent Admission Notice 2026-27",
      category: "ADMISSION",
      summary: "Forms now available online",
      content: "<p>Last date 15 Dec 2026</p>",
      isUrgent: true,
      isPublished: true,
      publishDate: past10Days, // > 7 days ago, but isUrgent = true
      publishedAt: past10Days,
      expiryDate: future5Days,
      authorId: "user_secret_5",
      displayOrder: 0,
    },
  ];

  // -------------------------------------------------------------
  // 1. Lifecycle Exclusion Filtering
  // -------------------------------------------------------------
  console.log("--- 1. Lifecycle & Timestamp Exclusion Boundaries ---");
  const defaultWhere = buildWhereClause({}, now);

  const activeFiltered = sampleNotices.filter((n) => matchesWhere(n, defaultWhere, now));
  const activeIds = activeFiltered.map((n) => n.id);

  assert("Includes active notice without expiry", activeIds.includes("notice_1"));
  assert("Includes active notice with future expiry", activeIds.includes("notice_5"));
  assert("Strictly excludes draft notice (isPublished: false)", !activeIds.includes("notice_2"));
  assert("Strictly excludes scheduled notice (publishDate > now)", !activeIds.includes("notice_3"));
  assert("Strictly excludes expired notice (expiryDate <= now)", !activeIds.includes("notice_4"));
  assert("Only exactly 2 active notices matched", activeFiltered.length === 2);

  // -------------------------------------------------------------
  // 2. Query Filtering (Category & UrgentOnly)
  // -------------------------------------------------------------
  console.log("\n--- 2. Category & UrgentOnly Query Filtering ---");

  const categoryWhere = buildWhereClause({ category: "CIRCULAR" }, now);
  const circulars = sampleNotices.filter((n) => matchesWhere(n, categoryWhere, now));
  assert("Category filter CIRCULAR returns only circulars", circulars.length === 1 && circulars[0].id === "notice_1");

  const urgentWhere = buildWhereClause({ urgentOnly: true }, now);
  const urgentNotices = sampleNotices.filter((n) => matchesWhere(n, urgentWhere, now));
  assert("urgentOnly filter returns only urgent notices", urgentNotices.length === 1 && urgentNotices[0].id === "notice_5");

  // -------------------------------------------------------------
  // 3. Computed isNew Flag Logic
  // -------------------------------------------------------------
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

  const urgentOldNotice = {
    ...sampleNotices[0],
    id: "notice_urgent_old",
    publishDate: past10Days,
    isUrgent: true,
  };
  const dtoUrgentOld = projectPublicNoticeDto(urgentOldNotice, now);
  assert("Urgent notice published 10 days ago retains isNew: true", dtoUrgentOld.isNew === true);

  // -------------------------------------------------------------
  // 4. Strict DTO Whitelist Projection
  // -------------------------------------------------------------
  console.log("\n--- 4. DTO Whitelist Projection ---");

  const projectedKeys = Object.keys(dto1);
  const forbiddenKeys = ["authorId", "author", "internalAuditId", "password", "role"];

  for (const fKey of forbiddenKeys) {
    assert(`DTO does not expose forbidden key '${fKey}'`, !projectedKeys.includes(fKey));
  }
  assert("DTO includes categoryLabel", dto1.categoryLabel === "Circular");
  assert("DTO serializes publishDate to ISO string", typeof dto1.publishDate === "string");

  // -------------------------------------------------------------
  // 5. Pagination Metadata Math
  // -------------------------------------------------------------
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

  const p5 = calcPagination(45, 5, 10);
  assert("Page 5 hasNextPage false", p5.hasNextPage === false);
  assert("Page 5 hasPrevPage true", p5.hasPrevPage === true);

  const pEmpty = calcPagination(0, 1, 10);
  assert("0 items yields totalPages 1", pEmpty.totalPages === 1 && pEmpty.hasNextPage === false);

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
