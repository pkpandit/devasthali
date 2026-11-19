-- CreateTable
CREATE TABLE "gallery_albums" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(60) NOT NULL,
    "coverImageUrl" VARCHAR(500) NOT NULL,
    "coverImageStorageKey" VARCHAR(255),
    "coverImageAlt" VARCHAR(255) NOT NULL DEFAULT '',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_images" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "imageUrl" VARCHAR(500) NOT NULL,
    "imageStorageKey" VARCHAR(255),
    "imageAlt" VARCHAR(255) NOT NULL,
    "caption" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_events" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "eventDate" VARCHAR(100) NOT NULL,
    "isoDate" TIMESTAMP(3),
    "time" VARCHAR(100),
    "location" VARCHAR(200),
    "category" VARCHAR(60),
    "linkHref" VARCHAR(500),
    "linkLabel" VARCHAR(100),
    "coverImageUrl" VARCHAR(500),
    "coverImageStorageKey" VARCHAR(255),
    "coverImageAlt" VARCHAR(255),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gallery_albums_isPublished_displayOrder_idx" ON "gallery_albums"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "gallery_albums_category_idx" ON "gallery_albums"("category");

-- CreateIndex
CREATE INDEX "gallery_images_albumId_displayOrder_idx" ON "gallery_images"("albumId", "displayOrder");

-- CreateIndex
CREATE INDEX "gallery_images_isPublished_displayOrder_idx" ON "gallery_images"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "school_events_isPublished_displayOrder_idx" ON "school_events"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "school_events_isoDate_idx" ON "school_events"("isoDate");

-- AddForeignKey
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "gallery_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;
