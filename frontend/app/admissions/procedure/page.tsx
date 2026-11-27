import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { getPublicAdmissionsPublications } from "@/lib/api/admissions-publications";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPublicAdmissionsPublications();
  const session = data.overview?.sessionLabel ?? "2026–27";

  return {
    title: `Admission Procedure & Subject for Entrance Exam (Session ${session}) | Devasthaly Vidyapeeth`,
    description: `Official admission procedure, registration rules, demand draft requirements, and entrance examination subjects for session ${session} at Devasthaly Vidyapeeth, Chilkahar, Ballia.`,
  };
}

export default async function AdmissionProcedurePage() {
  const { procedureRules, entranceSubjects } = await getPublicAdmissionsPublications();

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

          {procedureRules.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#F3F4F6] border border-gray-200/80 text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
              <p className="text-sm text-gray-600 font-sans">
                No admission procedure rules are currently published. Please contact our campus administrative desk.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {procedureRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#F3F4F6] border border-gray-200/80 flex items-start gap-3.5"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#111827] leading-relaxed font-sans font-medium">
                    {rule.ruleText}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Entrance Exam Subjects Table */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/90 shadow-sm space-y-6">
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#111827] flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center text-sm font-bold">2</span>
            <span>Subject For Entrance Examination</span>
          </h2>

          {entranceSubjects.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#F3F4F6] border border-gray-200/80 text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
              <p className="text-sm text-gray-600 font-sans">
                No entrance examination subjects are currently scheduled.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#111827] text-white">
                  <tr>
                    <th className="py-3 px-4 font-heading font-bold w-1/3">CLASS / GROUP</th>
                    <th className="py-3 px-4 font-heading font-bold">EXAMINATION SUBJECTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-sans text-gray-800">
                  {entranceSubjects.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F3F4F6] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#111827]">{item.classGrade}</td>
                      <td className="py-3.5 px-4 font-medium text-gray-700">{item.subjects}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
