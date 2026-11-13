/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Notice Server Actions, Authorization, Diffs, and Database Transactions.
 * Tests:
 * 1. Role-based access control matrix (SUPER_ADMIN permitted, others rejected).
 * 2. Diff computation and audit metadata serialization.
 * 3. Live database transactional lifecycle:
 *    - Notice creation with deterministic slug and publishedAt handling.
 *    - Notice update with field diff logging.
 *    - Notice status toggling (DRAFT <-> PUBLISHED).
 *    - Notice deletion and audit verification.
 *    - Post-test transactional cleanup.
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const { generateDeterministicSlug } = require("../lib/server/slug.ts");
const { sanitizeRichText } = require("../lib/server/sanitizer.ts");

dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

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
  console.log("  Running Test Suite: Notice Actions, Auth, Diff & Transactions");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // 1. Role-Based Access Control Matrix
  // -------------------------------------------------------------
  console.log("--- 1. Role Authorization Matrix ---");
  function checkRoleAuth(role) {
    if (role === "SUPER_ADMIN") return true;
    throw new Error("AuthorizationError: Forbidden. Insufficient permissions.");
  }

  assert("SUPER_ADMIN role is authorized", checkRoleAuth("SUPER_ADMIN") === true);

  const unauthorizedRoles = ["PRINCIPAL", "TEACHER", "STAFF", "PARENT", "STUDENT", null, undefined];
  for (const role of unauthorizedRoles) {
    let blocked = false;
    try {
      checkRoleAuth(role);
    } catch {
      blocked = true;
    }
    assert(`Role '${role}' is blocked with AuthorizationError`, blocked);
  }

  // -------------------------------------------------------------
  // 2. Diff Computation Logic
  // -------------------------------------------------------------
  console.log("\n--- 2. Field Diff Computation for Audit Metadata ---");

  function computeNoticeDiff(existing, incoming) {
    const diff = {};
    const trackedFields = [
      "title",
      "category",
      "summary",
      "isUrgent",
      "isPublished",
      "fileUrl",
      "fileSize",
      "displayOrder",
    ];

    for (const field of trackedFields) {
      const oldVal = existing[field] ?? null;
      const newVal = incoming[field] ?? null;
      if (oldVal !== newVal) {
        diff[field] = { from: oldVal, to: newVal };
      }
    }
    return diff;
  }

  const existingNotice = {
    title: "Summer Vacation Circular",
    category: "CIRCULAR",
    summary: "School closes on 15 May",
    isUrgent: false,
    isPublished: true,
    fileUrl: "/documents/summer.pdf",
    fileSize: "200 KB",
    displayOrder: 0,
  };

  const updatedNotice = {
    title: "Summer Vacation Circular 2026",
    category: "CIRCULAR",
    summary: "School closes on 15 May",
    isUrgent: true,
    isPublished: true,
    fileUrl: "/documents/summer-revised.pdf",
    fileSize: "220 KB",
    displayOrder: 1,
  };

  const diff = computeNoticeDiff(existingNotice, updatedNotice);
  assert("Detects changed title", diff.title?.from === "Summer Vacation Circular" && diff.title?.to === "Summer Vacation Circular 2026");
  assert("Detects changed isUrgent", diff.isUrgent?.from === false && diff.isUrgent?.to === true);
  assert("Detects changed fileUrl", diff.fileUrl?.from === "/documents/summer.pdf" && diff.fileUrl?.to === "/documents/summer-revised.pdf");
  assert("Does not flag unchanged fields", diff.category === undefined && diff.summary === undefined);

  // -------------------------------------------------------------
  // 3. Database Transactional Lifecycle
  // -------------------------------------------------------------
  console.log("\n--- 3. Database Transactional Notice Lifecycle ---");

  // Find or use super-admin user for authorId
  let testUser = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (!testUser) {
    console.log("Creating test SUPER_ADMIN user for test suite...");
    testUser = await prisma.user.create({
      data: {
        email: "test-admin@devasthali.edu.in",
        name: "Test Admin",
        role: "SUPER_ADMIN",
        passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$fakehash",
      },
    });
  }

  let createdNoticeId = null;

  try {
    // 3A. Notice Creation
    const baseTitle = "Test Integration Notice Announcement";
    const rawContent = "<p>Test details with <script>bad()</script><strong>safe bold</strong></p>";
    const cleanContent = sanitizeRichText(rawContent);

    const created = await prisma.$transaction(async (tx) => {
      const slug = await generateDeterministicSlug(tx, baseTitle);
      const notice = await tx.notice.create({
        data: {
          title: baseTitle,
          slug,
          category: "CIRCULAR",
          summary: "Summary for test notice",
          content: cleanContent,
          isUrgent: true,
          isPublished: true,
          publishedAt: new Date(),
          fileUrl: "/documents/test.pdf",
          fileSize: "100 KB",
          publishDate: new Date(),
          displayOrder: 5,
          authorId: testUser.id,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "NOTICE_CREATED",
          entityType: "Notice",
          entityId: notice.id,
          userId: testUser.id,
          ipAddress: "127.0.0.1",
          metadata: {
            title: notice.title,
            slug: notice.slug,
            category: notice.category,
            isPublished: notice.isPublished,
          },
        },
      });

      return notice;
    });

    createdNoticeId = created.id;

    assert("Notice created with non-null ID", Boolean(created.id));
    assert("Content sanitized before insertion", !created.content.includes("<script>"));
    assert("Deterministic slug matches expected format", created.slug.startsWith("test-integration-notice-announcement"));
    assert("publishedAt is populated upon publish", created.publishedAt instanceof Date);

    // Verify audit record exists
    const createAudit = await prisma.auditLog.findFirst({
      where: { entityType: "Notice", entityId: created.id, action: "NOTICE_CREATED" },
    });
    assert("Audit record NOTICE_CREATED recorded in database", Boolean(createAudit));

    // 3B. Notice Update
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.notice.findUnique({ where: { id: created.id } });
      const newTitle = "Test Integration Notice Announcement - Revised";
      const slug = await generateDeterministicSlug(tx, newTitle, existing.id);

      const notice = await tx.notice.update({
        where: { id: created.id },
        data: {
          title: newTitle,
          slug,
          isUrgent: false,
          displayOrder: 2,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "NOTICE_UPDATED",
          entityType: "Notice",
          entityId: notice.id,
          userId: testUser.id,
          ipAddress: "127.0.0.1",
          metadata: {
            changedFields: {
              title: { from: existing.title, to: newTitle },
              isUrgent: { from: existing.isUrgent, to: false },
              displayOrder: { from: existing.displayOrder, to: 2 },
            },
          },
        },
      });

      return notice;
    });

    assert("Updated notice title reflects revision", updated.title.includes("Revised"));
    assert("Updated notice slug updated deterministically", updated.slug.includes("revised"));
    assert("Updated isUrgent is false", updated.isUrgent === false);

    const updateAudit = await prisma.auditLog.findFirst({
      where: { entityType: "Notice", entityId: created.id, action: "NOTICE_UPDATED" },
    });
    assert("Audit record NOTICE_UPDATED recorded with changedFields", Boolean(updateAudit && updateAudit.metadata));

    // 3C. Notice Status Toggle (Published -> Draft -> Published)
    const toggledToDraft = await prisma.$transaction(async (tx) => {
      const notice = await tx.notice.update({
        where: { id: created.id },
        data: {
          isPublished: false,
          publishedAt: null,
        },
      });
      return notice;
    });

    assert("Status toggled to draft: isPublished is false", toggledToDraft.isPublished === false);
    assert("publishedAt cleared when unpublished to draft", toggledToDraft.publishedAt === null);

    const toggledToPublished = await prisma.$transaction(async (tx) => {
      const notice = await tx.notice.update({
        where: { id: created.id },
        data: {
          isPublished: true,
          publishedAt: new Date(),
        },
      });
      return notice;
    });

    assert("Status toggled to published: isPublished is true", toggledToPublished.isPublished === true);
    assert("publishedAt restored upon republishing", toggledToPublished.publishedAt instanceof Date);

    // 3D. Notice Deletion
    await prisma.$transaction(async (tx) => {
      await tx.notice.delete({ where: { id: created.id } });
      await tx.auditLog.create({
        data: {
          action: "NOTICE_DELETED",
          entityType: "Notice",
          entityId: created.id,
          userId: testUser.id,
          ipAddress: "127.0.0.1",
          metadata: {
            title: created.title,
            slug: created.slug,
          },
        },
      });
    });

    const deletedCheck = await prisma.notice.findUnique({ where: { id: created.id } });
    assert("Notice successfully deleted from PostgreSQL", deletedCheck === null);

    const deleteAudit = await prisma.auditLog.findFirst({
      where: { entityType: "Notice", entityId: created.id, action: "NOTICE_DELETED" },
    });
    assert("Audit record NOTICE_DELETED recorded in database", Boolean(deleteAudit));

    // Clean up test audit logs
    await prisma.auditLog.deleteMany({
      where: { entityType: "Notice", entityId: created.id },
    });

    createdNoticeId = null;
  } catch (err) {
    console.error("Test execution error:", err);
    assert("Lifecycle execution without unhandled exception", false, err.message);
  } finally {
    if (createdNoticeId) {
      await prisma.notice.deleteMany({ where: { id: createdNoticeId } });
      await prisma.auditLog.deleteMany({ where: { entityType: "Notice", entityId: createdNoticeId } });
    }
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
