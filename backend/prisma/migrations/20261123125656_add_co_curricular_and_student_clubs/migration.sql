-- CreateTable
CREATE TABLE "activity_overviews" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "badge_text" VARCHAR(100),
    "title" VARCHAR(150),
    "subtitle" VARCHAR(300),
    "arena_size" VARCHAR(60),
    "card_title" VARCHAR(150),
    "card_subtitle" VARCHAR(200),
    "narrative_paragraph_1" TEXT,
    "narrative_paragraph_2" TEXT,
    "hero_image" VARCHAR(500),
    "hero_image_alt" VARCHAR(255),
    "hero_image_storage_key" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_overviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_clubs" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "category" VARCHAR(80) NOT NULL DEFAULT 'Cultural & Creative',
    "description" TEXT,
    "icon_name" VARCHAR(50) NOT NULL DEFAULT 'Activity',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_clubs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_overviews_hero_image_storage_key_idx" ON "activity_overviews"("hero_image_storage_key");

-- CreateIndex
CREATE UNIQUE INDEX "student_clubs_slug_key" ON "student_clubs"("slug");

-- CreateIndex
CREATE INDEX "student_clubs_is_published_display_order_idx" ON "student_clubs"("is_published", "display_order");

-- CreateIndex
CREATE INDEX "student_clubs_slug_idx" ON "student_clubs"("slug");
