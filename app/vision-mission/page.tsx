import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Target, Heart, Sparkles, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Vision, Mission & Core Values | Devasthaly Vidyapeeth",
  description:
    "Discover the vision, mission, and guiding educational values of Devasthaly Vidyapeeth, Chilkahar, Ballia. Fostering academic rigor, moral character, and social responsibility.",
};

export default function VisionMissionPage() {
  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-12">
        {/* Header */}
        <div className="border-b border-[#E5E7EB] pb-8 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            About Us / Philosophy
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#111827]">
            Vision, Mission & Guiding Values
          </h1>
          <p className="text-sm sm:text-base text-[#4B5563] mt-3 max-w-3xl leading-relaxed">
            Cultivating minds capable of critical thought, compassion, and leadership while holding steadfast to Indian cultural roots and global competence.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] text-[#4F46E5] flex items-center justify-center mb-4 border border-[#E5E7EB]">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-[#111827] mb-4">Our Vision</h2>
              <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
                To be the benchmark institution of holistic schooling in eastern Uttar Pradesh, recognized for academic excellence, ethical grounding, and empowering students from every background to emerge as responsible global citizens, innovative thinkers, and leaders of character.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-[#E5E7EB] text-xs text-[#4F46E5] font-bold">
              &ldquo;Vidya Dadati Vinayam&rdquo; — Knowledge Imparts Humility
            </div>
          </div>

          {/* Mission */}
          <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] text-[#4F46E5] flex items-center justify-center mb-4 border border-[#E5E7EB]">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-[#111827] mb-4">Our Mission</h2>
              <ul className="space-y-3 text-xs sm:text-sm text-[#4B5563]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                  <span>Deliver rigorous CBSE-aligned education fostering scientific inquiry, mathematics, and expressive English fluency.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                  <span>Provide safe, disciplined residential hostels that cultivate independence, brotherhood, and time management.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                  <span>Nurture physical agility and sportsmanship through dedicated athletics, martial arts, yoga, and NCC training.</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-[#E5E7EB] text-xs text-[#4F46E5] font-bold">
              Committed to NEP 2020 Holistic Competencies
            </div>
          </div>
        </div>

        {/* 4 Pillars of Values */}
        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <h3 className="font-heading text-xl font-bold text-[#111827] mb-6 text-center">
            The Four Pillars of Devasthaly Character
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Academic Integrity", desc: "Honesty in thought, intellectual curiosity, and pursuit of deep concept mastery over rote memorization." },
              { title: "Discipline & Duty", desc: "Respect for time, institutional norms, teachers, parents, and adherence to personal accountability." },
              { title: "Cultural Sanskaar", desc: "Deep reverence for heritage, patriotic duty towards the nation, and humility in personal conduct." },
              { title: "Universal Empathy", desc: "Kindness, peer cooperation, community service, and sensitivity towards environmental sustainability." },
            ].map((v, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB]">
                <div className="font-heading font-bold text-base text-[#111827] mb-2">{v.title}</div>
                <p className="text-xs text-[#4B5563] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
