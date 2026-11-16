import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface PublicSiteProfileDto {
  schoolName: string;
  tagline: string | null;
  affiliationNo: string | null;
  schoolCode: string | null;
  establishedYear: number | null;
  legacyYearsText: string | null;
  schoolType: string | null;
  medium: string | null;
  gradesOffered: string | null;
  address: {
    campus: string | null;
    tehsil: string | null;
    district: string | null;
    state: string | null;
    pinCode: string | null;
    landmark: string | null;
  };
  contacts: {
    primaryPhone: string | null;
    admissionsPhone: string | null;
    receptionPhone: string | null;
    hostelWardenPhone: string | null;
    whatsappNumber: string | null;
    email: string | null;
    officeEmail: string | null;
    workingHours: string | null;
  };
  social: {
    facebook: string | null;
    youtube: string | null;
    instagram: string | null;
  };
  copyrightText: string | null;
}

export async function GET() {
  try {
    const profile = await prisma.siteProfile.findUnique({
      where: { id: "default" },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Site profile not found" },
        { status: 404 }
      );
    }

    const payload: PublicSiteProfileDto = {
      schoolName: profile.schoolName,
      tagline: profile.tagline,
      affiliationNo: profile.affiliationNo,
      schoolCode: profile.schoolCode,
      establishedYear: profile.establishedYear,
      legacyYearsText: profile.legacyYearsText,
      schoolType: profile.schoolType,
      medium: profile.medium,
      gradesOffered: profile.gradesOffered,
      address: {
        campus: profile.campusAddress,
        tehsil: profile.tehsil,
        district: profile.district,
        state: profile.state,
        pinCode: profile.pinCode,
        landmark: profile.landmark,
      },
      contacts: {
        primaryPhone: profile.primaryPhone,
        admissionsPhone: profile.admissionsPhone,
        receptionPhone: profile.receptionPhone,
        hostelWardenPhone: profile.hostelWardenPhone,
        whatsappNumber: profile.whatsappNumber,
        email: profile.principalEmail || profile.officeEmail,
        officeEmail: profile.officeEmail,
        workingHours: profile.workingHours,
      },
      social: {
        facebook: profile.facebookUrl,
        youtube: profile.youtubeUrl,
        instagram: profile.instagramUrl,
      },
      copyrightText: profile.copyrightText,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[public-profile-api] GET error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve site profile" },
      { status: 500 }
    );
  }
}
