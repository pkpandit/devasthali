-- CreateTable
CREATE TABLE "hostel_sections" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "badge" VARCHAR(100) NOT NULL DEFAULT 'Residential Boarding Life',
    "title" VARCHAR(200) NOT NULL DEFAULT 'A Safe, Caring "Home Away From Home"',
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_features" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL DEFAULT 'default',
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hostel_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_sections" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "badge" VARCHAR(100) NOT NULL DEFAULT 'Day-Scholar Transport Network',
    "title" VARCHAR(200) NOT NULL DEFAULT 'Safe, GPS-Tracked Transportation Fleet',
    "description" TEXT NOT NULL,
    "cta_text" VARCHAR(150) NOT NULL DEFAULT 'Contact Transport Coordinator for Pick-up Node Details →',
    "cta_url" VARCHAR(255) NOT NULL DEFAULT '/contact',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hostel_features_section_id_display_order_idx" ON "hostel_features"("section_id", "display_order");

-- CreateIndex
CREATE INDEX "hostel_features_section_id_is_published_idx" ON "hostel_features"("section_id", "is_published");

-- AddForeignKey
ALTER TABLE "hostel_features" ADD CONSTRAINT "hostel_features_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "hostel_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
