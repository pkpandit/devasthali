/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const CANONICAL_DISCLOSURE_SECTIONS = [
  {
    title: "DOCUMENTS AND INFORMATION",
    slug: "documents-and-information",
    description: "CBSE statutory compliance certificates, recognition, NOC, and safety proformas.",
    displayOrder: 0,
    docs: [
      {
        title: "GENERAL INFORMATION (APPENDIX-IX)",
        description: "Statutory mandatory public disclosure details and affiliation credentials.",
        file: "/documents/original/general-information-1.pdf",
        size: "947 KB",
        sizeBytes: 969891,
        linkLabel: "VIEW/DOWNLOAD",
        displayOrder: 0,
      },
      {
        title: "Letter of Affiliation Upgradation",
        description: "Official CBSE grant letter for senior secondary level affiliation.",
        file: "/documents/original/affliation-certificate-2025.pdf",
        size: "148 KB",
        sizeBytes: 151694,
        linkLabel: "VIEW/DOWNLOAD",
        displayOrder: 1,
      },
      {
        title: "COPIES OF SOCIETY/ TRUST/ COMPANY REGISTRATION/ RENEWAL CERTIFICATE, AS APPLICABLE",
        description: "Society registration and renewal certificates under Society Registration Act.",
        file: "/documents/original/trustsociety.pdf",
        size: "93 KB",
        sizeBytes: 94941,
        linkLabel: "VIEW/DOWNLOAD",
        displayOrder: 2,
      },
      {
        title: "COPY OF NO OBJECTION CERTIFICATE (NOC) ISSUED, IF APPLICABLE, BY THE STATE GOVT./UT",
        description: "State Government No Objection Certificate for CBSE affiliation.",
        file: "/documents/original/noc.pdf",
        size: "657 KB",
        sizeBytes: 672704,
        linkLabel: "VIEW/DOWNLOAD",
        displayOrder: 3,
      },
      {
        title: "COPIES OF RECOGNITION CERTIFICATE UNDER RTE ACT, 2009, AND IT'S RENEWAL IF APPLICABLE",
        description: "State education department recognition under Right to Education norms.",
        file: "/documents/original/school-recognition.pdf",
        size: "254 KB",
        sizeBytes: 260515,
        linkLabel: "VIEW/DOWNLOAD",
        displayOrder: 4,
      },
      {
        title: "COPY OF VALID BUILDING SAFETY CERTIFICATE AS PER THE NATIONAL BUILDING CODE",
        description: "Structural and building safety certificate by authorized civil engineer.",
        file: "/documents/original/building-safety.pdf",
        size: "231 KB",
        sizeBytes: 236879,
        linkLabel: "VIEW/DOWNLOAD",
        displayOrder: 5,
      },
      {
        title: "COPY OF VALID FIRE SAFETY CERTIFICATE ISSUED BY THE COMPETENT AUTHORITY",
        description: "Fire service safety clearance and compliance certificate.",
        file: "/documents/original/fire-service-_-uttar-pradesh-3.pdf",
        size: "279 KB",
        sizeBytes: 285964,
        linkLabel: "VIEW/DOWNLOAD",
        displayOrder: 6,
      },
      {
        title: "COPY OF THE DEO CERTIFICATE SUBMITTED BY THE SCHOOL FOR AFFILIATION",
        description: "District Education Officer certificate for CBSE affiliation verification.",
        file: "/documents/original/deo.pdf",
        size: "3.1 MB",
        sizeBytes: 3243203,
        linkLabel: "VIEW/DOWNLOAD",
        displayOrder: 7,
      },
      {
        title: "COPIES OF VALID WATER, HEALTH AND SANITATION CERTIFICATES",
        description: "Potable drinking water test reports and campus sanitation certification.",
        file: "/documents/original/health1_health2_merged-1.pdf",
        size: "247 KB",
        sizeBytes: 252623,
        linkLabel: "VIEW/DOWNLOAD",
        displayOrder: 8,
      },
    ],
  },
  {
    title: "RESULTS AND ACADEMICS",
    slug: "results-and-academics",
    description: "Academic fee structures, annual school calendars, management committees, and proforma.",
    displayOrder: 1,
    docs: [
      {
        title: "Fee Structure 2026-27",
        description: "Approved tuition fee chart and admission fee structure for session 2026-27.",
        file: "/documents/original/new-admission-chart-2026-27.pdf",
        size: "706 KB",
        sizeBytes: 722779,
        linkLabel: "VIEW/DOWNLOAD",
        displayOrder: 0,
      },
      {
        title: "Annual School Calendar 2025-26",
        description: "Academic schedules, examination timetables, and list of annual holidays.",
        file: "/documents/original/holydays-calender-2025-26.pdf",
        size: "529 KB",
        sizeBytes: 541402,
        linkLabel: "VIEW/DOWNLOAD",
        displayOrder: 1,
      },
      {
        title: "List of School Management Committee (SMC)",
        description: "Elected members of the School Management Committee as per CBSE bylaws.",
        file: "/documents/original/list-of-school-management-2025-26.pdf",
        size: "422 KB",
        sizeBytes: 431839,
        linkLabel: "VIEW/DOWNLOAD",
        displayOrder: 2,
      },
      {
        title: "List of Parents Teachers Association (PTA) Members",
        description: "Current office bearers and executive members of the PTA.",
        file: "/documents/original/list-of-parent-teacher-2025-26.pdf",
        size: "181 KB",
        sizeBytes: 184926,
        linkLabel: "VIEW/DOWNLOAD",
        displayOrder: 3,
      },
      {
        title: "Self Certification Proforma",
        description: "Affidavit and self-certification proforma submitted for CBSE compliance.",
        file: "/documents/original/self-certification-proforma.pdf",
        size: "217 KB",
        sizeBytes: 221817,
        linkLabel: "VIEW/DOWNLOAD",
        displayOrder: 4,
      },
    ],
  },
];

