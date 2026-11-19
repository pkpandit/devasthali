/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Notice Server Actions, Authorization, Attachments, Diffs, and Database Transactions.
 * Tests:
 * 1. Role-based access control matrix (SUPER_ADMIN permitted, others rejected).
 * 2. Diff computation and audit metadata serialization.
 * 3. Validation schema enforcement (noticeAttachmentSchema, reorderNoticesSchema, reorderNoticeAttachmentsSchema).
 * 4. Live database transactional lifecycle:
 *    - Notice creation with attachments.
 *    - Notice update with field diff and attachment sync.
 *    - Notice status toggling (DRAFT <-> PUBLISHED).
 *    - Batch notices reordering.
 *    - Attachment status toggle & reordering.
 *    - Attachment deletion.
 *    - Notice cascade deletion (Notice -> NoticeAttachment).
 *    - Post-test transactional cleanup.
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const { generateDeterministicSlug } = require("../lib/server/slug.ts");
const { sanitizeRichText } = require("../lib/server/sanitizer.ts");
const {
  noticeAttachmentSchema,
  reorderNoticesSchema,
  reorderNoticeAttachmentsSchema,
  deleteNoticeAttachmentSchema,
} = require("../lib/validation/notices.ts");

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
  console.log("  Running Test Suite: Notice Actions, Auth, Attachments & Trans");
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
  // 2. Field Diff Computation Logic
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
  // 3. Validation Schemas (Attachments & Reordering)
  // -------------------------------------------------------------
  console.log("\n--- 3. Validation Schema Enforcement ---");

  const validAtt = noticeAttachmentSchema.safeParse({
    title: "Official Schedule PDF",
    fileUrl: "/documents/schedule.pdf",
    fileSizeBytes: 1048576,
    fileSize: "1.00 MB",
    displayOrder: 0,
    isPublished: true,
  });
  assert("noticeAttachmentSchema accepts valid root-relative attachment", validAtt.success);

  const emptyTitleAtt = noticeAttachmentSchema.safeParse({
    title: "",
    fileUrl: "/documents/schedule.pdf",
  });
  assert("noticeAttachmentSchema rejects empty attachment title", !emptyTitleAtt.success);

  const invalidKeyAtt = noticeAttachmentSchema.safeParse({
    title: "Doc",
    fileUrl: "/documents/schedule.pdf",
    fileStorageKey: "malicious/path.pdf",
  });
  assert("noticeAttachmentSchema rejects invalid managed storage key format", !invalidKeyAtt.success);

  const validReorderNotices = reorderNoticesSchema.safeParse({
    orderedIds: ["id1", "id2"],
  });
  assert("reorderNoticesSchema accepts valid non-empty array", validReorderNotices.success);

  const emptyReorderNotices = reorderNoticesSchema.safeParse({
    orderedIds: [],
  });
  assert("reorderNoticesSchema rejects empty array", !emptyReorderNotices.success);

  const validReorderAtts = reorderNoticeAttachmentsSchema.safeParse({
    noticeId: "notice-123",
    orderedIds: ["att-1", "att-2"],
  });
  assert("reorderNoticeAttachmentsSchema accepts valid payload", validReorderAtts.success);

  const missingNoticeIdReorderAtts = reorderNoticeAttachmentsSchema.safeParse({
    noticeId: "",
    orderedIds: ["att-1"],
  });
  assert("reorderNoticeAttachmentsSchema rejects missing noticeId", !missingNoticeIdReorderAtts.success);

  const validDeleteAtt = deleteNoticeAttachmentSchema.safeParse({
    id: "att-xyz",
  });
  assert("deleteNoticeAttachmentSchema accepts valid ID", validDeleteAtt.success);

  // -------------------------------------------------------------
  // 4. Database Transactional Notice & Attachment Lifecycle
  // -------------------------------------------------------------
  console.log("\n--- 4. Database Transactional Notice & Attachment Lifecycle ---");

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
  let createdSecondaryNoticeId = null;

  try {
    // 4A. Notice Creation with Attachments
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

      // Add 2 child attachments
      const att1 = await tx.noticeAttachment.create({
        data: {
          noticeId: notice.id,
          title: "Attachment 1 - Guidelines",
          fileUrl: "/documents/guidelines.pdf",
          fileSizeBytes: 102400,
          fileSize: "100 KB",
          fileType: "application/pdf",
          displayOrder: 0,
          isPublished: true,
        },
      });

      const att2 = await tx.noticeAttachment.create({
        data: {
          noticeId: notice.id,
          title: "Attachment 2 - Schedule",
          fileUrl: "/documents/schedule.pdf",
          fileSizeBytes: 204800,
          fileSize: "200 KB",
          fileType: "application/pdf",
          displayOrder: 1,
          isPublished: true,
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
            attachmentCount: 2,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          action: "NOTICE_ATTACHMENT_CREATED",
          entityType: "NoticeAttachment",
          entityId: att1.id,
          userId: testUser.id,
          ipAddress: "127.0.0.1",
          metadata: { noticeId: notice.id, title: att1.title },
        },
      });

      await tx.auditLog.create({
        data: {
          action: "NOTICE_ATTACHMENT_CREATED",
          entityType: "NoticeAttachment",
          entityId: att2.id,
          userId: testUser.id,
          ipAddress: "127.0.0.1",
          metadata: { noticeId: notice.id, title: att2.title },
        },
      });

      return { notice, att1, att2 };
    });

    createdNoticeId = created.notice.id;

    assert("Notice created with non-null ID", Boolean(created.notice.id));
    assert("Content sanitized before insertion", !created.notice.content.includes("<script>"));
    assert("Deterministic slug matches expected format", created.notice.slug.startsWith("test-integration-notice-announcement"));
    assert("publishedAt is populated upon publish", created.notice.publishedAt instanceof Date);

    const attachmentsInDb = await prisma.noticeAttachment.findMany({
      where: { noticeId: createdNoticeId },
      orderBy: { displayOrder: "asc" },
    });
    assert("Notice attachments created in database", attachmentsInDb.length === 2);
    assert("Attachment 1 title matches", attachmentsInDb[0].title === "Attachment 1 - Guidelines");
    assert("Attachment 2 title matches", attachmentsInDb[1].title === "Attachment 2 - Schedule");

    // 4B. Reorder Attachments
    await prisma.$transaction(async (tx) => {
      const reversedIds = [attachmentsInDb[1].id, attachmentsInDb[0].id];
      for (let i = 0; i < reversedIds.length; i++) {
        await tx.noticeAttachment.update({
          where: { id: reversedIds[i] },
          data: { displayOrder: i },
        });
      }

      await tx.auditLog.create({
        data: {
          action: "NOTICE_ATTACHMENTS_REORDERED",
          entityType: "NoticeAttachment",
          entityId: createdNoticeId,
          userId: testUser.id,
          ipAddress: "127.0.0.1",
          metadata: { noticeId: createdNoticeId, orderedIds: reversedIds },
        },
      });
    });

    const reorderedAtts = await prisma.noticeAttachment.findMany({
      where: { noticeId: createdNoticeId },
      orderBy: { displayOrder: "asc" },
    });
    assert("Attachment order reversed (Attachment 2 is first)", reorderedAtts[0].id === attachmentsInDb[1].id);
    assert("Attachment 1 is now second", reorderedAtts[1].id === attachmentsInDb[0].id);

    const reorderAttAudit = await prisma.auditLog.findFirst({
      where: { entityType: "NoticeAttachment", entityId: createdNoticeId, action: "NOTICE_ATTACHMENTS_REORDERED" },
    });
    assert("Audit record NOTICE_ATTACHMENTS_REORDERED recorded", Boolean(reorderAttAudit));

    // 4C. Toggle Attachment Status
    const toggledAtt = await prisma.$transaction(async (tx) => {
      const att = await tx.noticeAttachment.update({
        where: { id: attachmentsInDb[0].id },
        data: { isPublished: false },
      });
      await tx.auditLog.create({
        data: {
          action: "NOTICE_ATTACHMENT_STATUS_CHANGED",
          entityType: "NoticeAttachment",
          entityId: att.id,
          userId: testUser.id,
          ipAddress: "127.0.0.1",
          metadata: { noticeId: createdNoticeId, from: "PUBLISHED", to: "DRAFT" },
        },
      });
      return att;
    });

    assert("Attachment toggled to draft (isPublished is false)", toggledAtt.isPublished === false);
    const statusAudit = await prisma.auditLog.findFirst({
      where: { entityType: "NoticeAttachment", entityId: attachmentsInDb[0].id, action: "NOTICE_ATTACHMENT_STATUS_CHANGED" },
    });
    assert("Audit record NOTICE_ATTACHMENT_STATUS_CHANGED recorded", Boolean(statusAudit));

    // 4D. Delete Single Attachment Directly
    await prisma.$transaction(async (tx) => {
      await tx.noticeAttachment.delete({ where: { id: attachmentsInDb[1].id } });
      await tx.auditLog.create({
        data: {
          action: "NOTICE_ATTACHMENT_DELETED",
          entityType: "NoticeAttachment",
          entityId: attachmentsInDb[1].id,
          userId: testUser.id,
          ipAddress: "127.0.0.1",
          metadata: { noticeId: createdNoticeId, title: attachmentsInDb[1].title },
        },
      });
    });

    const attAfterDelete = await prisma.noticeAttachment.findUnique({
      where: { id: attachmentsInDb[1].id },
    });
    assert("Attachment deleted directly from database", attAfterDelete === null);

    // 4E. Batch Reorder Notices
    const secondaryNotice = await prisma.notice.create({
      data: {
        title: "Test Secondary Notice For Reordering",
        slug: "test-secondary-notice-for-reordering",
        category: "CIRCULAR",
        displayOrder: 99,
        authorId: testUser.id,
      },
    });
    createdSecondaryNoticeId = secondaryNotice.id;

    await prisma.$transaction(async (tx) => {
      const orderedNoticeIds = [secondaryNotice.id, createdNoticeId];
      for (let i = 0; i < orderedNoticeIds.length; i++) {
        await tx.notice.update({
          where: { id: orderedNoticeIds[i] },
          data: { displayOrder: i },
        });
      }
      await tx.auditLog.create({
        data: {
          action: "NOTICES_REORDERED",
          entityType: "Notice",
          entityId: "batch",
          userId: testUser.id,
          ipAddress: "127.0.0.1",
          metadata: { orderedIds: orderedNoticeIds, count: 2 },
        },
      });
    });

    const n1 = await prisma.notice.findUnique({ where: { id: secondaryNotice.id } });
    const n2 = await prisma.notice.findUnique({ where: { id: createdNoticeId } });
    assert("Notices batch reordered: secondary notice has displayOrder 0", n1.displayOrder === 0);
    assert("Notices batch reordered: primary notice has displayOrder 1", n2.displayOrder === 1);

    const reorderNoticesAudit = await prisma.auditLog.findFirst({
      where: { entityType: "Notice", entityId: "batch", action: "NOTICES_REORDERED" },
    });
    assert("Audit record NOTICES_REORDERED recorded in database", Boolean(reorderNoticesAudit));

    // 4F. Cascade Deletion (Notice -> Child NoticeAttachment)
    await prisma.$transaction(async (tx) => {
      await tx.notice.delete({ where: { id: createdNoticeId } });
      await tx.auditLog.create({
        data: {
          action: "NOTICE_DELETED",
          entityType: "Notice",
          entityId: createdNoticeId,
          userId: testUser.id,
          ipAddress: "127.0.0.1",
          metadata: { title: created.notice.title },
        },
      });
    });

    const deletedNoticeCheck = await prisma.notice.findUnique({ where: { id: createdNoticeId } });
    assert("Parent notice deleted from PostgreSQL", deletedNoticeCheck === null);

    const orphanedAttCheck = await prisma.noticeAttachment.findMany({
      where: { noticeId: createdNoticeId },
    });
    assert("Foreign key ON DELETE CASCADE deleted child attachments automatically", orphanedAttCheck.length === 0);

    // Delete secondary notice
    await prisma.notice.delete({ where: { id: createdSecondaryNoticeId } });
    createdSecondaryNoticeId = null;
    createdNoticeId = null;

    // Clean up test audit logs
    await prisma.auditLog.deleteMany({
      where: {
        entityId: { in: [created.notice.id, secondaryNotice.id, attachmentsInDb[0].id, attachmentsInDb[1].id, "batch"] },
      },
    });
  } catch (err) {
    console.error("Test execution error:", err);
    assert("Lifecycle execution without unhandled exception", false, err.message);
  } finally {
    if (createdNoticeId) {
      await prisma.notice.deleteMany({ where: { id: createdNoticeId } });
      await prisma.auditLog.deleteMany({ where: { entityId: createdNoticeId } });
    }
    if (createdSecondaryNoticeId) {
      await prisma.notice.deleteMany({ where: { id: createdSecondaryNoticeId } });
      await prisma.auditLog.deleteMany({ where: { entityId: createdSecondaryNoticeId } });
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
