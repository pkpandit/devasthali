import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SCHOOL_INFO,
  NOTICES_DATA,
  TOPPERS_DATA,
  FACILITIES_DATA,
  FAQ_DATA,
} from "@/lib/school-data";
import { Container } from "@/components/Container";
import {
  ShieldCheck,
  Award,
  BookOpen,
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
  Bus,
  Building,
  Heart,
  Quote,
  Star,
  MonitorPlay,
  FlaskConical,
  Cpu,
  Home,
  Trophy,
  HeartPulse,
  GraduationCap,
} from "lucide-react";

const FACILITY_IMAGES: Record<string, string> = {
  "fac-smart-classes": "/images/hero-students.jpg",
  "fac-composite-labs": "/images/science-lab.jpg",
  "fac-computer-ai-lab": "/images/hero-bg/hero-bg.webp",
  "fac-hostel-mess": "/images/campus-grounds.jpg",
  "fac-sports-complex": "/images/sports-activities.jpg",
  "fac-gps-transport": "/images/campus-grounds.jpg",
  "fac-library-reading": "/images/principal-mentor.jpg",
  "fac-infirmary-care": "/images/faculty-teachers.jpg",
};

const FACILITY_ICONS: Record<string, React.ElementType> = {
  MonitorPlay,
  FlaskConical,
  Cpu,
  Home,
  Trophy,
  Bus,
  BookOpen,
  HeartPulse,
};

const TOPPER_IMAGES: Record<string, string> = {
  "Priya Singh": "/images/topper-priya.jpg",
  "Aman Kumar Verma": "/images/topper-aman.jpg",
  "Shweta Tiwari": "/images/topper-shweta.jpg",
  "Rohan Upadhyay": "/images/topper-rohan.jpg",
};

const STAT_ICONS = [
  Award,
  Trophy,
  Building,
  GraduationCap,
  Sparkles,
  Bus,
];

