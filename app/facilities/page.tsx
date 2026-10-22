import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FACILITIES_DATA } from "@/lib/school-data";
import {
  CheckCircle2,
  ShieldCheck,
  Bus,
  Home,
  Trophy,
  BookOpen,
  FlaskConical,
  Cpu,
  MonitorPlay,
  HeartPulse,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

const FACILITY_IMAGES: Record<string, string> = {
  "fac-smart-classes": "/images/hero-students.jpg",
  "fac-composite-labs": "/images/science-lab.jpg",
  "fac-computer-ai-lab": "/images/hero-bg/hero-bg.webp",
  "fac-hostel-mess": "/images/campus-grounds.jpg",
  "fac-sports-complex": "/images/sports-activities.jpg",
  "fac-gps-transport": "/images/campus-grounds.jpg",
  "fac-library-reading": "/images/principal-mentor.jpg",
  "fac-infirmary-care": "/images/faculty-teachers.jpg",
};

const FACILITY_ICONS: Record<string, React.ElementType> = {
  MonitorPlay,
  FlaskConical,
  Cpu,
  Home,
  Trophy,
  Bus,
  BookOpen,
  HeartPulse,
};

export const metadata: Metadata = {
  title: "Campus Facilities, Hostels & Infrastructure",
  description:
    "Explore the 15-acre green campus of Devasthaly Vidyapeeth, Chilkahar, Ballia. High-tech science labs, smart classrooms, separate air-cooled hostels, pure veg mess, and GPS-tracked bus fleet.",
};

export default function FacilitiesPage() {
  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-12">
        {/* Header */}
        <div className="border-b border-[#E5E7EB] pb-8 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Campus Infrastructure
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#111827]">
            World-Class Infrastructure on a 15-Acre Eco Campus
          </h1>
          <p className="text-sm sm:text-base text-[#4B5563] mt-2 max-w-3xl leading-relaxed">
            Constructed with deliberate care in Chilkahar, Ballia, our campus provides an unpolluted, distraction-free atmosphere equipped with modern laboratories, digital smart classrooms, and safe residential amenities.
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FACILITIES_DATA.map((fac) => {
            const IconComponent = FACILITY_ICONS[fac.iconName] || BookOpen;
            const facilityImage = FACILITY_IMAGES[fac.id] || "/images/campus-grounds.jpg";

            return (
              <div
                key={fac.id}
                id={fac.id.replace("fac-", "")}
                className="relative bg-white hover:bg-[#4F46E5] rounded-2xl sm:rounded-3xl shadow-md hover:shadow-2xl p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                {/* Top Image Container with Inset White Padding */}
                <div>
                  <div className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-xs">
                    <Image
                      src={facilityImage}
                      alt={fac.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Top-Left Category Pill Badge with Icon */}
                    <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4F46E5] group-hover:bg-white text-white group-hover:text-[#4F46E5] text-xs font-bold shadow-sm transition-colors duration-300">
                      <GraduationCap className="w-3.5 h-3.5 text-white group-hover:text-[#4F46E5] transition-colors duration-300" />
                      <span>{fac.category}</span>
                    </div>
                  </div>

                  {/* Sub-header / Meta Capsule Pill with Dashed Border */}
                  <div className="rounded-full border border-dashed border-[#CBD5E1] group-hover:border-white/30 px-3 py-1.5 inline-flex items-center gap-2 w-fit bg-slate-50/70 group-hover:bg-white/15 mb-3 transition-colors duration-300">
                    <div className="w-6 h-6 rounded-full bg-[#EEF2FF] group-hover:bg-white border border-[#C7D2FE] group-hover:border-white flex items-center justify-center shrink-0 transition-colors duration-300">
                      <IconComponent className="w-3.5 h-3.5 text-[#4F46E5] transition-colors duration-300" />
                    </div>
                    <span className="text-xs font-bold text-[#4F46E5] group-hover:text-white transition-colors duration-300">{fac.category}</span>
                    <span className="text-xs text-gray-700 group-hover:text-indigo-100 font-medium truncate max-w-[130px] sm:max-w-[150px] transition-colors duration-300">
                      {fac.highlights[0]}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h2 className="font-heading font-bold text-base sm:text-lg text-[#111827] group-hover:text-white transition-colors duration-300 leading-snug line-clamp-2 mb-2">
                    {fac.title}
                  </h2>

                  {/* Meta Feature Accent Row */}
                  <div className="flex items-center gap-2 text-xs text-[#4F46E5] group-hover:text-white font-semibold mb-3 transition-colors duration-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                    <span className="text-gray-600 group-hover:text-indigo-100 font-medium truncate transition-colors duration-300">
                      {fac.highlights[1] || fac.highlights[0]}
                    </span>
                  </div>

                  {/* Paragraph Description */}
                  <p className="text-xs text-gray-600 group-hover:text-white/95 leading-relaxed font-sans line-clamp-3 mb-4 transition-colors duration-300">
                    {fac.description}
                  </p>
                </div>

                {/* Highlights Bullet List */}
                <div className="pt-3 border-t border-gray-100 group-hover:border-white/20 space-y-1.5 mt-auto transition-colors duration-300">
                  {fac.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-600 group-hover:text-white font-sans transition-colors duration-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] group-hover:bg-white shrink-0 transition-colors duration-300" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hostel Highlight Section */}
        <div id="hostel" className="bg-[#111827] text-white p-8 sm:p-10 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-2 text-[#4F46E5] text-xs font-bold uppercase tracking-wider">
            <Home className="w-4 h-4 text-[#4F46E5]" />
            <span>Residential Boarding Life</span>
          </div>

          <h3 className="font-heading text-2xl sm:text-3xl font-bold">
            A Safe, Caring "Home Away From Home"
          </h3>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl">
            Our residential boarding is structured to instill life-long habits of self-reliance, physical vigor, and focused academic discipline. We maintain completely segregated hostel blocks for boys and girls with strict 24/7 security, resident female and male wardens, and zero tolerance for bullying or ragging.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
              <strong className="block text-white font-bold mb-1">Pure Vegetarian Dining</strong>
              4 freshly prepared, nutritious meals daily crafted by trained chefs under strict hygiene standards.
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
              <strong className="block text-white font-bold mb-1">Evening Supervised Study</strong>
              2 hours of compulsory, teacher-mentored preparation every evening to clear academic doubts.
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
              <strong className="block text-white font-bold mb-1">Parent Connect & Wellness</strong>
              Scheduled weekly tele-calls, round-the-clock nurse on duty, and routine health checks.
            </div>
          </div>
        </div>

        {/* Transport Fleet Section */}
        <div id="transport" className="bg-white p-8 sm:p-10 rounded-2xl shadow-md space-y-4">
          <div className="flex items-center gap-2 text-[#4F46E5] text-xs font-bold uppercase tracking-wider">
            <Bus className="w-4 h-4 text-[#4F46E5]" />
            <span>Day-Scholar Transport Network</span>
          </div>
          <h3 className="font-heading text-2xl font-bold text-[#111827]">
            Safe, GPS-Tracked Transportation Fleet
          </h3>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            Our yellow school buses operate on strictly monitored routes connecting Chilkahar to Ballia City, Rasra Tehsil, Sikanderpur, Nagra, Bilthara Road, and adjacent rural educational nodes. Each bus is equipped with speed governors, CCTV cameras, first-aid kits, and trained female attendants for younger students.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#4F46E5] hover:underline"
            >
              Contact Transport Coordinator for Pick-up Node Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
