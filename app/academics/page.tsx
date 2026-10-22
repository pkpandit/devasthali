import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, CheckCircle2, Award, FlaskConical, Cpu, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Academics & CBSE Curriculum (LKG to Class 12)",
  description:
    "Explore the CBSE academic curriculum at Devasthaly Vidyapeeth, Chilkahar, Ballia. Senior Secondary Science, Commerce, and Humanities streams with NEET/JEE foundation mentoring.",
};

export default function AcademicsPage() {
  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-12">
        {/* Header */}
        <div className="border-b border-[#E5E7EB] pb-8 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Academics / Curriculum
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#111827]">
            CBSE Academic Framework & Wings
          </h1>
          <p className="text-sm sm:text-base text-[#4B5563] mt-2 max-w-3xl leading-relaxed">
            Delivering the Central Board of Secondary Education (CBSE) syllabus from Foundational LKG through Senior Secondary Class XII, aligned with the National Education Policy (NEP 2020).
          </p>
        </div>

        {/* Full-Width CBSE Academic Laboratory & Experimental Learning Showcase */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xs bg-[#111827]">
          <Image
            src="/images/science-lab.jpg"
            alt="Devasthaly Vidyapeeth advanced science laboratory practical learning session"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* 1. Academic Wings */}
        <div id="wings" className="space-y-8">
          <div className="bg-white hover:bg-[#4F46E5] p-8 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-2xl space-y-4 transition-all duration-300 group cursor-pointer">
            <span className="text-xs font-bold text-[#4F46E5] group-hover:text-[#4F46E5] uppercase tracking-wider bg-[#F3F4F6] group-hover:bg-white border border-[#E5E7EB] group-hover:border-white px-3 py-1 rounded-full transition-colors duration-300 inline-block">
              Stage 1: Foundational Wing
            </span>
            <h2 className="font-heading text-2xl font-bold text-[#111827] group-hover:text-white transition-colors duration-300">
              Foundational Stage (LKG, UKG, Classes I & II)
            </h2>
            <p className="text-sm text-[#4B5563] group-hover:text-white/95 leading-relaxed transition-colors duration-300">
              Focuses on playful, experiential learning that cultivates speech fluency, phonetic awareness, early mathematics, sensory stimulation, social sharing, and motor dexterity. Every child is given gentle, loving care in safe, well-equipped activity suites.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                "Phonics, picture-talk & vocabulary building",
                "Number games, counting & spatial geometry",
                "Coloring, craft, music, movement & physical play",
                "Safe, child-sized hygiene washrooms & nursery beds",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#374151] group-hover:text-white transition-colors duration-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white hover:bg-[#4F46E5] p-8 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-2xl space-y-4 transition-all duration-300 group cursor-pointer">
            <span className="text-xs font-bold text-[#4F46E5] group-hover:text-[#4F46E5] uppercase tracking-wider bg-[#F3F4F6] group-hover:bg-white border border-[#E5E7EB] group-hover:border-white px-3 py-1 rounded-full transition-colors duration-300 inline-block">
              Stage 2: Preparatory & Middle Wing
            </span>
            <h2 className="font-heading text-2xl font-bold text-[#111827] group-hover:text-white transition-colors duration-300">
              Preparatory & Middle Stage (Classes III to VIII)
            </h2>
            <p className="text-sm text-[#4B5563] group-hover:text-white/95 leading-relaxed transition-colors duration-300">
              Transition from play to conceptual discovery. Students are introduced to structured science experiments, mathematical reasoning, world geography, history, and three-language proficiency (English, Hindi, Sanskrit).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                "Weekly physics, chemistry & biology lab visits",
                "Computer technology, typing, scratch & python coding",
                "Inter-house quizzes, debates & elocution contests",
                "Physical education, athletics, yoga, and gymnastics",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#374151] group-hover:text-white transition-colors duration-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Senior Secondary Streams */}
          <div id="streams" className="bg-white hover:bg-[#4F46E5] p-8 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-2xl space-y-6 transition-all duration-300 group cursor-pointer">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-bold text-[#4F46E5] group-hover:text-[#4F46E5] uppercase tracking-wider bg-[#F3F4F6] group-hover:bg-white border border-[#E5E7EB] group-hover:border-white px-3 py-1 rounded-full transition-colors duration-300 inline-block">
                  Stage 3: Senior Secondary Wing
                </span>
                <h2 className="font-heading text-2xl font-bold text-[#111827] group-hover:text-white transition-colors duration-300 mt-1">
                  Senior Secondary (Classes IX to XII)
                </h2>
              </div>
              <span className="text-xs font-bold text-gray-600 group-hover:text-white bg-[#F3F4F6] group-hover:bg-white/20 border border-[#E5E7EB] group-hover:border-white/30 px-3 py-1 rounded-lg transition-colors duration-300">
                Affiliation No. 2130238
              </span>
            </div>

            <p className="text-sm text-[#4B5563] group-hover:text-white/95 leading-relaxed transition-colors duration-300">
              Devasthaly Vidyapeeth offers three comprehensive streams for Classes XI and XII, taught by experienced Post Graduate Teachers (PGTs) with specialized laboratory equipment and study hours.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Science Stream */}
              <div className="p-5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB]">
                <div className="font-heading font-bold text-base text-[#111827] mb-2 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-[#4F46E5]" />
                  <span>Science Stream</span>
                </div>
                <ul className="text-xs text-[#4B5563] space-y-1.5">
                  <li>• English Core (Compulsory)</li>
                  <li>• Physics & Chemistry</li>
                  <li>• Mathematics (PCM) OR Biology (PCB)</li>
                  <li>• Elective: Computer Science / Physical Ed</li>
                  <li className="text-[#4F46E5] font-bold pt-2">Includes NEET/JEE Foundation</li>
                </ul>
              </div>

              {/* Commerce Stream */}
              <div className="p-5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB]">
                <div className="font-heading font-bold text-base text-[#111827] mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#4F46E5]" />
                  <span>Commerce Stream</span>
                </div>
                <ul className="text-xs text-[#4B5563] space-y-1.5">
                  <li>• English Core (Compulsory)</li>
                  <li>• Accountancy & Business Studies</li>
                  <li>• Economics</li>
                  <li>• Mathematics / Applied Math</li>
                  <li>• Elective: Informatics Practices / PE</li>
                  <li className="text-[#4F46E5] font-bold pt-2">Includes CUET & CA Foundation</li>
                </ul>
              </div>

              {/* Humanities Stream */}
              <div className="p-5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB]">
                <div className="font-heading font-bold text-base text-[#111827] mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#4F46E5]" />
                  <span>Humanities Stream</span>
                </div>
                <ul className="text-xs text-[#4B5563] space-y-1.5">
                  <li>• English Core & Hindi Core</li>
                  <li>• History & Political Science</li>
                  <li>• Geography / Economics</li>
                  <li>• Physical Education / Psychology</li>
                  <li className="text-[#4F46E5] font-bold pt-2">Focus on Civil Services & Law</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Competitive Coaching Integration */}
        <div id="competitive" className="bg-[#111827] text-white p-8 sm:p-10 rounded-2xl border border-gray-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
              Integrated Career Preparation
            </span>
            <h3 className="font-heading text-2xl font-bold mt-1">
              NEET, JEE & CUET Foundational Guidance
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-xl leading-relaxed">
              We eliminate the stress of outstation coaching by offering integrated competitive foundation modules on campus, including mock OMR testing, concept-clearing doubt desks, and Olympiad problem-solving.
            </p>
          </div>
          <Link
            href="/admissions"
            className="px-6 py-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shrink-0 shadow-xs border border-[#4338CA]"
          >
            Apply for Class XI Admission
          </Link>
        </div>
      </div>
    </div>
  );
}
