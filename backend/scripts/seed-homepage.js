/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Homepage Seed Script for Devasthaly Vidyapeeth (Milestone 3)
 * Idempotent: Only seeds when respective homepage tables are empty or missing default singleton.
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const HERO_SEED = {
  id: "default",
  badgeText: "Admissions Open 2026–27 • LKG to Class XI",
  heading: "Nurturing Academic Rigour, Moral Character & Leadership",
  highlightText: "Since 1988",
  subheading:
    "Welcome to Devasthaly Vidyapeeth, Chilkahar, Ballia. A premier CBSE-affiliated co-educational residential and day-boarding institution where timeless Indian values converge with state-of-the-art modern education.",
  primaryCtaLabel: "Apply 2026–27",
  primaryCtaHref: "/admissions",
  secondaryCtaLabel: "Schedule a Guided Campus Tour",
  secondaryCtaHref: "/contact",
  backgroundImageUrl: "/images/about/campus-showcase.jpg",
  backgroundImageStorageKey: null,
  isPublished: true,
};

const PRINCIPAL_SEED = {
  id: "default",
  heading: "Principal’s Message",
  principalName: "P. C. Shrivastava",
  principalDesignation: "Principal, Devasthaly Vidyapeeth",
  quote:
    "Devasthaly Vidyapeeth is an amalgamation of competent teachers, state-of-the-art infrastructure, an idyllic setting and an experienced administration, creating a safe and supportive environment for student growth.",
  excerpt:
    "Devasthaly Vidyapeeth aims at holistic growth and development of its students. The school's genuine concern ensures student's emotional growth along with intellectual excellence. This empowers them to develop their self esteem, self-awareness and self-confidence. Sharing ideas, analysing situations and expressing them confidently are essential skills which are honed here, through experiential learning.",
  imageUrl: "/images/leadership/principal_sir.webp",
  imageStorageKey: null,
  ctaLabel: "Read Full Message",
  ctaHref: "/principals-message",
  isPublished: true,
};

const STATISTICS_SEED = [
  {
    label: "Years of Heritage",
    numericValue: "36+",
    suffix: null,
    subtext: "Established in 1988",
    badge: "Legacy",
    iconName: "Award",
    imageUrl: "/images/about/campus-showcase.jpg",
    imageStorageKey: null,
    displayOrder: 0,
    isPublished: true,
  },
  {
    label: "CBSE Board Pass Rate",
    numericValue: "100%",
    suffix: null,
    subtext: "Consistent Merit Ranks",
    badge: "Excellence",
    iconName: "Trophy",
    imageUrl: "/images/home/hero/hero-students.jpg",
    imageStorageKey: null,
    displayOrder: 1,
    isPublished: true,
  },
  {
    label: "Lush Green Campus",
    numericValue: "15+ Acres",
    suffix: null,
    subtext: "Eco-Friendly & Safe",
    badge: "Eco Campus",
    iconName: "Building",
    imageUrl: "/images/facilities/campus-grounds.jpg",
    imageStorageKey: null,
    displayOrder: 2,
    isPublished: true,
  },
  {
    label: "Student-Teacher Ratio",
    numericValue: "1 : 25",
    suffix: null,
    subtext: "Personal Mentorship",
    badge: "Mentorship",
    iconName: "GraduationCap",
    imageUrl: "/images/leadership/principal-mentor.jpg",
    imageStorageKey: null,
    displayOrder: 3,
    isPublished: true,
  },
  {
    label: "Alumni Across India",
    numericValue: "3,500+",
    suffix: null,
    subtext: "IITs, AIIMS, Armed Forces",
    badge: "Alumni",
    iconName: "Sparkles",
    imageUrl: "/images/alumni/alumni-graduates.jpg",
    imageStorageKey: null,
    displayOrder: 4,
    isPublished: true,
  },
  {
    label: "Transport Nodes",
    numericValue: "40+ Stops",
    suffix: null,
    subtext: "Ballia & Rasra Network",
    badge: "GPS Fleet",
    iconName: "Bus",
    imageUrl: "/images/facilities/school-bus-fleet.jpg",
    imageStorageKey: null,
    displayOrder: 5,
    isPublished: true,
  },
];

