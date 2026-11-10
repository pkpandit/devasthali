import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Admission Procedure & Subject for Entrance Exam | Devasthaly Vidyapeeth",
  description:
    "Official admission procedure, registration rules (16th Jan to 20th March), demand draft requirements, and entrance examination subjects for Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default function AdmissionProcedurePage() {
  const rules = [
    "Before admission child’s name has to be registered (16th January to 20th of March) in advance. A sum of Rs.1000/- is charged as registration fee for boarder and day scholar. The said payment is to done in form of Demand Draft (DD) in favour of \"Principal Devasthaly, Devasthaly Ballia\", Payable at Ballia, Along with application form.",
    "No admission will be granted to the student unless a transfer certificate from the previous institution is produced along with application form",
    "Formal admission is completed after the perusal of the application form by the principal and the parents are informed of his decision after a test and an interview",
    "Every student will have to produce a birth certificate from from the Hospital, Nursing home, The Municipality or the Gram Panchayat",
    "The child must have attained the age of four years at the time of admission in L.K.G.",
    "If the child fails for two successive years he/ she will not allowed to continue his/her education in this institute",
  ];

  const examSubjects = [
    { grade: "L.K.G.", subjects: "Oral Test" },
    { grade: "U.K.G. To V", subjects: "English, Hindi, Maths" },
    { grade: "VI to IX", subjects: "English, Maths, Science" },
    { grade: "XI (Maths & Bio Group)", subjects: "English, Maths, Science" },
    { grade: "XI (Commerce Group)", subjects: "English, Social Science & Maths" },
    { grade: "XI (Humanity Group)", subjects: "English, Hindi & Social Science" },
  ];

  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Full-Width White Edunex Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>Admissions / Guidelines</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            Admission Procedure &amp; Entrance Details
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Official guidelines, registration timeline, and entrance examination subjects for Devasthaly Vidyapeeth.
          </p>
        </div>
      </div>

      <div className="site-container space-y-10">
        {/* Registration Terms Card */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/90 shadow-sm space-y-6">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#111827] flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center text-sm font-bold">1</span>
            <span>Registration &amp; Eligibility Guidelines</span>
          </h2>

          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-[#F3F4F6] border border-gray-200/80 flex items-start gap-3.5"
              >
                <CheckCircle2 className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" />
                <p className="text-sm text-[#111827] leading-relaxed font-sans font-medium">
                  {rule}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Entrance Exam Subjects Table */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/90 shadow-sm space-y-6">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#111827] flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center text-sm font-bold">2</span>
            <span>Subject For Entrance Examination</span>
          </h2>

          <div className="overflow-x-auto border border-gray-200 rounded-2xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#111827] text-white">
                <tr>
                  <th className="py-3 px-4 font-heading font-bold w-1/3">CLASS / GROUP</th>
                  <th className="py-3 px-4 font-heading font-bold">EXAMINATION SUBJECTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-sans text-gray-800">
                {examSubjects.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#F3F4F6] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#111827]">{item.grade}</td>
                    <td className="py-3.5 px-4 font-medium text-gray-700">{item.subjects}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100">
            <Link
              href="/admissions/fees"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#111827] border border-[#E5E7EB] hover:bg-[#B91C1C] hover:text-white hover:border-[#B91C1C] [&_svg]:transition-colors [&_svg]:duration-150 hover:[&_svg]:text-white text-sm font-heading font-bold transition-all hover:-translate-y-0.5 shadow-2xs hover:shadow-xs focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2"
            >
              <span>View Official Fee Structure</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/online-admission-form"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-heading font-bold transition-all shadow-sm hover:shadow-md border border-[#991B1B] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2"
            >
              <span>Fill Online Admission Form</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
