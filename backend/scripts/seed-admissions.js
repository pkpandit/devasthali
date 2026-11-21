/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const prisma = new PrismaClient();

const CANONICAL_STEPS = [
  {
    stepNumber: "01",
    title: "Online Enquiry",
    description: "Submit the quick form below or send a WhatsApp message to receive the 2026–27 prospectus.",
    displayOrder: 0,
    isPublished: true,
  },
  {
    stepNumber: "02",
    title: "Campus Interaction",
    description: "Visit our Chilkahar campus for an informal interaction (LKG-I) or diagnostic assessment (II-XI).",
    displayOrder: 1,
    isPublished: true,
  },
  {
    stepNumber: "03",
    title: "Document Verification",
    description: "Verification of child's birth certificate, Aadhaar card, previous report cards, and transfer certificate.",
    displayOrder: 2,
    isPublished: true,
  },
  {
    stepNumber: "04",
    title: "Provisional Enrollment",
    description: "Complete registration fee payment, uniform requisition, and hostel room allocation (for boarders).",
    displayOrder: 3,
    isPublished: true,
  },
];

const CANONICAL_ELIGIBILITY = [
  {
    classGrade: "LKG / Nursery",
    ageRequirement: "3 to 4 Years",
    evaluationMode: "Informal Parent-Child Observation",
    displayOrder: 0,
    isPublished: true,
  },
  {
    classGrade: "UKG / KG",
    ageRequirement: "4 to 5 Years",
    evaluationMode: "Basic Learning Readiness Assessment",
    displayOrder: 1,
    isPublished: true,
  },
  {
    classGrade: "Class I",
    ageRequirement: "6+ Years (NEP Mandate)",
    evaluationMode: "Oral & Written Readiness",
    displayOrder: 2,
    isPublished: true,
  },
  {
    classGrade: "Classes II to VIII",
    ageRequirement: "Age commensurate with grade",
    evaluationMode: "Written Aptitude Test (English & Mathematics)",
    displayOrder: 3,
    isPublished: true,
  },
  {
    classGrade: "Class IX & X",
    ageRequirement: "13+ / 14+ Years",
    evaluationMode: "Diagnostic Test (Eng, Math, Sci) & Previous Marksheet",
    displayOrder: 4,
    isPublished: true,
  },
  {
    classGrade: "Class XI (Sci/Com/Hum)",
    ageRequirement: "Class X Board Qualified",
    evaluationMode: "Class X Board Percentage & Stream Aptitude Counselling",
    displayOrder: 5,
    isPublished: true,
  },
];

const CANONICAL_DOCUMENTS = [
  {
    title: "Original Transfer Certificate (TC) countersigned by competent education authority",
    description: "Must be issued by the previous recognized school and countersigned if required.",
    displayOrder: 0,
    isPublished: true,
  },
  {
    title: "Photocopy of Student's Birth Certificate (Municipal or Gram Panchayat)",
    description: "Official municipal or panchayat birth certificate verifying student age.",
    displayOrder: 1,
    isPublished: true,
  },
  {
    title: "Report Card / Marksheet of previous passed academic class",
    description: "Official statement of marks / grade sheet from the previous academic year.",
    displayOrder: 2,
    isPublished: true,
  },
  {
    title: "Photocopy of Student and Parent Aadhaar Cards",
    description: "Identity and address verification for student, father, and mother/guardian.",
    displayOrder: 3,
    isPublished: true,
  },
  {
    title: "Six recent passport-sized color photographs of the student",
    description: "Recent color photographs with white or light background.",
    displayOrder: 4,
    isPublished: true,
  },
  {
    title: "Category certificate (SC/ST/OBC/EWS) if applicable",
    description: "Competent authority certificate for reservation category verification.",
    displayOrder: 5,
    isPublished: true,
  },
  {
    title: "Medical fitness certificate signed by registered MBBS medical practitioner",
    description: "Including blood group, vaccination history, and chronic allergy declaration.",
    displayOrder: 6,
    isPublished: true,
  },
];

