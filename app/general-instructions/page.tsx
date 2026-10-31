import React from "react";
import type { Metadata } from "next";
import { Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "General Instructions | Devasthaly Vidyapeeth",
  description:
    "Official school rules, code of conduct, and general instructions for students and parents at Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default function GeneralInstructionsPage() {
  const instructions = [
    "Attendance in prayer, physical training, social service assignments, sports and games, Yoga and Meditation classes and extension lecture of Saturday etc. is compulsory. Absence in any one of them would be treated as absent for the whole days and student fined accordingly.",
    "Students coming late will not be allowed to attend classes.",
    "Parents and servants also will not be allowed to meet a student during school hours. In special cases and emergencies they would be required to contact the Principal and seek permission.",
    "Every student must be present on the day the school reopens after each vacation.",
    "Parents are advised to plan their holidays according to the vacation fixed by the school.",
    "It is also advisable that parents do not disturb their child to attend weddings and other functions during the academic period.",
    "No student can leave school premises during school hours without the written permission of the Principal.",
    "The Principal has right to suspend any student if his / her conduct and / or progress is not satisfactory.",
    "Suggestions / complaints, if any, should be lodged in writing and in confidence to the Principal.",
  ];

  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Full-Width White Edunex Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>Students & Parents / Guidelines</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            General Instructions
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Institutional code of conduct, discipline guidelines, and rules for students and guardians.
          </p>
        </div>
      </div>

      <div className="site-container">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60 shadow-2xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#111827]">
                School Rules &amp; Regulations
              </h2>
              <p className="text-sm text-gray-500 font-sans">
                Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {instructions.map((item, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-[#F3F4F6] border border-gray-200/80 hover:border-red-300 hover:bg-white transition-all duration-300 flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-[#B91C1C] font-heading font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                  {index + 1}
                </div>
                <p className="text-sm text-[#111827] leading-relaxed font-sans pt-0.5">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

