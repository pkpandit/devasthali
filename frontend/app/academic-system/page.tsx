import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, BookOpen, CheckCircle2, Download, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Academic System | Devasthaly Vidyapeeth",
  description:
    "Assessment, promotion guidelines, and examination rules at Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default function AcademicSystemPage() {
  return (
    <div className="w-full bg-[#F3F4F6] pb-20">
      {/* Edplus University Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-12 sm:py-16 mb-10 shadow-2xs">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" aria-hidden="true" />
            <span>Academics / System</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            Academic System
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Assessment and Promotion regulations at Devasthaly Vidyapeeth.
          </p>
        </div>
      </div>

      <div className="site-container space-y-8">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-xs space-y-8">
          <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60 shadow-2xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#111827]">
                ASSESSMENT AND PROMOTION
              </h2>
              <p className="text-sm text-gray-500 font-sans">
                Official Examination &amp; Evaluation Regulations
              </p>
            </div>
          </div>

          {/* Verbatim Source Content Preserved */}
          <div className="space-y-4 text-sm sm:text-base text-[#111827] leading-relaxed font-sans">
            <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-gray-200/80 hover:border-red-200 transition-colors">
              <p>
                • Promotions will be decided on the average marks obtained in the Terminal and Final Examinations in addition to the year’s work including the unit test. To pass in any subject, a student has to secure 35% marks except for languages. Any students who losses the progress card will be fined Rs. 25/-.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-gray-200/80 hover:border-red-200 transition-colors">
              <p>
                • Those students who are absent for any of the termination is punishable with expulsion from terminal/unit examination will not be tested earlier or later.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-gray-200/80 hover:border-red-200 transition-colors">
              <p>
                • Willful breach of any of the regulations for the conduct of Examination is punishable with expulsion from examination or if subsequently discovered cancelling of paper.
              </p>
            </div>

            <p className="pt-2 text-gray-700">
              The Parents/Guardians of these students are free to come to the school and meet the class teachers to know the progress of their children/wards on this day.
            </p>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm text-gray-500 font-sans">
              Download the official school prospectus for comprehensive academic curriculum and regulations.
            </span>
            <a
              href="/documents/original/prospectus-2.pdf"
              download
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-heading font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md border border-[#991B1B] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2"
            >
              <Download className="w-4 h-4" />
              Download School Prospectus
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
