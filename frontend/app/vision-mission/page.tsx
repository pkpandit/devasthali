import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Sparkles,
  Compass,
  Target,
  Award,
  Heart,
  Shield,
  BookOpen,
  GraduationCap,
  Lightbulb,
} from "lucide-react";
import { getPublicVisionMission } from "@/lib/api/about-leadership";

export const metadata: Metadata = {
  title: "Vision and Mission | Devasthaly Vidyapeeth",
  description:
    "Vision and mission of Devasthaly Vidyapeeth, Chilkahar, Ballia. Imparting comprehensive modern education with valuable Indian traditions since 1988.",
};

const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>
> = {
  Compass,
  Target,
  Award,
  Heart,
  Shield,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Sparkles,
};

export default async function VisionMissionPage() {
  const { setting, coreValues } = await getPublicVisionMission();

  // If setting is unpublished/null AND core values collection is empty, page is unpublished
  if (!setting && coreValues.length === 0) {
    notFound();
  }

  const VisionIconComp =
    (setting?.visionIcon && ICON_MAP[setting.visionIcon]) || Compass;
  const MissionIconComp =
    (setting?.missionIcon && ICON_MAP[setting.missionIcon]) || Target;

  return (
    <div className="w-full bg-[#F9FAFB] pb-20">
      {/* 1. Page Header Banner (Rendered only when VisionMissionSetting is published) */}
      {setting && (
        <div className="w-full bg-white border-b border-gray-200/80 py-12 sm:py-16 mb-12">
          <div className="site-container">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" aria-hidden="true" />
              <span>{setting.breadcrumb}</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
              {setting.heading}
            </h1>
            <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
              {setting.subheading}
            </p>
          </div>
        </div>
      )}

      <div className={`site-container space-y-12 ${!setting ? "pt-12" : ""}`}>
        {/* 2. Twin Vision & Mission Cards (Rendered when setting is published) */}
        {setting && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Vision Card */}
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-red-300 transition-all duration-300 space-y-6 group">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center border border-red-100/60 shadow-2xs group-hover:scale-105 transition-transform">
                <VisionIconComp className="w-7 h-7" aria-hidden="true" />
              </div>
              <div className="space-y-3">
                <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#111827] tracking-tight group-hover:text-[#B91C1C] transition-colors">
                  {setting.visionTitle}
                </h2>
                <div className="h-1 w-12 bg-[#B91C1C] rounded-full" aria-hidden="true" />
              </div>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-sans whitespace-pre-line">
                {setting.visionBody}
              </p>
            </div>

            {/* Mission Card */}
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-red-300 transition-all duration-300 space-y-6 group">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center border border-red-100/60 shadow-2xs group-hover:scale-105 transition-transform">
                <MissionIconComp className="w-7 h-7" aria-hidden="true" />
              </div>
              <div className="space-y-3">
                <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#111827] tracking-tight group-hover:text-[#B91C1C] transition-colors">
                  {setting.missionTitle}
                </h2>
                <div className="h-1 w-12 bg-[#B91C1C] rounded-full" aria-hidden="true" />
              </div>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-sans whitespace-pre-line">
                {setting.missionBody}
              </p>
            </div>
          </div>
        )}

        {/* 3. Core Values Section (Rendered when core values exist) */}
        {coreValues.length > 0 && (
          <div className="space-y-8 pt-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
                Institutional Core Values
              </h2>
              <p className="text-sm text-gray-600 font-sans">
                Foundational pedagogical principles that guide every aspect of student life at Devasthaly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreValues.map((val) => {
                const IconComponent =
                  (val.iconName && ICON_MAP[val.iconName]) || Compass;
                return (
                  <div
                    key={val.id}
                    className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md transition-all space-y-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center border border-red-100/60">
                      <IconComponent className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-heading font-bold text-base text-[#111827]">
                      {val.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-sans leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
