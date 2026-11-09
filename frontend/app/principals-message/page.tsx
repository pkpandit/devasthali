import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Sparkles, Quote } from "lucide-react";

export const metadata: Metadata = {
  title: "Principal’s Message | Devasthaly Vidyapeeth",
  description:
    "Principal’s message by P. C. Shrivastava, Principal of Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default function PrincipalsMessagePage() {
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
            Principal’s Message
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Address by P. C. Shrivastava — Principal, Devasthaly Vidyapeeth.
          </p>
        </div>
      </div>

      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Anchored Portrait Showcase (Edplus Leadership Anatomy) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-200/90 shadow-sm text-center lg:text-left space-y-4 lg:sticky lg:top-28">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-gray-200/80 shadow-inner bg-[#111827] group">
              <Image
                src="/images/leadership/principal_sir.webp"
                alt="P. C. Shrivastava - Principal of Devasthaly Vidyapeeth"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 inset-x-3 text-center">
                <span className="text-sm font-heading font-bold uppercase tracking-wider px-3 py-1 bg-[#B91C1C] text-white rounded-full shadow-md">
                  Principal
                </span>
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              <h2 className="font-heading text-2xl font-black text-[#111827] tracking-tight">
                P. C. Shrivastava
              </h2>
              <div className="text-sm font-heading font-bold text-[#B91C1C] tracking-wide">
                Principal
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
                &quot;Devasthaly Vidyapeeth is an amalgamation of competent teachers, state-of-the-art infrastructure, an idyllic setting and an experienced administration, creating a safe and supportive environment for student growth.&quot;
              </p>
            </div>

            <div className="space-y-5 text-gray-700 text-sm sm:text-base leading-relaxed font-sans pt-2">
              <p className="text-left max-w-[72ch] leading-relaxed">
                Devasthaly Vidyapeeth is an amalgamation of competent teachers, state-of-the-art infrastructure, an idyllic setting and an experienced and efficient administration. The school came into existence with the vision of creating a safe and supportive environment for its students – to provide a perfect balance of academics, sports, artistic and social opportunities. Childhood, youth and learning should be a joy and we strive for that.
              </p>
              <p className="text-left max-w-[72ch] leading-relaxed">
                Devasthaly Vidyapeeth aims at holistic growth and development of its students. The school&apos;s genuine concern ensures student&apos;s emotional growth along with intellectual excellence. This empowers them to develop their self esteem, self-awareness and self-confidence. Sharing ideas, analysing situations and expressing them confidently are essential skills which are honed here, through experiential learning. The school takes leadership seriously and our concern for character is a point of distinction. Our mission has never been narrow to prepare students for college, but rather to provide an experience which goes far beyond college requirements, addressing important personal aspects of growth and maturity.
              </p>
              <p className="text-left max-w-[72ch] leading-relaxed">
                Modern and secure infrastructure, pollution free environment, excellent pastoral care, nutritious and sumptuous vegetarian food are some of our strengths. While studying at Devasthaly Vidyapeeth, your ward is groomed to become a confident, articulate and enlightened young citizen, ready to step into global society with dignity, honour and integrity.
              </p>
              <p className="text-left max-w-[72ch] leading-relaxed">
                We believe in giving our students deep roots along with a set of strong wings which may carry them far and wide but still continue nourishing with rich moral values. In other words, our students are equipped to face the challenges of the rapidly changing world.
              </p>

              <div className="pt-6 border-t border-gray-100 space-y-2 font-heading">
                <div className="relative w-48 h-12">
                  <Image
                    src="/images/leadership/principal-signature.webp"
                    alt="Principal Signature"
                    fill
                    className="object-contain object-left"
                  />
                </div>
                <strong className="text-base font-bold text-[#111827] block">P. C. Shrivastava</strong>
                <span className="text-sm text-gray-500 font-sans block">
                  Principal, Devasthaly Vidyapeeth
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
