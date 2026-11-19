-- CreateTable
CREATE TABLE "notice_attachments" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileStorageKey" VARCHAR(255),
    "fileSizeBytes" INTEGER,
    "fileSize" TEXT,
    "fileType" TEXT NOT NULL DEFAULT 'application/pdf',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notice_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notice_attachments_noticeId_displayOrder_idx" ON "notice_attachments"("noticeId", "displayOrder");

-- CreateIndex
CREATE INDEX "notice_attachments_noticeId_isPublished_idx" ON "notice_attachments"("noticeId", "isPublished");

-- CreateIndex
CREATE INDEX "notice_attachments_fileStorageKey_idx" ON "notice_attachments"("fileStorageKey");

-- AddForeignKey
ALTER TABLE "notice_attachments" ADD CONSTRAINT "notice_attachments_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "notices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill existing legacy notice documents into NoticeAttachment rows idempotently
INSERT INTO "notice_attachments" (
    "id",
    "noticeId",
    "title",
    "fileUrl",
    "fileStorageKey",
    "fileSizeBytes",
    "fileSize",
    "fileType",
    "displayOrder",
    "isPublished",
    "createdAt",
    "updatedAt"
)
SELECT 
    'att_' || n."id",
    n."id",
    COALESCE(NULLIF(TRIM(n."fileOriginalName"), ''), TRIM(n."title") || ' Document'),
    n."fileUrl",
    n."fileStorageKey",
    n."fileSizeBytes",
    n."fileSize",
    'application/pdf',
    0,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "notices" n
WHERE (n."fileUrl" IS NOT NULL OR n."fileStorageKey" IS NOT NULL)
  AND NOT EXISTS (
      SELECT 1 FROM "notice_attachments" na WHERE na."id" = 'att_' || n."id" OR na."noticeId" = n."id"
  );
