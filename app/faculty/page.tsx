import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { FACULTY_DATA } from "@/lib/school-data";
import { GraduationCap, Award, BookOpen, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Faculty & Academic Mentors | Devasthaly Vidyapeeth",
  description:
    "Meet the experienced Post Graduate Teachers (PGTs) and academic mentors at Devasthaly Vidyapeeth, Chilkahar, Ballia. Dedicated educators shaping future leaders.",
};

const FACULTY_IMAGE_MAP: Record<string, string> = {
  "Dr. K. N. Pandey": "/images/principal-mentor.jpg",
  "Smt. Manorama Singh": "/images/faculty-vice-principal.jpg",
  "Shri Rajeshwar Nath Rai": "/images/faculty-math-teacher.jpg",
  "Dr. Alok Srivastava": "/images/faculty-chemistry-teacher.jpg",
  "Smt. Priyanka Mishra": "/images/faculty-biology-teacher.jpg",
  "Shri Devendra Yadav": "/images/faculty-sports-director.jpg",
};

export default function FacultyPage() {
  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-10">
        <div className="border-b border-[#E5E7EB] pb-6 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Academics / Faculty
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#111827]">
            Our Faculty & Academic Mentors
          </h1>
          <p className="text-sm text-[#4B5563] mt-2 max-w-3xl">
            At Devasthaly Vidyapeeth, our educators are experienced mentors who balance rigorous CBSE academic delivery with personal character building and individual attention.
          </p>
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FACULTY_DATA.map((fac, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Full-Width Teacher Image inside Card */}
                <div className="relative w-full aspect-[4/3] bg-[#F3F4F6] overflow-hidden border-b border-[#E5E7EB]">
                  <Image
                    src={FACULTY_IMAGE_MAP[fac.name] || "/images/faculty-teachers.jpg"}
                    alt={`${fac.name} - ${fac.designation}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#374151] bg-[#F3F4F6] px-2.5 py-1 rounded-md border border-[#E5E7EB]">
                    {fac.department}
                  </span>
                  <h3 className="font-heading font-bold text-lg text-[#111827] mt-3 mb-1">
                    {fac.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#4F46E5] mb-3">{fac.designation}</p>
                  <p className="text-xs text-[#4B5563] bg-[#F3F4F6] p-3 rounded-xl border border-[#E5E7EB] leading-relaxed">
                    {fac.qualification}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-[#E5E7EB] text-xs text-gray-500 flex items-center justify-between">
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
