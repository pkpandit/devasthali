import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Sparkles, Quote } from "lucide-react";

export const metadata: Metadata = {
  title: "Manager’s Message | Devasthaly Vidyapeeth",
  description:
    "Manager’s message by Dr. Naveen Singh, Manager of Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default function ManagersMessagePage() {
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
            Manager’s Message
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Address by Dr. Naveen Singh — Manager, Devasthaly Vidyapeeth.
          </p>
        </div>
      </div>

      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Anchored Portrait Showcase (Edplus Leadership Anatomy) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-200/90 shadow-sm text-center lg:text-left space-y-4 lg:sticky lg:top-28">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-gray-200/80 shadow-inner bg-[#111827] group">
              <Image
                src="/images/leadership/manager_sir.webp"
                alt="Dr. Naveen Singh - Manager of Devasthaly Vidyapeeth"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 inset-x-3 text-center">
                <span className="text-sm font-heading font-bold uppercase tracking-wider px-3 py-1 bg-[#B91C1C] text-white rounded-full shadow-md">
                  Manager
                </span>
              </div>
            </div>
            <div className="space-y-1.5 pt-1">
              <h2 className="font-heading text-2xl font-black text-[#111827] tracking-tight">
                Dr. Naveen Singh
              </h2>
              <div className="text-sm font-heading font-bold text-[#B91C1C] tracking-wide">
                Manager
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
                &quot;A child is an ocean of immense possibilities and it is our noble duty to fish-out pearls for them.&quot;
              </p>
            </div>

            <div className="space-y-5 text-gray-700 text-sm sm:text-base leading-relaxed font-sans pt-2">
              <p className="text-justify leading-relaxed">
                About 38 years ago Late Shri Chandrashekhar (Founder of Devasthaly) thoughts shaped a line &quot;A child is an ocean of immense possibilities and it is our noble duty to fish-out pearls for them&quot;. Of course, every child possesses unique inherent quality but latent talents not elsewhere found in conjecture. Its utilisation needs alert parental care at home and continuous inspiration, encouragement, environment clubbed with timely redressal of problems at school. Teacher&apos;s responsibility is to inculcate moral values, self-realisation, patience, restrain, tolerance and dutifulness to build a sound character, besides academic enhancement, variable excellence and personality development. This must be done consistantly, as per child&apos;s needs which always differs from child to child. Students must set a goal of life based on merits and mental inclination and not on glamoured choices. Therefore, choice of a child must not be rediculed. Its hostilities must be weeded out by psycho counselling. Children are tender, to them cruelty and hurting remarks are shocking. Our aim is to make them good, smart, dynamic, alert, honest, dutiful, dispilined, compassionate and caring. They need us. So do we. In such a situation orignal thoughts and ideas (which are changing face of globe) will come forth like water from a fountain. Efforts should innovative coupled with classical method of learning. Technology and audio-visual devices too should be accomodated to bring out inner potentional of students. Hence, inspiration will be the point of origin. Our students should be versatile and good in math, music and marathon.
              </p>

              <div className="pt-6 border-t border-gray-100 font-heading">
                <strong className="text-base font-bold text-[#111827] block">Dr. Naveen Singh</strong>
                <span className="text-sm text-gray-500 font-sans block mt-0.5">
                  Manager
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
