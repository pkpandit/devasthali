-- CreateEnum
CREATE TYPE "NoticeCategory" AS ENUM ('CIRCULAR', 'EXAMINATION', 'ADMISSION', 'EVENT');

-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "NoticeCategory" NOT NULL DEFAULT 'CIRCULAR',
    "summary" TEXT,
    "content" TEXT,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "fileUrl" TEXT,
    "fileSize" TEXT,
    "publishDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notices_slug_key" ON "notices"("slug");

-- CreateIndex
CREATE INDEX "notices_isPublished_publishDate_idx" ON "notices"("isPublished", "publishDate");

-- CreateIndex
CREATE INDEX "notices_category_isPublished_idx" ON "notices"("category", "isPublished");

-- CreateIndex
CREATE INDEX "notices_displayOrder_publishDate_idx" ON "notices"("displayOrder", "publishDate");

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
