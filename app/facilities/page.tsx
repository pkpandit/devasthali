import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FACILITIES_DATA } from "@/lib/school-data";
import {
  CheckCircle2,
  Bus,
  Home,
  Trophy,
  BookOpen,
  FlaskConical,
  Cpu,
  MonitorPlay,
  HeartPulse,
  GraduationCap,
  Sparkles,
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
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Edunex Page Header */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-heading font-bold bg-red-50 text-[#B91C1C] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Infrastructure</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            World-Class Infrastructure on a 15-Acre Eco Campus
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-2 max-w-3xl leading-relaxed font-sans">
            Constructed with deliberate care in Chilkahar, Ballia, our campus provides an unpolluted, distraction-free atmosphere equipped with modern laboratories, digital smart classrooms, and safe residential amenities.
          </p>
        </div>
      </div>

      <div className="site-container space-y-10">

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FACILITIES_DATA.map((fac) => {
            const IconComponent = FACILITY_ICONS[fac.iconName] || BookOpen;
            const facilityImage = FACILITY_IMAGES[fac.id] || "/images/campus-grounds.jpg";

            const elementId = fac.id === "fac-hostel-mess" ? "hostel" : fac.id.replace("fac-", "");
            return (
              <div
                key={fac.id}
                id={elementId}
                className="scroll-mt-28 bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                {/* Top Image Container with Inset White Padding */}
                <div>
                  <div className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-xs">
                    <Image
                      src={facilityImage}
                      alt={fac.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Top-Left Category Pill Badge with Icon */}
                    <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B91C1C] text-white text-sm font-bold shadow-sm">
                      <GraduationCap className="w-3.5 h-3.5 text-white" />
                      <span>{fac.category}</span>
                    </div>
                  </div>

                  {/* Sub-header / Meta Capsule Pill with Dashed Border */}
                  <div className="rounded-full border border-dashed border-gray-300 px-3 py-1.5 inline-flex items-center gap-2 w-fit bg-slate-50 mb-3 transition-colors duration-300">
                    <div className="w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                      <IconComponent className="w-3.5 h-3.5 text-[#B91C1C]" />
                    </div>
                    <span className="text-sm font-bold text-[#B91C1C]">{fac.category}</span>
                    <span className="text-sm text-gray-700 font-medium truncate max-w-[110px] sm:max-w-[130px]">
                      {fac.highlights[0]}
                    </span>
                  </div>

                  {/* Card Title */}
                  <h2 className="font-heading font-bold text-base text-[#111827] group-hover:text-[#B91C1C] transition-colors duration-300 leading-snug line-clamp-2 mb-2">
                    {fac.title}
                  </h2>

                  {/* Meta Feature Accent Row */}
                  <div className="flex items-center gap-2 text-sm text-[#B91C1C] font-semibold mb-3">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B91C1C] shrink-0" />
                    <span className="text-gray-600 font-medium truncate">
                      {fac.highlights[1] || fac.highlights[0]}
                    </span>
                  </div>

                  {/* Paragraph Description */}
                  <p className="text-base text-gray-600 leading-relaxed font-sans line-clamp-3 mb-4">
                    {fac.description}
                  </p>
                </div>

                {/* Highlights Bullet List */}
                <div className="pt-3 border-t border-gray-100 space-y-1.5 mt-auto">
                  {fac.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C] shrink-0" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hostel Highlight Section */}
        <div id="hostel" className="bg-[#111827] text-white p-8 sm:p-10 rounded-3xl border-t-4 border-[#B91C1C] shadow-xl space-y-6">
          <div className="flex items-center gap-2 text-[#F4CD13] text-sm font-bold uppercase tracking-wider">
            <Home className="w-4 h-4 text-[#F4CD13]" />
            <span>Residential Boarding Life</span>
          </div>

          <h3 className="font-heading text-2xl sm:text-3xl font-bold">
            A Safe, Caring &ldquo;Home Away From Home&rdquo;
          </h3>

          <p className="text-base text-gray-300 leading-relaxed max-w-3xl font-sans">
            Our residential boarding is structured to instill life-long habits of self-reliance, physical vigor, and focused academic discipline. We maintain completely segregated hostel blocks for boys and girls with strict 24/7 security, resident female and male wardens, and zero tolerance for bullying or ragging.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300 font-sans">
              <strong className="block text-white font-bold mb-1 font-heading text-sm">Pure Vegetarian Dining</strong>
              4 freshly prepared, nutritious meals daily crafted by trained chefs under strict hygiene standards.
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300 font-sans">
              <strong className="block text-white font-bold mb-1 font-heading text-sm">Evening Supervised Study</strong>
              2 hours of compulsory, teacher-mentored preparation every evening to clear academic doubts.
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300 font-sans">
              <strong className="block text-white font-bold mb-1 font-heading text-sm">Parent Connect & Wellness</strong>
              Scheduled weekly tele-calls, round-the-clock nurse on duty, and routine health checks.
            </div>
          </div>
        </div>

        {/* Transport Fleet Section */}
        <div id="transport" className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#B91C1C] text-sm font-bold uppercase tracking-wider">
            <Bus className="w-4 h-4 text-[#B91C1C]" />
            <span>Day-Scholar Transport Network</span>
          </div>
          <h3 className="font-heading text-2xl font-bold text-[#111827]">
            Safe, GPS-Tracked Transportation Fleet
          </h3>
          <p className="text-base text-gray-600 leading-relaxed font-sans">
            Our yellow school buses operate on strictly monitored routes connecting Chilkahar to Ballia City, Rasra Tehsil, Sikanderpur, Nagra, Bilthara Road, and adjacent rural educational nodes. Each bus is equipped with speed governors, CCTV cameras, first-aid kits, and trained female attendants for younger students.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#B91C1C] hover:underline"
            >
              Contact Transport Coordinator for Pick-up Node Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
