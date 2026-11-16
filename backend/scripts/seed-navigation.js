/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Navigation Seed Script for Devasthaly Vidyapeeth
 * Idempotent: Only seeds when navigation tables are empty.
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const HEADER_PRIMARY_ITEMS = [
  {
    label: "Home",
    href: "/",
    panelType: "NONE",
    badge: null,
    displayOrder: 1,
    isPublished: true,
    columns: [],
  },
  {
    label: "About Us",
    href: "/about",
    panelType: "MEGA",
    badge: null,
    displayOrder: 2,
    isPublished: true,
    columns: [
      {
        heading: "Overview & Heritage",
        displayOrder: 1,
        isPublished: true,
        links: [
          { label: "About School & Heritage", href: "/about", badge: null, displayOrder: 1, isPublished: true },
          { label: "Vision and Mission", href: "/vision-mission", badge: null, displayOrder: 2, isPublished: true },
          { label: "CBSE Mandatory Disclosure", href: "/mandatory-public-disclosure", badge: null, displayOrder: 3, isPublished: true },
        ],
      },
      {
        heading: "Leadership Messages",
        displayOrder: 2,
        isPublished: true,
        links: [
          { label: "Founder’s Message", href: "/founders-message", badge: null, displayOrder: 1, isPublished: true },
          { label: "Patron’s Message", href: "/patrons-message", badge: null, displayOrder: 2, isPublished: true },
          { label: "President’s Message", href: "/presidents-message", badge: null, displayOrder: 3, isPublished: true },
          { label: "Manager’s Message", href: "/managers-message", badge: null, displayOrder: 4, isPublished: true },
          { label: "Principal’s Message", href: "/principals-message", badge: null, displayOrder: 5, isPublished: true },
        ],
      },
    ],
  },
  {
    label: "Academics",
    href: "/academics",
    panelType: "MEGA",
    badge: null,
    displayOrder: 3,
    isPublished: true,
    columns: [
      {
        heading: "Pedagogy & Structure",
        displayOrder: 1,
        isPublished: true,
        links: [
          { label: "Curriculum & Academic System", href: "/academic-system", badge: null, displayOrder: 1, isPublished: true },
          { label: "Faculty & Mentors Directory", href: "/faculty", badge: null, displayOrder: 2, isPublished: true },
        ],
      },
      {
        heading: "Excellence & Achievements",
        displayOrder: 2,
        isPublished: true,
        links: [
          { label: "Board Examination Results & Toppers", href: "/results", badge: "100% Pass", displayOrder: 1, isPublished: true },
          { label: "Student Activities & Competitions", href: "/events", badge: null, displayOrder: 2, isPublished: true },
        ],
      },
    ],
  },
  {
    label: "Admissions",
    href: "/admissions",
    panelType: "MEGA",
    badge: null,
    displayOrder: 4,
    isPublished: true,
    columns: [
      {
        heading: "Admission Information",
        displayOrder: 1,
        isPublished: true,
        links: [
          { label: "Admission Procedure & Entrance", href: "/admissions/procedure", badge: null, displayOrder: 1, isPublished: true },
          { label: "Fee Structure (2026–27)", href: "/admissions/fees", badge: null, displayOrder: 2, isPublished: true },
        ],
      },
      {
        heading: "Application & Prospectus",
        displayOrder: 2,
        isPublished: true,
        links: [
          { label: "School Prospectus", href: "/school-prospectus", badge: null, displayOrder: 1, isPublished: true },
          { label: "Online Admission Form", href: "/online-admission-form", badge: "Apply Now", displayOrder: 2, isPublished: true },
        ],
      },
    ],
  },
  {
    label: "Life at School",
    href: "/facilities",
    panelType: "MEDIUM",
    badge: null,
    displayOrder: 5,
    isPublished: true,
    columns: [
      {
        heading: "Campus & Boarding",
        displayOrder: 1,
        isPublished: true,
        links: [
          { label: "Campus Infrastructure & Facilities", href: "/facilities", badge: null, displayOrder: 1, isPublished: true },
          { label: "Hostels & Residential Care", href: "/facilities#hostel", badge: null, displayOrder: 2, isPublished: true },
          { label: "Safe Transport Network", href: "/facilities#transport", badge: null, displayOrder: 3, isPublished: true },
        ],
      },
      {
        heading: "Activities & Culture",
        displayOrder: 2,
        isPublished: true,
        links: [
          { label: "Co-Curricular Activities & Sports", href: "/co-curricular-activities", badge: null, displayOrder: 1, isPublished: true },
          { label: "Campus Photo Gallery", href: "/gallery", badge: null, displayOrder: 2, isPublished: true },
        ],
      },
    ],
  },
  {
    label: "Students & Parents",
    href: "/notices",
    panelType: "COMPACT",
    badge: null,
    displayOrder: 6,
    isPublished: true,
    columns: [
      {
        heading: null,
        displayOrder: 1,
        isPublished: true,
        links: [
          { label: "Official Notices & Circulars", href: "/notices", badge: null, displayOrder: 1, isPublished: true },
          { label: "Downloads & Public Records", href: "/downloads", badge: null, displayOrder: 2, isPublished: true },
          { label: "General Instructions & Rules", href: "/general-instructions", badge: null, displayOrder: 3, isPublished: true },
          { label: "Alumni Corner & Reunion", href: "/alumni", badge: null, displayOrder: 4, isPublished: true },
        ],
      },
    ],
  },
  {
    label: "Contact",
    href: "/contact",
    panelType: "COMPACT",
    badge: null,
    displayOrder: 7,
    isPublished: true,
    columns: [
      {
        heading: null,
        displayOrder: 1,
        isPublished: true,
        links: [
          { label: "Contact Us & Directory", href: "/contact", badge: null, displayOrder: 1, isPublished: true },
          { label: "How to Reach Campus", href: "/contact#location", badge: null, displayOrder: 2, isPublished: true },
        ],
      },
    ],
  },
];

