import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SCHOOL_INFO,
  NOTICES_DATA,
  FACILITIES_DATA,
  FAQ_DATA,
} from "@/lib/school-data";
import { getPublicNotices } from "@/lib/api/notices";
import { Container } from "@/components/ui/Container";
import { TestimonialSection } from "@/components/features/testimonials/TestimonialSection";
import { HomeAnnouncement } from "@/components/features/announcements/HomeAnnouncement";
import { HomeToppersShowcase } from "@/components/features/home/HomeToppersShowcase";
import {
  ShieldCheck,
  Award,
  BookOpen,
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
  MonitorPlay,
  FlaskConical,
  Cpu,
  Home,
  Trophy,
  HeartPulse,
  GraduationCap,
} from "lucide-react";

const FACILITY_IMAGES: Record<string, string> = {
  "fac-smart-classes": "/images/home/hero/hero-students.jpg",
  "fac-composite-labs": "/images/facilities/science-lab.jpg",
  "fac-computer-ai-lab": "/images/home/hero/hero-bg.webp",
  "fac-hostel-mess": "/images/facilities/campus-grounds.jpg",
  "fac-sports-complex": "/images/facilities/sports-activities.jpg",
  "fac-gps-transport": "/images/facilities/campus-grounds.jpg",
  "fac-library-reading": "/images/leadership/principal-mentor.jpg",
  "fac-infirmary-care": "/images/academics/faculty/faculty-teachers.jpg",
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

const STAT_METRICS = [
  {
    label: "Years of Heritage",
    value: "36+",
    subtext: "Established in 1988",
    image: "/images/about/campus-showcase.jpg",
    icon: Award,
    color: "text-[#B45309]",
    bg: "bg-amber-50/80",
    borderHover: "hover:border-[#B45309]/40",
    topGradient: "from-amber-500 to-amber-600",
    badge: "Legacy",
  },
  {
    label: "CBSE Board Pass Rate",
    value: "100%",
    subtext: "Consistent Merit Ranks",
    image: "/images/home/hero/hero-students.jpg",
    icon: Trophy,
    color: "text-[#B91C1C]",
    bg: "bg-red-50/80",
    borderHover: "hover:border-[#B91C1C]/40",
    topGradient: "from-red-600 to-[#B91C1C]",
    badge: "Excellence",
  },
  {
    label: "Lush Green Campus",
    value: "15+ Acres",
    subtext: "Eco-Friendly & Safe",
    image: "/images/facilities/campus-grounds.jpg",
    icon: Building,
    color: "text-emerald-700",
    bg: "bg-emerald-50/80",
    borderHover: "hover:border-emerald-600/40",
    topGradient: "from-emerald-600 to-emerald-700",
    badge: "Eco Campus",
  },
  {
    label: "Student-Teacher Ratio",
    value: "1 : 25",
    subtext: "Personal Mentorship",
    image: "/images/leadership/principal-mentor.jpg",
    icon: GraduationCap,
    color: "text-[#B91C1C]",
    bg: "bg-red-50/80",
    borderHover: "hover:border-[#B91C1C]/40",
    topGradient: "from-red-600 to-[#B91C1C]",
    badge: "Mentorship",
  },
  {
    label: "Alumni Across India",
    value: "3,500+",
    subtext: "IITs, AIIMS, Armed Forces",
    image: "/images/alumni/alumni-graduates.jpg",
    icon: Sparkles,
    color: "text-[#B45309]",
    bg: "bg-amber-50/80",
    borderHover: "hover:border-[#B45309]/40",
    topGradient: "from-amber-500 to-amber-600",
    badge: "Alumni",
  },
  {
    label: "Transport Nodes",
    value: "40+ Stops",
    subtext: "Ballia & Rasra Network",
    image: "/images/facilities/school-bus-fleet.jpg",
    icon: Bus,
    color: "text-[#B91C1C]",
    bg: "bg-red-50/80",
    borderHover: "hover:border-[#B91C1C]/40",
    topGradient: "from-red-600 to-[#B91C1C]",
    badge: "GPS Fleet",
  },
];

const QUICK_ACTIONS = [
  {
    label: "Download School Prospectus",
    href: "/school-prospectus",
    image: "/images/admissions/prospectus-brochure.jpg",
    icon: Download,
    hint: "Admissions PDF Brochure",
    badge: "PDF",
  },
  {
    label: "Fee Schedule & Guidelines",
    href: "/admissions/fees",
    image: "/images/admissions/fee-guidelines.jpg",
    icon: FileText,
    hint: "Class-wise Fee Structure",
    badge: "Fees",
  },
  {
    label: "Bus Routes & Transport",
    href: "/facilities#transport",
    image: "/images/facilities/school-bus-fleet.jpg",
    icon: Bus,
    hint: "40+ Stops GPS Network",
    badge: "Routes",
  },
  {
    label: "Board Toppers & Results",
    href: "/results",
    image: "/images/academics/toppers/board-toppers-trophy.jpg",
    icon: Award,
    hint: "100% CBSE Pass Records",
    badge: "Merit",
  },
  {
    label: "Official Circulars & Desk",
    href: "/notices",
    image: "/images/notices/school-notices-circulars.jpg",
    icon: Calendar,
    hint: "Latest School Circulars",
    badge: "Desk",
  },
  {
    label: "CBSE Mandatory Disclosure",
    href: "/mandatory-public-disclosure",
    image: "/images/about/cbse-affiliation-cert.jpg",
    icon: ShieldCheck,
    hint: "Statutory Compliance Docs",
    badge: "CBSE",
  },
];

/**
 * Deterministic skeleton fallback for Section 7: Latest Notices & Circulars.
 * Pre-allocates space for 5 notice cards to eliminate Cumulative Layout Shift (CLS).
 */
function HomeNoticesFallback() {
  return (
    <div className="space-y-3.5" role="status" aria-label="Loading latest notices">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5 w-full sm:w-auto flex-1">
            <div className="p-3 rounded-xl bg-gray-100 shrink-0 border border-gray-200">
              <div className="w-5 h-5 bg-gray-200 rounded" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-100 rounded w-20" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          </div>
          <div className="shrink-0 w-24 h-9 bg-gray-100 rounded-full border border-gray-200" />
        </div>
      ))}
    </div>
  );
}

