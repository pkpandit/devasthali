-- AlterTable
ALTER TABLE "board_result_toppers" 
ADD COLUMN IF NOT EXISTS "photoAlt" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- Backfill meaningful alt text for existing records with photos
UPDATE "board_result_toppers"
SET "photoAlt" = 'Photo of ' || "studentName" || ' - ' || "grade" || ' CBSE Topper'
WHERE ("photoAlt" = '' OR "photoAlt" IS NULL) AND ("photoUrl" IS NOT NULL OR "photoStorageKey" IS NOT NULL);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "board_result_toppers_isPublished_displayOrder_idx" 
ON "board_result_toppers"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "board_result_toppers_isPublished_academicYear_idx" 
ON "board_result_toppers"("isPublished", "academicYear");
