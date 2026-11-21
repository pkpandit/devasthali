-- CreateTable
CREATE TABLE "academic_wings" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "stageBadge" VARCHAR(100) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_wings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_streams" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "iconName" VARCHAR(50) NOT NULL DEFAULT 'BookOpen',
    "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "careerHighlight" VARCHAR(150) NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_streams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_assessment_rules" (
    "id" TEXT NOT NULL,
    "ruleText" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_assessment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_overviews" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "heroBadge" VARCHAR(100),
    "heroImage" VARCHAR(500),
    "heroImageAlt" VARCHAR(255),
    "heroImageStorageKey" VARCHAR(255),
    "competitiveBadge" VARCHAR(100),
    "competitiveTitle" VARCHAR(150),
    "competitiveDescription" TEXT,
    "competitiveCtaText" VARCHAR(100),
    "competitiveCtaHref" VARCHAR(255),
    "assessmentParentNotice" TEXT,
    "assessmentProspectusNotice" TEXT,
    "assessmentProspectusUrl" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_overviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_wings_slug_key" ON "academic_wings"("slug");

-- CreateIndex
CREATE INDEX "academic_wings_isPublished_displayOrder_idx" ON "academic_wings"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "academic_wings_slug_idx" ON "academic_wings"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "academic_streams_slug_key" ON "academic_streams"("slug");

-- CreateIndex
CREATE INDEX "academic_streams_isPublished_displayOrder_idx" ON "academic_streams"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "academic_streams_slug_idx" ON "academic_streams"("slug");

-- CreateIndex
CREATE INDEX "academic_assessment_rules_isPublished_displayOrder_idx" ON "academic_assessment_rules"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "academic_overviews_heroImageStorageKey_idx" ON "academic_overviews"("heroImageStorageKey");
