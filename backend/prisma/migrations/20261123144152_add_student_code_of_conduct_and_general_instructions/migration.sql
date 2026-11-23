-- CreateTable
CREATE TABLE "instruction_overviews" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "badge_text" VARCHAR(100),
    "title" VARCHAR(150),
    "subtitle" VARCHAR(300),
    "card_title" VARCHAR(150),
    "card_subtitle" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instruction_overviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_instructions" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "rule_text" VARCHAR(1000) NOT NULL,
    "category" VARCHAR(80) NOT NULL DEFAULT 'General Discipline',
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "general_instructions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "general_instructions_slug_key" ON "general_instructions"("slug");

-- CreateIndex
CREATE INDEX "general_instructions_is_published_display_order_idx" ON "general_instructions"("is_published", "display_order");

-- CreateIndex
CREATE INDEX "general_instructions_slug_idx" ON "general_instructions"("slug");