const QUICK_ACTIONS = [
  { label: "Download 2025 Prospectus", href: "/downloads", icon: Download, hint: "Admissions PDF" },
  { label: "Fee Schedule & Guidelines", href: "/admissions/fees", icon: FileText, hint: "Class-wise Fees" },
  { label: "Bus Routes & Transport", href: "/facilities#transport", icon: Bus, hint: "40+ Stops Network" },
  { label: "Board Toppers & Results", href: "/results", icon: Award, hint: "100% Pass Records" },
  { label: "Official Circulars & Desk", href: "/notices", icon: Calendar, hint: "Latest Circulars" },
  { label: "CBSE Mandatory Disclosure", href: "/downloads", icon: ShieldCheck, hint: "Statutory Docs" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col w-full bg-white">
      {/* =========================================================================
          SECTION 1: HERO & ADMISSION HOOK (Full-Width Background Image)
      ========================================================================= */}
      <section className="relative w-full min-h-[600px] sm:min-h-[640px] lg:min-h-[700px] flex items-center bg-[#111827] text-white overflow-hidden py-16 sm:py-20 lg:py-28 border-b border-gray-800">
        {/* Full-Width Background Photograph Layer */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src="/images/hero-bg/hero-bg.webp"
            alt="Devasthaly Vidyapeeth classroom learning environment"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Neutral #111827 Restrained Directional Overlay */}
          <div
            className="absolute inset-0 bg-[#111827]/85 sm:bg-gradient-to-b sm:from-[#111827]/80 sm:via-[#111827]/75 sm:to-[#111827]/90"
            aria-hidden="true"
          />
        </div>

        <Container className="relative z-10 py-6 sm:py-10">
          {/* Hero Content */}
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
            {/* Admission Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider w-fit shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#818CF8]" />
              <span>Admissions Open 2025–26 • LKG to Class XI</span>
            </div>

            {/* Main H1 */}
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.12] tracking-tight max-w-4xl">
              Nurturing Academic Rigour, Moral Character & Leadership{" "}
              <span className="text-[#818CF8] underline decoration-[#818CF8]/40 underline-offset-8">
                Since 1988
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-200 leading-relaxed font-sans max-w-2xl sm:max-w-3xl">
              Welcome to <strong>Devasthaly Vidyapeeth</strong>, Chilkahar, Ballia. A premier CBSE-affiliated co-educational residential and day-boarding institution where timeless Indian values converge with state-of-the-art modern education.
            </p>

            {/* Quick Key Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-200 pt-2">
              <span className="inline-flex items-center gap-2 bg-[#111827]/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#818CF8]" />
                <span className="font-semibold text-white">CBSE Affil. No. 2130238</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-[#111827]/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 shadow-xs">
                <Award className="w-4 h-4 text-[#818CF8]" />
                <span className="font-semibold text-white">36+ Years of Trust</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-[#111827]/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 shadow-xs">
                <Building className="w-4 h-4 text-[#818CF8]" />
                <span className="font-semibold text-white">15-Acre Eco Campus</span>
              </span>
            </div>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
              <Link
                href="/admissions"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-sm tracking-wide uppercase transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 border border-[#4338CA] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              >
                <span>Apply for Admission</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>

              <Link
                href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}?text=Hello%20Devasthaly%20Vidyapeeth,%20I%20would%20like%20to%20know%20more%20about%20admissions.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#111827]/60 hover:bg-[#111827]/90 text-white border border-white/40 hover:border-white font-bold text-sm tracking-wide transition-all shadow-xs flex items-center justify-center gap-2.5 backdrop-blur-md focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <span>WhatsApp Counsellor</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 2: INSTITUTIONAL TRUST STRIP
      ========================================================================= */}
      <section className="w-full bg-[#F8FAFC] border-b border-[#E5E7EB] py-12 sm:py-16">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {SCHOOL_INFO.stats.map((stat, idx) => {
              const IconComponent = STAT_ICONS[idx % STAT_ICONS.length];
              return (
                <div
                  key={idx}
                  className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group border border-slate-100 hover:border-[#4F46E5]/40 relative overflow-hidden"
                >
                  <div className="absolute top-0 inset-x-0 h-1 bg-[#4F46E5] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] group-hover:bg-[#4F46E5] text-[#4F46E5] group-hover:text-white flex items-center justify-center mb-3.5 transition-colors duration-300 shadow-xs">
                    <IconComponent className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <span className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-[#111827] group-hover:text-[#4F46E5] tracking-tight transition-colors whitespace-nowrap">
                    {stat.value}
                  </span>
                  <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider mt-2 line-clamp-1">
                    {stat.label}
                  </span>
                  <span className="text-[11px] text-gray-500 mt-1 leading-normal font-sans line-clamp-1">
                    {stat.subtext}
                  </span>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 3: PARENT QUICK ACTIONS HUB
      ========================================================================= */}
      <section className="w-full py-12 sm:py-16 bg-white border-b border-[#E5E7EB]">
        <Container>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {QUICK_ACTIONS.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="group relative bg-[#F8FAFC] hover:bg-[#4F46E5] p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-between text-center gap-3.5 border border-slate-100 hover:border-[#4F46E5] cursor-pointer min-h-[148px]"
                >
                  <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-white/20 text-[#4F46E5] group-hover:text-white flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-105 border border-slate-100 group-hover:border-white/30">
                    <IconComponent className="w-6 h-6 text-[#4F46E5] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <span className="font-heading font-bold text-xs sm:text-sm text-[#111827] group-hover:text-white transition-colors duration-300 leading-snug block mb-1">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-gray-500 group-hover:text-indigo-100 font-sans transition-colors duration-300 block">
                      {item.hint}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 4: WHY CHOOSE DEVASTHALY VIDYAPEETH
      ========================================================================= */}
      <section className="w-full py-16 sm:py-24 bg-[#F3F4F6] border-b border-[#E5E7EB]">
        <Container>
          <div className="max-w-3xl mb-12 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#4F46E5] bg-white border border-[#E5E7EB] px-3.5 py-1.5 rounded-full inline-block shadow-xs">
              Our Foundation
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] mt-3 mb-4 tracking-tight">
              An Academic Environment Built for Focus, Character, and Distinction
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-sans">
              For more than three decades, Devasthaly Vidyapeeth has been the trusted sanctuary for families seeking rigorous CBSE learning, disciplined boarding life, and authentic Indian values.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "36+ Years CBSE Rigour",
                desc: "100% board pass track record with consistent district top ranks, dedicated subject masters, and NEET/JEE foundational mentoring.",
                icon: BookOpen,
                color: "text-[#4F46E5]",
                bg: "bg-[#F3F4F6]",
              },
              {
                title: "Disciplined Residential Care",
                desc: "Separate secure hostels for boys and girls with 24/7 warden supervision, in-house evening study sessions, and wholesome pure vegetarian meals.",
                icon: Building,
                color: "text-[#4F46E5]",
                bg: "bg-[#F3F4F6]",
              },
              {
                title: "Spoken English & Tech Labs",
                desc: "Daily language fluency drills, smart interactive digital boards, and coding/robotics laboratories to ensure students thrive globally.",
                icon: Sparkles,
                color: "text-[#4F46E5]",
                bg: "bg-[#F3F4F6]",
              },
              {
                title: "Holistic Moral Sanskaar",
                desc: "Traditional Indian culture, yoga, athletics, NCC/Scouts, and values education fostering empathy, integrity, and patriotic leadership.",
                icon: Heart,
                color: "text-[#4F46E5]",
                bg: "bg-[#F3F4F6]",
              },
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-7 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-13 h-13 rounded-2xl bg-[#F3F4F6] text-[#4F46E5] group-hover:bg-[#4F46E5] group-hover:text-white transition-colors flex items-center justify-center mb-5 border border-[#E5E7EB] shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-[#111827] group-hover:text-[#4F46E5] transition-colors mb-2.5">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
                      {pillar.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-5 border-t border-gray-100 flex items-center text-xs font-bold text-[#4F46E5] group-hover:translate-x-1 transition-transform">
                    <span>Learn more</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 5: ACADEMICS PROGRESSION (LKG TO CLASS XII)
      ========================================================================= */}
      <section className="w-full bg-white py-16 sm:py-24 border-b border-[#E5E7EB]">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#4F46E5] bg-[#F3F4F6] border border-[#E5E7EB] px-3.5 py-1.5 rounded-full inline-block shadow-xs">
                Curriculum Progression
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] mt-3 tracking-tight">
                Comprehensive CBSE Curriculum (LKG to Class 12)
              </h2>
            </div>
            <Link
              href="/academics"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors group shrink-0"
            >
              <span>Explore Detailed Academic Wings</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Wing 1: Foundational */}
            <div className="relative bg-white hover:bg-[#4F46E5] rounded-2xl sm:rounded-3xl shadow-md hover:shadow-2xl p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer">
              <div>
                {/* Top Image Container */}
                <div className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-xs">
                  <Image
                    src="/images/hero-students.jpg"
                    alt="Foundational Wing LKG to Class II at Devasthaly Vidyapeeth"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Top-Left Category Pill Badge */}
                  <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4F46E5] group-hover:bg-white text-white group-hover:text-[#4F46E5] text-xs font-bold shadow-sm transition-colors duration-300">
                    <GraduationCap className="w-3.5 h-3.5 text-white group-hover:text-[#4F46E5] transition-colors duration-300" />
                    <span>Early Childhood (Age 3–7)</span>
                  </div>
                </div>

                {/* Sub-header / Meta Capsule Pill with Dashed Border */}
                <div className="rounded-full border border-dashed border-[#CBD5E1] group-hover:border-white/30 px-3 py-1.5 inline-flex items-center gap-2 w-fit bg-slate-50/70 group-hover:bg-white/15 mb-3 transition-colors duration-300">
                  <div className="w-6 h-6 rounded-full bg-[#EEF2FF] group-hover:bg-white border border-[#C7D2FE] group-hover:border-white flex items-center justify-center shrink-0 transition-colors duration-300">
                    <GraduationCap className="w-3.5 h-3.5 text-[#4F46E5] transition-colors duration-300" />
                  </div>
                  <span className="text-xs font-bold text-[#4F46E5] group-hover:text-white transition-colors duration-300">Stage 1</span>
                  <span className="text-xs text-gray-700 group-hover:text-indigo-100 font-medium truncate max-w-[130px] sm:max-w-[150px] transition-colors duration-300">
                    LKG to Class II
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="font-heading font-bold text-lg sm:text-xl text-[#111827] group-hover:text-white transition-colors duration-300 leading-snug line-clamp-2 mb-2">
                  Foundational Wing (LKG to Class II)
                </h3>

                {/* Meta Feature Accent Row */}
                <div className="flex items-center gap-2 text-xs text-[#4F46E5] group-hover:text-white font-semibold mb-3 transition-colors duration-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                  <span className="text-gray-600 group-hover:text-indigo-100 font-medium truncate transition-colors duration-300">
                    Phonics & Storytelling Circles
                  </span>
                </div>

                {/* Paragraph Description */}
                <p className="text-xs text-gray-600 group-hover:text-white/95 leading-relaxed font-sans line-clamp-3 mb-4 transition-colors duration-300">
                  Activity-based, play-way methodology focused on foundational literacy, numeracy, spoken English confidence, and sensory discovery in colorful child-friendly classrooms.
                </p>
              </div>

              {/* Highlights Bullet List */}
              <div className="pt-3 border-t border-gray-100 group-hover:border-white/20 space-y-2 mt-auto transition-colors duration-300">
                <ul className="space-y-2 text-xs text-gray-600 group-hover:text-white font-sans transition-colors duration-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                    <span>Phonics & Storytelling Circles</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                    <span>Play Area & Montessori Learning Aids</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                    <span>Caring Female Attendants & Nurse</span>
                  </li>
                </ul>
                <Link
                  href="/academics"
                  className="mt-4 pt-3 border-t border-gray-100 group-hover:border-white/20 inline-flex items-center text-xs font-bold text-[#4F46E5] group-hover:text-white transition-colors duration-300"
                >
                  Learn About Foundational Pedagogy →
                </Link>
              </div>
            </div>

            {/* Wing 2: Middle School */}
            <div className="relative bg-white hover:bg-[#4F46E5] rounded-2xl sm:rounded-3xl shadow-md hover:shadow-2xl p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer">
              <div>
                {/* Top Image Container */}
                <div className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-xs">
                  <Image
                    src="/images/science-lab.jpg"
                    alt="Preparatory and Middle Wing Classes III to VIII at Devasthaly Vidyapeeth"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Top-Left Category Pill Badge */}
                  <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4F46E5] group-hover:bg-white text-white group-hover:text-[#4F46E5] text-xs font-bold shadow-sm transition-colors duration-300">
                    <BookOpen className="w-3.5 h-3.5 text-white group-hover:text-[#4F46E5] transition-colors duration-300" />
                    <span>Classes III to VIII</span>
                  </div>
                </div>

                {/* Sub-header / Meta Capsule Pill with Dashed Border */}
                <div className="rounded-full border border-dashed border-[#CBD5E1] group-hover:border-white/30 px-3 py-1.5 inline-flex items-center gap-2 w-fit bg-slate-50/70 group-hover:bg-white/15 mb-3 transition-colors duration-300">
                  <div className="w-6 h-6 rounded-full bg-[#EEF2FF] group-hover:bg-white border border-[#C7D2FE] group-hover:border-white flex items-center justify-center shrink-0 transition-colors duration-300">
                    <BookOpen className="w-3.5 h-3.5 text-[#4F46E5] transition-colors duration-300" />
                  </div>
                  <span className="text-xs font-bold text-[#4F46E5] group-hover:text-white transition-colors duration-300">Stage 2</span>
                  <span className="text-xs text-gray-700 group-hover:text-indigo-100 font-medium truncate max-w-[130px] sm:max-w-[150px] transition-colors duration-300">
                    Preparatory & Middle
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="font-heading font-bold text-lg sm:text-xl text-[#111827] group-hover:text-white transition-colors duration-300 leading-snug line-clamp-2 mb-2">
                  Preparatory & Middle Wing
                </h3>

                {/* Meta Feature Accent Row */}
                <div className="flex items-center gap-2 text-xs text-[#4F46E5] group-hover:text-white font-semibold mb-3 transition-colors duration-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                  <span className="text-gray-600 group-hover:text-indigo-100 font-medium truncate transition-colors duration-300">
                    Hands-on Science & Math Lab Experiments
                  </span>
                </div>

                {/* Paragraph Description */}
                <p className="text-xs text-gray-600 group-hover:text-white/95 leading-relaxed font-sans line-clamp-3 mb-4 transition-colors duration-300">
                  Experiential learning introducing scientific inquiry, analytical mathematics, computer programming, languages (English, Hindi, Sanskrit), and collaborative project work.
                </p>
              </div>

              {/* Highlights Bullet List */}
              <div className="pt-3 border-t border-gray-100 group-hover:border-white/20 space-y-2 mt-auto transition-colors duration-300">
                <ul className="space-y-2 text-xs text-gray-600 group-hover:text-white font-sans transition-colors duration-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                    <span>Hands-on Science & Math Lab Experiments</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                    <span>Python & AI Foundations Curriculum</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                    <span>Inter-house Debates & Olympiads</span>
                  </li>
                </ul>
                <Link
                  href="/academics"
                  className="mt-4 pt-3 border-t border-gray-100 group-hover:border-white/20 inline-flex items-center text-xs font-bold text-[#4F46E5] group-hover:text-white transition-colors duration-300"
                >
                  Learn About Middle School Subjects →
                </Link>
              </div>
            </div>

            {/* Wing 3: Senior Secondary */}
            <div className="relative bg-white hover:bg-[#4F46E5] rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer">
              <div>
                {/* Top Image Container */}
                <div className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-xs">
                  <Image
                    src="/images/principal-mentor.jpg"
                    alt="Senior Secondary Wing Classes IX to XII at Devasthaly Vidyapeeth"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Top-Left Category Pill Badge */}
                  <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4F46E5] group-hover:bg-white text-white group-hover:text-[#4F46E5] text-xs font-bold shadow-sm transition-colors duration-300">
                    <Sparkles className="w-3.5 h-3.5 text-white group-hover:text-[#4F46E5] transition-colors duration-300" />
                    <span>Classes IX to XII</span>
                  </div>
                  {/* Top-Right High Demand Badge */}
                  <div className="absolute top-3 right-3 z-10 bg-amber-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    High Demand
                  </div>
                </div>

                {/* Sub-header / Meta Capsule Pill with Dashed Border */}
                <div className="rounded-full border border-dashed border-[#CBD5E1] group-hover:border-white/30 px-3 py-1.5 inline-flex items-center gap-2 w-fit bg-slate-50/70 group-hover:bg-white/15 mb-3 transition-colors duration-300">
                  <div className="w-6 h-6 rounded-full bg-[#EEF2FF] group-hover:bg-white border border-[#C7D2FE] group-hover:border-white flex items-center justify-center shrink-0 transition-colors duration-300">
                    <Award className="w-3.5 h-3.5 text-[#4F46E5] transition-colors duration-300" />
                  </div>
                  <span className="text-xs font-bold text-[#4F46E5] group-hover:text-white transition-colors duration-300">Stage 3</span>
                  <span className="text-xs text-gray-700 group-hover:text-indigo-100 font-medium truncate max-w-[130px] sm:max-w-[150px] transition-colors duration-300">
                    Secondary & Sr. Sec
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="font-heading font-bold text-lg sm:text-xl text-[#111827] group-hover:text-white transition-colors duration-300 leading-snug line-clamp-2 mb-2">
                  Secondary & Senior Secondary
                </h3>

                {/* Meta Feature Accent Row */}
                <div className="flex items-center gap-2 text-xs text-[#4F46E5] group-hover:text-white font-semibold mb-3 transition-colors duration-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                  <span className="text-gray-600 group-hover:text-indigo-100 font-medium truncate transition-colors duration-300">
                    NEET, JEE & CUET Foundation
                  </span>
                </div>

                {/* Paragraph Description */}
                <p className="text-xs text-gray-600 group-hover:text-white/95 leading-relaxed font-sans line-clamp-3 mb-4 transition-colors duration-300">
                  Rigorous preparation for CBSE Board examinations coupled with foundation guidance for NEET, JEE, and CUET across all three distinct streams.
                </p>
              </div>

              {/* Highlights Bullet List */}
              <div className="pt-3 border-t border-gray-100 group-hover:border-white/20 space-y-2 mt-auto transition-colors duration-300">
                <ul className="space-y-2 text-xs text-gray-600 group-hover:text-white font-sans transition-colors duration-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                    <span><strong>Science Stream:</strong> PCM / PCB with Biotech & CS</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                    <span><strong>Commerce Stream:</strong> Accounts, B.St, Economics</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                    <span><strong>Humanities Stream:</strong> History, Pol. Sci, Geo</span>
                  </li>
                </ul>
                <Link
                  href="/admissions"
                  className="mt-4 pt-3 border-t border-gray-100 group-hover:border-white/20 inline-flex items-center text-xs font-bold text-[#4F46E5] group-hover:text-white transition-colors duration-300"
                >
                  Apply for Class XI Admission →
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 6: CAMPUS FACILITIES & RESIDENTIAL LIFE
      ========================================================================= */}
      <section className="w-full py-16 sm:py-24 bg-[#F3F4F6] border-b border-[#E5E7EB]">
        <Container>
          <div className="max-w-3xl mb-12 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#4F46E5] bg-white border border-[#E5E7EB] px-3.5 py-1.5 rounded-full inline-block shadow-xs">
              Infrastructure & Facilities
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] mt-3 mb-4 tracking-tight">
              World-Class Infrastructure on a Serene 15-Acre Campus
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-sans">
              From modern science laboratories and smart digital learning suites to separate residential hostels and an expansive athletics arena.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FACILITIES_DATA.slice(0, 8).map((fac) => {
              const IconComponent = FACILITY_ICONS[fac.iconName] || BookOpen;
              const facilityImage = FACILITY_IMAGES[fac.id] || "/images/campus-grounds.jpg";

              return (
                <div
                  key={fac.id}
                  className="relative bg-white hover:bg-[#4F46E5] rounded-2xl sm:rounded-3xl shadow-md hover:shadow-2xl p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  {/* Top Image Container with Inset White Padding */}
                  <div>
                    <div className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-xs">
                      <Image
                        src={facilityImage}
                        alt={fac.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Top-Left Category Pill Badge with Icon */}
                      <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4F46E5] group-hover:bg-white text-white group-hover:text-[#4F46E5] text-xs font-bold shadow-sm transition-colors duration-300">
                        <GraduationCap className="w-3.5 h-3.5 text-white group-hover:text-[#4F46E5] transition-colors duration-300" />
                        <span>{fac.category}</span>
                      </div>
                    </div>

                    {/* Sub-header / Meta Capsule Pill with Dashed Border */}
                    <div className="rounded-full border border-dashed border-[#CBD5E1] group-hover:border-white/30 px-3 py-1.5 inline-flex items-center gap-2 w-fit bg-slate-50/70 group-hover:bg-white/15 mb-3 transition-colors duration-300">
                      <div className="w-6 h-6 rounded-full bg-[#EEF2FF] group-hover:bg-white border border-[#C7D2FE] group-hover:border-white flex items-center justify-center shrink-0 transition-colors duration-300">
                        <IconComponent className="w-3.5 h-3.5 text-[#4F46E5] transition-colors duration-300" />
                      </div>
                      <span className="text-xs font-bold text-[#4F46E5] group-hover:text-white transition-colors duration-300">{fac.category}</span>
                      <span className="text-xs text-gray-700 group-hover:text-indigo-100 font-medium truncate max-w-[130px] sm:max-w-[150px] transition-colors duration-300">
                        {fac.highlights[0]}
                      </span>
                    </div>

                    {/* Card Title */}
                    <h3 className="font-heading font-bold text-base sm:text-lg text-[#111827] group-hover:text-white transition-colors duration-300 leading-snug line-clamp-2 mb-2">
                      {fac.title}
                    </h3>

                    {/* Meta Feature Accent Row */}
                    <div className="flex items-center gap-2 text-xs text-[#4F46E5] group-hover:text-white font-semibold mb-3 transition-colors duration-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5] group-hover:text-white shrink-0 transition-colors duration-300" />
                      <span className="text-gray-600 group-hover:text-indigo-100 font-medium truncate transition-colors duration-300">
                        {fac.highlights[1] || fac.highlights[0]}
                      </span>
                    </div>

                    {/* Paragraph Description */}
                    <p className="text-xs text-gray-600 group-hover:text-white/95 leading-relaxed font-sans line-clamp-3 mb-4 transition-colors duration-300">
                      {fac.description}
                    </p>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="pt-3 border-t border-gray-100 group-hover:border-white/20 space-y-1.5 mt-auto transition-colors duration-300">
                    {fac.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-600 group-hover:text-white font-sans transition-colors duration-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] group-hover:bg-white shrink-0 transition-colors duration-300" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex justify-start">
            <Link
              href="/facilities"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs border border-[#4338CA]"
            >
              <span>Explore All Campus Facilities & Hostel Routine</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 7: NOTICES, CIRCULARS & ACADEMIC DESK
      ========================================================================= */}
      <section className="w-full bg-white py-16 sm:py-24 border-b border-[#E5E7EB]">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Official Notices */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#4F46E5]">
                  Official School Desk
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#111827] mt-1 tracking-tight">
                  Latest Notices & Circulars
                </h2>
              </div>
              <Link
                href="/notices"
                className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1 group"
              >
                <span>View Archive</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {NOTICES_DATA.slice(0, 5).map((notice) => (
                <div
                  key={notice.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-xl bg-[#F3F4F6] text-[#4F46E5] shrink-0 border border-[#E5E7EB] group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F3F4F6] px-2.5 py-0.5 rounded text-gray-700 border border-[#E5E7EB]">
                          {notice.category}
                        </span>
                        {notice.isNew && (
                          <span className="bg-[#4F46E5] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase shadow-xs">
                            New
                          </span>
                        )}
                        <span className="text-xs text-gray-500 font-sans">{notice.date}</span>
                      </div>
                      <h4 className="font-heading font-bold text-sm sm:text-base text-[#111827] group-hover:text-[#4F46E5] transition-colors leading-snug">
                        {notice.title}
                      </h4>
                    </div>
                  </div>

                  <Link
                    href="/downloads"
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#111827] border border-[#E5E7EB] text-xs font-bold hover:bg-[#4F46E5] hover:text-white hover:border-[#4F46E5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 transition-all shadow-xs"
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
            <div className="bg-[#111827] text-white p-7 rounded-2xl shadow-md border-t-4 border-[#4F46E5]">
              <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider mb-2.5">
                <ShieldCheck className="w-4 h-4 text-[#4F46E5]" />
                <span>Statutory Compliance</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-white mb-2.5">
                CBSE Mandatory Public Disclosure
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mb-5 leading-relaxed font-sans">
                In strict adherence to CBSE Circular CBSE/AFF/2021, all general school information, society registration, fire safety certificate, building safety certificate, and fee structure documents are available for public verification.
              </p>
              <Link
                href="/downloads"
                className="w-full py-3 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors text-center block shadow-xs border border-[#4338CA]"
              >
                Access Mandatory Disclosures →
              </Link>
            </div>

            <div className="bg-white p-7 rounded-2xl shadow-md">
              <h4 className="font-heading font-bold text-base text-[#111827] mb-3.5 pb-2 border-b border-gray-100">
                Key Document Downloads
              </h4>
              <ul className="space-y-2 text-xs font-sans">
                {[
                  { name: "Academic Calendar 2025–26", size: "1.2 MB" },
                  { name: "Admission Prospectus & Syllabus", size: "2.4 MB" },
                  { name: "Transfer Certificate (TC) Form", size: "480 KB" },
                  { name: "Hostel Rules & Checklist", size: "720 KB" },
                ].map((doc, i) => (
                  <li key={i}>
                    <Link
                      href="/downloads"
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F3F4F6] text-gray-700 hover:text-[#4F46E5] transition-colors"
                    >
                      <span className="font-medium text-xs sm:text-sm">{doc.name}</span>
                      <span className="text-[11px] text-gray-400 font-medium">PDF • {doc.size}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 8: PROOF OF EXCELLENCE: TOPPERS & TESTIMONIALS
      ========================================================================= */}
      <section className="w-full py-16 sm:py-24 bg-[#F3F4F6] border-b border-[#E5E7EB]">
        <Container>
          <div className="max-w-3xl mb-12 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#4F46E5] bg-white border border-[#E5E7EB] px-3.5 py-1.5 rounded-full inline-block shadow-xs">
              Proven Merit
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] mt-3 mb-4 tracking-tight">
              Proven Results. Proud Parents. Inspired Alumni.
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-sans">
              Consistently leading Ballia district board merit lists while grooming students for national entrance examinations and leadership careers.
            </p>
          </div>

          {/* Board Toppers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {TOPPERS_DATA.map((topper, idx) => (
              <div
                key={idx}
                className="relative bg-white hover:bg-[#4F46E5] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Top Image Container */}
                  <div className="relative w-full aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-xs">
                    <Image
                      src={TOPPER_IMAGES[topper.name] || "/images/hero-students.jpg"}
                      alt={`${topper.name} - ${topper.grade} CBSE Topper`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Top-Left Grade Badge */}
                    <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4F46E5] group-hover:bg-white text-white group-hover:text-[#4F46E5] text-xs font-bold shadow-sm transition-colors duration-300">
                      <GraduationCap className="w-3.5 h-3.5 text-white group-hover:text-[#4F46E5] transition-colors duration-300" />
                      <span>{topper.grade}</span>
                    </div>
                    {/* Top-Right Year Badge */}
                    <div className="absolute top-3 right-3 z-10 inline-flex items-center px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm group-hover:bg-white/20 text-[#111827] group-hover:text-white text-xs font-bold shadow-xs transition-colors duration-300">
                      <span>{topper.year}</span>
                    </div>
                  </div>

                  {/* Sub-header / Stream Capsule Pill with Dashed Border */}
                  <div className="rounded-full border border-dashed border-[#CBD5E1] group-hover:border-white/30 px-3 py-1 inline-flex items-center gap-1.5 w-fit bg-slate-50/70 group-hover:bg-white/15 mb-3 transition-colors duration-300">
                    <Award className="w-3.5 h-3.5 text-[#4F46E5] group-hover:text-white transition-colors duration-300" />
                    <span className="text-xs font-medium text-gray-700 group-hover:text-white transition-colors duration-300">
                      {topper.stream || "Board Distinction"}
                    </span>
                  </div>

                  {/* Score & Name */}
                  <div className="font-heading font-black text-3xl sm:text-4xl text-[#4F46E5] group-hover:text-white mb-1.5 transition-colors duration-300">
                    {topper.score}
                  </div>
                  <h4 className="font-heading font-bold text-lg text-[#111827] group-hover:text-white mb-2 transition-colors duration-300">
                    {topper.name}
                  </h4>
                  <p className="text-xs text-gray-600 group-hover:text-white bg-[#F3F4F6] group-hover:bg-white/15 p-3 rounded-xl border border-[#E5E7EB] group-hover:border-white/20 font-sans leading-relaxed transition-colors duration-300">
                    {topper.achievement}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Parent Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-7 sm:p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <h4 className="font-heading font-bold text-base sm:text-lg text-[#111827] mb-1.5">
                  Residential Care & Academic Discipline
                </h4>
                <div className="flex items-center gap-1 mb-4 text-[#F59E0B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-sans mb-6">
                  &quot;Enrolling our son in Devasthaly Vidyapeeth’s residential wing was the best decision for his discipline. The teachers take personal ownership of every boarder’s study routine, and the evening study supervision has produced wonderful academic gains.&quot;
                </p>
              </div>
              <div className="pt-5 border-t border-gray-100 flex items-center justify-between gap-4 mt-auto">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    RT
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-base text-[#111827]">
                      Shri Rajeshwar Tiwari
                    </h5>
                    <p className="text-xs text-gray-500 font-sans mt-0.5">Parent of Class IX Boarding Scholar • Rasra</p>
                  </div>
                </div>
                <Quote className="w-12 h-12 text-slate-200 shrink-0 select-none pointer-events-none" strokeWidth={2.5} />
              </div>
            </div>

            <div className="bg-white p-7 sm:p-8 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <h4 className="font-heading font-bold text-base sm:text-lg text-[#111827] mb-1.5">
                  Safety, Care & English Confidence
                </h4>
                <div className="flex items-center gap-1 mb-4 text-[#F59E0B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-sans mb-6">
                  &quot;As a doctor working long hours in Ballia, safety and English speaking confidence were our top priorities. Devasthaly delivers on both counts with remarkable teachers, strict anti-bullying policies, and safe GPS-tracked bus transportation.&quot;
                </p>
              </div>
              <div className="pt-5 border-t border-gray-100 flex items-center justify-between gap-4 mt-auto">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    SP
                  </div>
                  <div>
                    <h5 className="font-heading font-bold text-base text-[#111827]">
                      Dr. Sunita Pandey
                    </h5>
                    <p className="text-xs text-gray-500 font-sans mt-0.5">Parent of Class VI Day-Scholar • Ballia City</p>
                  </div>
                </div>
                <Quote className="w-12 h-12 text-slate-200 shrink-0 select-none pointer-events-none" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS (FAQ)
      ========================================================================= */}
      <section className="w-full bg-white py-16 sm:py-24 border-b border-[#E5E7EB]">
        <Container>
          <div className="max-w-3xl mb-12 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#4F46E5] bg-[#F3F4F6] border border-[#E5E7EB] px-3.5 py-1.5 rounded-full inline-block shadow-xs">
              Parent Queries
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] mt-3 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 font-sans">
              Everything parents want to know regarding admissions, transport, hostel life, and CBSE curriculum.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {FAQ_DATA.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#4F46E5] open:border-[#4F46E5] p-5 sm:p-6 transition-all"
              >
                <summary className="font-heading font-bold text-sm sm:text-base text-[#111827] cursor-pointer list-none flex items-center justify-between gap-4 group-hover:text-[#4F46E5] transition-colors">
                  <span>{faq.question}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform text-xs">
                    ▾
                  </span>
                </summary>
                <p className="text-xs sm:text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100 leading-relaxed font-sans">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 10: REACH US & CAMPUS VISIT (MAP EMBED)
      ========================================================================= */}
      <section className="w-full pt-16 sm:pt-24 bg-[#F3F4F6]">
        <Container className="mb-12">
          {/* Header */}
          <div className="max-w-3xl mb-10 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#4F46E5] bg-white border border-[#E5E7EB] px-3.5 py-1.5 rounded-full inline-block shadow-xs">
              Plan Your Visit
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] mt-3 tracking-tight">
              Visit Our Campus in Chilkahar, Ballia
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed font-sans">
              Parents are welcome to visit our lush campus for an in-person tour of our smart classrooms, science labs, hostels, and sports grounds.
            </p>
          </div>

          {/* Contact Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-xs sm:text-sm text-gray-600 font-sans">
            <div className="flex items-start gap-3.5 bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#4F46E5] shrink-0 border border-[#E5E7EB]">
                <MapPin className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <div>
                <strong className="text-[#111827] block text-xs sm:text-sm mb-0.5">Campus Address:</strong>
                <p className="text-gray-700 leading-relaxed">
                  Devasthaly Vidyapeeth, Chilkahar, Tehsil Rasra, District Ballia, Uttar Pradesh — 277123
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Landmark: Near Chilkahar Railway Crossing / Ballia-Rasra State Highway
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#4F46E5] shrink-0 border border-[#E5E7EB]">
                <Phone className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <div>
                <strong className="text-[#111827] block mb-0.5">Admissions Desk:</strong>{" "}
                <a
                  href={`tel:${SCHOOL_INFO.contacts.admissionsPhone.replace(/\s+/g, "")}`}
                  className="text-[#4F46E5] font-bold hover:underline"
                >
                  {SCHOOL_INFO.contacts.admissionsPhone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#4F46E5] shrink-0 border border-[#E5E7EB]">
                <Clock className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <div>
                <strong className="text-[#111827] block mb-0.5">Visiting Hours:</strong> {SCHOOL_INFO.contacts.workingHours}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admissions"
              className="px-6 py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs border border-[#4338CA]"
            >
              Schedule a Guided Campus Tour
            </Link>
            <Link
              href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1ebd5b] transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Directions
            </Link>
          </div>
        </Container>

        {/* Full-Width Interactive Google Map */}
        <div className="w-full h-[460px] sm:h-[520px] relative overflow-hidden border-t border-[#E5E7EB]">
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
      </section>
    </div>
  );
}
