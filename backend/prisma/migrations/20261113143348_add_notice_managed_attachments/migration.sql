-- AlterTable
ALTER TABLE "notices" ADD COLUMN     "fileOriginalName" VARCHAR(255),
ADD COLUMN     "fileSha256" VARCHAR(64),
ADD COLUMN     "fileSizeBytes" INTEGER,
ADD COLUMN     "fileStorageKey" VARCHAR(255),
ADD COLUMN     "fileUploadedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "notices_fileStorageKey_idx" ON "notices"("fileStorageKey");
