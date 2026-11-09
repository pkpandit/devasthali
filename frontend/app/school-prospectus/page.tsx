import React from "react";
import type { Metadata } from "next";
import { Sparkles, Download, FileText, CheckCircle2, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "School Prospectus (Session 2026–27) | Devasthaly Vidyapeeth",
  description:
    "Download the official School Prospectus of Devasthaly Vidyapeeth, Chilkahar, Ballia. Comprehensive academic, residential, curriculum, and admission guidelines.",
};

export default function SchoolProspectusPage() {
  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Full-Width White Edunex Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>Admissions / Prospectus</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            School Prospectus (Session 2026–27)
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Official institutional handbook, code of conduct, and curriculum syllabus for Devasthaly Vidyapeeth.
          </p>
        </div>
      </div>

      <div className="site-container max-w-4xl space-y-8">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center mx-auto border border-red-100/60 shadow-2xs">
            <FileText className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-[#111827]">
              Official Devasthaly Vidyapeeth Prospectus
            </h2>
            <p className="text-sm text-gray-600 font-sans leading-relaxed">
              Complete publication containing the vision of Founder Shri Chandra Shekhar, admission eligibility, code of conduct, academic syllabus, examination assessment rules, and hostel guidelines.
            </p>
          </div>

          <div className="pt-4">
            <a
              href="/documents/original/prospectus-2.pdf"
              download
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-heading font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg border border-[#991B1B] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2"
            >
              <Download className="w-5 h-5" />
              <span>Download Official Prospectus PDF (5.6 MB)</span>
            </a>
          </div>

          <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 font-sans">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#B91C1C]" />
              <span>Affiliation No: 2130238</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#B91C1C]" />
              <span>School Code: 70184</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#B91C1C]" />
              <span>Session 2026–27</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

