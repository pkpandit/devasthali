import React from "react";
import type { Metadata } from "next";
import {
  Sparkles,
  Activity,
  Palette,
  Music,
  Compass,
  Award,
  Trophy,
  Mic,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Co-Curricular Activities | Devasthaly Vidyapeeth",
  description:
    "Co-curricular and extra-curricular activities at Devasthaly Vidyapeeth, Chilkahar, Ballia. 22,000 sq ft dedicated activity arena for all-round personality development.",
};

export default function CoCurricularActivitiesPage() {
  const clubs = [
    { name: "Fine Arts & Painting", icon: Palette },
    { name: "Computer Graphics & Digital Design", icon: Sparkles },
    { name: "Nature & Environment Club", icon: Compass },
    { name: "Vocal & Instrumental Music", icon: Music },
    { name: "Western & Indian Classical Dance", icon: Activity },
    { name: "House Keeping & Culinary / Cooking Club", icon: Award },
    { name: "Inter-House Cultural Competitions", icon: Trophy },
    { name: "Debates, Elocution & Public Speaking", icon: Mic },
  ];

  return (
    <div className="w-full bg-[#F3F4F6] pb-20">
      {/* Edplus University Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-12 sm:py-16 mb-10 shadow-2xs">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" aria-hidden="true" />
            <span>Life at School / Activities</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            Co-Curricular Activities
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Enhancing personality, talent, and all-round development in our 22,000 sq ft dedicated activity complex.
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
                Holistic Personality Enrichment
              </h2>
              <p className="text-sm text-gray-500 font-sans">
                Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)
              </p>
            </div>
          </div>

          {/* Verbatim Source Text Preserved */}
          <div className="space-y-4 text-sm sm:text-base text-[#111827] leading-relaxed font-sans">
            <p className="text-justify">
              Devasthaly Vidyapeeth provides a wide variety of extra-curricular activities catering to each individual’s needs, talents and interest. Devasthaly Vidyapeeth works towards enhancing the personality of each child for all-round development, thereby nurturing the students to become a global citizen, who can compete and reside worldwide. Devasthaly Vidyapeeth, at regular intervals organises different activities and competitions in its separately built up area of 22000 sq ft.
            </p>
            <p className="text-justify">
              Devasthaly Vidyapeeth encourages its students to have a balanced involvement in the academic and extra curricular activities. Students are exposed to dance, music and other cultural events by number of inter House competitions and club activities including fine arts, computer graphics, nature club, vocal &amp; instrumental music, western &amp; Indian classical dance, house keeping and cooking club.
            </p>
          </div>

          {/* Activity Areas Grid - Edplus Feature Anatomy */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#111827] mb-6">
              Active Clubs &amp; Cultural Programs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {clubs.map((club, idx) => {
                const IconComponent = club.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-[#F9FAFB] hover:bg-white border border-gray-200/90 hover:border-red-300 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-3.5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60 group-hover:bg-[#B91C1C] group-hover:text-white transition-colors duration-200 shadow-2xs">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="font-heading text-sm font-bold text-[#111827] group-hover:text-[#B91C1C] transition-colors leading-snug">
                      {club.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