/**
 * Async server component to fetch and stream Section 7 homepage notices.
 */
async function HomeNoticesSection() {
  const { notices: liveNotices } = await getPublicNotices({ limit: 5 });
  const homeNotices = liveNotices && liveNotices.length > 0 ? liveNotices.slice(0, 5) : NOTICES_DATA.slice(0, 5);

  return (
    <div className="space-y-3.5">
      {homeNotices.map((notice) => {
        const hasDirectFile = Boolean(notice.fileUrl);

        return (
          <div
            key={notice.id}
            className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group border border-gray-100 hover:border-gray-200"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-[#F3F4F6] text-[#B91C1C] shrink-0 border border-[#E5E7EB] group-hover:bg-[#B91C1C] group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-sm font-heading font-bold uppercase tracking-wider bg-[#F3F4F6] px-2.5 py-0.5 rounded text-gray-700 border border-[#E5E7EB]">
                    {notice.category}
                  </span>
                  {notice.isNew && (
                    <span className="bg-[#B91C1C] text-white text-sm font-heading font-extrabold px-2 py-0.5 rounded uppercase shadow-xs">
                      New
                    </span>
                  )}
                  <span className="text-sm text-gray-500 font-sans">{notice.date}</span>
                </div>
                <h4 className="font-heading font-bold text-sm sm:text-base text-[#111827] group-hover:text-[#B91C1C] transition-colors leading-snug">
                  {notice.title}
                </h4>
              </div>
            </div>

            {hasDirectFile ? (
              <a
                href={notice.fileUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#111827] border border-[#E5E7EB] text-sm font-heading font-bold hover:bg-[#B91C1C] hover:text-white hover:border-[#B91C1C] focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2 transition-colors shadow-2xs hover:shadow-xs"
                aria-label={"Download document for " + notice.title}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            ) : (
              <Link
                href="/downloads"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#111827] border border-[#E5E7EB] text-sm font-heading font-bold hover:bg-[#B91C1C] hover:text-white hover:border-[#B91C1C] focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2 transition-colors shadow-2xs hover:shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col w-full bg-white">
      <HomeAnnouncement />
      {/* =========================================================================
          SECTION 1: HERO & ADMISSION HOOK (Faithful Edplus Distance Recreation)
      ========================================================================= */}
      <section className="relative w-full bg-[#111827] text-white py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-gray-800">
        {/* Full-Bleed Campus Hero Background Image with High-Contrast Gradient */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <Image
            src="/images/about/campus-showcase.jpg"
            alt="Devasthaly Vidyapeeth Campus Architecture"
            fill
            sizes="100vw"
            priority
            quality={90}
            className="object-cover object-center"
          />
          {/* Directional contrast gradient: deeper on left for text legibility, transparent on right to showcase campus building */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#111827]/95 via-[#111827]/80 to-[#111827]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-[#111827]/50" />
          {/* Brand atmospheric radial accents */}
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#B91C1C]/20 rounded-full blur-3xl" />
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#F4CD13]/15 rounded-full blur-3xl" />
        </div>

        {/* Edplus Floating Decorative Geometric Shapes (bshape1–bshape4) */}
        <div className="absolute top-1/4 left-8 w-16 h-16 rounded-full border-2 border-dashed border-[#B91C1C]/40 opacity-50 pointer-events-none select-none hidden xl:block" aria-hidden="true" />
        <div className="absolute bottom-1/4 left-1/3 w-8 h-8 rotate-45 border-2 border-[#F4CD13]/40 opacity-40 pointer-events-none select-none hidden lg:block" aria-hidden="true" />
        <div className="absolute top-16 right-1/4 w-12 h-12 rounded-2xl border border-white/20 rotate-12 opacity-30 pointer-events-none select-none hidden lg:block" aria-hidden="true" />

        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* LEFT COLUMN: Edplus Banner Typography & Action Suite */}
            <div className="lg:col-span-7 flex flex-col items-start text-left gap-6 lg:gap-8">
              {/* Edplus Eyebrow Pill Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#B91C1C] text-white text-sm font-heading font-bold uppercase tracking-wider w-fit shadow-md border border-red-500/40">
                <Sparkles className="w-4 h-4 text-[#F4CD13]" aria-hidden="true" />
                <span>Admissions Open 2026–27 • LKG to Class XI</span>
              </div>

              {/* Main Display Heading H1 (Edplus 62px-70px bold banner title) */}
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-[62px] lg:leading-[70px] font-bold text-white tracking-tight">
                Nurturing Academic Rigour, Moral Character & Leadership{" "}
                <span className="text-[#F4CD13] underline decoration-[#B91C1C] decoration-4 underline-offset-8">
                  Since 1988
                </span>
              </h1>

              {/* Subtitle Paragraph */}
              <p className="text-base sm:text-lg lg:text-[18px] lg:leading-[28px] text-gray-200 [&>strong]:text-white [&>strong]:font-semibold leading-relaxed font-sans max-w-2xl font-medium">
                Welcome to <strong>Devasthaly Vidyapeeth</strong>, Chilkahar, Ballia. A premier CBSE-affiliated co-educational residential and day-boarding institution where timeless Indian values converge with state-of-the-art modern education.
              </p>

              {/* Statutory Trust Pills in Frosted Glass (Edplus Category/Metadata Bar Style) */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-sm text-gray-300 pt-2 border-t border-gray-800/80 w-full">
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl text-gray-200 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-[#F4CD13]" aria-hidden="true" />
                  <span className="font-heading font-semibold text-white">CBSE Affil. No. 2130238</span>
                </span>
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl text-gray-200 shadow-2xs">
                  <Award className="w-4 h-4 text-[#F4CD13]" aria-hidden="true" />
                  <span className="font-heading font-semibold text-white">36+ Years of Trust</span>
                </span>
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl text-gray-200 shadow-2xs">
                  <Building className="w-4 h-4 text-[#F4CD13]" aria-hidden="true" />
                  <span className="font-heading font-semibold text-white">15-Acre Eco Campus</span>
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Edplus-Style Photographic Showcase with Glowing Frame */}
            <div className="lg:col-span-5 relative w-full max-w-xl mx-auto lg:max-w-none pt-6 lg:pt-0">
              {/* Atmospheric Crimson & Gold Aura Glow */}
              <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-tr from-[#B91C1C]/40 via-[#F4CD13]/20 to-transparent rounded-[3rem] blur-2xl opacity-60 pointer-events-none" aria-hidden="true" />

              {/* Asymmetric Framed Container */}
              <div className="relative rounded-[2.5rem] bg-gradient-to-b from-white/15 to-white/5 p-3 sm:p-4 backdrop-blur-md border border-white/20 shadow-2xl">
                <div className="relative aspect-[4/3] sm:aspect-[16/13] w-full rounded-[2rem] overflow-hidden bg-gray-950 shadow-inner group">
                  <Image
                    src="/images/home/hero/hero-bg.webp"
                    alt="Devasthaly Vidyapeeth classroom learning environment"
                    fill
                    priority
                    quality={95}
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Glassmorphic Stat Badges (Edplus Signature) */}
                  <div className="absolute top-4 right-4 bg-[#111827]/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 shadow-xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#B91C1C] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Award className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-sm font-heading font-bold text-white tracking-tight">36+ Years Legacy</div>
                      <div className="text-sm text-gray-300 font-medium">Estd. 1988 Ballia</div>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 bg-[#111827]/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 shadow-xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldCheck className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-sm font-heading font-bold text-white tracking-tight">100% Pass Rate</div>
                      <div className="text-sm text-gray-300 font-medium">CBSE Merit Track</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 2: INSTITUTIONAL TRUST & KEY STATS (Image on Left, Content on Right)
      ========================================================================= */}
      <section className="w-full bg-[#F3F4F6] border-b border-[#E5E7EB] py-12 sm:py-16">
        <Container>
          {/* Section Introduction */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 text-left">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E7EB] text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
                <span>Institutional Trust & Milestones</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-[30px] sm:leading-[40px] lg:text-[35px] lg:leading-[47px] font-semibold text-[#111827] tracking-tight">
                36 Years of Educational Eminence & Proven Rigour
              </h2>
            </div>
            <p className="text-sm text-gray-500 font-sans max-w-sm">
              Verified benchmarks that make Devasthaly Vidyapeeth Ballia&apos;s premier CBSE co-ed residential campus.
            </p>
          </div>

          {/* 6 Horizontal Cards: Image Left, Content Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {STAT_METRICS.map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={idx}
                  className={`group bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 ${stat.borderHover} shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-row items-center gap-4 relative overflow-hidden`}
                >
                  <div
                    className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${stat.topGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />

                  {/* LEFT SIDE: Image */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-slate-900 shadow-2xs">
                    <Image
                      src={stat.image}
                      alt={stat.label}
                      fill
                      sizes="(max-width: 640px) 96px, 112px"
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-sm font-heading font-bold text-white uppercase tracking-wider border border-white/20">
                      {stat.badge}
                    </span>
                  </div>

                  {/* RIGHT SIDE: Content */}
                  <div className="flex flex-col justify-between text-left flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="font-heading font-black text-2xl sm:text-3xl text-slate-900 group-hover:text-[#B91C1C] tracking-tight transition-colors whitespace-nowrap">
                        {stat.value}
                      </div>
                      <div
                        className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-sm font-heading font-bold text-slate-800 uppercase tracking-wide line-clamp-1">
                      {stat.label}
                    </div>
                    <div className="text-sm text-gray-500 font-sans mt-0.5 line-clamp-1">
                      {stat.subtext}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SECTION 3: PARENT QUICK ACTIONS HUB (Image on Left, Content on Right)
      ========================================================================= */}
      <section className="w-full bg-white border-b border-[#E5E7EB] py-12 sm:py-16">
        <Container>
          {/* Section Introduction */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 text-left">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
                <FileText className="w-3.5 h-3.5 text-[#B91C1C]" />
                <span>Parent & Aspirant Express Desk</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-[30px] sm:leading-[40px] lg:text-[35px] lg:leading-[47px] font-semibold text-[#111827] tracking-tight">
                One-Click Access to Essential School Resources
              </h2>
            </div>
            <p className="text-sm text-gray-500 font-sans max-w-sm">
              Direct portals for admission brochures, fee schedules, transit routes, and official CBSE notifications.
            </p>
          </div>

          {/* 6 Horizontal Cards: Image Left, Content Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {QUICK_ACTIONS.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="group bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200/90 hover:border-[#B91C1C]/40 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-row items-center gap-4 cursor-pointer"
                >
                  {/* LEFT SIDE: Image */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-900 shadow-2xs">
                    <Image
                      src={item.image}
                      alt={item.label}
                      fill
                      sizes="(max-width: 640px) 80px, 96px"
                      className="object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-md text-sm font-heading font-bold text-white uppercase tracking-wider border border-white/20">
                      {item.badge}
                    </span>
                  </div>

                  {/* RIGHT SIDE: Content */}
                  <div className="flex flex-col justify-between text-left flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-[#B91C1C] text-[#B91C1C] group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs border border-red-100/60">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center gap-1 text-sm font-bold text-gray-400 group-hover:text-[#B91C1C] transition-colors">
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    <span className="font-heading font-bold text-sm text-slate-900 group-hover:text-[#B91C1C] transition-colors block leading-snug line-clamp-1">
                      {item.label}
                    </span>
                    <span className="text-sm text-gray-500 font-sans transition-colors block mt-0.5 line-clamp-1">
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
            <span className="text-sm font-heading font-bold uppercase tracking-widest text-[#B91C1C] bg-white border border-[#E5E7EB] px-3.5 py-1.5 rounded-full inline-block shadow-xs">
              Our Foundation
            </span>
            <h2 className="font-heading text-2xl sm:text-[30px] sm:leading-[40px] lg:text-[35px] lg:leading-[47px] font-semibold text-[#111827] mt-3 mb-4 tracking-tight">
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
                color: "text-[#B91C1C]",
                bg: "bg-[#F3F4F6]",
              },
              {
                title: "Disciplined Residential Care",
                desc: "Separate secure hostels for boys and girls with 24/7 warden supervision, in-house evening study sessions, and wholesome pure vegetarian meals.",
                icon: Building,
                color: "text-[#B91C1C]",
                bg: "bg-[#F3F4F6]",
              },
              {
                title: "Spoken English & Tech Labs",
                desc: "Daily language fluency drills, smart interactive digital boards, and coding/robotics laboratories to ensure students thrive globally.",
                icon: Sparkles,
                color: "text-[#B91C1C]",
                bg: "bg-[#F3F4F6]",
              },
              {
                title: "Holistic Moral Sanskaar",
                desc: "Traditional Indian culture, yoga, athletics, NCC/Scouts, and values education fostering empathy, integrity, and patriotic leadership.",
                icon: Heart,
                color: "text-[#B91C1C]",
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
                    <div className="w-13 h-13 rounded-2xl bg-[#F3F4F6] text-[#B91C1C] group-hover:bg-[#B91C1C] group-hover:text-white transition-colors flex items-center justify-center mb-5 border border-[#E5E7EB] shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg lg:text-[22px] lg:leading-[30px] text-[#111827] group-hover:text-[#B91C1C] transition-colors mb-2.5">
                      {pillar.title}
                    </h3>
                    <p className="text-base text-gray-600 leading-relaxed font-sans">
                      {pillar.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-5 border-t border-gray-100 flex items-center text-sm font-bold text-[#B91C1C] group-hover:translate-x-1 transition-transform">
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
              <span className="text-sm font-heading font-bold uppercase tracking-widest text-[#B91C1C] bg-[#F3F4F6] border border-[#E5E7EB] px-3.5 py-1.5 rounded-full inline-block shadow-xs">
                Curriculum Progression
              </span>
              <h2 className="font-heading text-2xl sm:text-[30px] sm:leading-[40px] lg:text-[35px] lg:leading-[47px] font-semibold text-[#111827] mt-3 tracking-tight">
                Comprehensive CBSE Curriculum (LKG to Class 12)
              </h2>
            </div>
            <Link
              href="/academics"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#B91C1C] hover:text-[#991B1B] transition-colors group shrink-0"
            >
              <span>Explore Detailed Academic Wings</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Wing 1: Foundational */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer">
              <div>
                {/* Top Image Container */}
                <div className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-xs">
                  <Image
                    src="/images/home/hero/hero-students.jpg"
                    alt="Foundational Wing LKG to Class II at Devasthaly Vidyapeeth"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Top-Left Category Pill Badge */}
                  <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B91C1C] text-white text-sm font-heading font-bold shadow-sm">
                    <GraduationCap className="w-3.5 h-3.5 text-white" />
                    <span>LKG to Class II</span>
                  </div>
                </div>

                {/* Sub-header / Meta Capsule Pill with Dashed Border */}
                <div className="rounded-full border border-dashed border-[#CBD5E1] px-3 py-1.5 inline-flex items-center gap-2 w-fit bg-slate-50 mb-3 transition-colors duration-300">
                  <div className="w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 text-[#B91C1C]" />
                  </div>
                  <span className="text-sm font-bold text-[#B91C1C]">Stage 1</span>
                  <span className="text-sm text-gray-700 font-medium truncate max-w-[110px] sm:max-w-[130px]">
                    Foundational
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="font-heading font-semibold text-lg lg:text-[22px] lg:leading-[30px] text-[#111827] group-hover:text-[#B91C1C] transition-colors duration-300 leading-snug line-clamp-2 mb-2">
                  Foundational Wing (LKG to Class II)
                </h3>

                {/* Meta Feature Accent Row */}
                <div className="flex items-center gap-2 text-sm text-[#B91C1C] font-semibold mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B91C1C] shrink-0" />
                  <span className="text-gray-600 font-medium truncate">
                    Phonics & Storytelling Circles
                  </span>
                </div>

                {/* Paragraph Description */}
                <p className="text-base text-gray-600 leading-relaxed font-sans line-clamp-3 mb-4">
                  Activity-based, play-way methodology focused on foundational literacy, numeracy, spoken English confidence, and sensory discovery in colorful child-friendly classrooms.
                </p>
              </div>

              {/* Highlights Bullet List */}
              <div className="pt-3 border-t border-gray-100 space-y-2 mt-auto">
                <ul className="space-y-2 text-sm text-gray-600 font-sans">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    <span>Phonics & Story Circles</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    <span>Play & Montessori Aids</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    <span>Caring Attendants & Nurse</span>
                  </li>
                </ul>
                <Link
                  href="/academics"
                  className="mt-4 pt-3 border-t border-gray-100 inline-flex items-center text-sm font-bold text-[#B91C1C] hover:text-[#991B1B] group-hover:translate-x-1 transition-transform"
                >
                  Foundational Pedagogy →
                </Link>
              </div>
            </div>

            {/* Wing 2: Preparatory */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer">
              <div>
                {/* Top Image Container */}
                <div className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-xs">
                  <Image
                    src="/images/facilities/sports-activities.jpg"
                    alt="Preparatory Wing Classes III to V at Devasthaly Vidyapeeth"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Top-Left Category Pill Badge */}
                  <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B91C1C] text-white text-sm font-heading font-bold shadow-sm">
                    <BookOpen className="w-3.5 h-3.5 text-white" />
                    <span>Classes III to V</span>
                  </div>
                </div>

                {/* Sub-header / Meta Capsule Pill with Dashed Border */}
                <div className="rounded-full border border-dashed border-[#CBD5E1] px-3 py-1.5 inline-flex items-center gap-2 w-fit bg-slate-50 mb-3 transition-colors duration-300">
                  <div className="w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5 text-[#B91C1C]" />
                  </div>
                  <span className="text-sm font-bold text-[#B91C1C]">Stage 2</span>
                  <span className="text-sm text-gray-700 font-medium truncate max-w-[110px] sm:max-w-[130px]">
                    Preparatory Wing
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="font-heading font-semibold text-lg lg:text-[22px] lg:leading-[30px] text-[#111827] group-hover:text-[#B91C1C] transition-colors duration-300 leading-snug line-clamp-2 mb-2">
                  Preparatory Wing (Classes III to V)
                </h3>

                {/* Meta Feature Accent Row */}
                <div className="flex items-center gap-2 text-sm text-[#B91C1C] font-semibold mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B91C1C] shrink-0" />
                  <span className="text-gray-600 font-medium truncate">
                    Conceptual Discovery & Math Puzzles
                  </span>
                </div>

                {/* Paragraph Description */}
                <p className="text-base text-gray-600 leading-relaxed font-sans line-clamp-3 mb-4">
                  Transition from play to conceptual discovery. Focus on interactive reading, mathematical puzzles, environmental science, and creative arts.
                </p>
              </div>

              {/* Highlights Bullet List */}
              <div className="pt-3 border-t border-gray-100 space-y-2 mt-auto">
                <ul className="space-y-2 text-sm text-gray-600 font-sans">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    <span>Math Puzzles & Logic Games</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    <span>English & Hindi Story Clubs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    <span>Arts, Crafts & Physical Play</span>
                  </li>
                </ul>
                <Link
                  href="/academics"
                  className="mt-4 pt-3 border-t border-gray-100 inline-flex items-center text-sm font-bold text-[#B91C1C] hover:text-[#991B1B] group-hover:translate-x-1 transition-transform"
                >
                  Preparatory Pedagogy →
                </Link>
              </div>
            </div>

            {/* Wing 3: Middle Wing */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer">
              <div>
                {/* Top Image Container */}
                <div className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-xs">
                  <Image
                    src="/images/facilities/science-lab.jpg"
                    alt="Middle Wing Classes VI to VIII at Devasthaly Vidyapeeth"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Top-Left Category Pill Badge */}
                  <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B91C1C] text-white text-sm font-heading font-bold shadow-sm">
                    <FlaskConical className="w-3.5 h-3.5 text-white" />
                    <span>Classes VI to VIII</span>
                  </div>
                </div>

                {/* Sub-header / Meta Capsule Pill with Dashed Border */}
                <div className="rounded-full border border-dashed border-[#CBD5E1] px-3 py-1.5 inline-flex items-center gap-2 w-fit bg-slate-50 mb-3 transition-colors duration-300">
                  <div className="w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                    <FlaskConical className="w-3.5 h-3.5 text-[#B91C1C]" />
                  </div>
                  <span className="text-sm font-bold text-[#B91C1C]">Stage 3</span>
                  <span className="text-sm text-gray-700 font-medium truncate max-w-[110px] sm:max-w-[130px]">
                    Middle Wing
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="font-heading font-semibold text-lg lg:text-[22px] lg:leading-[30px] text-[#111827] group-hover:text-[#B91C1C] transition-colors duration-300 leading-snug line-clamp-2 mb-2">
                  Middle Wing (Classes VI to VIII)
                </h3>

                {/* Meta Feature Accent Row */}
                <div className="flex items-center gap-2 text-sm text-[#B91C1C] font-semibold mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B91C1C] shrink-0" />
                  <span className="text-gray-600 font-medium truncate">
                    Hands-on Science & Lab Inquiries
                  </span>
                </div>

                {/* Paragraph Description */}
                <p className="text-base text-gray-600 leading-relaxed font-sans line-clamp-3 mb-4">
                  Experiential learning introducing scientific inquiry, analytical mathematics, computer programming, three languages, and collaborative projects.
                </p>
              </div>

              {/* Highlights Bullet List */}
              <div className="pt-3 border-t border-gray-100 space-y-2 mt-auto">
                <ul className="space-y-2 text-sm text-gray-600 font-sans">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    <span>Science & Math Lab Sessions</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    <span>Python & AI Foundations</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    <span>Inter-house Quizzes & Debates</span>
                  </li>
                </ul>
                <Link
                  href="/academics"
                  className="mt-4 pt-3 border-t border-gray-100 inline-flex items-center text-sm font-bold text-[#B91C1C] hover:text-[#991B1B] group-hover:translate-x-1 transition-transform"
                >
                  Middle School Subjects →
                </Link>
              </div>
            </div>

            {/* Wing 4: Senior Secondary */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer">
              <div>
                {/* Top Image Container */}
                <div className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-xs">
                  <Image
                    src="/images/leadership/principal-mentor.jpg"
                    alt="Secondary and Senior Secondary Wing Classes IX to XII at Devasthaly Vidyapeeth"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Top-Left Category Pill Badge */}
                  <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B91C1C] text-white text-sm font-heading font-bold shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Classes IX to XII</span>
                  </div>
                  {/* Top-Right High Demand Badge */}
                  <div className="absolute top-3 right-3 z-10 bg-amber-500 text-white font-heading font-bold text-sm px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    High Demand
                  </div>
                </div>

                {/* Sub-header / Meta Capsule Pill with Dashed Border */}
                <div className="rounded-full border border-dashed border-[#CBD5E1] px-3 py-1.5 inline-flex items-center gap-2 w-fit bg-slate-50 mb-3 transition-colors duration-300">
                  <div className="w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                    <Award className="w-3.5 h-3.5 text-[#B91C1C]" />
                  </div>
                  <span className="text-sm font-bold text-[#B91C1C]">Stage 4</span>
                  <span className="text-sm text-gray-700 font-medium truncate max-w-[110px] sm:max-w-[130px]">
                    Secondary & Sr. Sec
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="font-heading font-semibold text-lg lg:text-[22px] lg:leading-[30px] text-[#111827] group-hover:text-[#B91C1C] transition-colors duration-300 leading-snug line-clamp-2 mb-2">
                  Secondary & Senior Secondary
                </h3>

                {/* Meta Feature Accent Row */}
                <div className="flex items-center gap-2 text-sm text-[#B91C1C] font-semibold mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B91C1C] shrink-0" />
                  <span className="text-gray-600 font-medium truncate">
                    NEET, JEE & CUET Foundation
                  </span>
                </div>

                {/* Paragraph Description */}
                <p className="text-base text-gray-600 leading-relaxed font-sans line-clamp-3 mb-4">
                  Rigorous preparation for CBSE Board examinations coupled with foundation guidance for NEET, JEE, and CUET across all three distinct streams.
                </p>
              </div>

              {/* Highlights Bullet List */}
              <div className="pt-3 border-t border-gray-100 space-y-2 mt-auto">
                <ul className="space-y-2 text-sm text-gray-600 font-sans">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    <span><strong>Science Stream:</strong> PCM / PCB with Biotech & CS</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    <span><strong>Commerce Stream:</strong> Accounts, B.St, Economics</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    <span><strong>Humanities Stream:</strong> History, Pol. Sci, Geo</span>
                  </li>
                </ul>
                <Link
                  href="/admissions"
                  className="mt-4 pt-3 border-t border-gray-100 inline-flex items-center text-sm font-bold text-[#B91C1C] hover:text-[#991B1B] group-hover:translate-x-1 transition-transform"
                >
                  Class XI Admission →
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
            <span className="text-sm font-heading font-bold uppercase tracking-widest text-[#B91C1C] bg-white border border-[#E5E7EB] px-3.5 py-1.5 rounded-full inline-block shadow-xs">
              Infrastructure & Facilities
            </span>
            <h2 className="font-heading text-2xl sm:text-[30px] sm:leading-[40px] lg:text-[35px] lg:leading-[47px] font-semibold text-[#111827] mt-3 mb-4 tracking-tight">
              World-Class Infrastructure on a Serene 15-Acre Campus
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-sans">
              From modern science laboratories and smart digital learning suites to separate residential hostels and an expansive athletics arena.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FACILITIES_DATA.slice(0, 8).map((fac) => {
              const IconComponent = FACILITY_ICONS[fac.iconName] || BookOpen;
              const facilityImage = FACILITY_IMAGES[fac.id] || "/images/facilities/campus-grounds.jpg";

              return (
                <div
                  key={fac.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  {/* Top Image Container with Inset White Padding */}
                  <div>
                    <div className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-xs">
                      <Image
                        src={facilityImage}
                        alt={fac.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Top-Left Category Pill Badge with Icon */}
                      <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B91C1C] text-white text-sm font-heading font-bold shadow-sm">
                        <GraduationCap className="w-3.5 h-3.5 text-white" />
                        <span>{fac.category}</span>
                      </div>
                    </div>

                    {/* Sub-header / Meta Capsule Pill with Dashed Border */}
                    <div className="rounded-full border border-dashed border-[#CBD5E1] px-3 py-1.5 inline-flex items-center gap-2 w-fit bg-slate-50 mb-3 transition-colors duration-300">
                      <div className="w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                        <IconComponent className="w-3.5 h-3.5 text-[#B91C1C]" />
                      </div>
                      <span className="text-sm font-bold text-[#B91C1C]">{fac.category}</span>
                      <span className="text-sm text-gray-700 font-medium truncate max-w-[110px] sm:max-w-[130px]">
                        {fac.highlights[0]}
                      </span>
                    </div>

                    {/* Card Title */}
                    <h3 className="font-heading font-bold text-base text-[#111827] group-hover:text-[#B91C1C] transition-colors duration-300 leading-snug line-clamp-2 mb-2">
                      {fac.title}
                    </h3>

                    {/* Meta Feature Accent Row */}
                    <div className="flex items-center gap-2 text-sm text-[#B91C1C] font-semibold mb-3">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B91C1C] shrink-0" />
                      <span className="text-gray-600 font-medium truncate">
                        {fac.highlights[1] || fac.highlights[0]}
                      </span>
                    </div>

                    {/* Paragraph Description */}
                    <p className="text-base text-gray-600 leading-relaxed font-sans line-clamp-3 mb-4">
                      {fac.description}
                    </p>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="pt-3 border-t border-gray-100 space-y-1.5 mt-auto">
                    {fac.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600 font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C] shrink-0" />
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
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-heading font-bold uppercase tracking-wider transition-colors shadow-sm border border-[#991B1B] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2"
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
                <span className="text-sm font-heading font-bold uppercase tracking-widest text-[#B91C1C]">
                  Official School Desk
                </span>
                <h2 className="font-heading text-2xl sm:text-[30px] sm:leading-[40px] lg:text-[35px] lg:leading-[47px] font-semibold text-[#111827] mt-1 tracking-tight">
                  Latest Notices & Circulars
                </h2>
              </div>
              <Link
                href="/notices"
                className="text-sm font-heading font-bold text-[#B91C1C] hover:text-[#991B1B] flex items-center gap-1 group"
              >
                <span>View Archive</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <Suspense fallback={<HomeNoticesFallback />}>
              <HomeNoticesSection />
            </Suspense>
          </div>

          {/* Right Column: CBSE Compliance & Quick Downloads */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#111827] text-white p-7 rounded-3xl shadow-md border-t-4 border-[#B91C1C]">
              <div className="flex items-center gap-2 text-white text-sm font-heading font-bold uppercase tracking-wider mb-2.5">
                <ShieldCheck className="w-4 h-4 text-[#B91C1C]" />
                <span>Statutory Compliance</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-white mb-2.5">
                CBSE Mandatory Public Disclosure
              </h3>
              <p className="text-base text-gray-300 mb-5 leading-relaxed font-sans">
                In strict adherence to CBSE Circular CBSE/AFF/2021, all general school information, society registration, fire safety certificate, building safety certificate, and fee structure documents are available for public verification.
              </p>
              <Link
                href="/downloads"
                className="w-full py-3.5 px-6 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-heading font-bold text-sm uppercase tracking-wider rounded-full transition-colors text-center block shadow-sm border border-[#991B1B] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2"
              >
                Access Mandatory Disclosures →
              </Link>
            </div>

            <div className="bg-white p-7 rounded-2xl shadow-md">
              <h4 className="font-heading font-bold text-base text-[#111827] mb-3.5 pb-2 border-b border-gray-100">
                Key Document Downloads
              </h4>
              <ul className="space-y-2 text-sm font-sans">
                {[
                  { name: "School Prospectus (Session 2026–27)", size: "5.6 MB", file: "/documents/original/prospectus-2.pdf" },
                  { name: "Annual Holidays & Calendar", size: "541 KB", file: "/documents/original/holydays-calender-2025-26.pdf" },
                  { name: "New Admission Fee Chart 2026–27", size: "722 KB", file: "/documents/original/new-admission-chart-2026-27.pdf" },
                  { name: "Mandatory Public Disclosure (Appendix IX)", size: "970 KB", file: "/documents/original/general-information-1.pdf" },
                ].map((doc, i) => (
                  <li key={i}>
                    <a
                      href={doc.file}
                      download
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F3F4F6] text-gray-700 hover:text-[#B91C1C] transition-colors"
                    >
                      <span className="font-heading font-bold text-sm text-[#111827]">{doc.name}</span>
                      <span className="text-sm text-gray-400 font-medium">PDF • {doc.size}</span>
                    </a>
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
      <Suspense fallback={null}>
        <HomeToppersShowcase />
      </Suspense>

      {/* =========================================================================
          SECTION 9: DEDICATED PARENT & COMMUNITY TESTIMONIALS (Edplus Reference)
      ========================================================================= */}
      <TestimonialSection />

      {/* =========================================================================
          SECTION 10: FREQUENTLY ASKED QUESTIONS (FAQ)
      ========================================================================= */}
      <section className="w-full bg-white py-16 sm:py-24 border-b border-[#E5E7EB]">
        <Container>
          <div className="max-w-3xl mb-12 text-left">
            <span className="text-sm font-heading font-bold uppercase tracking-widest text-[#B91C1C] bg-[#F3F4F6] border border-[#E5E7EB] px-3.5 py-1.5 rounded-full inline-block shadow-xs">
              Parent Queries
            </span>
            <h2 className="font-heading text-2xl sm:text-[30px] sm:leading-[40px] lg:text-[35px] lg:leading-[47px] font-semibold text-[#111827] mt-3 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-600 mt-2 font-sans">
              Everything parents want to know regarding admissions, transport, hostel life, and CBSE curriculum.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {FAQ_DATA.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#B91C1C] open:border-[#B91C1C] p-5 sm:p-6 transition-all"
              >
                <summary className="font-heading font-bold text-sm sm:text-base text-[#111827] cursor-pointer list-none flex items-center justify-between gap-4 group-hover:text-[#B91C1C] transition-colors">
                  <span>{faq.question}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform text-sm">
                    ▾
                  </span>
                </summary>
                <p className="text-base text-gray-600 mt-3 pt-3 border-t border-gray-100 leading-relaxed font-sans">
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
            <span className="text-sm font-heading font-bold uppercase tracking-widest text-[#B91C1C] bg-white border border-[#E5E7EB] px-3.5 py-1.5 rounded-full inline-block shadow-xs">
              Plan Your Visit
            </span>
            <h2 className="font-heading text-2xl sm:text-[30px] sm:leading-[40px] lg:text-[35px] lg:leading-[47px] font-semibold text-[#111827] mt-3 tracking-tight">
              Visit Our Campus in Chilkahar, Ballia
            </h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed font-sans">
              Parents are welcome to visit our lush campus for an in-person tour of our smart classrooms, science labs, hostels, and sports grounds.
            </p>
          </div>

          {/* Contact Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-sm text-gray-600 font-sans">
            <div className="flex items-start gap-3.5 bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#B91C1C] shrink-0 border border-[#E5E7EB]">
                <MapPin className="w-5 h-5 text-[#B91C1C]" />
              </div>
              <div>
                <strong className="text-[#111827] font-heading font-bold block text-sm mb-0.5">Campus Address:</strong>
                <p className="text-gray-700 leading-relaxed">
                  Devasthaly Vidyapeeth, Chilkahar, Tehsil Rasra, District Ballia, Uttar Pradesh — 277123
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  Landmark: Near Chilkahar Railway Crossing / Ballia-Rasra State Highway
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#B91C1C] shrink-0 border border-[#E5E7EB]">
                <Phone className="w-5 h-5 text-[#B91C1C]" />
              </div>
              <div>
                <strong className="text-[#111827] font-heading font-bold block mb-0.5">Admissions Desk:</strong>{" "}
                <a
                  href={`tel:${SCHOOL_INFO.contacts.admissionsPhone.replace(/\s+/g, "")}`}
                  className="text-[#B91C1C] font-bold hover:underline"
                >
                  {SCHOOL_INFO.contacts.admissionsPhone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#B91C1C] shrink-0 border border-[#E5E7EB]">
                <Clock className="w-5 h-5 text-[#B91C1C]" />
              </div>
              <div>
                <strong className="text-[#111827] font-heading font-bold block mb-0.5">Visiting Hours:</strong> {SCHOOL_INFO.contacts.workingHours}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admissions"
              className="px-7 py-3.5 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-bold uppercase tracking-wider transition-all shadow-xs hover:shadow-md border border-[#991B1B] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2"
            >
              Schedule a Guided Campus Tour
            </Link>
            <Link
              href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-full bg-[#25D366] text-white text-sm font-bold hover:bg-[#1ebd5b] transition-all inline-flex items-center gap-2 shadow-xs hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#25D366] focus-visible:outline-offset-2"
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

