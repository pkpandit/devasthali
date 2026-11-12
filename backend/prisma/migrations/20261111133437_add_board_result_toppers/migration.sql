-- CreateTable
CREATE TABLE "board_result_toppers" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "scorePercent" DECIMAL(5,2) NOT NULL,
    "grade" TEXT NOT NULL,
    "stream" TEXT,
    "academicYear" TEXT NOT NULL,
    "achievement" TEXT NOT NULL,
    "photoUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_result_toppers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "board_result_toppers_academicYear_grade_idx" ON "board_result_toppers"("academicYear", "grade");

-- CreateIndex
CREATE INDEX "board_result_toppers_isFeatured_displayOrder_idx" ON "board_result_toppers"("isFeatured", "displayOrder");
