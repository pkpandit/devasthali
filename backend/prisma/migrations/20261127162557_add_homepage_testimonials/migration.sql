-- CreateTable
CREATE TABLE "homepage_testimonials" (
    "id" TEXT NOT NULL,
    "author" VARCHAR(150) NOT NULL,
    "relationship" VARCHAR(200) NOT NULL,
    "subject" VARCHAR(150),
    "quote" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "avatar_url" VARCHAR(500),
    "monogram" VARCHAR(10) NOT NULL DEFAULT '★',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "homepage_testimonials_is_published_display_order_idx" ON "homepage_testimonials"("is_published", "display_order");
