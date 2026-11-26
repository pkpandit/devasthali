import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.admissionRegistrationSetting.findUnique({
      where: { id: "default" },
    });

    const response = NextResponse.json(
      {
        success: true,
        settings: {
          isRegistrationOpen: settings ? settings.isRegistrationOpen : false,
          sessionLabel: settings ? settings.sessionLabel : "2026-27",
          guidanceNotice: settings ? settings.guidanceNotice : null,
          closedMessage:
            settings?.closedMessage ||
            "Online registration is currently closed. Please contact the campus admissions counter.",
        },
      },
      { status: 200 }
    );

    // Uncached direct read across both apps
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (err) {
    console.error("Failed to read public registration settings:", err);
    // Fail closed on error
    const fallbackResponse = NextResponse.json(
      {
        success: true,
        settings: {
          isRegistrationOpen: false,
          sessionLabel: "2026-27",
          guidanceNotice: null,
          closedMessage: "Registration system is currently unavailable.",
        },
      },
      { status: 200 }
    );

    fallbackResponse.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
    return fallbackResponse;
  }
}