const HIGHLIGHTS_SEED = [
  {
    title: "Download School Prospectus",
    description: "Admissions PDF Brochure",
    badge: "PDF",
    iconName: "Download",
    imageUrl: "/images/admissions/prospectus-brochure.jpg",
    imageStorageKey: null,
    ctaLabel: "Download",
    ctaHref: "/school-prospectus",
    displayOrder: 0,
    isPublished: true,
  },
  {
    title: "Fee Schedule & Guidelines",
    description: "Class-wise Fee Structure",
    badge: "Fees",
    iconName: "FileText",
    imageUrl: "/images/admissions/fee-guidelines.jpg",
    imageStorageKey: null,
    ctaLabel: "View Details",
    ctaHref: "/admissions/fees",
    displayOrder: 1,
    isPublished: true,
  },
  {
    title: "Bus Routes & Transport",
    description: "40+ Stops GPS Network",
    badge: "Routes",
    iconName: "Bus",
    imageUrl: "/images/facilities/school-bus-fleet.jpg",
    imageStorageKey: null,
    ctaLabel: "Explore",
    ctaHref: "/facilities#transport",
    displayOrder: 2,
    isPublished: true,
  },
  {
    title: "Board Toppers & Results",
    description: "100% CBSE Pass Records",
    badge: "Merit",
    iconName: "Award",
    imageUrl: "/images/academics/toppers/board-toppers-trophy.jpg",
    imageStorageKey: null,
    ctaLabel: "View Results",
    ctaHref: "/results",
    displayOrder: 3,
    isPublished: true,
  },
  {
    title: "Official Circulars & Desk",
    description: "Latest School Circulars",
    badge: "Desk",
    iconName: "Calendar",
    imageUrl: "/images/notices/school-notices-circulars.jpg",
    imageStorageKey: null,
    ctaLabel: "Open Desk",
    ctaHref: "/notices",
    displayOrder: 4,
    isPublished: true,
  },
  {
    title: "CBSE Mandatory Disclosure",
    description: "Statutory Compliance Docs",
    badge: "CBSE",
    iconName: "ShieldCheck",
    imageUrl: "/images/about/cbse-affiliation-cert.jpg",
    imageStorageKey: null,
    ctaLabel: "Disclosures",
    ctaHref: "/mandatory-public-disclosure",
    displayOrder: 5,
    isPublished: true,
  },
];

async function seedHomepage() {
  console.log("Starting homepage seed check...");

  // 1. Hero Singleton
  const existingHero = await prisma.homepageHero.findUnique({
    where: { id: "default" },
  });
  if (!existingHero) {
    console.log("Seeding HomepageHero singleton...");
    await prisma.homepageHero.create({
      data: HERO_SEED,
    });
  } else {
    console.log("HomepageHero already exists, skipping.");
  }

  // 2. Principal Message Singleton
  const existingPrincipal = await prisma.homepagePrincipalMessage.findUnique({
    where: { id: "default" },
  });
  if (!existingPrincipal) {
    console.log("Seeding HomepagePrincipalMessage singleton...");
    await prisma.homepagePrincipalMessage.create({
      data: PRINCIPAL_SEED,
    });
  } else {
    console.log("HomepagePrincipalMessage already exists, skipping.");
  }

  // 3. Statistics Collection
  const statCount = await prisma.homepageStatistic.count();
  if (statCount === 0) {
    console.log(`Seeding ${STATISTICS_SEED.length} HomepageStatistics...`);
    for (const stat of STATISTICS_SEED) {
      await prisma.homepageStatistic.create({
        data: stat,
      });
    }
  } else {
    console.log(`HomepageStatistics table has ${statCount} records, skipping.`);
  }

  // 4. Highlights Collection
  const highlightCount = await prisma.homepageHighlight.count();
  if (highlightCount === 0) {
    console.log(`Seeding ${HIGHLIGHTS_SEED.length} HomepageHighlights...`);
    for (const highlight of HIGHLIGHTS_SEED) {
      await prisma.homepageHighlight.create({
        data: highlight,
      });
    }
  } else {
    console.log(`HomepageHighlights table has ${highlightCount} records, skipping.`);
  }

  console.log("Homepage seeding finished successfully.");
}

seedHomepage()
  .catch((err) => {
    console.error("Homepage seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
