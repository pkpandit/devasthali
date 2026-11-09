import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, CheckCircle2, Award, FlaskConical, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Academics & CBSE Curriculum (LKG to Class 12)",
  description:
    "Explore the CBSE academic curriculum at Devasthaly Vidyapeeth, Chilkahar, Ballia. Senior Secondary Science, Commerce, and Humanities streams with NEET/JEE foundation mentoring.",
};

export default function AcademicsPage() {
  return (
    <div className="w-full bg-[#F9FAFB] pb-20">
      {/* 1. Page Header Banner (Edplus University standard) */}
      <div className="w-full bg-white border-b border-gray-200/80 py-12 sm:py-16 mb-12">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" aria-hidden="true" />
            <span>Academics / Curriculum</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            CBSE Academic Framework & Wings
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Delivering the Central Board of Secondary Education (CBSE) syllabus from Foundational LKG through Senior Secondary Class XII, aligned with the National Education Policy (NEP 2020).
          </p>
        </div>
      </div>

      <div className="site-container space-y-12">
        {/* Full-Width CBSE Academic Laboratory & Experimental Learning Showcase */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden border border-gray-200/90 shadow-md bg-[#111827] group">
          <Image
            src="/images/facilities/science-lab.jpg"
            alt="Devasthaly Vidyapeeth advanced science laboratory practical learning session"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#B91C1C] text-white text-sm font-heading font-bold uppercase tracking-wider shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-[#F4CD13]" aria-hidden="true" />
              <span>Experimental Laboratory Learning</span>
            </span>
          </div>
        </div>

        {/* 1. Academic Wings (Edplus Program Anatomy) */}
        <div id="wings" className="scroll-mt-28 space-y-8">
          {/* Foundational Stage */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 space-y-4 transition-all duration-300">
            <span className="text-sm font-bold text-[#B91C1C] uppercase tracking-wider bg-red-50 border border-red-100/60 px-3.5 py-1 rounded-full inline-block font-heading">
              Stage 1: Foundational Wing
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              Foundational Stage (LKG, UKG, Classes I &amp; II)
            </h2>
            <p className="text-base text-gray-600 leading-[1.7] leading-relaxed font-sans">
              Focuses on playful, experiential learning that cultivates speech fluency, phonetic awareness, early mathematics, sensory stimulation, social sharing, and motor dexterity. Every child is given gentle, loving care in safe, well-equipped activity suites.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {[
                "Phonics, picture-talk & vocabulary building",
                "Number games, counting & spatial geometry",
                "Coloring, craft, music, movement & physical play",
                "Safe, child-sized hygiene washrooms & nursery beds",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preparatory & Middle Stage */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 space-y-4 transition-all duration-300">
            <span className="text-sm font-bold text-[#B91C1C] uppercase tracking-wider bg-red-50 border border-red-100/60 px-3.5 py-1 rounded-full inline-block font-heading">
              Stage 2: Preparatory &amp; Middle Wing
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              Preparatory &amp; Middle Stage (Classes III to VIII)
            </h2>
            <p className="text-base text-gray-600 leading-[1.7] leading-relaxed font-sans">
              Transition from play to conceptual discovery. Students are introduced to structured science experiments, mathematical reasoning, world geography, history, and three-language proficiency (English, Hindi, Sanskrit).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {[
                "Weekly physics, chemistry & biology lab visits",
                "Computer technology, typing, scratch & python coding",
                "Inter-house quizzes, debates & elocution contests",
                "Physical education, athletics, yoga, and gymnastics",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Senior Secondary Streams */}
          <div id="streams" className="scroll-mt-28 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 space-y-6 transition-all duration-300">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-sm font-bold text-[#B91C1C] uppercase tracking-wider bg-red-50 border border-red-100/60 px-3.5 py-1 rounded-full inline-block font-heading">
                  Stage 3: Senior Secondary Wing
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#111827] mt-1.5 tracking-tight">
                  Senior Secondary (Classes IX to XII)
                </h2>
              </div>
              <span className="text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-full font-sans">
                Affiliation No. 2130238
              </span>
            </div>

            <p className="text-base text-gray-600 leading-[1.7] leading-relaxed font-sans">
              Devasthaly Vidyapeeth offers three comprehensive streams for Classes XI and XII, taught by experienced Post Graduate Teachers (PGTs) with specialized laboratory equipment and study hours.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Science Stream */}
              <div className="p-6 sm:p-7 rounded-2xl bg-[#F9FAFB] border border-gray-200/90 shadow-2xs hover:border-red-300 hover:shadow-md transition-all">
                <div className="font-heading font-bold text-base text-[#111827] mb-3 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60">
                    <FlaskConical className="w-4 h-4 text-[#B91C1C]" aria-hidden="true" />
                  </div>
                  <span>Science Stream</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2.5 font-sans">
                  <li>• English Core (Compulsory)</li>
                  <li>• Physics &amp; Chemistry</li>
                  <li>• Mathematics (PCM) OR Biology (PCB)</li>
                  <li>• Elective: Computer Science / Physical Ed</li>
                  <li className="text-[#B91C1C] font-bold pt-2.5 border-t border-gray-200">Includes NEET/JEE Foundation</li>
                </ul>
              </div>

              {/* Commerce Stream */}
              <div className="p-6 sm:p-7 rounded-2xl bg-[#F9FAFB] border border-gray-200/90 shadow-2xs hover:border-red-300 hover:shadow-md transition-all">
                <div className="font-heading font-bold text-base text-[#111827] mb-3 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60">
                    <Award className="w-4 h-4 text-[#B91C1C]" aria-hidden="true" />
                  </div>
                  <span>Commerce Stream</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2.5 font-sans">
                  <li>• English Core (Compulsory)</li>
                  <li>• Accountancy &amp; Business Studies</li>
                  <li>• Economics</li>
                  <li>• Mathematics / Applied Math</li>
                  <li>• Elective: Informatics Practices / PE</li>
                  <li className="text-[#B91C1C] font-bold pt-2.5 border-t border-gray-200">Includes CUET &amp; CA Foundation</li>
                </ul>
              </div>

              {/* Humanities Stream */}
              <div className="p-6 sm:p-7 rounded-2xl bg-[#F9FAFB] border border-gray-200/90 shadow-2xs hover:border-red-300 hover:shadow-md transition-all">
                <div className="font-heading font-bold text-base text-[#111827] mb-3 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60">
                    <BookOpen className="w-4 h-4 text-[#B91C1C]" aria-hidden="true" />
                  </div>
                  <span>Humanities Stream</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2.5 font-sans">
                  <li>• English Core &amp; Hindi Core</li>
                  <li>• History &amp; Political Science</li>
                  <li>• Geography / Economics</li>
                  <li>• Physical Education / Psychology</li>
                  <li className="text-[#B91C1C] font-bold pt-2.5 border-t border-gray-200">Focus on Civil Services &amp; Law</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Competitive Coaching Integration (Edplus CTA Anatomy) */}
        <div id="competitive" className="scroll-mt-28 bg-[#111827] text-white p-8 sm:p-12 rounded-3xl border border-gray-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <span className="text-sm font-bold text-[#F4CD13] uppercase tracking-wider font-heading">
              Integrated Career Preparation
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-black text-white tracking-tight">
              NEET, JEE &amp; CUET Foundational Guidance
            </h3>
            <p className="text-base text-gray-300 max-w-xl leading-relaxed font-sans">
              We eliminate the stress of outstation coaching by offering integrated competitive foundation modules on campus, including mock OMR testing, concept-clearing doubt desks, and Olympiad problem-solving.
            </p>
          </div>
          <Link
            href="/admissions"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-heading font-bold text-sm uppercase tracking-wider rounded-full transition-all shrink-0 shadow-md hover:shadow-xl border border-red-500/40 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white"
          >
            <span>Apply for Class XI Admission</span>
            <ArrowRight className="w-4 h-4 text-white" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
