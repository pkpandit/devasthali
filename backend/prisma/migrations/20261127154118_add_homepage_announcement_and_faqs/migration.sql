-- CreateTable
CREATE TABLE "homepage_announcements" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "title" VARCHAR(150) NOT NULL DEFAULT 'Alumni Meet 2026',
    "badge" VARCHAR(50) DEFAULT 'Special Event',
    "subtitle" VARCHAR(200) DEFAULT 'Reconnect, Relive, Rejoice',
    "image_url" VARCHAR(500) NOT NULL DEFAULT '/images/announcements/alumni-meet-2026.webp',
    "image_alt" VARCHAR(255) NOT NULL DEFAULT 'Devasthaly Vidyapeeth Alumni Meet 2026 Official Poster - Reconnect, Relive, Rejoice',
    "link_href" VARCHAR(255) NOT NULL DEFAULT '/alumni',
    "link_label" VARCHAR(100) NOT NULL DEFAULT 'Join the Meet',
    "delay_ms" INTEGER NOT NULL DEFAULT 3000,
    "dismissal_key" VARCHAR(100) NOT NULL DEFAULT 'dvp_announcement_dismissed_alumni_meet_2026',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_faqs" (
    "id" TEXT NOT NULL,
    "question" VARCHAR(300) NOT NULL,
    "answer" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "homepage_faqs_is_published_display_order_idx" ON "homepage_faqs"("is_published", "display_order");
