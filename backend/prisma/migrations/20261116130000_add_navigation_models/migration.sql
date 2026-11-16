-- CreateEnum
CREATE TYPE "NavigationLocation" AS ENUM ('HEADER_PRIMARY', 'FOOTER_ADMISSIONS', 'FOOTER_COMMUNITY');

-- CreateEnum
CREATE TYPE "NavigationPanelType" AS ENUM ('NONE', 'COMPACT', 'MEDIUM', 'MEGA');

-- CreateTable
CREATE TABLE "navigation_items" (
    "id" TEXT NOT NULL,
    "location" "NavigationLocation" NOT NULL DEFAULT 'HEADER_PRIMARY',
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "panelType" "NavigationPanelType" NOT NULL DEFAULT 'NONE',
    "badge" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "navigation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navigation_columns" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "heading" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "navigation_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navigation_link_items" (
    "id" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "badge" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "navigation_link_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "navigation_items_location_isPublished_displayOrder_idx" ON "navigation_items"("location", "isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "navigation_columns_itemId_isPublished_displayOrder_idx" ON "navigation_columns"("itemId", "isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "navigation_link_items_columnId_isPublished_displayOrder_idx" ON "navigation_link_items"("columnId", "isPublished", "displayOrder");

-- AddForeignKey
ALTER TABLE "navigation_columns" ADD CONSTRAINT "navigation_columns_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "navigation_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "navigation_link_items" ADD CONSTRAINT "navigation_link_items_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "navigation_columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
