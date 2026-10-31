import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { SCHOOL_INFO } from "@/lib/school-data";
import { ShieldCheck, Award, GraduationCap, Building, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About School | Devasthaly Vidyapeeth",
  description:
    "Learn about Devasthaly Vidyapeeth, Chilkahar, Ballia. Founded on 2nd October 1988 under the vision of former Prime Minister of India, Shri Chandra Shekhar.",
};

export default function AboutPage() {
  return (
    <div className="w-full bg-[#F9FAFB] pb-20">
      {/* 1. Page Header Banner (Edplus University standard) */}
      <div className="w-full bg-white border-b border-gray-200/80 py-12 sm:py-16 mb-12">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" aria-hidden="true" />
            <span>Home / About School</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            About School
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Devasthaly Vidyapeeth — Imparting comprehensive modern education with valuable Indian traditions since 2nd October 1988.
          </p>
        </div>
      </div>

      <div className="site-container space-y-12">
        {/* 2. Key Credentials Strip (Edplus Features Anatomy) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60 shadow-2xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm text-gray-500 font-bold uppercase tracking-wider font-heading">Affiliation</span>
              <h3 className="font-heading font-bold text-base text-[#111827]">
                CBSE No. {SCHOOL_INFO.affiliationNo}
              </h3>
              <p className="text-sm text-gray-500 font-sans">School Code: {SCHOOL_INFO.schoolCode}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60 shadow-2xs group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm text-gray-500 font-bold uppercase tracking-wider font-heading">Heritage</span>
              <h3 className="font-heading font-bold text-base text-[#111827]">Founded in 1988</h3>
              <p className="text-sm text-gray-500 font-sans">2nd October 1988</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60 shadow-2xs group-hover:scale-105 transition-transform">
              <Building className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm text-gray-500 font-bold uppercase tracking-wider font-heading">Campus</span>
              <h3 className="font-heading font-bold text-base text-[#111827]">Chilkahar, Ballia</h3>
              <p className="text-sm text-gray-500 font-sans">Ballia-Lucknow Highway</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60 shadow-2xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm text-gray-500 font-bold uppercase tracking-wider font-heading">Founder</span>
              <h3 className="font-heading font-bold text-base text-[#111827]">Chandra Shekhar</h3>
              <p className="text-sm text-gray-500 font-sans">Former Prime Minister</p>
            </div>
          </div>
        </div>

        {/* 3. Verbatim Source Content & Campus Showcase (Edplus About-Us Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-7 bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-sm space-y-6 text-left">
            <div className="space-y-4 text-[#111827] text-sm sm:text-base leading-relaxed font-sans">
              <p className="text-justify font-medium">
                Devasthaly Vidyapeeth was founded on the 2nd October 1988 with the prime aim of imparting a comprehensive modern education to the children with valuable Indian tradition of education , irrespective of caste, creed and community. &quot;Devasthaly Vidyapeeth was established under the vision of our founder, Ex-Prime Minister of India, Mr. Chandra Shekhar .&quot;
              </p>
              <p className="text-justify text-gray-700">
                The institute is located in plush premises at Devasthaly, surrounded by attractive healthy, natural environment that creates favourable academic conditions for alround development of children. Since the day of inception it has been determined to scale an unparalleled new graph of success to impart it to the children.
              </p>
              <p className="text-justify text-gray-700">
                We want our children to imbibe moral values in life. At present the rapid changes in technology and accelerated pace of privatisation and liberalisation created a new sense of uncertainity about the future of society. Thus education should respond meaningfully and effectively to address the crucial academic burning issues. Devasthaly Vidyapeeth in its efforts is providing need-based quality education to the blossoming knowledge which has decided to equip the children will pragmatic skills so that they can face the future with renewed confidence and matchless courage. The president of school is always nurturing the institute keeping sight and presenting all the facilities with help of management committee.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-gray-200/90 shadow-md bg-[#111827] group">
              <Image
                src="/images/original/image-1-1.webp"
                alt="Devasthaly Vidyapeeth Campus Academic Block"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#B91C1C] text-white text-sm font-heading font-bold uppercase tracking-wider shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-[#F4CD13]" aria-hidden="true" />
                <span>Estd. 1988</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
