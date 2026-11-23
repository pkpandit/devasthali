import React from "react";
import type { Metadata } from "next";
import { Sparkles, ShieldAlert, AlertCircle } from "lucide-react";
import { getPublicInstructions } from "@/lib/api/instructions";

export const metadata: Metadata = {
  title: "General Instructions | Devasthaly Vidyapeeth",
  description:
    "Official school rules, code of conduct, and general instructions for students and parents at Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default async function GeneralInstructionsPage() {
  const { overview, instructions } = await getPublicInstructions();

  const badgeText = overview?.badgeText || "Students & Parents / Guidelines";
  const title = overview?.title || "General Instructions";
  const subtitle =
    overview?.subtitle ||
    "Institutional code of conduct, discipline guidelines, and rules for students and guardians.";
  const cardTitle = overview?.cardTitle || "School Rules & Regulations";
  const cardSubtitle =
    overview?.cardSubtitle || "Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)";

  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Full-Width White Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>{badgeText}</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
              {subtitle}
            </p>
          )}
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
                {cardTitle}
              </h2>
              {cardSubtitle && (
                <p className="text-sm text-gray-500 font-sans">
                  {cardSubtitle}
                </p>
              )}
            </div>
          </div>

          {instructions.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-2xl bg-[#F9FAFB] border border-dashed border-gray-300">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-base font-semibold text-gray-800 mb-1">
                Policy Guidelines Notice
              </h3>
              <p className="text-sm text-gray-500 font-sans max-w-md mx-auto">
                Official school rules and guidelines are currently being reviewed for the upcoming session.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {instructions.map((item, index) => (
                <div
                  key={item.id || index}
                  className={`p-5 rounded-2xl bg-[#F3F4F6] border ${
                    item.isCritical
                      ? "border-red-200/80 hover:border-red-400"
                      : "border-gray-200/80 hover:border-red-300"
                  } hover:bg-white transition-all duration-300 flex items-start gap-4`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-[#B91C1C] font-heading font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-1.5 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-gray-600 bg-gray-100/90 border border-gray-200/70 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                      {item.isCritical && (
                        <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Critical
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#111827] leading-relaxed font-sans">
                      {item.ruleText}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
