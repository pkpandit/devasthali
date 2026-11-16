-- CreateTable
CREATE TABLE "faculty_members" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "designation" VARCHAR(120) NOT NULL,
    "department" VARCHAR(120) NOT NULL,
    "qualification" VARCHAR(255),
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "imageUrl" VARCHAR(500),
    "imageStorageKey" VARCHAR(255),
    "imageAlt" VARCHAR(255) NOT NULL DEFAULT '',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculty_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "faculty_members_isPublished_displayOrder_idx" ON "faculty_members"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "faculty_members_department_idx" ON "faculty_members"("department");
