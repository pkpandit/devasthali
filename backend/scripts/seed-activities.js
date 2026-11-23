/**
 * Idempotent Seed Script: Co-Curricular Activities & Student Clubs
 * Milestone 15: Co-Curricular & Student Clubs Management
 *
 * Rules:
 * - Match records by deterministic slug or singleton id.
 * - If record exists, skip it.
 * - Do NOT use upsert.
 * - Do NOT overwrite, delete, reorder, or unpublish existing records.
 * - For singleton overview, populate only null or empty fields.
 * - Do NOT store localhost or 127.0.0.1 URLs.
 * - Set isPublished: true for newly seeded records.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const OVERVIEW_DEFAULT_DATA = {
  badgeText: "Life at School / Activities",
  title: "Co-Curricular Activities",
  subtitle: "Enhancing personality, talent, and all-round development in our 22,000 sq ft dedicated activity complex.",
  arenaSize: "22,000 sq ft",
  cardTitle: "Holistic Personality Enrichment",
  cardSubtitle: "Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)",
  narrativeParagraph1:
    "Devasthaly Vidyapeeth provides a wide variety of extra-curricular activities catering to each individual’s needs, talents and interest. Devasthaly Vidyapeeth works towards enhancing the personality of each child for all-round development, thereby nurturing the students to become a global citizen, who can compete and reside worldwide. Devasthaly Vidyapeeth, at regular intervals organises different activities and competitions in its separately built up area of 22000 sq ft.",
  narrativeParagraph2:
    "Devasthaly Vidyapeeth encourages its students to have a balanced involvement in the academic and extra curricular activities. Students are exposed to dance, music and other cultural events by number of inter House competitions and club activities including fine arts, computer graphics, nature club, vocal & instrumental music, western & Indian classical dance, house keeping and cooking club.",
  heroImage: null,
  heroImageAlt: null,
  heroImageStorageKey: null,
};

const CLUBS_DATA = [
  {
    slug: "fine-arts-painting",
    name: "Fine Arts & Painting",
    category: "Arts & Design",
    description: "Creative visual arts, sketching, watercolor, canvas painting, and exhibition curation.",
    iconName: "Palette",
    displayOrder: 0,
    isPublished: true,
  },
  {
    slug: "computer-graphics-digital-design",
    name: "Computer Graphics & Digital Design",
    category: "Digital & Tech",
    description: "Digital illustration, multimedia presentations, graphic designing, and creative software skills.",
    iconName: "Sparkles",
    displayOrder: 1,
    isPublished: true,
  },
  {
    slug: "nature-environment-club",
    name: "Nature & Environment Club",
    category: "Environment & Ecology",
    description: "Tree planting campaigns, campus recycling, eco-awareness walks, and environmental science projects.",
    iconName: "Compass",
    displayOrder: 2,
    isPublished: true,
  },
  {
    slug: "vocal-instrumental-music",
    name: "Vocal & Instrumental Music",
    category: "Performing Arts",
    description: "Classical and modern vocal training, harmonium, tabla, keyboard, and choral presentations.",
    iconName: "Music",
    displayOrder: 3,
    isPublished: true,
  },
  {
    slug: "western-indian-classical-dance",
    name: "Western & Indian Classical Dance",
    category: "Performing Arts",
    description: "Kathak, Bharatnatyam, folk dances, Western contemporary choreography, and stage posture.",
    iconName: "Activity",
    displayOrder: 4,
    isPublished: true,
  },
  {
    slug: "house-keeping-culinary-cooking-club",
    name: "House Keeping & Culinary / Cooking Club",
    category: "Life Skills & Culinary",
    description: "Nutritious culinary basics, table etiquette, domestic aesthetics, and hospitality life skills.",
    iconName: "Award",
    displayOrder: 5,
    isPublished: true,
  },
  {
    slug: "inter-house-cultural-competitions",
    name: "Inter-House Cultural Competitions",
    category: "Competitions & Houses",
    description: "Year-round inter-house contests fostering camaraderie, competitive spirit, and team leadership.",
    iconName: "Trophy",
    displayOrder: 6,
    isPublished: true,
  },
  {
    slug: "debates-elocution-public-speaking",
    name: "Debates, Elocution & Public Speaking",
    category: "Literary & Oratory",
    description: "Parliamentary debates, speech delivery, elocution, declamation, and bilingual extempore.",
    iconName: "Mic",
    displayOrder: 7,
    isPublished: true,
  },
];

async function seedActivities() {
  console.log("==================================================================");
  console.log("  Seeding Co-Curricular Activities & Student Clubs");
  console.log("==================================================================");

  // 1. Seed Singleton ActivityOverview
  let overview = await prisma.activityOverview.findUnique({
    where: { id: "default" },
  });

  if (!overview) {
    overview = await prisma.activityOverview.create({
      data: {
        id: "default",
        ...OVERVIEW_DEFAULT_DATA,
      },
    });
    console.log("  ✓ Created default ActivityOverview singleton");
  } else {
    // Populate only null or empty fields, never overwrite existing admin-entered values
    const patch = {};
    for (const [key, value] of Object.entries(OVERVIEW_DEFAULT_DATA)) {
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        (overview[key] === null || overview[key] === undefined || overview[key] === "")
      ) {
        patch[key] = value;
      }
    }
    if (Object.keys(patch).length > 0) {
      overview = await prisma.activityOverview.update({
        where: { id: "default" },
        data: patch,
      });
      console.log(`  ✓ Populated ${Object.keys(patch).length} missing fields in ActivityOverview`);
    } else {
      console.log("  - ActivityOverview already populated; skipped to preserve existing data");
    }
  }

  // 2. Seed StudentClubs (idempotent skip-if-exists)
  let clubsCreated = 0;
  let clubsSkipped = 0;
  for (const club of CLUBS_DATA) {
    const existing = await prisma.studentClub.findUnique({
      where: { slug: club.slug },
    });
    if (existing) {
      clubsSkipped++;
    } else {
      await prisma.studentClub.create({
        data: club,
      });
      clubsCreated++;
    }
  }
  console.log(`  ✓ Student Clubs: ${clubsCreated} created, ${clubsSkipped} skipped`);

  console.log("==================================================================");
  console.log("  Co-Curricular Activities Seeding COMPLETED successfully.");
  console.log("==================================================================");
}

seedActivities()
  .catch((err) => {
    console.error("  [ERROR] Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