const FOOTER_ADMISSIONS_LINKS = [
  { label: "Admissions 2026–27 Overview", href: "/admissions", displayOrder: 1 },
  { label: "Admission Procedure & Guidelines", href: "/admissions/procedure", displayOrder: 2 },
  { label: "Fee Schedule & Structure", href: "/admissions/fees", displayOrder: 3 },
  { label: "School Prospectus (PDF)", href: "/school-prospectus", displayOrder: 4 },
  { label: "Online Admission Form", href: "/online-admission-form", displayOrder: 5 },
  { label: "CBSE Curriculum & Wings", href: "/academics", displayOrder: 6 },
  { label: "Academic System & Assessment", href: "/academic-system", displayOrder: 7 },
  { label: "Board Examination Results", href: "/results", displayOrder: 8 },
];

const FOOTER_COMMUNITY_LINKS = [
  { label: "Campus Facilities & 15-Acre Grounds", href: "/facilities", displayOrder: 1 },
  { label: "Residential Hostels & Mess", href: "/facilities#hostel", displayOrder: 2 },
  { label: "Safe Transport Network", href: "/facilities#transport", displayOrder: 3 },
  { label: "Co-Curricular Activities & Sports", href: "/co-curricular-activities", displayOrder: 4 },
  { label: "Campus Photo Gallery", href: "/gallery", displayOrder: 5 },
  { label: "Official Notices & Circulars", href: "/notices", displayOrder: 6 },
  { label: "General Instructions & Rules", href: "/general-instructions", displayOrder: 7 },
  { label: "Alumni Network & Reunion", href: "/alumni", displayOrder: 8 },
];

async function seedNavigation() {
  console.log("Checking navigation database status...");
  const existingCount = await prisma.navigationItem.count();

  if (existingCount > 0) {
    console.log(`Navigation tables already contain ${existingCount} items. Skipping seed to preserve data.`);
    return;
  }

  console.log("Seeding canonical navigation hierarchy...");

  await prisma.$transaction(async (tx) => {
    // 1. Seed Header Primary Items
    for (const itemData of HEADER_PRIMARY_ITEMS) {
      const { columns, ...itemFields } = itemData;
      const createdItem = await tx.navigationItem.create({
        data: {
          ...itemFields,
          location: "HEADER_PRIMARY",
        },
      });

      for (const colData of columns) {
        const { links, ...colFields } = colData;
        const createdColumn = await tx.navigationColumn.create({
          data: {
            ...colFields,
            itemId: createdItem.id,
          },
        });

        for (const linkData of links) {
          await tx.navigationLinkItem.create({
            data: {
              ...linkData,
              columnId: createdColumn.id,
            },
          });
        }
      }
    }

    // 2. Seed Footer Admissions Links
    for (const fItem of FOOTER_ADMISSIONS_LINKS) {
      await tx.navigationItem.create({
        data: {
          location: "FOOTER_ADMISSIONS",
          label: fItem.label,
          href: fItem.href,
          panelType: "NONE",
          displayOrder: fItem.displayOrder,
          isPublished: true,
        },
      });
    }

    // 3. Seed Footer Community Links
    for (const fItem of FOOTER_COMMUNITY_LINKS) {
      await tx.navigationItem.create({
        data: {
          location: "FOOTER_COMMUNITY",
          label: fItem.label,
          href: fItem.href,
          panelType: "NONE",
          displayOrder: fItem.displayOrder,
          isPublished: true,
        },
      });
    }
  });

  const finalItems = await prisma.navigationItem.count();
  const finalCols = await prisma.navigationColumn.count();
  const finalLinks = await prisma.navigationLinkItem.count();

  console.log(`Successfully seeded navigation: ${finalItems} items, ${finalCols} columns, ${finalLinks} links.`);
}

seedNavigation()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
