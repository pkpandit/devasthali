import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Award, Building2, ShieldCheck, Heart, Quote, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Alumni Network & Success Stories | Devasthaly Vidyapeeth",
  description:
    "Discover the global achievements of Devasthaly Vidyapeeth alumni. Graduates leading in IITs, AIIMS, Indian Armed Forces, Civil Services, and global enterprises.",
};

export default function AlumniPage() {
  const alumniList = [
    {
      name: "Major Vikramaditya Rai",
      batch: "Class of 2004",
      field: "Indian Armed Forces (Indian Army)",
      role: "Sena Medal Awardee • Commissioned Officer",
      quote:
        "The morning drill, physical rigor, and patriotic discipline instilled at Devasthaly’s Chilkahar campus laid the rock-solid foundation for my military career.",
    },
    {
      name: "Dr. Ananya Pandey",
      batch: "Class of 2012",
      field: "Medicine & Surgery",
      role: "Resident Surgeon • AIIMS New Delhi",
      quote:
        "Our biology and chemistry teachers in Chilkahar gave us hands-on lab training that matched the best institutions in the country. Forever grateful.",
    },
    {
      name: "Er. Saurabh Mishra",
      batch: "Class of 2016",
      field: "Technology & Software",
      role: "Senior AI Systems Engineer • Bengaluru",
      quote:
        "The computer lab at Devasthaly opened my eyes to programming when I was in Class VIII. It transformed a village boy into a global technologist.",
    },
  ];

  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-10">
        <div className="border-b border-[#E5E7EB] pb-6 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Legacy / Community
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#111827]">
            Alumni Network & Success Stories
          </h1>
          <p className="text-sm text-[#4B5563] mt-2 max-w-3xl">
            Over 3,500 alumni across India and the globe carry forward the values of Devasthaly Vidyapeeth in defense, medicine, technology, civil administration, and entrepreneurship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {alumniList.map((al, idx) => (
            <div
              key={idx}
              className="bg-white p-7 rounded-3xl shadow-md hover:shadow-xl flex flex-col justify-between transition-all duration-300"
            >
              <div>
                <h3 className="font-heading font-bold text-base text-[#111827] mb-1">
                  {al.field}
                </h3>
                <div className="flex items-center gap-1 mb-4 text-[#F59E0B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-sans mb-6">
                  &quot;{al.quote}&quot;
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4 mt-auto">
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#111827]">{al.name}</h4>
                  <p className="text-xs font-semibold text-[#4F46E5]">{al.role}</p>
                  <p className="text-[11px] text-gray-500">{al.batch}</p>
                </div>
                <Quote className="w-10 h-10 text-slate-200 shrink-0 select-none pointer-events-none" strokeWidth={2.5} />
              </div>
            </div>
          ))}
        </div>

        {/* Join Alumni Network Card */}
        <div className="bg-[#111827] text-white p-8 rounded-2xl text-center space-y-4 border border-gray-800 shadow-md">
          <h2 className="font-heading text-2xl font-bold">Are You an Alumnus of Devasthaly?</h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Stay connected with your alma mater, mentor current students, and attend annual alumni gatherings in Ballia.
          </p>
          <a
            href="mailto:alumni@devasthalyballia.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs border border-[#4338CA]"
          >
            Register in Alumni Directory
          </a>
        </div>
      </div>
    </div>
  );
}
