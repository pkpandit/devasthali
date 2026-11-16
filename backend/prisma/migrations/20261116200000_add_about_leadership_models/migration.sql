-- CreateEnum
CREATE TYPE "LeadershipRole" AS ENUM ('FOUNDER', 'PATRON', 'PRESIDENT', 'MANAGER', 'PRINCIPAL');

-- CreateTable
CREATE TABLE "about_page_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "breadcrumb" VARCHAR(120) NOT NULL DEFAULT '',
    "heading" VARCHAR(120) NOT NULL DEFAULT '',
    "subheading" VARCHAR(1000) NOT NULL DEFAULT '',
    "showcaseImageUrl" VARCHAR(500),
    "showcaseImageStorageKey" VARCHAR(255),
    "showcaseImageAlt" VARCHAR(255),
    "showcaseBadge" VARCHAR(60),
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_page_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_credentials" (
    "id" TEXT NOT NULL,
    "category" VARCHAR(60) NOT NULL DEFAULT '',
    "title" VARCHAR(120) NOT NULL DEFAULT '',
    "subtext" VARCHAR(120) NOT NULL DEFAULT '',
    "iconName" VARCHAR(60),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_narrative_sections" (
    "id" TEXT NOT NULL,
    "heading" VARCHAR(120),
    "body" TEXT NOT NULL,
    "imageUrl" VARCHAR(500),
    "imageStorageKey" VARCHAR(255),
    "imageAlt" VARCHAR(255),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_narrative_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vision_mission_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "breadcrumb" VARCHAR(120) NOT NULL DEFAULT '',
    "heading" VARCHAR(120) NOT NULL DEFAULT '',
    "subheading" VARCHAR(1000) NOT NULL DEFAULT '',
    "visionTitle" VARCHAR(120) NOT NULL DEFAULT '',
    "visionBody" TEXT NOT NULL DEFAULT '',
    "visionIcon" VARCHAR(60) NOT NULL DEFAULT '',
    "missionTitle" VARCHAR(120) NOT NULL DEFAULT '',
    "missionBody" TEXT NOT NULL DEFAULT '',
    "missionIcon" VARCHAR(60) NOT NULL DEFAULT '',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vision_mission_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutional_core_values" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "iconName" VARCHAR(60),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutional_core_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leadership_members" (
    "id" TEXT NOT NULL,
    "role" "LeadershipRole" NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "pageTitle" VARCHAR(120) NOT NULL DEFAULT '',
    "breadcrumb" VARCHAR(120) NOT NULL DEFAULT '',
    "badgeText" VARCHAR(60) NOT NULL DEFAULT '',
    "name" VARCHAR(120) NOT NULL DEFAULT '',
    "designation" VARCHAR(120) NOT NULL DEFAULT '',
    "termOrAffiliation" VARCHAR(120),
    "location" VARCHAR(200),
    "shortIntro" VARCHAR(1000) NOT NULL DEFAULT '',
    "quote" TEXT,
    "messageBody" TEXT NOT NULL DEFAULT '',
    "imageUrl" VARCHAR(500),
    "imageStorageKey" VARCHAR(255),
    "imageAlt" VARCHAR(255),
    "signatureImageUrl" VARCHAR(500),
    "signatureStorageKey" VARCHAR(255),
    "signatureAlt" VARCHAR(255),
    "bio" TEXT,
    "ctaLabel" VARCHAR(60),
    "ctaHref" VARCHAR(500),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leadership_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "about_credentials_isPublished_displayOrder_idx" ON "about_credentials"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "about_narrative_sections_isPublished_displayOrder_idx" ON "about_narrative_sections"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "institutional_core_values_isPublished_displayOrder_idx" ON "institutional_core_values"("isPublished", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "leadership_members_role_key" ON "leadership_members"("role");

-- CreateIndex
CREATE UNIQUE INDEX "leadership_members_slug_key" ON "leadership_members"("slug");

-- CreateIndex
CREATE INDEX "leadership_members_isPublished_displayOrder_idx" ON "leadership_members"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "leadership_members_slug_idx" ON "leadership_members"("slug");
