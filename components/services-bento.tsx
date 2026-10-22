"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Layers,
  Clock,
  ArrowRight,
  Calendar,
  Code2,
  Palette,
  Gauge,
  Terminal,
  Users,
  CheckCircle2,
  Flame,
  Check,
  ChevronRight,
  Building,
  Rocket,
  RefreshCw,
} from "lucide-react";

export interface ServiceTier {
  id: string;
  name: string;
  subtitle: string;
  badge?: string;
  isPopular?: boolean;
  price: string;
  period?: string;
  turnaround: string;
  idealFor: string;
  description: string;
  deliverables: string[];
  ctaLabel: string;
  ctaVariant: "primary" | "glow" | "outline";
  href: string;
}

const SERVICE_TIERS: ServiceTier[] = [
  {
    id: "mvp-sprint",
    name: "MVP Rapid Sprint",
    subtitle: "Idea to Live Production in 14 Days",
    turnaround: "2 Weeks Turnaround",
    idealFor: "Early-stage founders validating new concepts",
    price: "$3,499",
    description:
      "A fast-paced, zero-fluff development sprint to transform your product concept into a market-ready, revenue-generating SaaS web application.",
    deliverables: [
      "Custom Next.js 15 App Router architecture",
      "Tailwind CSS v4 design system with dark/light mode",
      "Authentication (Supabase or Clerk with OAuth)",
      "Stripe payment integration with recurring subscriptions",
      "Database schema & CRUD operations (PostgreSQL / Prisma)",
      "Lighthouse 98+ performance optimization",
      "Vercel automated CI/CD deployment",
      "Full GitHub repo ownership & Loom handover video",
    ],
    ctaLabel: "Book Sprint Slot",
    ctaVariant: "outline",
    href: "#contact",
  },
  {
    id: "bespoke-app",
    name: "Bespoke Web App & Design System",
    subtitle: "Full-Stack Craft for High-Growth Startups",
    badge: "Most In-Demand",
    isPopular: true,
    turnaround: "4–6 Weeks Sprint",
    idealFor: "Funded tech startups & high-converting brands",
    price: "$7,899",
    description:
      "End-to-end design and engineering partnership. We craft an iconic visual identity, responsive Figma token system, and a bulletproof full-stack React application.",
    deliverables: [
      "Everything in MVP Sprint, plus:",
      "Complete Figma design system (Tokens, Auto-layout, WCAG AA)",
      "High-fidelity interactive prototype & user journey testing",
      "Complex state management & custom REST/GraphQL endpoints",
      "Interactive micro-animations (Framer Motion / CSS dynamic)",
      "Multi-tenant or team collaboration dashboard capabilities",
      "Enterprise security audit, SEO meta tags & OpenGraph assets",
      "60-day dedicated post-launch support & bug warranty",
    ],
    ctaLabel: "Start Custom Project",
    ctaVariant: "glow",
    href: "#contact",
  },
  {
    id: "fractional-partner",
    name: "Fractional Design & Engineering",
    subtitle: "Senior Velocity On-Demand Retainer",
    turnaround: "Continuous Delivery (48h avg. task turnaround)",
    idealFor: "Agile teams needing senior design/dev firepower",
    price: "$4,950",
    period: "/ month",
    description:
      "Your dedicated lead frontend architect and UI/UX designer on subscription. Fast execution, direct communication, zero full-time management overhead.",
    deliverables: [
      "One active development or design request at a time",
      "Average 48-hour delivery on UI components and features",
      "Direct Slack/Discord private channel with lead architect",
      "Weekly synchronous sprint planning & architecture consulting",
      "Figma design iterations, web app builds & ongoing refactoring",
      "No contracts — pause or cancel subscription anytime",
      "Strict code reviews & automated testing pipelines",
      "Unlimited revisions until 100% satisfied",
    ],
    ctaLabel: "Join Retainer (1 Slot Left)",
    ctaVariant: "primary",
    href: "#contact",
  },
];

const BENTO_FEATURES = [
  {
    icon: Gauge,
    iconColor: "text-blue-500 dark:text-blue-400",
    iconBg: "bg-blue-500/10 dark:bg-blue-400/10",
    title: "Lighthouse 98+ Guaranteed",
    description:
      "Every web app is tuned for sub-second TTFB, optimal Core Web Vitals, and effortless zero-latency page transitions.",
    metric: "0.2s Avg TTFB",
  },
  {
    icon: Palette,
    iconColor: "text-indigo-500 dark:text-indigo-400",
    iconBg: "bg-indigo-500/10 dark:bg-indigo-400/10",
    title: "100% Design-to-Code Parity",
    description:
      "Direct Figma-to-Tailwind tokens. We eradicate design handoff friction with exact spacing, typography, and contrast tokens.",
    metric: "Zero UI Drift",
  },
  {
    icon: ShieldCheck,
    iconColor: "text-emerald-500 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    title: "Strict Production Standards",
    description:
      "TypeScript strict mode, WCAG 2.2 AA accessibility, sanitized API routes, and SOC2-ready database architecture.",
    metric: "100% Strict TS",
  },
  {
    icon: Users,
    iconColor: "text-amber-500 dark:text-amber-400",
    iconBg: "bg-amber-500/10 dark:bg-amber-400/10",
    title: "Direct Senior Engineering",
    description:
      "No account managers, no junior delegators. You collaborate directly with a senior frontend architect and visual designer.",
    metric: "Direct Access",
  },
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Blueprint & Architecture",
    timeline: "Days 1–3",
    description:
      "We unpack your business goals, map user journeys, lock database schemas, and establish token systems.",
  },
  {
    number: "02",
    title: "Interactive Prototype",
    timeline: "Days 4–7",
    description:
      "We design pixel-perfect Figma screens with auto-layout, interactive prototypes, and validated micro-interactions.",
  },
  {
    number: "03",
    title: "Production Engineering",
    timeline: "Days 8–12",
    description:
      "We engineer the application in Next.js 15, connect APIs, configure authentication, and wire Stripe billing.",
  },
  {
    number: "04",
    title: "Audit & Zero-Downtime Launch",
    timeline: "Days 13–14",
    description:
      "We run automated test suites, accessibility checks, optimize performance, and deploy live to your custom domain.",
  },
];

