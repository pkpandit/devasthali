import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Quote, Award, BookOpen, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Principal’s Message | Devasthaly Vidyapeeth",
  description:
    "Read the address from the Principal of Devasthaly Vidyapeeth, Chilkahar, Ballia. Insights on educational philosophy, CBSE curriculum, student character building, and academic excellence.",
};

export default function PrincipalsMessagePage() {
  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-10">
        {/* Header */}
        <div className="border-b border-[#E5E7EB] pb-8 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Leadership / Address
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#111827]">
            Principal’s Message
          </h1>
          <p className="text-sm sm:text-base text-[#4B5563] mt-2">
            A welcoming message to parents, students, and well-wishers of Devasthaly Vidyapeeth.
          </p>
        </div>

        {/* Message Container */}
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E5E7EB] shadow-xs relative space-y-6">
          <Quote className="w-12 h-12 text-[#4F46E5]/15 absolute top-8 right-8" />

          {/* Principal Bio Card */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#E5E7EB]">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xs shrink-0 bg-[#111827]">
              <Image
                src="/images/principal-mentor.jpg"
                alt="Dr. K. N. Pandey - Principal & Academic Director"
                fill
                priority
                sizes="(max-width: 640px) 96px, 112px"
                className="object-cover object-top"
              />
            </div>
            <div className="text-left">
              <h2 className="font-heading text-2xl font-bold text-[#111827]">Dr. K. N. Pandey</h2>
              <p className="text-xs text-[#4F46E5] font-bold uppercase tracking-wider mt-0.5">
                Principal & Academic Director
              </p>
              <p className="text-xs text-gray-500 mt-1">
                M.Sc. (Physics), M.Ed., Ph.D. in Education • 24+ Years of Pedagogical Leadership
              </p>
            </div>
          </div>

          <div className="space-y-4 text-[#4B5563] text-sm sm:text-base leading-relaxed">
            <p className="font-heading italic text-lg text-[#111827]">
              "Dear Parents, Guardians, and Esteemed Scholars,"
            </p>
            <p>
              It brings me profound joy to welcome you to Devasthaly Vidyapeeth. As an educator who has witnessed the transformation of thousands of young minds over decades, I firmly believe that education is not merely the transmission of textbook syllabus, but the lighting of a flame that illuminates character, intellect, and conscience.
            </p>
            <p>
              In eastern Uttar Pradesh, our students carry extraordinary resilience, diligence, and raw ambition. When provided with an environment that combines modern scientific inquiry, digital smart-classroom infrastructure, and an unyielding commitment to moral discipline, our children achieve wonders — gaining admissions into IITs, medical colleges, the armed forces, and esteemed universities across India.
            </p>
            <p>
              At Devasthaly, we treat each day-scholar and residential boarder as our own child. Our low student-teacher ratio (1:25) ensures that no child is lost in the crowd. Our hostel ecosystem is carefully designed to foster camaraderie, healthy nutritional habits, physical vigor on the sports field, and focused evening study hours.
            </p>
            <p>
              We welcome you to join hands with us as partners in shaping your child’s magnificent future.
            </p>
            <p className="pt-4 font-heading font-bold text-[#111827]">
              Warm regards,<br />
              <strong className="text-[#4F46E5]">Dr. K. N. Pandey</strong><br />
              <span className="text-xs text-gray-500 font-sans font-normal">
                Principal, Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
