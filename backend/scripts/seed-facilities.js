/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const prisma = new PrismaClient();

const CANONICAL_CATEGORIES = [
  {
    slug: "academic",
    title: "Academic",
    description: "Interactive smart classrooms, certified science laboratories, digital AI center, and central library.",
    displayOrder: 0,
  },
  {
    slug: "residential",
    title: "Residential",
    description: "Separate air-cooled boarding houses for boys and girls with 24/7 wardens and pure veg dining.",
    displayOrder: 1,
  },
  {
    slug: "sports",
    title: "Sports",
    description: "Over 5 acres of athletic infrastructure including cricket pitch, football turf, and basketball courts.",
    displayOrder: 2,
  },
  {
    slug: "transport",
    title: "Transport",
    description: "GPS-tracked yellow bus network connecting Chilkahar to Ballia, Rasra, and rural educational nodes.",
    displayOrder: 3,
  },
  {
    slug: "wellness",
    title: "Wellness",
    description: "In-house infirmary staffed with certified health personnel and emergency ambulance tie-ups.",
    displayOrder: 4,
  },
];

const CANONICAL_ITEMS = [
  {
    slug: "smart-classes",
    categorySlug: "academic",
    title: "Interactive Smart Classrooms",
    description: "Equipped with interactive digital smart-boards, high-resolution multimedia curriculum content, and ergonomic seating designed for engaging pedagogical delivery.",
    iconName: "MonitorPlay",
    highlights: ["Interactive Touch Panels", "NCERT 3D Digital Content", "Climate-controlled Ergonomics"],
    imageUrl: "/images/home/hero/hero-students.jpg",
    imageAlt: "Students learning in interactive digital smart classroom",
    displayOrder: 0,
  },
  {
    slug: "composite-labs",
    categorySlug: "academic",
    title: "Physics, Chemistry & Biology Laboratories",
    description: "Fully certified, advanced laboratory infrastructure enabling students to perform hands-on experimentation under strict laboratory safety protocols.",
    iconName: "FlaskConical",
    highlights: ["Individual Workstations", "Safety Eye-Wash & First Aid", "Certified Faculty Supervision"],
    imageUrl: "/images/facilities/science-lab.jpg",
    imageAlt: "High school students conducting experiments in modern science laboratory",
    displayOrder: 1,
  },
  {
    slug: "computer-ai-lab",
    categorySlug: "academic",
    title: "Advanced Computer & AI Tech Lab",
    description: "Modern computer terminal suite with high-speed fiber internet, Python programming suites, robotics kits, and introductory AI curriculum for classes VI–XII.",
    iconName: "Cpu",
    highlights: ["1:1 Computer Ratio", "Gigabit Internet", "Robotics & Coding Curriculum"],
    imageUrl: "/images/home/hero/hero-bg.webp",
    imageAlt: "Computer terminal workstations in digital coding and AI laboratory",
    displayOrder: 2,
  },
  {
    slug: "hostel-mess",
    categorySlug: "residential",
    title: "Residential Hostels & Pure Veg Mess",
    description: "Separate, secure air-cooled hostels for boys and girls with 24/7 dedicated resident wardens, CCTV corridors, and a pure vegetarian hygienic dining hall.",
    iconName: "Home",
    highlights: ["Separate Boys & Girls Wings", "4 Balanced Meals Daily", "Supervised Evening Study Halls"],
    imageUrl: "/images/facilities/campus-grounds.jpg",
    imageAlt: "Devasthaly Vidyapeeth boarding hostels and dining facilities",
    displayOrder: 0,
  },
  {
    slug: "sports-complex",
    categorySlug: "sports",
    title: "5+ Acre Sports & Athletics Complex",
    description: "Dedicated turf cricket pitch, standard football field, outdoor basketball court, badminton arenas, and daily morning yoga sessions under trained NIS coaches.",
    iconName: "Trophy",
    highlights: ["Cricket Turf & Practice Nets", "Full-size Football Ground", "Daily Yoga & Martial Arts"],
    imageUrl: "/images/facilities/sports-activities.jpg",
    imageAlt: "Campus sports ground with cricket pitch and athletic tracks",
    displayOrder: 0,
  },
  {
    slug: "gps-transport",
    categorySlug: "transport",
    title: "Safe GPS-Tracked Transport Network",
    description: "A well-maintained fleet of buses serving over 40 pick-up locations across Ballia, Rasra, Chilkahar, Sikanderpur, and nearby rural educational clusters.",
    iconName: "Bus",
    highlights: ["Real-time GPS Tracking", "Speed Governors & First Aid", "Experienced Drivers & Attendants"],
    imageUrl: "/images/facilities/school-bus-fleet.jpg",
    imageAlt: "Devasthaly Vidyapeeth yellow school bus fleet equipped with GPS",
    displayOrder: 0,
  },
  {
    slug: "library-reading",
    categorySlug: "academic",
    title: "Central Library & Resource Sanctum",
    description: "Stocked with over 10,000 volumes encompassing curriculum references, Olympiad preparation materials, encyclopedias, national journals, and quiet study alcoves.",
    iconName: "BookOpen",
    highlights: ["10,000+ Curated Books", "Daily National Dailies & Magazines", "Digital E-Library Corner"],
    imageUrl: "/images/leadership/principal-mentor.jpg",
    imageAlt: "Central school library and quiet academic research study hall",
    displayOrder: 3,
  },
  {
    slug: "infirmary-care",
    categorySlug: "wellness",
    title: "24/7 Campus Medical Care & Infirmary",
    description: "In-house healthcare unit staffed with a certified nurse and on-call medical practitioners with ambulance tie-ups for emergency hospital transit.",
    iconName: "HeartPulse",
    highlights: ["Resident Nurse on Duty", "Routine Student Health Checkups", "Emergency Hospital Tie-up"],
    imageUrl: "/images/academics/faculty/faculty-teachers.jpg",
    imageAlt: "School medical care infirmary with resident health attendants",
    displayOrder: 0,
  },
];

