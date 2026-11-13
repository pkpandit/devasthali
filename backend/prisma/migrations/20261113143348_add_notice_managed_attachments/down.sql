-- Rollback Migration for 20261113143348_add_notice_managed_attachments
DROP INDEX IF EXISTS "notices_fileStorageKey_idx";

ALTER TABLE "notices"
  DROP COLUMN IF EXISTS "fileOriginalName",
  DROP COLUMN IF EXISTS "fileSha256",
  DROP COLUMN IF EXISTS "fileSizeBytes",
  DROP COLUMN IF EXISTS "fileStorageKey",
  DROP COLUMN IF EXISTS "fileUploadedAt";
