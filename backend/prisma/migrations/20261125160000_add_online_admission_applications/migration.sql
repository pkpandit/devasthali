-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'WITHDRAWN', 'REJECTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "admission_registration_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "is_registration_open" BOOLEAN NOT NULL DEFAULT false,
    "session_label" VARCHAR(50) NOT NULL DEFAULT '2026-27',
    "guidance_notice" TEXT,
    "closed_message" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_registration_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_applications" (
    "id" TEXT NOT NULL,
    "application_number" VARCHAR(40) NOT NULL,
    "idempotency_key" VARCHAR(64) NOT NULL,
    "submission_fingerprint" VARCHAR(64) NOT NULL,
    "session_code" VARCHAR(20) NOT NULL,
    "applied_class" VARCHAR(50) NOT NULL,
    "student_name" VARCHAR(150) NOT NULL,
    "dob" VARCHAR(30) NOT NULL,
    "gender" VARCHAR(20) NOT NULL,
    "nationality" VARCHAR(50) DEFAULT 'Indian',
    "religion" VARCHAR(50),
    "category" VARCHAR(50),
    "mobile" VARCHAR(30) NOT NULL,
    "email" VARCHAR(150),
    "address" VARCHAR(500) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "father_name" VARCHAR(150) NOT NULL,
    "father_mobile" VARCHAR(30),
    "father_occupation" VARCHAR(150),
    "mother_name" VARCHAR(150),
    "mother_mobile" VARCHAR(30),
    "mother_occupation" VARCHAR(150),
    "last_attended_class" VARCHAR(50),
    "previous_school_name" VARCHAR(255),
    "previous_school_board" VARCHAR(100),
    "declaration_agreed" BOOLEAN NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "admin_notes" TEXT,
    "ip_hash" VARCHAR(64),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_submission_attempts" (
    "id" TEXT NOT NULL,
    "ip_hash" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admission_submission_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admission_applications_application_number_key" ON "admission_applications"("application_number");

-- CreateIndex
CREATE UNIQUE INDEX "admission_applications_idempotency_key_key" ON "admission_applications"("idempotency_key");

-- CreateIndex
CREATE INDEX "admission_applications_session_code_status_created_at_idx" ON "admission_applications"("session_code", "status", "created_at");

-- CreateIndex
CREATE INDEX "admission_applications_applied_class_idx" ON "admission_applications"("applied_class");

-- CreateIndex
CREATE INDEX "admission_applications_created_at_idx" ON "admission_applications"("created_at");

-- CreateIndex
CREATE INDEX "admission_applications_ip_hash_created_at_idx" ON "admission_applications"("ip_hash", "created_at");

-- CreateIndex
CREATE INDEX "admission_submission_attempts_ip_hash_created_at_idx" ON "admission_submission_attempts"("ip_hash", "created_at");

-- CreateIndex (Atomic Active Deduplication Constraint)
CREATE UNIQUE INDEX "admission_applications_active_dedup_idx" ON "admission_applications"("session_code", LOWER(TRIM("student_name")), "dob", TRIM("mobile")) WHERE "status" IN ('SUBMITTED', 'UNDER_REVIEW', 'VERIFIED');