async function seedDisclosure() {
  console.log("=== Seeding Mandatory Public Disclosure Sections & Documents ===");

  let sectionsCreated = 0;
  let sectionsSkipped = 0;
  let documentsCreated = 0;
  let documentsSkipped = 0;

  for (const secData of CANONICAL_DISCLOSURE_SECTIONS) {
    let section = await prisma.disclosureSection.findUnique({
      where: { slug: secData.slug },
    });

    if (!section) {
      section = await prisma.disclosureSection.create({
        data: {
          slug: secData.slug,
          title: secData.title,
          description: secData.description,
          displayOrder: secData.displayOrder,
          isPublished: true,
        },
      });
      console.log(`[CREATE] Section "${section.title}" (slug: ${section.slug}, id: ${section.id})`);
      sectionsCreated++;
    } else {
      console.log(`[SKIP] Section "${section.title}" already exists (slug: ${section.slug}, id: ${section.id})`);
      sectionsSkipped++;
    }

    for (const docData of secData.docs) {
      const existingDoc = await prisma.disclosureDocument.findFirst({
        where: {
          sectionId: section.id,
          title: docData.title,
        },
      });

      if (!existingDoc) {
        const createdDoc = await prisma.disclosureDocument.create({
          data: {
            sectionId: section.id,
            title: docData.title,
            description: docData.description,
            fileUrl: docData.file,
            fileSize: docData.size,
            fileSizeBytes: docData.sizeBytes,
            fileType: "application/pdf",
            linkLabel: docData.linkLabel,
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
    `=== Seeding Completed: Sections: ${sectionsCreated} created, ${sectionsSkipped} skipped | Documents: ${documentsCreated} created, ${documentsSkipped} skipped ===`
  );
}

seedDisclosure()
  .catch((e) => {
    console.error("Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
