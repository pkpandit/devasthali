/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Faculty Directory Seed Script for Devasthaly Vidyapeeth (Milestone 5)
 * Idempotent: Only seeds when faculty_members table is completely empty.
 * Never duplicates or overwrites admin-edited records.
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const FACULTY_SEED = [
  {
    name: "Dr. K. N. Pandey",
    designation: "Principal & Academic Director",
    department: "Administration & Science",
    qualification: "M.Sc. (Physics), M.Ed., Ph.D. in Education",
    experienceYears: 24,
    bio: null,
    imageUrl: "/images/leadership/principal-mentor.jpg",
    imageStorageKey: null,
    imageAlt: "Dr. K. N. Pandey - Principal & Academic Director",
    displayOrder: 0,
    isPublished: true,
  },
  {
    name: "Smt. Manorama Singh",
    designation: "Vice Principal & Head of Senior Secondary",
    department: "English & Humanities",
    qualification: "M.A. (English Literature), B.Ed., PGCTE",
    experienceYears: 20,
    bio: null,
    imageUrl: "/images/academics/faculty/faculty-vice-principal.jpg",
    imageStorageKey: null,
    imageAlt: "Smt. Manorama Singh - Vice Principal & Head of Senior Secondary",
    displayOrder: 1,
    isPublished: true,
  },
  {
    name: "Shri Rajeshwar Nath Rai",
    designation: "Post Graduate Teacher (PGT)",
    department: "Mathematics",
    qualification: "M.Sc. (Mathematics), B.Ed.",
    experienceYears: 18,
    bio: null,
    imageUrl: "/images/academics/faculty/faculty-math-teacher.jpg",
    imageStorageKey: null,
    imageAlt: "Shri Rajeshwar Nath Rai - Post Graduate Teacher (PGT)",
    displayOrder: 2,
    isPublished: true,
  },
  {
    name: "Dr. Alok Srivastava",
    designation: "Post Graduate Teacher (PGT)",
    department: "Chemistry & NEET Coordinator",
    qualification: "M.Sc. (Organic Chemistry), Ph.D., B.Ed.",
    experienceYears: 16,
    bio: null,
    imageUrl: "/images/academics/faculty/faculty-chemistry-teacher.jpg",
    imageStorageKey: null,
    imageAlt: "Dr. Alok Srivastava - Post Graduate Teacher (PGT)",
    displayOrder: 3,
    isPublished: true,
  },
  {
    name: "Smt. Priyanka Mishra",
    designation: "Trained Graduate Teacher (TGT)",
    department: "Science & Biology",
    qualification: "M.Sc. (Botany), B.Ed.",
    experienceYears: 12,
    bio: null,
    imageUrl: "/images/academics/faculty/faculty-biology-teacher.jpg",
    imageStorageKey: null,
    imageAlt: "Smt. Priyanka Mishra - Trained Graduate Teacher (TGT)",
    displayOrder: 4,
    isPublished: true,
  },
  {
    name: "Shri Devendra Yadav",
    designation: "Physical Education Director & Sports Head",
    department: "Physical Education",
    qualification: "M.P.Ed., NIS Certified Cricket Coach",
    experienceYears: 15,
    bio: null,
    imageUrl: "/images/academics/faculty/faculty-sports-director.jpg",
    imageStorageKey: null,
    imageAlt: "Shri Devendra Yadav - Physical Education Director & Sports Head",
    displayOrder: 5,
    isPublished: true,
  },
  {
    name: "Shri Arvind Kumar Shukla",
    designation: "Post Graduate Teacher (PGT)",
    department: "Computer Science & AI",
    qualification: "M.Tech (CSE), B.Ed., Python & Robotics Certified",
    experienceYears: 14,
    bio: null,
    imageUrl: "/images/academics/faculty/faculty-teachers.jpg",
    imageStorageKey: null,
    imageAlt: "Shri Arvind Kumar Shukla - Post Graduate Teacher (PGT)",
    displayOrder: 6,
    isPublished: true,
  },
  {
    name: "Dr. Sunita Upadhyay",
    designation: "Post Graduate Teacher (PGT)",
    department: "Social Science & Hindi",
    qualification: "M.A. (History & Hindi), Ph.D., B.Ed.",
    experienceYears: 17,
    bio: null,
    imageUrl: "/images/academics/faculty/faculty-teachers.jpg",
    imageStorageKey: null,
    imageAlt: "Dr. Sunita Upadhyay - Post Graduate Teacher (PGT)",
    displayOrder: 7,
    isPublished: true,
  },
];

async function seedFaculty(client = prisma) {
  console.log("=== Seeding Faculty Directory ===");

  const existingCount = await client.facultyMember.count();
  if (existingCount > 0) {
    console.log(
      `[Seed] faculty_members already has ${existingCount} records. Skipping to preserve existing data.`
    );
    return;
  }

  const created = await client.facultyMember.createMany({
    data: FACULTY_SEED,
  });

  console.log(`[Seed] Successfully seeded ${created.count} faculty members.`);
}

if (require.main === module) {
  seedFaculty()
    .catch((e) => {
      console.error("[Seed] Error seeding faculty:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedFaculty, FACULTY_SEED };
