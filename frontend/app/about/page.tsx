import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  Award,
  GraduationCap,
  Building,
  Sparkles,
  BookOpen,
  Compass,
  Target,
  Landmark,
} from "lucide-react";
import { getPublicAbout } from "@/lib/api/about-leadership";

export const metadata: Metadata = {
  title: "About School | Devasthaly Vidyapeeth",
  description:
    "Learn about Devasthaly Vidyapeeth, Chilkahar, Ballia. Founded on 2nd October 1988 under the vision of former Prime Minister of India, Shri Chandra Shekhar.",
};

const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>
> = {
  ShieldCheck,
  Award,
  Building,
  GraduationCap,
  Sparkles,
  BookOpen,
  Compass,
  Target,
  Landmark,
};

export default async function AboutPage() {
  const { setting, credentials, narrativeSections } = await getPublicAbout();

  // If setting is unpublished/null AND all child collections are empty, page is unpublished
  if (!setting && credentials.length === 0 && narrativeSections.length === 0) {
    notFound();
  }

  return (
    <div className="w-full bg-[#F9FAFB] pb-20">
      {/* 1. Page Header Banner (Rendered only when AboutPageSetting is published) */}
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
        {/* 2. Key Credentials Strip (Rendered only when credentials exist) */}
        {credentials.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {credentials.map((cred) => {
              const IconComp =
                (cred.iconName && ICON_MAP[cred.iconName]) || Award;
              return (
                <div
                  key={cred.id}
                  className="bg-white p-6 rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60 shadow-2xs group-hover:scale-105 transition-transform">
                    <IconComp className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 font-bold uppercase tracking-wider font-heading">
                      {cred.category}
                    </span>
                    <h3 className="font-heading font-bold text-base text-[#111827]">
                      {cred.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-sans">{cred.subtext}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Narrative Sections & Showcase (Rendered conditionally) */}
        {(narrativeSections.length > 0 || setting?.showcaseImageUrl) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className={`${setting?.showcaseImageUrl ? "lg:col-span-7" : "lg:col-span-12"} bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-sm space-y-6 text-left`}>
              {narrativeSections.length > 0 ? (
                <div className="space-y-6 text-[#111827] text-sm sm:text-base leading-relaxed font-sans">
                  {narrativeSections.map((sec, idx) => (
                    <div key={sec.id} className="space-y-2">
                      {sec.heading && (
                        <h2 className="text-lg font-heading font-bold text-gray-900">
                          {sec.heading}
                        </h2>
                      )}
                      <p
                        className={`text-left max-w-[72ch] ${
                          idx === 0 ? "font-medium" : "text-gray-700"
                        } whitespace-pre-line`}
                      >
                        {sec.body}
                      </p>
                      {sec.imageUrl && (
                        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mt-3 border border-gray-100">
                          <Image
                            src={sec.imageUrl}
                            alt={sec.imageAlt || sec.heading || "Narrative illustration"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {setting?.showcaseImageUrl && (
              <div className="lg:col-span-5 space-y-6">
                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-gray-200/90 shadow-md bg-[#111827] group">
                  <Image
                    src={setting.showcaseImageUrl}
                    alt={setting.showcaseImageAlt || "Devasthaly Vidyapeeth Campus Showcase"}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  {setting.showcaseBadge && (
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#B91C1C] text-white text-sm font-heading font-bold uppercase tracking-wider shadow-md">
                      <Sparkles className="w-3.5 h-3.5 text-[#F4CD13]" aria-hidden="true" />
                      <span>{setting.showcaseBadge}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
