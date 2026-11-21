/**
 * Idempotent Seed Script: Academic Wings, Curriculum & Assessment Regulations
 * Milestone 14: Academic Wings & Curriculum Management
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

const WINGS_DATA = [
  {
    slug: "foundational",
    stageBadge: "Stage 1: Foundational Wing",
    title: "Foundational Stage (LKG, UKG, Classes I & II)",
    description:
      "Focuses on playful, experiential learning that cultivates speech fluency, phonetic awareness, early mathematics, sensory stimulation, social sharing, and motor dexterity. Every child is given gentle, loving care in safe, well-equipped activity suites.",
    highlights: [
      "Phonics, picture-talk & vocabulary building",
      "Number games, counting & spatial geometry",
      "Coloring, craft, music, movement & physical play",
      "Safe, child-sized hygiene washrooms & nursery beds",
    ],
    displayOrder: 0,
    isPublished: true,
  },
  {
    slug: "preparatory-middle",
    stageBadge: "Stage 2: Preparatory & Middle Wing",
    title: "Preparatory & Middle Stage (Classes III to VIII)",
    description:
      "Transition from play to conceptual discovery. Students are introduced to structured science experiments, mathematical reasoning, world geography, history, and three-language proficiency (English, Hindi, Sanskrit).",
    highlights: [
      "Weekly physics, chemistry & biology lab visits",
      "Computer technology, typing, scratch & python coding",
      "Inter-house quizzes, debates & elocution contests",
      "Physical education, athletics, yoga, and gymnastics",
    ],
    displayOrder: 1,
    isPublished: true,
  },
  {
    slug: "senior-secondary",
    stageBadge: "Stage 3: Senior Secondary Wing",
    title: "Senior Secondary (Classes IX to XII)",
    description:
      "Devasthaly Vidyapeeth offers three comprehensive streams for Classes XI and XII, taught by experienced Post Graduate Teachers (PGTs) with specialized laboratory equipment and study hours.",
    highlights: [],
    displayOrder: 2,
    isPublished: true,
  },
];

const STREAMS_DATA = [
  {
    slug: "science",
    title: "Science Stream",
    iconName: "FlaskConical",
    subjects: [
      "English Core (Compulsory)",
      "Physics & Chemistry",
      "Mathematics (PCM) OR Biology (PCB)",
      "Elective: Computer Science / Physical Ed",
    ],
    careerHighlight: "Includes NEET/JEE Foundation",
    displayOrder: 0,
    isPublished: true,
  },
  {
    slug: "commerce",
    title: "Commerce Stream",
    iconName: "Award",
    subjects: [
      "English Core (Compulsory)",
      "Accountancy & Business Studies",
      "Economics",
      "Mathematics / Applied Math",
      "Elective: Informatics Practices / PE",
    ],
    careerHighlight: "Includes CUET & CA Foundation",
    displayOrder: 1,
    isPublished: true,
  },
  {
    slug: "humanities",
    title: "Humanities Stream",
    iconName: "BookOpen",
    subjects: [
      "English Core & Hindi Core",
      "History & Political Science",
      "Geography / Economics",
      "Physical Education / Psychology",
    ],
    careerHighlight: "Focus on Civil Services & Law",
    displayOrder: 2,
    isPublished: true,
  },
];

const ASSESSMENT_RULES_DATA = [
  {
    ruleText:
      "Promotions will be decided on the average marks obtained in the Terminal and Final Examinations in addition to the year's work including the unit test. To pass in any subject, a student has to secure 35% marks except for languages. Any students who losses the progress card will be fined Rs. 25/-.",
    displayOrder: 0,
    isPublished: true,
  },
  {
    ruleText:
      "Those students who are absent for any of the termination is punishable with expulsion from terminal/unit examination will not be tested earlier or later.",
    displayOrder: 1,
    isPublished: true,
  },
  {
    ruleText:
      "Willful breach of any of the regulations for the conduct of Examination is punishable with expulsion from examination or if subsequently discovered cancelling of paper.",
    displayOrder: 2,
    isPublished: true,
  },
];

const OVERVIEW_DEFAULT_DATA = {
  heroBadge: "Experimental Laboratory Learning",
  heroImage: "/images/facilities/science-lab.jpg",
  heroImageAlt: "Devasthaly Vidyapeeth advanced science laboratory practical learning session",
  competitiveBadge: "Integrated Career Preparation",
  competitiveTitle: "NEET, JEE & CUET Foundational Guidance",
  competitiveDescription:
    "We eliminate the stress of outstation coaching by offering integrated competitive foundation modules on campus, including mock OMR testing, concept-clearing doubt desks, and Olympiad problem-solving.",
  competitiveCtaText: "Apply for Class XI Admission",
  competitiveCtaHref: "/admissions",
  assessmentParentNotice:
    "The Parents/Guardians of these students are free to come to the school and meet the class teachers to know the progress of their children/wards on this day.",
  assessmentProspectusNotice:
    "Download the official school prospectus for comprehensive academic curriculum and regulations.",
  assessmentProspectusUrl: "/documents/original/prospectus-2.pdf",
};

async function seedAcademics() {
  console.log("==================================================================");
  console.log("  Seeding Academic Wings, Curriculum & Assessment Regulations");
  console.log("==================================================================");

  // 1. Seed Singleton AcademicOverview
  let overview = await prisma.academicOverview.findUnique({
    where: { id: "default" },
  });

  if (!overview) {
    overview = await prisma.academicOverview.create({
      data: {
        id: "default",
        ...OVERVIEW_DEFAULT_DATA,
      },
    });
    console.log("  ✓ Created default AcademicOverview singleton");
  } else {
    // Populate only null or empty fields, never overwrite existing admin-entered values
    const patch = {};
    for (const [key, value] of Object.entries(OVERVIEW_DEFAULT_DATA)) {
      if (overview[key] === null || overview[key] === undefined || overview[key] === "") {
        patch[key] = value;
      }
    }
    if (Object.keys(patch).length > 0) {
      overview = await prisma.academicOverview.update({
        where: { id: "default" },
        data: patch,
      });
      console.log(`  ✓ Populated ${Object.keys(patch).length} missing fields in AcademicOverview`);
    } else {
      console.log("  - AcademicOverview already populated; skipped to preserve existing data");
    }
  }

  // 2. Seed AcademicWings (idempotent skip-if-exists)
  let wingsCreated = 0;
  let wingsSkipped = 0;
  for (const wing of WINGS_DATA) {
    const existing = await prisma.academicWing.findUnique({
      where: { slug: wing.slug },
    });
    if (existing) {
      wingsSkipped++;
    } else {
      await prisma.academicWing.create({
        data: wing,
      });
      wingsCreated++;
    }
  }
  console.log(`  ✓ Academic Wings: ${wingsCreated} created, ${wingsSkipped} skipped`);

  // 3. Seed AcademicStreams (idempotent skip-if-exists)
  let streamsCreated = 0;
  let streamsSkipped = 0;
  for (const stream of STREAMS_DATA) {
    const existing = await prisma.academicStream.findUnique({
      where: { slug: stream.slug },
    });
    if (existing) {
      streamsSkipped++;
    } else {
      await prisma.academicStream.create({
        data: stream,
      });
      streamsCreated++;
    }
  }
  console.log(`  ✓ Academic Streams: ${streamsCreated} created, ${streamsSkipped} skipped`);

  // 4. Seed AcademicAssessmentRules (idempotent skip-if-exists)
  let rulesCreated = 0;
  let rulesSkipped = 0;
  const existingRules = await prisma.academicAssessmentRule.findMany();
  for (const rule of ASSESSMENT_RULES_DATA) {
    const match = existingRules.find(
      (r) => r.ruleText.trim().slice(0, 40) === rule.ruleText.trim().slice(0, 40)
    );
    if (match) {
      rulesSkipped++;
    } else {
      await prisma.academicAssessmentRule.create({
        data: rule,
      });
      rulesCreated++;
    }
  }
  console.log(`  ✓ Assessment Rules: ${rulesCreated} created, ${rulesSkipped} skipped`);

  console.log("==================================================================");
  console.log("  Academic Curriculum Seeding COMPLETED successfully.");
  console.log("==================================================================");
}

seedAcademics()
  .catch((err) => {
    console.error("  [ERROR] Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
