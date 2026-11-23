-- CreateTable
CREATE TABLE "alumni_overviews" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "badge_text" VARCHAR(100),
    "title" VARCHAR(150),
    "subtitle" VARCHAR(300),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumni_overviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumni_reunions" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "hero_image" VARCHAR(500),
    "hero_image_alt" VARCHAR(255),
    "hero_image_storage_key" VARCHAR(255),
    "event_date" VARCHAR(100),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumni_reunions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_opportunities" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "badge_text" VARCHAR(60) NOT NULL DEFAULT 'Institutional Notice',
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "contact_email" VARCHAR(150) NOT NULL,
    "email_subject" VARCHAR(150),
    "cta_text" VARCHAR(60) NOT NULL DEFAULT 'Connect via Email',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alumni_reunions_slug_key" ON "alumni_reunions"("slug");

-- CreateIndex
CREATE INDEX "alumni_reunions_is_published_display_order_idx" ON "alumni_reunions"("is_published", "display_order");

-- CreateIndex
CREATE INDEX "alumni_reunions_slug_idx" ON "alumni_reunions"("slug");

-- CreateIndex
CREATE INDEX "alumni_reunions_hero_image_storage_key_idx" ON "alumni_reunions"("hero_image_storage_key");

-- CreateIndex
CREATE UNIQUE INDEX "career_opportunities_slug_key" ON "career_opportunities"("slug");

-- CreateIndex
CREATE INDEX "career_opportunities_is_published_display_order_idx" ON "career_opportunities"("is_published", "display_order");

-- CreateIndex
CREATE INDEX "career_opportunities_slug_idx" ON "career_opportunities"("slug");
