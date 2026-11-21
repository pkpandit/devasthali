import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, CheckCircle2, Award, FlaskConical, Sparkles, ArrowRight } from "lucide-react";
import { getPublicAcademics } from "@/lib/api/academics";

export const metadata: Metadata = {
  title: "Academics & CBSE Curriculum (LKG to Class 12)",
  description:
    "Explore the CBSE academic curriculum at Devasthaly Vidyapeeth, Chilkahar, Ballia. Senior Secondary Science, Commerce, and Humanities streams with NEET/JEE foundation mentoring.",
};

function StreamIcon({ iconName }: { iconName: string }) {
  switch (iconName) {
    case "FlaskConical":
      return <FlaskConical className="w-4 h-4 text-[#B91C1C]" aria-hidden="true" />;
    case "Award":
      return <Award className="w-4 h-4 text-[#B91C1C]" aria-hidden="true" />;
    case "BookOpen":
    default:
      return <BookOpen className="w-4 h-4 text-[#B91C1C]" aria-hidden="true" />;
  }
}

export default async function AcademicsPage() {
  const { overview, wings, streams } = await getPublicAcademics();

  const heroImage = overview?.heroImage || "/images/facilities/science-lab.jpg";
  const heroImageAlt =
    overview?.heroImageAlt || "Devasthaly Vidyapeeth advanced science laboratory practical learning session";
  const heroBadge = overview?.heroBadge || "Experimental Laboratory Learning";

  const competitiveBadge = overview?.competitiveBadge || "Integrated Career Preparation";
  const competitiveTitle = overview?.competitiveTitle || "NEET, JEE & CUET Foundational Guidance";
  const competitiveDescription =
    overview?.competitiveDescription ||
    "We eliminate the stress of outstation coaching by offering integrated competitive foundation modules on campus, including mock OMR testing, concept-clearing doubt desks, and Olympiad problem-solving.";
  const competitiveCtaText = overview?.competitiveCtaText || "Apply for Class XI Admission";
  const competitiveCtaHref = overview?.competitiveCtaHref || "/admissions";

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
            CBSE Academic Framework &amp; Wings
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
            src={heroImage}
            alt={heroImageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          {heroBadge && (
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#B91C1C] text-white text-sm font-heading font-bold uppercase tracking-wider shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-[#F4CD13]" aria-hidden="true" />
                <span>{heroBadge}</span>
              </span>
            </div>
          )}
        </div>

        {/* 1. Academic Wings (Edplus Program Anatomy) */}
        <div id="wings" className="scroll-mt-28 space-y-8">
          {wings.length === 0 ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-gray-400 mx-auto" aria-hidden="true" />
              <h3 className="font-heading text-xl font-bold text-[#111827]">
                Curriculum Framework Updating
              </h3>
              <p className="text-gray-600 max-w-md mx-auto text-sm leading-relaxed font-sans">
                Academic wing guidelines and pedagogical structures are currently being refreshed for the upcoming academic session.
              </p>
            </div>
          ) : (
            wings.map((wing) => (
              <div
                key={wing.id}
                className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 space-y-4 transition-all duration-300"
              >
                {wing.stageBadge && (
                  <span className="text-sm font-bold text-[#B91C1C] uppercase tracking-wider bg-red-50 border border-red-100/60 px-3.5 py-1 rounded-full inline-block font-heading">
                    {wing.stageBadge}
                  </span>
                )}
                <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
                  {wing.title}
                </h2>
                <p className="text-base text-gray-600 leading-[1.7] leading-relaxed font-sans">
                  {wing.description}
                </p>
                {wing.highlights && wing.highlights.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    {wing.highlights.map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700 font-sans">
                        <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" aria-hidden="true" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

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
              Devasthaly Vidyapeeth offers comprehensive streams for Classes XI and XII, taught by experienced Post Graduate Teachers (PGTs) with specialized laboratory equipment and study hours.
            </p>

            {streams.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Award className="w-8 h-8 text-gray-400 mx-auto" aria-hidden="true" />
                <p className="text-gray-600 text-sm font-sans">
                  Curriculum stream offerings are being finalized for the upcoming session.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {streams.map((stream) => (
                  <div
                    key={stream.id}
                    className="p-6 sm:p-7 rounded-2xl bg-[#F9FAFB] border border-gray-200/90 shadow-2xs hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-heading font-bold text-base text-[#111827] mb-3 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60">
                          <StreamIcon iconName={stream.iconName} />
                        </div>
                        <span>{stream.title}</span>
                      </div>
                      {stream.description && (
                        <p className="text-xs text-gray-500 mb-2 font-sans">{stream.description}</p>
                      )}
                      {stream.subjects && stream.subjects.length > 0 && (
                        <ul className="text-sm text-gray-600 space-y-2.5 font-sans">
                          {stream.subjects.map((sub, sIdx) => (
                            <li key={sIdx}>• {sub}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {stream.competitiveBadge && (
                      <div className="text-[#B91C1C] font-bold text-sm pt-2.5 mt-3 border-t border-gray-200 font-sans">
                        {stream.competitiveBadge}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Competitive Coaching Integration (Edplus CTA Anatomy) */}
        <div id="competitive" className="scroll-mt-28 bg-[#111827] text-white p-8 sm:p-12 rounded-3xl border border-gray-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            {competitiveBadge && (
              <span className="text-sm font-bold text-[#F4CD13] uppercase tracking-wider font-heading">
                {competitiveBadge}
              </span>
            )}
            <h3 className="font-heading text-2xl sm:text-3xl font-black text-white tracking-tight">
              {competitiveTitle}
            </h3>
            <p className="text-base text-gray-300 max-w-xl leading-relaxed font-sans">
              {competitiveDescription}
            </p>
          </div>
          <Link
            href={competitiveCtaHref}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-heading font-bold text-sm uppercase tracking-wider rounded-full transition-all shrink-0 shadow-md hover:shadow-xl border border-red-500/40 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white"
          >
            <span>{competitiveCtaText}</span>
            <ArrowRight className="w-4 h-4 text-white" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
