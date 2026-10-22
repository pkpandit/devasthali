import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SCHOOL_INFO } from "@/lib/school-data";
import { ShieldCheck, Award, Heart, CheckCircle2, Building, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us & Institutional Heritage Since 1988",
  description:
    "Learn about the 36-year legacy of Devasthaly Vidyapeeth, Chilkahar, Ballia. CBSE Affiliation No. 2130238. Co-educational residential school delivering holistic education in Eastern UP.",
};

export default function AboutPage() {
  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-12">
        {/* Breadcrumb & Header */}
        <div className="border-b border-[#E5E7EB] pb-8 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Home / About Us
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#111827]">
            The Devasthaly Legacy of Excellence
          </h1>
          <p className="text-sm sm:text-base text-[#4B5563] mt-3 max-w-3xl leading-relaxed">
            Founded in 1988, Devasthaly Vidyapeeth was established with the sacred vision of bringing world-class, disciplined English-medium CBSE education to the youth of Ballia, Rasra, and Purvanchal.
          </p>
        </div>

        {/* Key Credentials Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] text-[#4F46E5] flex items-center justify-center shrink-0 border border-[#E5E7EB]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-bold uppercase">Affiliation</span>
              <h3 className="font-heading font-bold text-base text-[#111827]">
                CBSE No. {SCHOOL_INFO.affiliationNo}
              </h3>
              <p className="text-[11px] text-gray-500">School Code: {SCHOOL_INFO.schoolCode}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] text-[#4F46E5] flex items-center justify-center shrink-0 border border-[#E5E7EB]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-bold uppercase">Heritage</span>
              <h3 className="font-heading font-bold text-base text-[#111827]">36+ Glorious Years</h3>
              <p className="text-[11px] text-gray-500">Established in 1988</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] text-[#4F46E5] flex items-center justify-center shrink-0 border border-[#E5E7EB]">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-bold uppercase">Campus</span>
              <h3 className="font-heading font-bold text-base text-[#111827]">15+ Acre Campus</h3>
              <p className="text-[11px] text-gray-500">Residential & Day Boarding</p>
            </div>
          </div>
        </div>

        {/* Narrative & Philosophy */}
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-md space-y-6">
          <h2 className="font-heading text-2xl font-bold text-[#111827]">
            A Beacon of Learning in Eastern Uttar Pradesh
          </h2>
          <p className="text-[#4B5563] leading-relaxed text-sm sm:text-base">
            In 1988, when quality English-medium education affiliated with the Central Board of Secondary Education (CBSE) was largely confined to state capitals, Devasthaly Vidyapeeth took root in Chilkahar, Ballia. Our founders recognized that students in rural and semi-urban eastern Uttar Pradesh possessed unbounded intellect, curiosity, and drive — requiring only the right mentorship, modern infrastructure, and moral grounding to achieve national distinction.
          </p>
          <p className="text-[#4B5563] leading-relaxed text-sm sm:text-base">
            Over three and a half decades, our campus has expanded across a peaceful 15-acre green estate equipped with state-of-the-art physics, chemistry, biology, and computer/AI laboratories, a 10,000-volume library, modern athletics grounds, and separate air-cooled residential hostels for boys and girls.
          </p>

          <div className="pt-6 border-t border-[#E5E7EB] grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "NCERT & NEP 2020 aligned curriculum framework",
              "100% board examination pass rate across 36 years",
              "Alumni in IITs, AIIMS, National Defence Academy & Civil Services",
              "Strict anti-ragging, POCSO compliance and child safety guidelines",
              "Supervised evening study sessions for all residential boarders",
              "Comprehensive transport network covering Ballia & Rasra",
            ].map((pt, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#111827]">
                <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Strip */}
        <div className="bg-[#111827] text-white p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-heading text-xl font-bold">Visit Our Chilkahar Campus</h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              Experience our disciplined campus life, laboratories, and green hostel environment in person.
            </p>
          </div>
          <Link
            href="/admissions"
            className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shrink-0 shadow-xs border border-[#4338CA]"
          >
            Apply for Admission 2025–26
          </Link>
        </div>
      </div>
    </div>
  );
}
