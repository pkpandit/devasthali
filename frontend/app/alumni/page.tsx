import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Alumni Corner & Reunion | Devasthaly Vidyapeeth",
  description:
    "Official alumni portal and reunion announcements for Devasthaly Vidyapeeth, Chilkahar, Ballia. Connecting generations of students since 1988.",
};

export default function AlumniPage() {
  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Full-Width White Edunex Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>Students & Parents / Alumni</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            Alumni Corner
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Welcome to the Devasthaly Vidyapeeth Alumni Network. Celebrating memories, reunions, and enduring bonds.
          </p>
        </div>
      </div>

      <div className="site-container space-y-10">
        {/* Official Alumni Reunion Banner from devasthalyballia.com */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/90 shadow-sm space-y-4 text-center">
          <div className="relative w-full aspect-[1612/976] max-h-[550px] rounded-2xl overflow-hidden border border-gray-200 bg-[#111827]">
            <Image
              src="/images/gallery/ALUMNI-REUNION.webp"
              alt="Devasthaly Vidyapeeth Alumni Reunion"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-contain"
            />
          </div>
          <div className="pt-2 text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#111827]">
              ALUMNI MEET &amp; REUNION
            </h2>
            <p className="text-sm text-gray-600 font-sans leading-relaxed">
              Reconnect with your alma mater, fellow batchmates, and teachers at Devasthaly Vidyapeeth, Chilkahar, Ballia.
            </p>
          </div>
        </div>

        {/* Recruitment / Campus Opportunity Notice from Source Website */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-sm font-heading font-bold uppercase tracking-wider text-[#B91C1C] bg-red-50 border border-red-100/60 px-3 py-1 rounded-full inline-block">
              Institutional Notice
            </span>
            <h3 className="font-heading text-xl font-bold text-[#111827] mt-1">
              Careers &amp; Alumni Faculty Association
            </h3>
            <p className="text-base text-gray-600 font-sans">
              Devasthaly Vidyapeeth invites alumni scholars and experienced educators to join the academic mentoring team.
            </p>
          </div>
          <a
            href="mailto:principaldvp@gmail.com?subject=Alumni%20Association%20/%20Career%20Enquiry"
            className="px-6 py-3 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-heading font-bold uppercase tracking-wider transition-all shadow-xs hover:shadow-md border border-[#991B1B] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2 shrink-0"
          >
            Connect via Email
          </a>
        </div>
      </div>
    </div>
  );
}
