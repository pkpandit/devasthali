/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Idempotent Seed Script for Devasthaly Vidyapeeth Official Notices & Attachments
 * 
 * Invariants:
 * 1. Seeds exactly the 7 official notices from current static frontend data verbatim.
 * 2. Preserves root-relative /documents/original/... paths.
 * 3. Never stores localhost or 127.0.0.1 URLs.
 * 4. Creates corresponding NoticeAttachment records with meaningful titles and displayOrder.
 * 5. Does NOT delete, overwrite, or alter existing test/adhoc notice records.
 * 6. Completely idempotent: safe to run multiple times with zero duplicate records.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const OFFICIAL_NOTICES = [
  {
    title: "Result of Entrance Exam held on 29.03.2026 Class – XI",
    slug: "result-of-entrance-exam-held-on-29-03-2026-class-xi",
    category: "EXAMINATION",
    publishDate: new Date("2026-03-29T09:00:00.000Z"),
    summary: "Official result notification for students who appeared in the Class XI entrance examination on 29 March 2026.",
    content: "The result of the Entrance Examination held on 29.03.2026 for admission to Class XI is hereby declared. Selected candidates must complete admission formalities within the stipulated timeframe.",
    isUrgent: false,
    isPublished: true,
    fileUrl: "/documents/original/entrance-2026-29th-march-2026-class-11.pdf",
    fileSize: "145 KB",
    displayOrder: 0,
    attachment: {
      title: "Entrance Result 29.03.2026 Class XI (PDF)",
      fileUrl: "/documents/original/entrance-2026-29th-march-2026-class-11.pdf",
      fileSize: "145 KB",
      fileType: "application/pdf",
      displayOrder: 0,
    },
  },
  {
    title: "Result of Entrance Exam held on 29.03.2026 Class – LKG to IX",
    slug: "result-of-entrance-exam-held-on-29-03-2026-class-lkg-to-ix",
    category: "EXAMINATION",
    publishDate: new Date("2026-03-29T09:00:00.000Z"),
    summary: "Official result notification for students who appeared in the LKG to Class IX entrance examination on 29 March 2026.",
    content: "The result of the Entrance Examination held on 29.03.2026 for admission to Classes LKG to IX is hereby declared. Parents of selected candidates are requested to contact the administrative desk.",
    isUrgent: false,
    isPublished: true,
    fileUrl: "/documents/original/entrance-2026-29th-march-2026-lkg-to-9th.pdf",
    fileSize: "262 KB",
    displayOrder: 1,
    attachment: {
      title: "Entrance Result 29.03.2026 Class LKG-IX (PDF)",
      fileUrl: "/documents/original/entrance-2026-29th-march-2026-lkg-to-9th.pdf",
      fileSize: "262 KB",
      fileType: "application/pdf",
      displayOrder: 0,
    },
  },
  {
    title: "Official School Prospectus & Admission Guidelines",
    slug: "official-school-prospectus-admission-guidelines",
    category: "ADMISSION",
    publishDate: new Date("2026-03-20T09:00:00.000Z"),
    summary: "Comprehensive school prospectus, academic guidelines, fee matrix, and registration instructions for Session 2026-27.",
    content: "Download the comprehensive school prospectus and admission handbook for academic session 2026-27 detailing academic curricula, campus infrastructure, and admission procedures.",
    isUrgent: false,
    isPublished: true,
    fileUrl: "/documents/original/prospectus-2.pdf",
    fileSize: "5.6 MB",
    displayOrder: 2,
    attachment: {
      title: "Official School Prospectus 2026-27 (PDF)",
      fileUrl: "/documents/original/prospectus-2.pdf",
      fileSize: "5.6 MB",
      fileType: "application/pdf",
      displayOrder: 0,
    },
  },
  {
    title: "Annual Holidays & Academic Calendar 2026-27",
    slug: "annual-holidays-academic-calendar-2026-27",
    category: "CIRCULAR",
    publishDate: new Date("2026-03-18T09:00:00.000Z"),
    summary: "Official academic calendar and list of gazetted holidays for academic year 2026-27.",
    content: "Official circular notifying all students, parents, and faculty of the academic schedule, term examination windows, and recognized holidays for the 2026-27 session.",
    isUrgent: false,
    isPublished: true,
    fileUrl: "/documents/original/holydays-calender-2025-26.pdf",
    fileSize: "541 KB",
    displayOrder: 3,
    attachment: {
      title: "Annual Holidays & Academic Calendar (PDF)",
      fileUrl: "/documents/original/holydays-calender-2025-26.pdf",
      fileSize: "541 KB",
      fileType: "application/pdf",
      displayOrder: 0,
    },
  },
  {
    title: "Result of Entrance Exam held on 15.03.2026 Class – XI",
    slug: "result-of-entrance-exam-held-on-15-03-2026-class-xi",
    category: "EXAMINATION",
    publishDate: new Date("2026-03-15T09:00:00.000Z"),
    summary: "Entrance examination results for Class XI conducted on 15 March 2026.",
    content: "The entrance examination results for Class XI candidates tested on 15.03.2026 are published herewith. Candidates are ranked according to standardized merit.",
    isUrgent: false,
    isPublished: true,
    fileUrl: "/documents/original/class-11-entrance-2026-15th-march-2026.pdf",
    fileSize: "233 KB",
    displayOrder: 4,
    attachment: {
      title: "Entrance Result 15.03.2026 Class XI (PDF)",
      fileUrl: "/documents/original/class-11-entrance-2026-15th-march-2026.pdf",
      fileSize: "233 KB",
      fileType: "application/pdf",
      displayOrder: 0,
    },
  },
  {
    title: "Result of Entrance Exam held on 15.03.2026 Class – LKG to IX",
    slug: "result-of-entrance-exam-held-on-15-03-2026-class-lkg-to-ix",
    category: "EXAMINATION",
    publishDate: new Date("2026-03-15T09:00:00.000Z"),
    summary: "Entrance examination results for Classes LKG to IX conducted on 15 March 2026.",
    content: "Official score sheets and provisional enrollment lists for applicants who appeared for the entrance examination on 15.03.2026.",
    isUrgent: false,
    isPublished: true,
    fileUrl: "/documents/original/class-lkg-to-9-entrance-2026-15th-march-2026.pdf",
    fileSize: "282 KB",
    displayOrder: 5,
    attachment: {
      title: "Entrance Result 15.03.2026 Class LKG-IX (PDF)",
      fileUrl: "/documents/original/class-lkg-to-9-entrance-2026-15th-march-2026.pdf",
      fileSize: "282 KB",
      fileType: "application/pdf",
      displayOrder: 0,
    },
  },
  {
    title: "Result of Entrance Exam held on 22.02.2026",
    slug: "result-of-entrance-exam-held-on-22-02-2026",
    category: "EXAMINATION",
    publishDate: new Date("2026-02-22T09:00:00.000Z"),
    summary: "Entrance examination results for candidates tested on 22 February 2026.",
    content: "Provisional merit list for all grades tested during the general entrance session on 22.02.2026.",
    isUrgent: false,
    isPublished: true,
    fileUrl: "/documents/original/entrance-2026-22nd-feb-2026.pdf",
    fileSize: "360 KB",
    displayOrder: 6,
    attachment: {
      title: "Entrance Result 22.02.2026 (PDF)",
      fileUrl: "/documents/original/entrance-2026-22nd-feb-2026.pdf",
      fileSize: "360 KB",
      fileType: "application/pdf",
      displayOrder: 0,
    },
  },
];

