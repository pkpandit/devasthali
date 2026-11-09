import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { TOPPERS_DATA, TOPPER_IMAGE_MAP } from "@/lib/content/academics";
import { Award, GraduationCap, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "CBSE Board Examination Results & Toppers | Devasthaly",
  description:
    "Check CBSE Class 10 and Class 12 Board examination results, merit rankings, and academic toppers from Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

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

        {/* Board Toppers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOPPERS_DATA.map((topper, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Top Image Container */}
                <div className="relative w-full aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-xs">
                  <Image
                    src={TOPPER_IMAGE_MAP[topper.name] || "/images/home/hero/hero-students.jpg"}
                    alt={`${topper.name} - ${topper.grade} CBSE Topper`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Top-Left Grade Badge */}
                  <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B91C1C] text-white text-sm font-bold shadow-sm">
                    <GraduationCap className="w-3.5 h-3.5 text-white" />
                    <span>{topper.grade}</span>
                  </div>
                  {/* Top-Right Year Badge */}
                  <div className="absolute top-3 right-3 z-10 inline-flex items-center px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[#111827] text-sm font-bold shadow-xs">
                    <span>{topper.year}</span>
                  </div>
                </div>

                {/* Sub-header / Stream Capsule Pill with Dashed Border */}
                <div className="rounded-full border border-dashed border-[#CBD5E1] px-3 py-1 inline-flex items-center gap-1.5 w-fit bg-slate-50 mb-3 transition-colors duration-300">
                  <Award className="w-3.5 h-3.5 text-[#B91C1C]" />
                  <span className="text-sm font-medium text-gray-700">
                    {topper.stream || "Board Distinction"}
                  </span>
                </div>

                {/* Score & Name */}
                <div className="font-heading font-black text-3xl sm:text-4xl text-[#B91C1C] mb-1.5 tracking-tight">
                  {topper.score}
                </div>
                <h3 className="font-heading font-bold text-lg text-[#111827] group-hover:text-[#B91C1C] transition-colors mb-2">
                  {topper.name}
                </h3>
                <p className="text-base text-gray-600 bg-[#F3F4F6] p-3 rounded-xl border border-[#E5E7EB] font-sans leading-relaxed">
                  {topper.achievement}
                </p>
              </div>
            </div>
          ))}
        </div>

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
