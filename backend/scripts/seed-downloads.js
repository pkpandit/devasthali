/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const CANONICAL_DOWNLOAD_SECTIONS = [
  {
    category: "School Prospectus & Fee Charts",
    slug: "school-prospectus-fee-charts",
    description: "Official school prospectus, fee schedules, and academic calendars.",
    displayOrder: 0,
    docs: [
      {
        title: "Official School Prospectus (Session 2026–27)",
        size: "5.6 MB",
        file: "/documents/original/prospectus-2.pdf",
        displayOrder: 0,
      },
      {
        title: "New Admission Fee Chart 2026–27",
        size: "722 KB",
        file: "/documents/original/new-admission-chart-2026-27.pdf",
        displayOrder: 1,
      },
      {
        title: "Annual Holidays & Academic Calendar",
        size: "541 KB",
        file: "/documents/original/holydays-calender-2025-26.pdf",
        displayOrder: 2,
      },
    ],
  },
  {
    category: "Entrance Examination Results (Session 2026–27)",
    slug: "entrance-examination-results-2026-27",
    description: "Merit results and selection lists for entrance examinations.",
    displayOrder: 1,
    docs: [
      {
        title: "Result of Entrance Exam held on 29.03.2026 Class – XI",
        size: "145 KB",
        file: "/documents/original/entrance-2026-29th-march-2026-class-11.pdf",
        displayOrder: 0,
      },
      {
        title: "Result of Entrance Exam held on 29.03.2026 Class – LKG to IX",
        size: "262 KB",
        file: "/documents/original/entrance-2026-29th-march-2026-lkg-to-9th.pdf",
        displayOrder: 1,
      },
      {
        title: "Result of Entrance Exam held on 15.03.2026 Class – XI",
        size: "233 KB",
        file: "/documents/original/class-11-entrance-2026-15th-march-2026.pdf",
        displayOrder: 2,
      },
      {
        title: "Result of Entrance Exam held on 15.03.2026 Class – LKG to IX",
        size: "282 KB",
        file: "/documents/original/class-lkg-to-9-entrance-2026-15th-march-2026.pdf",
        displayOrder: 3,
      },
      {
        title: "Result of Entrance Exam held on 22.02.2026",
        size: "360 KB",
        file: "/documents/original/entrance-2026-22nd-feb-2026.pdf",
        displayOrder: 4,
      },
    ],
  },
  {
    category: "CBSE Statutory Compliance Documents",
    slug: "cbse-statutory-compliance-documents",
    description: "Affiliation certificates, trust registration, safety proformas, and public disclosures.",
    displayOrder: 2,
    docs: [
      {
        title: "Mandatory Public Disclosure (Appendix IX Format)",
        size: "970 KB",
        file: "/documents/original/general-information-1.pdf",
        displayOrder: 0,
      },
      {
        title: "CBSE Affiliation Extension / Upgradation Letter",
        size: "152 KB",
        file: "/documents/original/affliation-certificate-2025.pdf",
        displayOrder: 1,
      },
      {
        title: "Society & Trust Registration Certificate",
        size: "95 KB",
        file: "/documents/original/trustsociety.pdf",
        displayOrder: 2,
      },
      {
        title: "Building Safety Certificate (National Building Code)",
        size: "237 KB",
        file: "/documents/original/building-safety.pdf",
        displayOrder: 3,
      },
      {
        title: "Fire Safety Compliance Certificate",
        size: "286 KB",
        file: "/documents/original/fire-service-_-uttar-pradesh-3.pdf",
        displayOrder: 4,
      },
      {
        title: "Safe Drinking Water & Sanitary Certificate",
        size: "253 KB",
        file: "/documents/original/health1_health2_merged-1.pdf",
        displayOrder: 5,
      },
    ],
  },
];

async function seedDownloads() {
  console.log("=== Starting Idempotent Downloads & Documents Seeding ===");

  let categoriesCreated = 0;
  let categoriesSkipped = 0;
  let documentsCreated = 0;
  let documentsSkipped = 0;

  for (const catData of CANONICAL_DOWNLOAD_SECTIONS) {
    let category = await prisma.downloadCategory.findUnique({
      where: { slug: catData.slug },
    });

    if (!category) {
      category = await prisma.downloadCategory.create({
        data: {
          slug: catData.slug,
          title: catData.category,
          description: catData.description,
          displayOrder: catData.displayOrder,
          isPublished: true,
        },
      });
      console.log(`[CREATE] Category "${category.title}" (id: ${category.id})`);
      categoriesCreated++;
    } else {
      console.log(`[SKIP] Category "${category.title}" already exists (id: ${category.id})`);
      categoriesSkipped++;
    }

    for (const docData of catData.docs) {
      const existingDoc = await prisma.downloadDocument.findFirst({
        where: {
          categoryId: category.id,
          title: docData.title,
        },
      });

      if (!existingDoc) {
        const createdDoc = await prisma.downloadDocument.create({
          data: {
            categoryId: category.id,
            title: docData.title,
            fileUrl: docData.file,
            fileSize: docData.size,
            fileType: "application/pdf",
            displayOrder: docData.displayOrder,
            isPublished: true,
          },
        });
        console.log(`  [CREATE] Document "${createdDoc.title}" (id: ${createdDoc.id})`);
        documentsCreated++;
      } else {
        console.log(`  [SKIP] Document "${existingDoc.title}" already exists (id: ${existingDoc.id})`);
        documentsSkipped++;
      }
    }
  }

  console.log(
    `=== Seeding Completed: Categories: ${categoriesCreated} created, ${categoriesSkipped} skipped | Documents: ${documentsCreated} created, ${documentsSkipped} skipped ===`
  );
}

seedDownloads()
  .catch((e) => {
    console.error("Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