async function seedNotices() {
  console.log("=== Starting Idempotent Notice & Attachment Seeding ===");

  let seededCount = 0;
  let skippedCount = 0;

  for (const item of OFFICIAL_NOTICES) {
    const existing = await prisma.notice.findUnique({
      where: { slug: item.slug },
      include: { attachments: true },
    });

    if (existing) {
      console.log(`[SKIP] Notice with slug "${item.slug}" already exists (id: ${existing.id}).`);
      skippedCount++;

      // Ensure child attachment exists if missing
      if (existing.attachments.length === 0 && item.attachment) {
        await prisma.noticeAttachment.create({
          data: {
            id: `att_${existing.id}`,
            noticeId: existing.id,
            title: item.attachment.title,
            fileUrl: item.attachment.fileUrl,
            fileSize: item.attachment.fileSize,
            fileType: item.attachment.fileType,
            displayOrder: item.attachment.displayOrder,
            isPublished: true,
          },
        });
        console.log(`  [ATTACH] Backfilled missing attachment for "${item.slug}".`);
      }
      continue;
    }

    // Notice does not exist: create notice and attachment transactionally
    await prisma.$transaction(async (tx) => {
      const notice = await tx.notice.create({
        data: {
          title: item.title,
          slug: item.slug,
          category: item.category,
          publishDate: item.publishDate,
          publishedAt: item.publishDate,
          summary: item.summary,
          content: item.content,
          isUrgent: item.isUrgent,
          isPublished: item.isPublished,
          fileUrl: item.fileUrl,
          fileSize: item.fileSize,
          displayOrder: item.displayOrder,
        },
      });

      await tx.noticeAttachment.create({
        data: {
          id: `att_${notice.id}`,
          noticeId: notice.id,
          title: item.attachment.title,
          fileUrl: item.attachment.fileUrl,
          fileSize: item.attachment.fileSize,
          fileType: item.attachment.fileType,
          displayOrder: item.attachment.displayOrder,
          isPublished: true,
        },
      });
    });

    console.log(`[SEED] Created notice "${item.title}" with attachment.`);
    seededCount++;
  }

  console.log(`=== Seeding Completed: ${seededCount} created, ${skippedCount} skipped ===`);
}

if (require.main === module) {
  seedNotices()
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

module.exports = { seedNotices, OFFICIAL_NOTICES };
