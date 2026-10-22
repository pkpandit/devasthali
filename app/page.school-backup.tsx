import React from "react";
import Link from "next/link";
import {
  SCHOOL_INFO,
  NOTICES_DATA,
  TOPPERS_DATA,
  FACILITIES_DATA,
  FAQ_DATA,
} from "@/lib/school-data";
import { AdmissionEnquiryForm } from "@/components/AdmissionEnquiryForm";
import {
  ShieldCheck,
  Award,
  BookOpen,
  Users,
  Compass,
  ArrowRight,
  Phone,
  MessageCircle,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Clock,
  Download,
  GraduationCap,
  Bus,
  FlaskConical,
  Building,
  Heart,
  Quote,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* =========================================================================
          SECTION 1: HERO & ADMISSION HOOK
      ========================================================================= */}
      <section className="relative bg-gradient-to-b from-[#0F2C59] via-[#143464] to-[#0F2C59] text-white pt-10 pb-16 lg:pt-16 lg:pb-24 px-4 sm:px-8 border-b-4 border-[#C59B27] overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 flex flex-col gap-5 text-center lg:text-left">
            {/* Admission Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C59B27]/20 border border-[#C59B27]/40 text-[#DFB23E] text-xs font-bold uppercase tracking-wider mx-auto lg:mx-0 w-fit">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Admissions Open 2025–26 • LKG to Class XI</span>
            </div>

            {/* Main H1 */}
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
              Nurturing Academic Rigour, Moral Character & Leadership{" "}
              <span className="text-[#DFB23E] underline decoration-[#C59B27]/60 underline-offset-8">
                Since 1988
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-sans max-w-2xl mx-auto lg:mx-0">
              Welcome to <strong>Devasthaly Vidyapeeth</strong>, Chilkahar, Ballia. A premier CBSE-affiliated co-educational residential and day-boarding institution where timeless Indian values converge with state-of-the-art modern education.
            </p>

            {/* Quick Key Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-300 pt-1">
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <ShieldCheck className="w-4 h-4 text-[#C59B27]" />
                CBSE Affil. No. 2130238
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <Award className="w-4 h-4 text-[#DFB23E]" />
                36+ Years of Trust
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <Building className="w-4 h-4 text-[#C59B27]" />
                15-Acre Eco Campus
              </span>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/admissions"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#1B4D3E] hover:bg-[#246452] text-white font-bold text-sm tracking-wide uppercase transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 border border-[#246452]"
              >
                <span>Apply for Admission</span>
                <ArrowRight className="w-4 h-4 text-[#DFB23E]" />
              </Link>

              <Link
                href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}?text=Hello%20Devasthaly%20Vidyapeeth,%20I%20would%20like%20to%20know%20more%20about%20admissions.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#25D366] hover:bg-[#1ebd5b] text-white font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp Counsellor</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Admission Lead Capture Dock */}
          <div className="lg:col-span-5 w-full">
            <AdmissionEnquiryForm />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: INSTITUTIONAL TRUST STRIP
      ========================================================================= */}
      <section className="bg-white border-b border-slate-200 py-8 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {SCHOOL_INFO.stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span className="font-heading font-black text-2xl sm:text-3xl text-[#0F2C59]">
                {stat.value}
              </span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-tight mt-1">
                {stat.label}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">{stat.subtext}</span>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PARENT QUICK ACTIONS HUB
      ========================================================================= */}
      <section className="py-6 px-4 sm:px-8 bg-[#F3F0E6] border-b border-amber-200/60">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {[
            { label: "Download 2025 Prospectus", href: "/downloads", icon: Download },
            { label: "Fee Schedule & Guidelines", href: "/admissions/fees", icon: FileText },
            { label: "Bus Routes & Transport", href: "/facilities#transport", icon: Bus },
            { label: "Board Toppers & Results", href: "/results", icon: Award },
            { label: "Official Circulars & Desk", href: "/notices", icon: Calendar },
            { label: "CBSE Mandatory Disclosure", href: "/downloads", icon: ShieldCheck },
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-800 text-xs font-bold border border-slate-200 shadow-sm hover:border-[#0F2C59] hover:text-[#0F2C59] hover:shadow transition-all"
              >
                <IconComponent className="w-4 h-4 text-[#C59B27]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: WHY CHOOSE DEVASTHALY VIDYAPEETH
      ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1B4D3E] bg-[#1B4D3E]/10 px-3 py-1 rounded-full">
            Our Foundation
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F2C59] mt-3 mb-4">
            An Academic Environment Built for Focus, Character, and Distinction
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            For more than three decades, Devasthaly Vidyapeeth has been the trusted sanctuary for families seeking rigorous CBSE learning, disciplined boarding life, and authentic Indian values.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "36+ Years CBSE Rigour",
              desc: "100% board pass track record with consistent district top ranks, dedicated subject masters, and NEET/JEE foundational mentoring.",
              icon: BookOpen,
              color: "text-[#0F2C59]",
              bg: "bg-blue-50",
            },
            {
              title: "Disciplined Residential Care",
              desc: "Separate secure hostels for boys and girls with 24/7 warden supervision, in-house evening study sessions, and wholesome pure vegetarian meals.",
              icon: Building,
              color: "text-[#1B4D3E]",
              bg: "bg-emerald-50",
            },
            {
              title: "Spoken English & Tech Labs",
              desc: "Daily language fluency drills, smart interactive digital boards, and coding/robotics laboratories to ensure students thrive globally.",
              icon: Sparkles,
              color: "text-[#C59B27]",
              bg: "bg-amber-50",
            },
            {
              title: "Holistic Moral Sanskaar",
              desc: "Traditional Indian culture, yoga, athletics, NCC/Scouts, and values education fostering empathy, integrity, and patriotic leadership.",
              icon: Heart,
              color: "text-[#B91C1C]",
              bg: "bg-red-50",
            },
          ].map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl ${pillar.bg} ${pillar.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#0F2C59]">
                  <span>Learn more</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: ACADEMICS PROGRESSION (LKG TO CLASS XII)
      ========================================================================= */}
      <section className="bg-slate-50 py-16 sm:py-20 px-4 sm:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0F2C59] bg-[#0F2C59]/10 px-3 py-1 rounded-full">
                Curriculum Progression
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F2C59] mt-3">
                Comprehensive CBSE Curriculum (LKG to Class 12)
              </h2>
            </div>
            <Link
              href="/academics"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0F2C59] hover:text-[#1B4D3E] transition-colors"
            >
              <span>Explore Detailed Academic Wings</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Wing 1: Foundational */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#1B4D3E] uppercase tracking-wider">
                  Early Childhood (Age 3–7)
                </span>
                <h3 className="font-heading text-xl font-bold text-slate-900 mt-1 mb-3">
                  Foundational Wing (LKG to Class II)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                  Activity-based, play-way methodology focused on foundational literacy, numeracy, spoken English confidence, and sensory discovery in colorful child-friendly classrooms.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4D3E]" />
                    Phonics & Storytelling Circles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4D3E]" />
                    Play Area & Montessori Learning Aids
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4D3E]" />
                    Caring Female Attendants & Nurse
                  </li>
                </ul>
              </div>
              <Link
                href="/academics"
                className="mt-6 inline-flex items-center text-xs font-bold text-[#0F2C59] hover:underline"
              >
                Learn About Foundational Pedagogy →
              </Link>
            </div>

            {/* Wing 2: Middle School */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#0F2C59] uppercase tracking-wider">
                  Classes III to VIII
                </span>
                <h3 className="font-heading text-xl font-bold text-slate-900 mt-1 mb-3">
                  Preparatory & Middle Wing
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                  Experiential learning introducing scientific inquiry, analytical mathematics, computer programming, languages (English, Hindi, Sanskrit), and collaborative project work.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F2C59]" />
                    Hands-on Science & Math Lab Experiments
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F2C59]" />
                    Python & AI Foundations Curriculum
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F2C59]" />
                    Inter-house Debates & Olympiads
                  </li>
                </ul>
              </div>
              <Link
                href="/academics"
                className="mt-6 inline-flex items-center text-xs font-bold text-[#0F2C59] hover:underline"
              >
                Learn About Middle School Subjects →
              </Link>
            </div>

            {/* Wing 3: Senior Secondary */}
            <div className="bg-white p-6 rounded-2xl border-2 border-[#C59B27] shadow-md flex flex-col justify-between relative">
              <div className="absolute -top-3 right-6 bg-[#C59B27] text-[#0F2C59] font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                High Demand
              </div>
              <div>
                <span className="text-xs font-bold text-[#C59B27] uppercase tracking-wider">
                  Classes IX to XII
                </span>
                <h3 className="font-heading text-xl font-bold text-slate-900 mt-1 mb-3">
                  Secondary & Senior Secondary
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                  Rigorous preparation for CBSE Board examinations coupled with foundation guidance for NEET, JEE, and CUET across all three distinct streams.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C59B27]" />
                    <strong>Science Stream:</strong> PCM / PCB with Biotech & CS
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C59B27]" />
                    <strong>Commerce Stream:</strong> Accounts, B.St, Economics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C59B27]" />
                    <strong>Humanities Stream:</strong> History, Pol. Sci, Geo
                  </li>
                </ul>
              </div>
              <Link
                href="/admissions"
                className="mt-6 inline-flex items-center text-xs font-bold text-[#1B4D3E] hover:underline"
              >
                Apply for Class XI Admission →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: CAMPUS FACILITIES & RESIDENTIAL LIFE
      ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1B4D3E] bg-[#1B4D3E]/10 px-3 py-1 rounded-full">
            Infrastructure & Facilities
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F2C59] mt-3 mb-4">
            World-Class Infrastructure on a Serene 15-Acre Campus
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            From modern science laboratories and smart digital learning suites to separate residential hostels and an expansive athletics arena.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FACILITIES_DATA.slice(0, 8).map((fac) => (
            <div
              key={fac.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-[#0F2C59] transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-[#C59B27] uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded">
                  {fac.category}
                </span>
                <h3 className="font-heading font-bold text-base text-slate-900 mt-2 mb-2">
                  {fac.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {fac.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1">
                {fac.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1B4D3E]" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/facilities"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F2C59] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1A3E75] transition-colors"
          >
            <span>Explore All Campus Facilities & Hostel Routine</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: NOTICES, CIRCULARS & ACADEMIC DESK
      ========================================================================= */}
      <section className="bg-slate-100 py-16 sm:py-20 px-4 sm:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Official Notices */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-300 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#B91C1C]">
                  Official School Desk
                </span>
                <h2 className="font-heading text-2xl font-bold text-[#0F2C59] mt-1">
                  Latest Notices & Circulars
                </h2>
              </div>
              <Link
                href="/notices"
                className="text-xs font-bold text-[#0F2C59] hover:underline flex items-center gap-1"
              >
                <span>View Archive</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {NOTICES_DATA.slice(0, 5).map((notice) => (
                <div
                  key={notice.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-50 text-[#0F2C59] shrink-0 border border-slate-200">
                      <FileText className="w-5 h-5 text-[#C59B27]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {notice.category}
                        </span>
                        {notice.isNew && (
                          <span className="bg-[#B91C1C] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                            New
                          </span>
                        )}
                        <span className="text-xs text-slate-500">{notice.date}</span>
                      </div>
                      <h4 className="font-heading font-bold text-sm text-slate-900 hover:text-[#0F2C59] transition-colors">
                        {notice.title}
                      </h4>
                    </div>
                  </div>

                  <Link
                    href="/downloads"
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0F2C59] hover:text-white text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: CBSE Compliance & Quick Downloads */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#0F2C59] text-white p-6 rounded-2xl shadow-md border border-[#1A3E75]">
              <div className="flex items-center gap-2 text-[#DFB23E] text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Statutory Compliance</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-white mb-2">
                CBSE Mandatory Public Disclosure
              </h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                In strict adherence to CBSE Circular CBSE/AFF/2021, all general school information, society registration, fire safety certificate, building safety certificate, and fee structure documents are available for public verification.
              </p>
              <Link
                href="/downloads"
                className="w-full py-2.5 px-4 bg-[#C59B27] hover:bg-[#DFB23E] text-[#0F2C59] font-bold text-xs uppercase tracking-wider rounded-xl transition-colors text-center block"
              >
                Access Mandatory Disclosures →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-heading font-bold text-base text-slate-900 mb-3">
                Key Document Downloads
              </h4>
              <ul className="space-y-2.5 text-xs">
                {[
                  { name: "Academic Calendar 2025–26", size: "1.2 MB" },
                  { name: "Admission Prospectus & Syllabus", size: "2.4 MB" },
                  { name: "Transfer Certificate (TC) Form", size: "480 KB" },
                  { name: "Hostel Rules & Checklist", size: "720 KB" },
                ].map((doc, i) => (
                  <li key={i}>
                    <Link
                      href="/downloads"
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-[#0F2C59]"
                    >
                      <span className="font-medium">{doc.name}</span>
                      <span className="text-[10px] text-slate-400">PDF • {doc.size}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: PROOF OF EXCELLENCE: TOPPERS & TESTIMONIALS
      ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27] bg-amber-50 px-3 py-1 rounded-full">
            Proven Merit
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F2C59] mt-3 mb-4">
            Proven Results. Proud Parents. Inspired Alumni.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Consistently leading Ballia district board merit lists while grooming students for national entrance examinations and leadership careers.
          </p>
        </div>

        {/* Board Toppers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {TOPPERS_DATA.map((topper, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border-2 border-slate-100 hover:border-[#C59B27] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold bg-[#0F2C59] text-white px-2.5 py-1 rounded-lg">
                    {topper.grade}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{topper.year}</span>
                </div>
                <div className="font-heading font-black text-3xl text-[#1B4D3E] mb-1">
                  {topper.score}
                </div>
                <h4 className="font-heading font-bold text-lg text-slate-900 mb-1">
                  {topper.name}
                </h4>
                {topper.stream && (
                  <p className="text-xs font-medium text-slate-500 mb-2">{topper.stream}</p>
                )}
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {topper.achievement}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Parent Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
            <Quote className="w-8 h-8 text-[#C59B27]/30 absolute top-6 right-6" />
            <p className="text-sm sm:text-base text-slate-700 italic leading-relaxed mb-6">
              "Enrolling our son in Devasthaly Vidyapeeth’s residential wing was the best decision for his discipline. The teachers take personal ownership of every boarder’s study routine, and the evening study supervision has produced wonderful academic gains."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#0F2C59] text-white flex items-center justify-center font-bold text-sm">
                RT
              </div>
              <div>
                <h5 className="font-heading font-bold text-sm text-slate-900">
                  Shri Rajeshwar Tiwari
                </h5>
                <p className="text-xs text-slate-500">Parent of Class IX Boarding Scholar • Rasra</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
            <Quote className="w-8 h-8 text-[#C59B27]/30 absolute top-6 right-6" />
            <p className="text-sm sm:text-base text-slate-700 italic leading-relaxed mb-6">
              "As a doctor working long hours in Ballia, safety and English speaking confidence were our top priorities. Devasthaly delivers on both counts with remarkable teachers, strict anti-bullying policies, and safe GPS-tracked bus transportation."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center font-bold text-sm">
                SP
              </div>
              <div>
                <h5 className="font-heading font-bold text-sm text-slate-900">
                  Dr. Sunita Pandey
                </h5>
                <p className="text-xs text-slate-500">Parent of Class VI Day-Scholar • Ballia City</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS (FAQ)
      ========================================================================= */}
      <section className="bg-slate-50 py-16 sm:py-20 px-4 sm:px-8 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0F2C59] bg-blue-50 px-3 py-1 rounded-full">
              Parent Queries
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#0F2C59] mt-3">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Everything parents want to know regarding admissions, transport, hostel life, and CBSE curriculum.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_DATA.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm open:border-[#0F2C59] transition-all"
              >
                <summary className="font-heading font-bold text-sm sm:text-base text-slate-900 cursor-pointer list-none flex items-center justify-between gap-4">
                  <span>{faq.question}</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <p className="text-xs sm:text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: REACH US & CAMPUS VISIT (MAP EMBED)
      ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Contact Details */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#1B4D3E]">
                Plan Your Visit
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#0F2C59] mt-1">
                Visit Our Campus in Chilkahar, Ballia
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Parents are welcome to visit our lush campus for an in-person tour of our smart classrooms, science labs, hostels, and sports grounds.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C59B27] shrink-0 mt-0.5" />
                <div>
                  <strong>Campus Address:</strong>
                  <p className="text-slate-600">
                    Devasthaly Vidyapeeth, Chilkahar, Tehsil Rasra, District Ballia, Uttar Pradesh — 277123
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Landmark: Near Chilkahar Railway Crossing / Ballia-Rasra State Highway
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#C59B27] shrink-0" />
                <div>
                  <strong>Admissions Desk:</strong>{" "}
                  <a
                    href={`tel:${SCHOOL_INFO.contacts.admissionsPhone.replace(/\s+/g, "")}`}
                    className="text-[#0F2C59] font-bold hover:underline"
                  >
                    {SCHOOL_INFO.contacts.admissionsPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#C59B27] shrink-0" />
                <div>
                  <strong>Visiting Hours:</strong> {SCHOOL_INFO.contacts.workingHours}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/admissions"
                className="px-5 py-3 rounded-xl bg-[#0F2C59] hover:bg-[#1A3E75] text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Schedule a Guided Campus Tour
              </Link>
              <Link
                href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1ebd5b] transition-colors inline-flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Directions
              </Link>
            </div>
          </div>

          {/* Interactive Google Map Embed */}
          <div className="lg:col-span-7 h-[380px] rounded-2xl overflow-hidden border border-slate-200 shadow-md">
            <iframe
              title="Devasthaly Vidyapeeth Campus Location in Chilkahar Ballia"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14372.416823334255!2d84.0152431!3d25.8643212!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39925bf784a6c4f7%3A0xbcf0bf5377f0a9a1!2sChilkahar%2C%20Uttar%20Pradesh%20277123!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
