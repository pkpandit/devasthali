/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Controlled Seed Script for Site Profile and Campus Directory
 * Populates singleton SiteProfile and initial CampusDirectoryEntry records idempotently.
 */

const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seed() {
  console.log("--> Seeding SiteProfile...");

  await prisma.siteProfile.upsert({
    where: { id: "default" },
    update: {
      schoolName: "Devasthaly Vidyapeeth",
      tagline: "Nurturing Academic Rigour, Moral Character & Leadership Since 1988",
      affiliationNo: "2130238",
      schoolCode: "70184",
      establishedYear: 1988,
      legacyYearsText: "38+",
      schoolType: "Co-educational, Residential & Day-Boarding",
      medium: "English Medium (CBSE Affiliated, New Delhi)",
      gradesOffered: "LKG to Class XII (Science, Commerce, Humanities)",
      campusAddress: "Chilkahar",
      tehsil: "Rasra",
      district: "Ballia",
      state: "Uttar Pradesh",
      pinCode: "277123",
      landmark: "Near Chilkahar Railway Crossing / Ballia-Rasra State Highway",
      primaryPhone: "9554960408",
      admissionsPhone: "9554960408",
      receptionPhone: "9554960415",
      hostelWardenPhone: "6307010040",
      whatsappNumber: "919554960408",
      officeEmail: "principaldvp@gmail.com",
      principalEmail: "principaldvp@gmail.com",
      workingHours: "Monday – Saturday: 8:00 AM – 3:30 PM",
      facebookUrl: "https://facebook.com/devasthalyvidyapeeth",
      youtubeUrl: "https://youtube.com/devasthalyvidyapeeth",
      instagramUrl: "https://instagram.com/devasthalyvidyapeeth",
      copyrightText: "© 2025 Devasthaly Vidyapeeth, Chilkahar, Ballia. All Rights Reserved.",
    },
    create: {
      id: "default",
      schoolName: "Devasthaly Vidyapeeth",
      tagline: "Nurturing Academic Rigour, Moral Character & Leadership Since 1988",
      affiliationNo: "2130238",
      schoolCode: "70184",
      establishedYear: 1988,
      legacyYearsText: "38+",
      schoolType: "Co-educational, Residential & Day-Boarding",
      medium: "English Medium (CBSE Affiliated, New Delhi)",
      gradesOffered: "LKG to Class XII (Science, Commerce, Humanities)",
      campusAddress: "Chilkahar",
      tehsil: "Rasra",
      district: "Ballia",
      state: "Uttar Pradesh",
      pinCode: "277123",
      landmark: "Near Chilkahar Railway Crossing / Ballia-Rasra State Highway",
      primaryPhone: "9554960408",
      admissionsPhone: "9554960408",
      receptionPhone: "9554960415",
      hostelWardenPhone: "6307010040",
      whatsappNumber: "919554960408",
      officeEmail: "principaldvp@gmail.com",
      principalEmail: "principaldvp@gmail.com",
      workingHours: "Monday – Saturday: 8:00 AM – 3:30 PM",
      facebookUrl: "https://facebook.com/devasthalyvidyapeeth",
      youtubeUrl: "https://youtube.com/devasthalyvidyapeeth",
      instagramUrl: "https://instagram.com/devasthalyvidyapeeth",
      copyrightText: "© 2025 Devasthaly Vidyapeeth, Chilkahar, Ballia. All Rights Reserved.",
    },
  });

  console.log("--> SiteProfile seeded.");

  console.log("--> Seeding CampusDirectoryEntry records...");

  const existingCount = await prisma.campusDirectoryEntry.count();
  if (existingCount > 0) {
    console.log(`--> Directory already has ${existingCount} entries. Skipping directory seed.`);
    return;
  }

  const directoryEntries = [
    // Security & Gate
    { category: "SECURITY_TRANSPORT", roleTitle: "Main Gate Security", contactName: null, department: "Campus Security", phoneNumber: "7753914135", displayOrder: 1 },

    // Administration & Reception
    { category: "ADMINISTRATION", roleTitle: "Reception", contactName: "Mr. B. C. Dubey", department: "Front Desk", phoneNumber: "9554960415", displayOrder: 2 },
    { category: "ADMINISTRATION", roleTitle: "Vice-Principal", contactName: "Mrs. Mamta Singh", department: "Administration", phoneNumber: "6306580532", displayOrder: 3 },

    // Academic Coordinators
    { category: "ACADEMIC_COORDINATOR", roleTitle: "Co-ordinator", contactName: "Mrs. Anita Singh", department: "Class IX to XII (Girls)", phoneNumber: "9616148210", displayOrder: 4 },
    { category: "ACADEMIC_COORDINATOR", roleTitle: "Co-ordinator", contactName: "Mrs. Sadhana Mishra", department: "Class VI to VIII (Girls)", phoneNumber: "9161762457", displayOrder: 5 },
    { category: "ACADEMIC_COORDINATOR", roleTitle: "Co-ordinator", contactName: "Mr. Neeraj Singh", department: "Class XI & XII (Boys)", phoneNumber: "9005122930", displayOrder: 6 },
    { category: "ACADEMIC_COORDINATOR", roleTitle: "Co-ordinator", contactName: "Mr. Chitrasen Singh", department: "Class IX & X (Boys)", phoneNumber: "7376867376", displayOrder: 7 },
    { category: "ACADEMIC_COORDINATOR", roleTitle: "Co-ordinator", contactName: "Mr. Rameshwar Singh", department: "Class VI to VIII (Boys)", phoneNumber: "7860436565", displayOrder: 8 },
    { category: "ACADEMIC_COORDINATOR", roleTitle: "Co-ordinator", contactName: "Mrs. Sita Singh", department: "L.K.G. to Class II", phoneNumber: "9415830247", displayOrder: 9 },
    { category: "ACADEMIC_COORDINATOR", roleTitle: "Co-ordinator", contactName: "Mrs. Sadhana Asthana", department: "Class III to V", phoneNumber: "9506892222", displayOrder: 10 },

    // Office & Accounts
    { category: "OFFICE_ACCOUNTS", roleTitle: "Fee Counter", contactName: "Mr. Mukesh Prasad", department: "Accounts & Fees", phoneNumber: "9250930763", displayOrder: 11 },
    { category: "OFFICE_ACCOUNTS", roleTitle: "Fee Counter", contactName: "Mr. Satyendra Singh", department: "Accounts & Fees", phoneNumber: "9451491906", displayOrder: 12 },
    { category: "OFFICE_ACCOUNTS", roleTitle: "Accountant", contactName: "Mr. Dhananjay", department: "Accounts", phoneNumber: "9554960408", displayOrder: 13 },

    // Hostel Wardens
    { category: "HOSTEL_WARDEN", roleTitle: "Chief Warden", contactName: "Mr. Dhirendra Singh", department: "Hostel Administration", phoneNumber: "6307010040", displayOrder: 14 },
    { category: "HOSTEL_WARDEN", roleTitle: "Resident Warden", contactName: "Mrs. Shalini Singh", department: "Girls Wing", phoneNumber: "9519051030", displayOrder: 15 },
    { category: "HOSTEL_WARDEN", roleTitle: "Resident Warden", contactName: "Mrs. Shanti Verma", department: "Draupadi Niketan (Kids Wing)", phoneNumber: "8810973997, 8887526375", displayOrder: 16 },
    { category: "HOSTEL_WARDEN", roleTitle: "Resident Warden", contactName: "Mrs. Beena Singh", department: "Girls Wing", phoneNumber: "8858451165, 9198069451", displayOrder: 17 },
    { category: "HOSTEL_WARDEN", roleTitle: "Resident Warden", contactName: "Mrs. Archana Rai", department: "Girls Wing", phoneNumber: "8176841070, 7800529868", displayOrder: 18 },
    { category: "HOSTEL_WARDEN", roleTitle: "Resident Warden", contactName: "Mr. Amit Singh", department: "Sadanand Niketan (Boys)", phoneNumber: "7309186668", displayOrder: 19 },
    { category: "HOSTEL_WARDEN", roleTitle: "Resident Warden", contactName: "Mr. Purushottam Ojha", department: "Boys Wing", phoneNumber: "7355467982, 7003176352", displayOrder: 20 },
    { category: "HOSTEL_WARDEN", roleTitle: "Resident Warden", contactName: "Mr. Ravi Prakash", department: "Boys Wing", phoneNumber: "6387266720, 9473723117", displayOrder: 21 },
    { category: "HOSTEL_WARDEN", roleTitle: "Resident Warden", contactName: "Mr. Akash", department: "Boys Wing", phoneNumber: "8756641048, 9984117456", displayOrder: 22 },
    { category: "HOSTEL_WARDEN", roleTitle: "Resident Warden", contactName: "Mr. M. K. Ojha", department: "J.P. Niketan (Senior Boys)", phoneNumber: "9140702961, 9554960406", displayOrder: 23 },
    { category: "HOSTEL_WARDEN", roleTitle: "Resident Warden", contactName: "Mr. Mrityunjay Singh", department: "Boys Wing", phoneNumber: "8318399947, 7307368482", displayOrder: 24 },
    { category: "HOSTEL_WARDEN", roleTitle: "Resident Warden", contactName: "Mr. Ashish Mani", department: "Boys Wing", phoneNumber: "9651904529, 7052921300", displayOrder: 25 },
  ];

  for (const entry of directoryEntries) {
    await prisma.campusDirectoryEntry.create({ data: entry });
  }

  console.log(`--> Seeded ${directoryEntries.length} CampusDirectoryEntry records.`);
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
