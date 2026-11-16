-- CreateEnum
CREATE TYPE "DirectoryCategory" AS ENUM ('ADMINISTRATION', 'HOSTEL_WARDEN', 'ACADEMIC_COORDINATOR', 'OFFICE_ACCOUNTS', 'SECURITY_TRANSPORT');

-- CreateTable
CREATE TABLE "site_profiles" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "schoolName" TEXT NOT NULL DEFAULT 'School Name',
    "tagline" TEXT,
    "affiliationNo" TEXT,
    "schoolCode" TEXT,
    "establishedYear" INTEGER,
    "legacyYearsText" TEXT,
    "schoolType" TEXT,
    "medium" TEXT,
    "gradesOffered" TEXT,
    "campusAddress" TEXT,
    "tehsil" TEXT,
    "district" TEXT,
    "state" TEXT,
    "pinCode" TEXT,
    "landmark" TEXT,
    "primaryPhone" TEXT,
    "admissionsPhone" TEXT,
    "receptionPhone" TEXT,
    "hostelWardenPhone" TEXT,
    "whatsappNumber" TEXT,
    "officeEmail" TEXT,
    "principalEmail" TEXT,
    "workingHours" TEXT,
    "facebookUrl" TEXT,
    "youtubeUrl" TEXT,
    "instagramUrl" TEXT,
    "copyrightText" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campus_directory_entries" (
    "id" TEXT NOT NULL,
    "category" "DirectoryCategory" NOT NULL DEFAULT 'ADMINISTRATION',
    "roleTitle" TEXT NOT NULL,
    "contactName" TEXT,
    "department" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campus_directory_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campus_directory_entries_category_isPublished_displayOrder_idx" ON "campus_directory_entries"("category", "isPublished", "displayOrder");

-- Seed neutral singleton profile row
INSERT INTO "site_profiles" ("id", "schoolName", "updatedAt")
VALUES ('default', 'School Name', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
