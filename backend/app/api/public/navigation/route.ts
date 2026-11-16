import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all published navigation data with nested published columns and links
    const items = await prisma.navigationItem.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
      include: {
        columns: {
          where: {
            isPublished: true,
          },
          orderBy: [
            { displayOrder: "asc" },
            { createdAt: "asc" },
          ],
          include: {
            links: {
              where: {
                isPublished: true,
              },
              orderBy: [
                { displayOrder: "asc" },
                { createdAt: "asc" },
              ],
            },
          },
        },
      },
    });

    const headerItems = items.filter((item) => item.location === "HEADER_PRIMARY");
    const footerAdmissionsItems = items.filter((item) => item.location === "FOOTER_ADMISSIONS");
    const footerCommunityItems = items.filter((item) => item.location === "FOOTER_COMMUNITY");

    // Project header items to NavItem DTO
    const header = headerItems.map((item) => {
      // Filter out columns that have 0 published links
      const validColumns = item.columns
        .filter((col) => col.links.length > 0)
        .map((col) => ({
          heading: col.heading || undefined,
          items: col.links.map((link) => ({
            name: link.label,
            href: link.href,
            badge: link.badge || undefined,
            openInNewTab: link.openInNewTab || undefined,
          })),
        }));

      // Graceful degradation: if item has panelType != NONE but 0 valid columns, degrade to NONE
      const effectivePanelType =
        item.panelType !== "NONE" && validColumns.length > 0
          ? (item.panelType.toLowerCase() as "compact" | "medium" | "mega")
          : undefined;

      return {
        name: item.label,
        href: item.href,
        badge: item.badge || undefined,
        panelType: effectivePanelType,
        columns: validColumns.length > 0 ? validColumns : undefined,
        openInNewTab: item.openInNewTab || undefined,
      };
    });

    // Project footer admissions items to FooterLinkItem DTO
    const footerAdmissions = footerAdmissionsItems.map((item) => ({
      name: item.label,
      href: item.href,
      openInNewTab: item.openInNewTab || undefined,
    }));

    // Project footer community items to FooterLinkItem DTO
    const footerLife = footerCommunityItems.map((item) => ({
      name: item.label,
      href: item.href,
      openInNewTab: item.openInNewTab || undefined,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          header,
          footerAdmissions,
          footerLife,
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
    console.error("[GET /api/public/navigation] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch public navigation",
      },
      { status: 500 }
    );
  }
}
