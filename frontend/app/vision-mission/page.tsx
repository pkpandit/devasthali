import React from "react";
import type { Metadata } from "next";
import { Sparkles, Compass, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "Vision and Mission | Devasthaly Vidyapeeth",
  description:
    "Vision and mission of Devasthaly Vidyapeeth, Chilkahar, Ballia. Imparting comprehensive modern education with valuable Indian traditions since 1988.",
};

export default function VisionMissionPage() {
  return (
    <div className="w-full bg-[#F9FAFB] pb-20">
      {/* 1. Page Header Banner (Edplus University standard) */}
      <div className="w-full bg-white border-b border-gray-200/80 py-12 sm:py-16 mb-12">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" aria-hidden="true" />
            <span>About School / Vision &amp; Mission</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            Vision and Mission
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Guiding educational philosophy and institutional objectives of Devasthaly Vidyapeeth.
          </p>
        </div>
      </div>

      <div className="site-container space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* Vision Card (Edplus Feature Anatomy) */}
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-red-300 transition-all duration-300 space-y-6 group">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center border border-red-100/60 shadow-2xs group-hover:scale-105 transition-transform">
              <Compass className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#111827] tracking-tight group-hover:text-[#B91C1C] transition-colors">
                Our Vision &amp; Establishment
              </h2>
              <div className="h-1 w-12 bg-[#B91C1C] rounded-full" aria-hidden="true" />
            </div>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-sans">
              To meet a long-felt need of providing quality educational facilities to our younger children, Devasthaly Vidyapeeth, Devasthaly, Ballia has been opened. The School is located 8kms. away from Rasra or 25kms. away from Ballia on Ballia-Lucknow State Highway.
            </p>
          </div>

          {/* Mission Card (Edplus Feature Anatomy) */}
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-red-300 transition-all duration-300 space-y-6 group">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center border border-red-100/60 shadow-2xs group-hover:scale-105 transition-transform">
              <Target className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#111827] tracking-tight group-hover:text-[#B91C1C] transition-colors">
                Our Mission &amp; Development Goals
              </h2>
              <div className="h-1 w-12 bg-[#B91C1C] rounded-full" aria-hidden="true" />
            </div>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-sans">
              The School was started on Oct., 2, 1988. It is an English medium institution co-educational and prepares students for CBSE examination. This institution aims at all round physical, mental moral and spiritual development of the child. Special care is taken to make the child a useful member of the society.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
