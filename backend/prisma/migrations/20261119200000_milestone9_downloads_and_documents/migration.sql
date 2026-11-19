-- CreateTable
CREATE TABLE IF NOT EXISTS "download_categories" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "download_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "download_documents" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500),
    "fileUrl" VARCHAR(500),
    "fileStorageKey" VARCHAR(255),
    "fileSizeBytes" INTEGER,
    "fileSize" VARCHAR(50),
    "fileType" VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "download_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "download_categories_slug_key" ON "download_categories"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "download_categories_isPublished_displayOrder_idx" ON "download_categories"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "download_documents_categoryId_displayOrder_idx" ON "download_documents"("categoryId", "displayOrder");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "download_documents_categoryId_isPublished_idx" ON "download_documents"("categoryId", "isPublished");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "download_documents_fileStorageKey_idx" ON "download_documents"("fileStorageKey");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'download_documents_categoryId_fkey'
    ) THEN
        ALTER TABLE "download_documents" ADD CONSTRAINT "download_documents_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "download_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