const CANONICAL_FAQS = [
  {
    question: "What is the procedure for admission to Devasthaly Vidyapeeth for 2025–26?",
    answer: "Admissions begin with submitting an online enquiry or collecting the registration prospectus from the school counter. For Foundational grades (LKG to Class 1), an informal parent-child interaction is conducted. For Classes 2 through 9 and 11, students undergo a written diagnostic assessment in English, Mathematics, and Science followed by document verification.",
    displayOrder: 0,
    isPublished: true,
  },
  {
    question: "Is Devasthaly Vidyapeeth affiliated with CBSE New Delhi?",
    answer: "Yes. Devasthaly Vidyapeeth is proudly affiliated with the Central Board of Secondary Education (CBSE), New Delhi, under Affiliation Number 2130238. We follow the NCERT curriculum strictly in accordance with NEP 2020 guidelines.",
    displayOrder: 1,
    isPublished: true,
  },
  {
    question: "What are the boarding and hostel facilities provided for residential students?",
    answer: "We offer separate, secure, air-cooled hostel residences for boys and girls. Facilities include 24/7 warden supervision, CCTV surveillance, 4 balanced pure vegetarian meals daily, mandatory evening supervised self-study with school teachers, sports coaching, and a 24/7 medical infirmary.",
    displayOrder: 2,
    isPublished: true,
  },
  {
    question: "Which bus routes does the school transport cover?",
    answer: "Our GPS-enabled bus network spans over 40 pick-up locations across Ballia City, Rasra Tehsil, Chilkahar, Sikanderpur, Nagra, and adjacent rural nodes. All buses are fitted with speed governors, CCTV cameras, and accompanied by trained attendants.",
    displayOrder: 3,
    isPublished: true,
  },
  {
    question: "Which subject streams are offered in Class XI and XII?",
    answer: "We offer three primary streams: Science (Physics, Chemistry, Mathematics / Biology with Computer Science or Physical Education), Commerce (Accountancy, Business Studies, Economics, Mathematics / Applied Math), and Humanities (History, Political Science, Geography, Economics, Hindi/English Core).",
    displayOrder: 4,
    isPublished: true,
  },
  {
    question: "Can parents pay school fees in installments?",
    answer: "Yes, school fees can be paid in four convenient quarterly installments (April, July, October, and January). We also support instant online payment through our Parent Portal via UPI, Debit/Credit Card, and Net Banking.",
    displayOrder: 5,
    isPublished: true,
  },
];

async function seedAdmissions() {
  console.log("===============================================================");
  console.log("  Devasthaly Vidyapeeth — Admissions Content & FAQ Seeder");
  console.log("===============================================================\n");

  let stepsCreated = 0;
  let stepsSkipped = 0;
  for (const step of CANONICAL_STEPS) {
    const existing = await prisma.admissionStep.findFirst({
      where: { stepNumber: step.stepNumber },
    });
    if (existing) {
      stepsSkipped++;
      console.log(`  [SKIP] Admission step already exists: \"Step ${step.stepNumber} - ${step.title}\"`);
    } else {
      await prisma.admissionStep.create({
        data: step,
      });
      stepsCreated++;
      console.log(`  [CREATE] Admission step created: \"Step ${step.stepNumber} - ${step.title}\"`);
    }
  }

  let eligibilityCreated = 0;
  let eligibilitySkipped = 0;
  for (const row of CANONICAL_ELIGIBILITY) {
    const existing = await prisma.admissionEligibilityCriteria.findFirst({
      where: { classGrade: row.classGrade },
    });
    if (existing) {
      eligibilitySkipped++;
      console.log(`  [SKIP] Eligibility criteria already exists: \"${row.classGrade}\"`);
    } else {
      await prisma.admissionEligibilityCriteria.create({
        data: row,
      });
      eligibilityCreated++;
      console.log(`  [CREATE] Eligibility criteria created: \"${row.classGrade}\"`);
    }
  }

  let documentsCreated = 0;
  let documentsSkipped = 0;
  for (const doc of CANONICAL_DOCUMENTS) {
    const existing = await prisma.admissionDocumentRequirement.findFirst({
      where: { title: doc.title },
    });
    if (existing) {
      documentsSkipped++;
      console.log(`  [SKIP] Document requirement already exists: \"${doc.title.slice(0, 40)}...\"`);
    } else {
      await prisma.admissionDocumentRequirement.create({
        data: doc,
      });
      documentsCreated++;
      console.log(`  [CREATE] Document requirement created: \"${doc.title.slice(0, 40)}...\"`);
    }
  }

  let faqsCreated = 0;
  let faqsSkipped = 0;
  for (const faq of CANONICAL_FAQS) {
    const existing = await prisma.admissionFaq.findFirst({
      where: { question: faq.question },
    });
    if (existing) {
      faqsSkipped++;
      console.log(`  [SKIP] FAQ already exists: \"${faq.question.slice(0, 40)}...\"`);
    } else {
      await prisma.admissionFaq.create({
        data: faq,
      });
      faqsCreated++;
      console.log(`  [CREATE] FAQ created: \"${faq.question.slice(0, 40)}...\"`);
    }
  }

  console.log("\n===============================================================");
  console.log("  Admissions Seed Summary:");
  console.log(`  Steps:       ${stepsCreated} created, ${stepsSkipped} skipped`);
  console.log(`  Eligibility: ${eligibilityCreated} created, ${eligibilitySkipped} skipped`);
  console.log(`  Documents:   ${documentsCreated} created, ${documentsSkipped} skipped`);
  console.log(`  FAQs:        ${faqsCreated} created, ${faqsSkipped} skipped`);
  console.log("===============================================================");
}

seedAdmissions()
  .catch((err) => {
    console.error("Admissions seeding failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
