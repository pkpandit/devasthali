-- CreateTable
CREATE TABLE "disclosure_sections" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disclosure_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disclosure_documents" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500),
    "fileUrl" VARCHAR(500),
    "fileStorageKey" VARCHAR(255),
    "fileSizeBytes" INTEGER,
    "fileSize" VARCHAR(50),
    "fileType" VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    "linkLabel" VARCHAR(100) DEFAULT 'VIEW/DOWNLOAD',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disclosure_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "disclosure_sections_slug_key" ON "disclosure_sections"("slug");

-- CreateIndex
CREATE INDEX "disclosure_sections_isPublished_displayOrder_idx" ON "disclosure_sections"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "disclosure_documents_sectionId_displayOrder_idx" ON "disclosure_documents"("sectionId", "displayOrder");

-- CreateIndex
CREATE INDEX "disclosure_documents_sectionId_isPublished_idx" ON "disclosure_documents"("sectionId", "isPublished");

-- CreateIndex
CREATE INDEX "disclosure_documents_fileStorageKey_idx" ON "disclosure_documents"("fileStorageKey");

-- AddForeignKey
ALTER TABLE "disclosure_documents" ADD CONSTRAINT "disclosure_documents_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "disclosure_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
