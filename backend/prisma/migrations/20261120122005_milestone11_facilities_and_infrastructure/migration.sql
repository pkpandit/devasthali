-- CreateTable
CREATE TABLE "facility_categories" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_items" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" VARCHAR(500),
    "imageStorageKey" VARCHAR(255),
    "imageAlt" VARCHAR(255) NOT NULL DEFAULT 'Campus facility photograph',
    "iconName" VARCHAR(50) DEFAULT 'BookOpen',
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "facility_categories_slug_key" ON "facility_categories"("slug");

-- CreateIndex
CREATE INDEX "facility_categories_isPublished_displayOrder_idx" ON "facility_categories"("isPublished", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "facility_items_slug_key" ON "facility_items"("slug");

-- CreateIndex
CREATE INDEX "facility_items_categoryId_displayOrder_idx" ON "facility_items"("categoryId", "displayOrder");

-- CreateIndex
CREATE INDEX "facility_items_categoryId_isPublished_idx" ON "facility_items"("categoryId", "isPublished");

-- CreateIndex
CREATE INDEX "facility_items_isPublished_displayOrder_idx" ON "facility_items"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "facility_items_imageStorageKey_idx" ON "facility_items"("imageStorageKey");

-- AddForeignKey
ALTER TABLE "facility_items" ADD CONSTRAINT "facility_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "facility_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