async function seedFacilities() {
  console.log("===============================================================");
  console.log("  Seeding Facilities & Infrastructure (Milestone 11)");
  console.log("===============================================================");

  let categoriesCreated = 0;
  let categoriesSkipped = 0;
  const categoryMap = new Map(); // slug -> id

  for (const cat of CANONICAL_CATEGORIES) {
    const existing = await prisma.facilityCategory.findUnique({
      where: { slug: cat.slug },
    });

    if (existing) {
      categoriesSkipped++;
      categoryMap.set(cat.slug, existing.id);
      console.log(`  [SKIP] Category already exists: "${cat.title}" (${cat.slug})`);
    } else {
      const created = await prisma.facilityCategory.create({
        data: {
          slug: cat.slug,
          title: cat.title,
          description: cat.description,
          displayOrder: cat.displayOrder,
          isPublished: true,
        },
      });
      categoriesCreated++;
      categoryMap.set(cat.slug, created.id);
      console.log(`  [CREATE] Category created: "${cat.title}" (${cat.slug})`);
    }
  }

  let itemsCreated = 0;
  let itemsSkipped = 0;

  for (const item of CANONICAL_ITEMS) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) {
      throw new Error(`Category not found for slug: ${item.categorySlug}`);
    }

    const existing = await prisma.facilityItem.findUnique({
      where: { slug: item.slug },
    });

    if (existing) {
      itemsSkipped++;
      console.log(`  [SKIP] Facility item already exists: "${item.title}" (${item.slug})`);
    } else {
      await prisma.facilityItem.create({
        data: {
          categoryId,
          slug: item.slug,
          title: item.title,
          description: item.description,
          iconName: item.iconName,
          highlights: item.highlights,
          imageUrl: item.imageUrl,
          imageAlt: item.imageAlt,
          displayOrder: item.displayOrder,
          isPublished: true,
        },
      });
      itemsCreated++;
      console.log(`  [CREATE] Facility item created: "${item.title}" (${item.slug})`);
    }
  }

  console.log("\n===============================================================");
  console.log("  Facilities Seed Summary:");
  console.log(`  Categories: ${categoriesCreated} created, ${categoriesSkipped} skipped`);
  console.log(`  Items:      ${itemsCreated} created, ${itemsSkipped} skipped`);
  console.log("===============================================================");
}

seedFacilities()
  .catch((err) => {
    console.error("Facilities seeding failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
