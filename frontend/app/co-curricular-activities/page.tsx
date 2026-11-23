import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import {
  Sparkles,
  Activity,
  Palette,
  Music,
  Compass,
  Award,
  Trophy,
  Mic,
  HeartHandshake,
  BookOpen,
  Dumbbell,
  Smile,
} from "lucide-react";
import { getPublicActivities } from "@/lib/api/activities";

export const metadata: Metadata = {
  title: "Co-Curricular Activities | Devasthaly Vidyapeeth",
  description:
    "Co-curricular and extra-curricular activities at Devasthaly Vidyapeeth, Chilkahar, Ballia. Dedicated activity arena for all-round personality development.",
};

function getClubIcon(iconName: string) {
  switch (iconName) {
    case "Palette":
      return Palette;
    case "Sparkles":
      return Sparkles;
    case "Compass":
      return Compass;
    case "Music":
      return Music;
    case "Award":
      return Award;
    case "Trophy":
      return Trophy;
    case "Mic":
      return Mic;
    case "HeartHandshake":
      return HeartHandshake;
    case "BookOpen":
      return BookOpen;
    case "Dumbbell":
      return Dumbbell;
    case "Smile":
      return Smile;
    case "Activity":
    default:
      return Activity;
  }
}

export default async function CoCurricularActivitiesPage() {
  const data = await getPublicActivities();
  const overview = data.overview;
  const clubs = data.clubs;

  return (
    <div className="w-full bg-[#F3F4F6] pb-20">
      {/* Edplus University Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-12 sm:py-16 mb-10 shadow-2xs">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" aria-hidden="true" />
            <span>{overview?.badgeText || "Life at School / Activities"}</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            {overview?.title || "Co-Curricular Activities"}
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            {overview?.subtitle ||
              "Enhancing personality, talent, and all-round development in our 22,000 sq ft dedicated activity complex."}
          </p>
        </div>
      </div>

      <div className="site-container space-y-10">
        {/* Main Editorial Card */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-xs space-y-8">
          <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60 shadow-2xs">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#111827]">
                {overview?.cardTitle || "Holistic Personality Enrichment"}
              </h2>
              <p className="text-sm text-gray-500 font-sans">
                {overview?.cardSubtitle || "Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)"}
              </p>
            </div>
          </div>

          {/* Optional Showcase Image */}
          {overview?.heroImage && (
            <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-xs border border-gray-100">
              <Image
                src={overview.heroImage}
                alt={
                  overview.heroImageAlt ||
                  "Devasthaly Vidyapeeth co-curricular activities and dedicated arena"
                }
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover object-center"
              />
            </div>
          )}

          {/* Verbatim Source Text Preserved */}
          <div className="space-y-4 text-sm sm:text-base text-[#111827] leading-relaxed font-sans">
            {overview?.narrativeParagraph1 && (
              <p className="text-left max-w-[72ch]">
                {overview.narrativeParagraph1}
              </p>
            )}
            {overview?.narrativeParagraph2 && (
              <p className="text-left max-w-[72ch]">
                {overview.narrativeParagraph2}
              </p>
            )}
          </div>

          {/* Activity Areas Grid - Edplus Feature Anatomy */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#111827] mb-6">
              Active Clubs &amp; Cultural Programs
            </h3>

            {clubs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {clubs.map((club) => {
                  const IconComponent = getClubIcon(club.iconName);
                  return (
                    <div
                      key={club.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#F9FAFB] hover:bg-white border border-gray-200/90 hover:border-red-300 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-3.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60 group-hover:bg-[#B91C1C] group-hover:text-white transition-colors duration-200 shadow-2xs">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block font-heading text-sm font-bold text-[#111827] group-hover:text-[#B91C1C] transition-colors leading-snug">
                          {club.name}
                        </span>
                        {club.category && (
                          <span className="block text-xs text-gray-500 font-sans mt-0.5">
                            {club.category}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                <p className="text-gray-600 font-sans text-sm sm:text-base">
                  Student clubs and cultural programs are currently being finalized for the upcoming session.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
