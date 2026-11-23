import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Sparkles, Calendar, Users } from "lucide-react";
import { getPublicAlumni } from "@/lib/api/alumni";

export const metadata: Metadata = {
  title: "Alumni Corner & Reunion | Devasthaly Vidyapeeth",
  description:
    "Official alumni portal and reunion announcements for Devasthaly Vidyapeeth, Chilkahar, Ballia. Connecting generations of students since 1988.",
};

export default async function AlumniPage() {
  const { overview, reunions, opportunities } = await getPublicAlumni();

  const badgeText = overview?.badgeText || "Students & Parents / Alumni";
  const title = overview?.title || "Alumni Corner";
  const subtitle =
    overview?.subtitle ||
    "Welcome to the Devasthaly Vidyapeeth Alumni Network. Celebrating memories, reunions, and enduring bonds.";

  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Full-Width White Edunex Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>{badgeText}</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            {title}
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="site-container space-y-10">
        {/* Alumni Meets & Reunions */}
        {reunions.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-sm text-center">
            <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-heading font-bold text-gray-700">No Alumni Reunions Scheduled</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              No alumni reunions or meets are currently scheduled. Check back for upcoming alumni network gatherings.
            </p>
          </div>
        ) : (
          reunions.map((reunion) => (
            <div
              key={reunion.id}
              className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/90 shadow-sm space-y-4 text-center"
            >
              {reunion.heroImage && (
                <div className="relative w-full aspect-[1612/976] max-h-[550px] rounded-2xl overflow-hidden border border-gray-200 bg-[#111827]">
                  <Image
                    src={reunion.heroImage}
                    alt={reunion.heroImageAlt || reunion.title}
                    fill
                    priority
                    sizes="(max-width: 1280px) 100vw, 1200px"
                    className="object-contain"
                  />
                </div>
              )}
              <div className="pt-2 text-center max-w-2xl mx-auto space-y-2">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#111827]">
                  {reunion.title}
                </h2>
                {reunion.eventDate && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{reunion.eventDate}</span>
                  </div>
                )}
                <p className="text-sm text-gray-600 font-sans leading-relaxed">
                  {reunion.description}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Recruitment / Campus Opportunity Notices */}
        {opportunities.map((opp) => (
          <div
            key={opp.id}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="space-y-1">
              <span className="text-sm font-heading font-bold uppercase tracking-wider text-[#B91C1C] bg-red-50 border border-red-100/60 px-3 py-1 rounded-full inline-block">
                {opp.badgeText}
              </span>
              <h3 className="font-heading text-xl font-bold text-[#111827] mt-1">
                {opp.title}
              </h3>
              <p className="text-base text-gray-600 font-sans">
                {opp.description}
              </p>
            </div>
            <a
              href={`mailto:${opp.contactEmail}${
                opp.emailSubject ? `?subject=${encodeURIComponent(opp.emailSubject)}` : ""
              }`}
              className="px-6 py-3 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-heading font-bold uppercase tracking-wider transition-all shadow-xs hover:shadow-md border border-[#991B1B] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2 shrink-0"
            >
              {opp.ctaText}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
