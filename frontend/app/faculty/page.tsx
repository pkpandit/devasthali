import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { FACULTY_DATA, FACULTY_IMAGE_MAP } from "@/lib/content/academics";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Faculty & Academic Mentors | Devasthaly Vidyapeeth",
  description:
    "Meet the experienced Post Graduate Teachers (PGTs) and academic mentors at Devasthaly Vidyapeeth, Chilkahar, Ballia. Dedicated educators shaping future leaders.",
};

export default function FacultyPage() {
  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Edunex Page Header */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-heading font-bold bg-red-50 text-[#B91C1C] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academics / Faculty</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            Our Faculty &amp; Academic Mentors
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-2 max-w-3xl leading-relaxed font-sans">
            At Devasthaly Vidyapeeth, our educators are experienced mentors who balance rigorous CBSE academic delivery with personal character building and individual attention.
          </p>
        </div>
      </div>

      <div className="site-container space-y-10">

        {/* Faculty Grid - 4 Columns (Edunex Instructor Archetype) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FACULTY_DATA.map((fac, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group text-center"
            >
              <div className="p-6">
                {/* Edunex Circular Instructor Portrait with Soft Backdrop Ring */}
                <div className="relative w-32 h-32 mx-auto rounded-full p-1 bg-gradient-to-tr from-red-100 via-slate-100 to-amber-100 shadow-md mb-4 group-hover:scale-105 transition-transform duration-300">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                    <Image
                      src={FACULTY_IMAGE_MAP[fac.name] || "/images/academics/faculty/faculty-teachers.jpg"}
                      alt={`${fac.name} - ${fac.designation}`}
                      fill
                      sizes="(max-width: 640px) 128px, 128px"
                      className="object-cover object-top"
                    />
                  </div>
                </div>

                <span className="inline-block text-sm font-bold uppercase tracking-wider text-[#B91C1C] bg-red-50 px-3 py-1 rounded-full border border-red-100/60 mb-2">
                  {fac.department}
                </span>

                <h3 className="font-heading font-bold text-lg text-[#111827] group-hover:text-[#B91C1C] transition-colors mb-1 line-clamp-1">
                  {fac.name}
                </h3>
                <p className="text-sm font-semibold text-gray-500 mb-3">{fac.designation}</p>

                <p className="text-base text-gray-600 bg-[#F3F4F6] p-2.5 rounded-2xl border border-[#E5E7EB] leading-relaxed line-clamp-2 font-sans">
                  {fac.qualification}
                </p>
              </div>

              <div className="px-6 py-3.5 bg-[#F3F4F6]/80 border-t border-gray-100 text-sm text-gray-500 flex items-center justify-between font-sans">
                <span>Experience:</span>
                <strong className="text-[#111827] font-heading font-bold">{fac.experienceYears}+ Years</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
