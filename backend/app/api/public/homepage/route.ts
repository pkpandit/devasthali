import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getPublicMediaOrigin } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

function resolveMediaUrl(url: string | null | undefined, storageKey: string | null | undefined): string | null {
  if (storageKey) {
    const origin = getPublicMediaOrigin();
    return `${origin}/api/public/media/${storageKey}`;
  }
  return url || null;
}

export async function GET() {
  try {
    const [
      heroRecord,
      principalRecord,
      statisticsRecords,
      highlightsRecords,
      announcementRecord,
      faqRecords,
      testimonialRecords,
    ] = await Promise.all([
      prisma.homepageHero.findUnique({
        where: { id: "default" },
      }),
      prisma.homepagePrincipalMessage.findUnique({
        where: { id: "default" },
      }),
      prisma.homepageStatistic.findMany({
        where: { isPublished: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.homepageHighlight.findMany({
        where: { isPublished: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.homepageAnnouncement.findUnique({
        where: { id: "default" },
      }),
      prisma.homepageFaq.findMany({
        where: { isPublished: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.homepageTestimonial.findMany({
        where: { isPublished: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    const hero =
      heroRecord && heroRecord.isPublished
        ? {
            badgeText: heroRecord.badgeText || null,
            heading: heroRecord.heading,
            highlightText: heroRecord.highlightText || null,
            subheading: heroRecord.subheading,
            primaryCta: {
              label: heroRecord.primaryCtaLabel,
              href: heroRecord.primaryCtaHref,
            },
            secondaryCta:
              heroRecord.secondaryCtaLabel && heroRecord.secondaryCtaHref
                ? {
                    label: heroRecord.secondaryCtaLabel,
                    href: heroRecord.secondaryCtaHref,
                  }
                : null,
            backgroundImageUrl: resolveMediaUrl(
              heroRecord.backgroundImageUrl,
              heroRecord.backgroundImageStorageKey
            ),
          }
        : null;

    const principal =
      principalRecord && principalRecord.isPublished
        ? {
            heading: principalRecord.heading,
            principalName: principalRecord.principalName,
            principalDesignation: principalRecord.principalDesignation,
            quote: principalRecord.quote,
            excerpt: principalRecord.excerpt,
            imageUrl: resolveMediaUrl(
              principalRecord.imageUrl,
              principalRecord.imageStorageKey
            ),
            cta:
              principalRecord.ctaLabel && principalRecord.ctaHref
                ? {
                    label: principalRecord.ctaLabel,
                    href: principalRecord.ctaHref,
                  }
                : null,
          }
        : null;

    const statistics = statisticsRecords.map((stat) => ({
      id: stat.id,
      label: stat.label,
      numericValue: stat.numericValue,
      suffix: stat.suffix || null,
      subtext: stat.subtext || null,
      badge: stat.badge || null,
      iconName: stat.iconName || null,
      imageUrl: resolveMediaUrl(stat.imageUrl, stat.imageStorageKey),
      displayOrder: stat.displayOrder,
    }));

    const highlights = highlightsRecords.map((hl) => ({
      id: hl.id,
      title: hl.title,
      description: hl.description,
      badge: hl.badge || null,
      iconName: hl.iconName || null,
      imageUrl: resolveMediaUrl(hl.imageUrl, hl.imageStorageKey),
      ctaLabel: hl.ctaLabel,
      ctaHref: hl.ctaHref,
      displayOrder: hl.displayOrder,
    }));

    const announcement = announcementRecord
      ? {
          enabled: announcementRecord.enabled,
          title: announcementRecord.title,
          badge: announcementRecord.badge || null,
          subtitle: announcementRecord.subtitle || null,
          imageUrl: announcementRecord.imageUrl,
          imageAlt: announcementRecord.imageAlt,
          linkHref: announcementRecord.linkHref,
          linkLabel: announcementRecord.linkLabel,
          delayMs: announcementRecord.delayMs,
          dismissalKey: announcementRecord.dismissalKey,
        }
      : null;

    const faqs = faqRecords.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      displayOrder: faq.displayOrder,
    }));

    const testimonials = testimonialRecords.map((t) => ({
      id: t.id,
      author: t.author,
      relationship: t.relationship,
      subject: t.subject || null,
      quote: t.quote,
      rating: t.rating,
      avatarUrl: t.avatarUrl || null,
      monogram: t.monogram,
      displayOrder: t.displayOrder,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          hero,
          principal,
          principalMessage: principal,
          statistics,
          highlights,
          announcement,
          faqs,
          testimonials,
        },
        meta: {
          version: 1,
          generatedAt: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/public/homepage] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch public homepage content",
      },
      { status: 500 }
    );
  }
}
