import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Sparkles, Quote } from "lucide-react";

export const metadata: Metadata = {
  title: "Patron’s Message | Devasthaly Vidyapeeth",
  description:
    "Patron’s message by Shri Neeraj Shekhar, Member of Rajya Sabha and Patron of Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default function PatronsMessagePage() {
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
            Patron’s Message
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Address by Neeraj Shekhar, Member of Rajya Sabha — Patron, Devasthaly Vidyapeeth.
          </p>
        </div>
      </div>

      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Anchored Portrait Showcase (Edplus Leadership Anatomy) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-200/90 shadow-sm text-center lg:text-left space-y-4 lg:sticky lg:top-28">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-gray-200/80 shadow-inner bg-[#111827] group">
              <Image
                src="/images/original/chatgpt-image-apr-17-2026-10_46_58-am-1.webp"
                alt="Shri Neeraj Shekhar - Patron of Devasthaly Vidyapeeth"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 inset-x-3 text-center">
                <span className="text-sm font-heading font-bold uppercase tracking-wider px-3 py-1 bg-[#B91C1C] text-white rounded-full shadow-md">
                  Patron
                </span>
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              <h2 className="font-heading text-2xl font-black text-[#111827] tracking-tight">
                Shri Neeraj Shekhar
              </h2>
              <div className="text-sm font-heading font-bold text-[#B91C1C] tracking-wide">
                Member of Rajya Sabha • Patron
              </div>
              <p className="text-sm text-gray-500 font-sans pt-1">
                Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)
              </p>
            </div>
          </div>

          {/* Right Column: Editorial Message & Address Text */}
          <div className="lg:col-span-8 bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-sm relative space-y-6 text-left">
            <Quote className="w-20 h-20 text-[#B91C1C]/10 absolute top-8 right-8 select-none pointer-events-none" aria-hidden="true" />

            <div className="border-l-4 border-[#B91C1C] pl-5 py-1">
              <p className="font-heading font-bold text-base sm:text-lg text-[#111827] leading-relaxed italic">
                &quot;My father late Chandrashekhar Ji would always dream of progressing his native land in multidirectional aspects. His vision was to establish an institution that empowers the upcoming generation through quality education.&quot;
              </p>
            </div>

            <div className="space-y-5 text-gray-700 text-sm sm:text-base leading-relaxed font-sans pt-2">
              <p className="text-justify leading-relaxed">
                My father late Chandrashekhar Ji would always dream of progressing his native land in multidirectional aspects. He thought deeply and was firmly determined to impart the upcoming generation the quality education and to enrich their life so that they could lead the nation on the path of unprecedented glory. To materialise his this thought he decided to establish Devasthaly Vidyapeeth, a co-educational, English medium institution, which was founded on Oct. 2, 1988 at Devasthaly.
              </p>
              <p className="text-justify leading-relaxed">
                It was an inevitable need of that time of the district and purvanchal along with neighboring states like Bihar to have such a leading and dedicated institution. Since the day of its inception, it has achieved unprecedented success in its noble mission.
              </p>
              <p className="text-justify leading-relaxed">
                Since then it has been inclined to achieve his desired motive providing its best services to make the children competent and to enrich their capability to lead a dignified and successful life.
              </p>
              <p className="text-justify leading-relaxed">
                It is a motif of grandiose to me that I have been inherited the devoir to patron the institution. It is not an institution but an embodiment of ideal education. It always tries to imbibe valuable Indian ethos along with modern education in children. In fact, it is an institution where values and knowledge run in same vein. May the Almighty empower us with his divine blessings to maintain the dignity and standard of the institution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
