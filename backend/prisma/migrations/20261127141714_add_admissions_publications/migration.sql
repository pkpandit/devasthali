-- CreateTable
CREATE TABLE "admission_overviews" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "session_label" VARCHAR(50) NOT NULL DEFAULT '2026-27',
    "fee_structure_title" VARCHAR(200) NOT NULL DEFAULT 'Fee Structure (Session 2026–27)',
    "fee_structure_subtitle" VARCHAR(500) NOT NULL DEFAULT 'Official statutory fee schedule and prospectus for Devasthaly Vidyapeeth, Chilkahar, Ballia.',
    "prospectus_title" VARCHAR(200) NOT NULL DEFAULT 'Official Devasthaly Vidyapeeth Prospectus',
    "prospectus_description" TEXT NOT NULL DEFAULT 'Complete publication containing the vision of Founder Shri Chandra Shekhar, admission eligibility, code of conduct, academic syllabus, examination assessment rules, and hostel guidelines.',
    "prospectus_pdf_url" VARCHAR(500) NOT NULL DEFAULT '/documents/original/prospectus-2.pdf',
    "prospectus_display_label" VARCHAR(100) NOT NULL DEFAULT 'Prospectus PDF (5.6 MB)',
    "admission_chart_pdf_url" VARCHAR(500) NOT NULL DEFAULT '/documents/original/new-admission-chart-2026-27.pdf',
    "admission_chart_display_label" VARCHAR(100) NOT NULL DEFAULT 'Admission Chart (722 KB)',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_overviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_structure_pages" (
    "id" TEXT NOT NULL,
    "page_number" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_structure_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_procedure_rules" (
    "id" TEXT NOT NULL,
    "rule_text" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_procedure_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrance_exam_subjects" (
    "id" TEXT NOT NULL,
    "class_grade" VARCHAR(100) NOT NULL,
    "subjects" VARCHAR(255) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entrance_exam_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fee_structure_pages_is_published_display_order_idx" ON "fee_structure_pages"("is_published", "display_order");

-- CreateIndex
CREATE INDEX "admission_procedure_rules_is_published_display_order_idx" ON "admission_procedure_rules"("is_published", "display_order");

-- CreateIndex
CREATE INDEX "entrance_exam_subjects_is_published_display_order_idx" ON "entrance_exam_subjects"("is_published", "display_order");

-- CreateIndex
CREATE INDEX "admission_applications_application_number_idx" ON "admission_applications"("application_number");
