-- CreateTable
CREATE TABLE "homepage_hero" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "badgeText" VARCHAR(120),
    "heading" VARCHAR(255) NOT NULL,
    "highlightText" VARCHAR(100),
    "subheading" TEXT NOT NULL,
    "primaryCtaLabel" VARCHAR(60) NOT NULL,
    "primaryCtaHref" VARCHAR(500) NOT NULL,
    "secondaryCtaLabel" VARCHAR(60),
    "secondaryCtaHref" VARCHAR(500),
    "backgroundImageUrl" VARCHAR(500),
    "backgroundImageStorageKey" VARCHAR(255),
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_principal_message" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "heading" VARCHAR(120) NOT NULL,
    "principalName" VARCHAR(120) NOT NULL,
    "principalDesignation" VARCHAR(120) NOT NULL,
    "quote" VARCHAR(500) NOT NULL,
    "excerpt" TEXT NOT NULL,
    "imageUrl" VARCHAR(500),
    "imageStorageKey" VARCHAR(255),
    "ctaLabel" VARCHAR(60),
    "ctaHref" VARCHAR(500),
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_principal_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_statistics" (
    "id" TEXT NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "numericValue" VARCHAR(40) NOT NULL,
    "suffix" VARCHAR(20),
    "subtext" VARCHAR(120),
    "badge" VARCHAR(40),
    "iconName" VARCHAR(60),
    "imageUrl" VARCHAR(500),
    "imageStorageKey" VARCHAR(255),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_highlights" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "badge" VARCHAR(40),
    "iconName" VARCHAR(60),
    "imageUrl" VARCHAR(500),
    "imageStorageKey" VARCHAR(255),
    "ctaLabel" VARCHAR(60) NOT NULL,
    "ctaHref" VARCHAR(500) NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "homepage_statistics_isPublished_displayOrder_idx" ON "homepage_statistics"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "homepage_highlights_isPublished_displayOrder_idx" ON "homepage_highlights"("isPublished", "displayOrder");
