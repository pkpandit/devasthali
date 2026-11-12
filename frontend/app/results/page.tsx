import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Sparkles, AlertCircle, Award } from "lucide-react";
import { getPublicToppers } from "@/lib/api/toppers";
import { TopperCard } from "@/components/features/toppers/TopperCard";

export const metadata: Metadata = {
  title: "CBSE Board Examination Results & Toppers | Devasthaly",
  description:
    "Check CBSE Class 10 and Class 12 Board examination results, merit rankings, and academic toppers from Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

async function ToppersGridSection() {
  const result = await getPublicToppers();

  if (result.isError) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-heading font-bold text-lg text-gray-900 mb-2">
          Examination Results Notice
        </h2>
        <p className="text-sm text-gray-600 font-sans leading-relaxed">
          The merit toppers showcase is temporarily unavailable while records are being updated. Please check back shortly or contact the academic office.
        </p>
      </div>
    );
  }

  if (result.toppers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <Award className="w-6 h-6 text-slate-400" />
        </div>
        <h2 className="font-heading font-bold text-lg text-gray-900 mb-2">
          Merit Records Compilation
        </h2>
        <p className="text-sm text-gray-600 font-sans leading-relaxed">
          No topper records are available yet. Official board examination merit rankings will be published here upon verification.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {result.toppers.map((topper, idx) => (
        <TopperCard
          key={`${topper.studentName}-${topper.academicYear}-${idx}`}
          topper={topper}
        />
      ))}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Edunex Page Header */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-heading font-bold bg-red-50 text-[#B91C1C] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Excellence / Results</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            CBSE Board Examination Results &amp; Toppers
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-2 max-w-3xl leading-relaxed font-sans">
            Celebrating consistent 100% board pass track records and district merit toppers who bring glory to Ballia and Purvanchal.
          </p>
        </div>
      </div>

      <div className="site-container space-y-10">
        {/* Dynamic Topper Section wrapped in Suspense for PPR streaming */}
        <Suspense fallback={null}>
          <ToppersGridSection />
        </Suspense>

        {/* Results Summary Stats (Edunex Vibrant Metric Band Archetype) */}
        <div className="bg-[#111827] text-white p-8 sm:p-10 rounded-3xl border-t-4 border-[#B91C1C] shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="font-heading font-black text-4xl text-[#F4CD13]">100%</div>
            <div className="text-sm font-bold uppercase tracking-wider mt-1 text-gray-200">
              CBSE Class X &amp; XII Pass Rate
            </div>
            <div className="text-sm text-gray-400 mt-0.5 font-sans">Consecutive 36-Year Legacy</div>
          </div>
          <div>
            <div className="font-heading font-black text-4xl text-[#F4CD13]">42+</div>
            <div className="text-sm font-bold uppercase tracking-wider mt-1 text-gray-200">
              Scored Above 90% Aggregate
            </div>
            <div className="text-sm text-gray-400 mt-0.5 font-sans">Academic Session 2023–24</div>
          </div>
          <div>
            <div className="font-heading font-black text-4xl text-[#F4CD13]">18+</div>
            <div className="text-sm font-bold uppercase tracking-wider mt-1 text-gray-200">
              NEET / JEE / CUET Qualifiers
            </div>
            <div className="text-sm text-gray-400 mt-0.5 font-sans">Direct from School Campus</div>
          </div>
        </div>
      </div>
    </div>
  );
}