export function ServicesBento() {
  const [activeTab, setActiveTab] = React.useState<"packages" | "process" | "standards">("packages");

  return (
    <section id="services" className="relative py-20 lg:py-28 overflow-hidden bg-white dark:bg-[#080D1A]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/40 mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Bespoke Engineering & Design</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Custom Development Services Built for{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              Speed & Scale
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Need more than a starter template? We partner with ambitious founders to engineer custom web applications, SaaS dashboards, and design systems with obsessive craftsmanship.
          </p>

          {/* Interactive view toggle tabs */}
          <div className="mt-8 inline-flex p-1.5 rounded-full bg-slate-100 dark:bg-[#0E1526] border border-slate-200/80 dark:border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab("packages")}
              className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${
                activeTab === "packages"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-blue-600 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Pricing & Packages
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("process")}
              className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${
                activeTab === "process"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-blue-600 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Our 4-Step Process
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("standards")}
              className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${
                activeTab === "standards"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-blue-600 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Engineering Standards
            </button>
          </div>
        </div>

        {/* TAB 1: Pricing Packages (3-Tier High-Ticket Bento) */}
        {activeTab === "packages" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {SERVICE_TIERS.map((tier) => (
              <Card
                key={tier.id}
                hoverEffect
                className={`flex flex-col relative rounded-[20px] transition-all duration-300 p-8 ${
                  tier.isPopular
                    ? "border-2 border-blue-600 dark:border-indigo-500 shadow-xl shadow-blue-500/10 dark:shadow-indigo-500/15 lg:-translate-y-2"
                    : "border border-slate-200/90 dark:border-white/10"
                }`}
              >
                {/* Popular Pill */}
                {tier.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                    <span>{tier.badge}</span>
                  </div>
                )}

                {/* Card Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300">
                      {tier.turnaround}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">
                    {tier.name}
                  </h3>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">
                    {tier.subtitle}
                  </p>
                </div>

                {/* Price block */}
                <div className="mb-6 pb-6 border-b border-slate-100 dark:border-white/10">
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-white">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {tier.period}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ideal for: {tier.idealFor}</span>
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  {tier.description}
                </p>

                {/* Deliverables List */}
                <div className="mb-8 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                    What&apos;s Included
                  </p>
                  <ul className="space-y-3">
                    {tier.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <div className="mt-0.5 rounded-full p-0.5 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Action */}
                <div className="mt-auto pt-4">
                  <Button
                    variant={tier.ctaVariant}
                    size="lg"
                    className="w-full rounded-full font-heading font-semibold"
                    asChild
                  >
                    <Link href={tier.href} className="flex items-center justify-center gap-2">
                      <span>{tier.ctaLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 2: Process Roadmap */}
        {activeTab === "process" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step, index) => (
              <Card
                key={index}
                hoverEffect
                className="p-6 rounded-[20px] flex flex-col justify-between border border-slate-200/90 dark:border-white/10 relative overflow-hidden"
              >
                <div className="absolute -top-4 -right-4 font-heading font-extrabold text-7xl text-slate-100 dark:text-white/5 select-none pointer-events-none">
                  {step.number}
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 mb-4">
                    <Calendar className="w-3 h-3" />
                    <span>{step.timeline}</span>
                  </div>

                  <h4 className="font-heading font-bold text-xl text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h4>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <span>Phase {step.number} Handover</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* TAB 3: Engineering Standards & Bento Highlights */}
        {activeTab === "standards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENTO_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  hoverEffect
                  className="p-6 rounded-[20px] border border-slate-200/90 dark:border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.iconBg}`}>
                        <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                        {feature.metric}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h4>

                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Audited on every deploy</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Bottom Discovery / Booking Bridge */}
        <div className="mt-16 rounded-[24px] bg-gradient-to-r from-slate-900 via-[#0E1526] to-slate-900 text-white p-8 lg:p-12 relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Q4 Availability: 2 Sprint Slots Open</span>
              </div>
              <h3 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-white">
                Have a Complex Vision or Require an NDA?
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
                Schedule a 20-minute architecture discovery call. We review your tech requirements, estimate sprint milestones, and provide a binding fixed-price proposal within 24 hours.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <Button
                variant="glow"
                size="lg"
                className="w-full sm:w-auto rounded-full font-heading font-semibold text-base shadow-lg shadow-blue-500/30"
                asChild
              >
                <Link href="#contact" className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Book Free Discovery Call</span>
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full font-heading font-medium text-white border-white/20 bg-white/5 hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/contact" className="flex items-center justify-center gap-2">
                  <span>Send Project Brief</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
