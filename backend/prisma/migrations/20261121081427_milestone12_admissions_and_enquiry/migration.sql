-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('PENDING', 'CONTACTED', 'RESOLVED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "notice_attachments" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "admission_steps" (
    "id" TEXT NOT NULL,
    "stepNumber" VARCHAR(20) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_eligibility_criteria" (
    "id" TEXT NOT NULL,
    "classGrade" VARCHAR(100) NOT NULL,
    "ageRequirement" VARCHAR(200) NOT NULL,
    "evaluationMode" VARCHAR(255) NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_eligibility_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_document_requirements" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_document_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_faqs" (
    "id" TEXT NOT NULL,
    "question" VARCHAR(300) NOT NULL,
    "answer" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enquiry_submissions" (
    "id" TEXT NOT NULL,
    "studentName" VARCHAR(150) NOT NULL,
    "parentName" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "email" VARCHAR(150),
    "grade" VARCHAR(100) NOT NULL,
    "message" TEXT,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "ipHash" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enquiry_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admission_steps_isPublished_displayOrder_idx" ON "admission_steps"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "admission_eligibility_criteria_isPublished_displayOrder_idx" ON "admission_eligibility_criteria"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "admission_document_requirements_isPublished_displayOrder_idx" ON "admission_document_requirements"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "admission_faqs_isPublished_displayOrder_idx" ON "admission_faqs"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "enquiry_submissions_status_createdAt_idx" ON "enquiry_submissions"("status", "createdAt");

-- CreateIndex
CREATE INDEX "enquiry_submissions_createdAt_idx" ON "enquiry_submissions"("createdAt");

-- CreateIndex
CREATE INDEX "enquiry_submissions_ipHash_createdAt_idx" ON "enquiry_submissions"("ipHash", "createdAt");
