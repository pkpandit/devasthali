import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { TOPPERS_DATA } from "@/lib/school-data";
import { Award, Trophy, GraduationCap, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "CBSE Board Examination Results & Toppers | Devasthaly",
  description:
    "Check CBSE Class 10 and Class 12 Board examination results, merit rankings, and academic toppers from Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

const TOPPER_IMAGES: Record<string, string> = {
  "Priya Singh": "/images/topper-priya.jpg",
  "Aman Kumar Verma": "/images/topper-aman.jpg",
  "Shweta Tiwari": "/images/topper-shweta.jpg",
  "Rohan Upadhyay": "/images/topper-rohan.jpg",
};

export default function ResultsPage() {
  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-12">
        <div className="border-b border-[#E5E7EB] pb-6 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Academic Excellence / Results
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#111827]">
            CBSE Board Examination Results & Toppers
          </h1>
          <p className="text-sm text-[#4B5563] mt-2 max-w-3xl">
            Celebrating consistent 100% board pass track records and district merit toppers who bring glory to Ballia and Purvanchal.
          </p>
        </div>

        {/* Board Toppers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOPPERS_DATA.map((topper, idx) => (
            <div
              key={idx}
              className="relative bg-white hover:bg-[#4F46E5] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Top Image Container */}
                <div className="relative w-full aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-xs">
                  <Image
                    src={TOPPER_IMAGES[topper.name] || "/images/hero-students.jpg"}
                    alt={`${topper.name} - ${topper.grade} CBSE Topper`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Top-Left Grade Badge */}
                  <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4F46E5] group-hover:bg-white text-white group-hover:text-[#4F46E5] text-xs font-bold shadow-sm transition-colors duration-300">
                    <GraduationCap className="w-3.5 h-3.5 text-white group-hover:text-[#4F46E5] transition-colors duration-300" />
                    <span>{topper.grade}</span>
                  </div>
                  {/* Top-Right Year Badge */}
                  <div className="absolute top-3 right-3 z-10 inline-flex items-center px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm group-hover:bg-white/20 text-[#111827] group-hover:text-white text-xs font-bold shadow-xs transition-colors duration-300">
                    <span>{topper.year}</span>
                  </div>
                </div>

                {/* Sub-header / Stream Capsule Pill with Dashed Border */}
                <div className="rounded-full border border-dashed border-[#CBD5E1] group-hover:border-white/30 px-3 py-1 inline-flex items-center gap-1.5 w-fit bg-slate-50/70 group-hover:bg-white/15 mb-3 transition-colors duration-300">
                  <Award className="w-3.5 h-3.5 text-[#4F46E5] group-hover:text-white transition-colors duration-300" />
                  <span className="text-xs font-medium text-gray-700 group-hover:text-white transition-colors duration-300">
                    {topper.stream || "Board Distinction"}
                  </span>
                </div>

                {/* Score & Name */}
                <div className="font-heading font-black text-3xl sm:text-4xl text-[#4F46E5] group-hover:text-white mb-1.5 transition-colors duration-300">
                  {topper.score}
                </div>
                <h3 className="font-heading font-bold text-lg text-[#111827] group-hover:text-white mb-2 transition-colors duration-300">
                  {topper.name}
                </h3>
                <p className="text-xs text-[#4B5563] group-hover:text-white bg-[#F3F4F6] group-hover:bg-white/15 p-3 rounded-xl border border-[#E5E7EB] group-hover:border-white/20 font-sans leading-relaxed transition-colors duration-300">
                  {topper.achievement}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Results Summary Stats */}
        <div className="bg-[#111827] text-white p-8 sm:p-10 rounded-2xl shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="font-heading font-black text-4xl text-[#4F46E5]">100%</div>
            <div className="text-xs font-bold uppercase tracking-wider mt-1 text-gray-200">
              CBSE Class X & XII Pass Rate
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Consecutive 36-Year Legacy</div>
          </div>
          <div>
            <div className="font-heading font-black text-4xl text-[#4F46E5]">42+</div>
            <div className="text-xs font-bold uppercase tracking-wider mt-1 text-gray-200">
              Scored Above 90% Aggregate
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Academic Session 2023–24</div>
          </div>
          <div>
            <div className="font-heading font-black text-4xl text-[#4F46E5]">18+</div>
            <div className="text-xs font-bold uppercase tracking-wider mt-1 text-gray-200">
              NEET / JEE / CUET Qualifiers
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Direct from School Campus</div>
          </div>
        </div>
      </div>
    </div>
  );
}
