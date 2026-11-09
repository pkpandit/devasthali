import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Sparkles, Quote } from "lucide-react";

export const metadata: Metadata = {
  title: "Founder’s Message | Devasthaly Vidyapeeth",
  description:
    "Founder’s message and profile of Shri Chandra Shekhar, 8th Prime Minister of India and Founder of Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default function FoundersMessagePage() {
  return (
    <div className="w-full bg-[#F9FAFB] pb-20">
      {/* 1. Page Header Banner (Edplus University standard) */}
      <div className="w-full bg-white border-b border-gray-200/80 py-12 sm:py-16 mb-12">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" aria-hidden="true" />
            <span>About School / Leadership</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            Founder’s Message
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Shri Chandra Shekhar (8th Prime Minister of India, 1990–1991) — Founder of Devasthaly Vidyapeeth.
          </p>
        </div>
      </div>

      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Anchored Portrait Showcase (Edplus Leadership Anatomy) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-200/90 shadow-sm text-center lg:text-left space-y-4 lg:sticky lg:top-28">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-gray-200/80 shadow-inner bg-[#111827] group">
              <Image
                src="/images/leadership/chadrashekherji.webp"
                alt="Shri Chandra Shekhar - Founder of Devasthaly Vidyapeeth"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 inset-x-3 text-center">
                <span className="text-sm font-heading font-bold uppercase tracking-wider px-3 py-1 bg-[#B91C1C] text-white rounded-full shadow-md">
                  Founder
                </span>
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              <h2 className="font-heading text-2xl font-black text-[#111827] tracking-tight">
                Shri Chandra Shekhar
              </h2>
              <div className="text-sm font-heading font-bold text-[#B91C1C] tracking-wide">
                8th Prime Minister of India (1990–1991)
              </div>
              <p className="text-sm text-gray-500 font-sans pt-1">
                Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)
              </p>
            </div>
          </div>

          {/* Right Column: Editorial Message & Legacy Text (Edplus Article Rhythm) */}
          <div className="lg:col-span-8 bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-sm relative space-y-6 text-left">
            <Quote className="w-20 h-20 text-[#B91C1C]/10 absolute top-8 right-8 select-none pointer-events-none" aria-hidden="true" />

            <div className="border-l-4 border-[#B91C1C] pl-5 py-1">
              <p className="font-heading font-bold text-base sm:text-lg text-[#111827] leading-relaxed italic">
                &quot;Devasthaly Vidyapeeth was established under the vision of our founder, Ex-Prime Minister of India, Mr. Chandra Shekhar, to empower rural youth through modern education rooted in timeless values.&quot;
              </p>
            </div>

            <div className="space-y-5 text-gray-700 text-sm sm:text-base leading-relaxed font-sans pt-2">
              <p className="text-left max-w-[72ch] leading-relaxed">
                Shri Chandra Shekhar was born on April 17, 1927, in a farmer’s family in village Ibrahimpatti in District Ballia, Uttar Pradesh. He was President of the Janata Party from 1977 to 1988. Shri Chandra Shekhar was attracted to politics from his student days and was known as a fire-brand idealist with revolutionary fervour. After his Master’s Degree in Political Science from Allahabad University (1950-51), he joined the Socialist Movement. He had the privilege of having been associated very closely with Acharya Narendra Dev. He was elected Secretary of the District Praja Socialist Party, Ballia. Within a year, he was elected Joint Secretary of the U.P. State Praja Socialist Party. In 1955-56 he took over as General Secretary of the U.P., State Praja Socialist Party. In 1962, he was elected to the Rajya Sabha from Uttar Pradesh. He joined the Indian National Congress in January 1965. In 1967 he was elected General Secretary of the Congress Parliamentary Party. As a Member of Parliament he made a mark by taking keen interest in espousing the cause of the downtrodden and pleading for policies for rapid social change. In this context, when he attacked the disproportionate growth of monopoly houses with State patronage, he came in conflict with the centres of power.Chandra Shekhar (8th Prime Minister of India, 1990–1991) was known as a &quot;Young Turk&quot; and a steadfast socialist leader who championed the cause of the poor, farmers, and the downtrodden. His vision was defined by ideological politics, grassroots connection, and a commitment to democratic values over personality-driven leadership.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
