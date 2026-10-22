"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Star,
  Quote,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Download,
  Users,
  Code2,
  ExternalLink,
} from "lucide-react";

export type TestimonialFilter = "all" | "products" | "services";

export interface TestimonialItem {
  id: string;
  category: "products" | "services";
  author: string;
  role: string;
  company: string;
  avatarBg: string;
  avatarInitials: string;
  rating: number;
  date: string;
  verifiedLabel: string;
  attributedItem: string;
  title: string;
  content: string;
  highlightMetric?: string;
}

const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: "1",
    category: "services",
    author: "Julian Vance",
    role: "Founder & CEO",
    company: "HyperFlow AI (YC W25)",
    avatarBg: "bg-blue-600",
    avatarInitials: "JV",
    rating: 5,
    date: "February 2026",
    verifiedLabel: "Verified Custom Sprint Client",
    attributedItem: "Service: MVP Rapid Launch Sprint",
    title: "Shipped our entire AI MVP in 14 days flat — raised $2.4M seed",
    content:
      "DevCraft was the secret weapon for our launch. They took our messy product wireframes and turned them into a stunning, production-ready Next.js 15 application with real-time streaming AI execution. Our seed investors specifically praised the UI polish and sub-second load times.",
    highlightMetric: "$2.4M Seed Raised",
  },
  {
    id: "2",
    category: "products",
    author: "Sarah Lindqvist",
    role: "Indie Founder",
    company: "GrowthPulse",
    avatarBg: "bg-indigo-600",
    avatarInitials: "SL",
    rating: 5,
    date: "January 2026",
    verifiedLabel: "Verified License Purchase",
    attributedItem: "Product: SaaSify Pro Starter",
    title: "Made my first $1,200 in 72 hours of buying the starter kit",
    content:
      "Most boilerplate codebases are bloated nightmares with outdated dependencies. SaaSify Pro was pure joy to work with. The Supabase auth, Stripe billing checkout, and Tailwind v4 design tokens worked straight out of the box. Saved me at least 80 hours of setup.",
    highlightMetric: "72h to First Revenue",
  },
  {
    id: "3",
    category: "services",
    author: "Elena Rostova",
    role: "VP of Product",
    company: "Nova Financial Corp",
    avatarBg: "bg-emerald-600",
    avatarInitials: "ER",
    rating: 5,
    date: "December 2025",
    verifiedLabel: "Verified Enterprise Client",
    attributedItem: "Service: Bespoke Web App & Design System",
    title: "Zero UI glitching across 50,000 live trades and 0.18s TTFB",
    content:
      "In high-frequency fintech, latency and visual hierarchy are existential. DevCraft engineered an institutional treasury portal that handles real-time WebSocket telemetry with zero lag and strict SOC2-ready practices. Truly world-class frontend craftsmanship.",
    highlightMetric: "0.18s TTFB Across 50k Trades",
  },
  {
    id: "4",
    category: "services",
    author: "Marcus Sterling",
    role: "Head of Product Design",
    company: "Cognito Cloud",
    avatarBg: "bg-purple-600",
    avatarInitials: "MS",
    rating: 5,
    date: "November 2025",
    verifiedLabel: "Verified Retainer Partner",
    attributedItem: "Service: Fractional Design & Engineering",
    title: "The velocity of a 4-person design & dev team in one retainer",
    content:
      "Having DevCraft on retainer gave us immediate senior horsepower without the 3-month hiring loop. Every task submitted to our private Slack was delivered in under 48 hours with pixel-perfect Figma auto-layout and 100% strict TypeScript types.",
    highlightMetric: "48h Avg Turnaround",
  },
  {
    id: "5",
    category: "products",
    author: "David Chen",
    role: "Principal Frontend Architect",
    company: "Syntax Cloud",
    avatarBg: "bg-amber-600",
    avatarInitials: "DC",
    rating: 5,
    date: "January 2026",
    verifiedLabel: "Verified License Purchase",
    attributedItem: "Product: Apex Modern Admin Dashboard",
    title: "Saved our engineering org 200+ hours of UI re-architecture",
    content:
      "We needed an accessible, multi-tenant dashboard infrastructure for our cloud console. Apex is easily the cleanest, most modular React dashboard on the market. The chart primitives and WCAG 2.2 AA compliant contrast palettes are top tier.",
    highlightMetric: "200+ Engineering Hours Saved",
  },
  {
    id: "6",
    category: "services",
    author: "Mathieu Laurent",
    role: "Creative Director",
    company: "Aura Paris & Milan",
    avatarBg: "bg-rose-600",
    avatarInitials: "ML",
    rating: 5,
    date: "October 2025",
    verifiedLabel: "Verified Custom Sprint Client",
    attributedItem: "Service: Luxury Headless Commerce",
    title: "+44% checkout conversion lift in the very first month",
    content:
      "DevCraft built a headless luxury flagship that feels like walking into our Milan boutique. The 3D product configurator, frictionless cart drawer, and 99 Lighthouse performance rating delivered an immediate 44% lift in our checkout conversion rate.",
    highlightMetric: "+44% Conversion Lift",
  },
];

export function TestimonialsSection() {
  const [activeFilter, setActiveFilter] = React.useState<TestimonialFilter>("all");

  const filteredTestimonials =
    activeFilter === "all"
      ? TESTIMONIALS_DATA
      : TESTIMONIALS_DATA.filter((item) => item.category === activeFilter);

  return (
    <section id="testimonials" className="relative py-20 lg:py-28 overflow-hidden bg-white dark:bg-[#080D1A]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -right-32 w-80 h-80 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-32 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/40 mb-4 shadow-xs">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Social Proof &amp; Reviews</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Trusted by Ambitious Founders,{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              Engineers &amp; Designers
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Whether purchasing our production-ready digital starters or partnering for bespoke engineering sprints, see why teams consistently rate our craft 4.96/5.0.
          </p>

          {/* Filter Pills */}
          <div className="mt-8 inline-flex p-1.5 rounded-full bg-slate-100 dark:bg-[#0E1526] border border-slate-200/80 dark:border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${
                activeFilter === "all"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-blue-600 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All Reviews ({TESTIMONIALS_DATA.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("products")}
              className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${
                activeFilter === "products"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-blue-600 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Digital Templates (2)
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("services")}
              className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${
                activeFilter === "services"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-blue-600 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Custom Sprints (4)
            </button>
          </div>
        </div>

        {/* Testimonials Grid (3-Column Layout with equal height cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredTestimonials.map((t) => (
            <Card
              key={t.id}
              hoverEffect
              className="flex flex-col justify-between p-7 rounded-[20px] border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0E1526] shadow-sm hover:shadow-lg transition-all duration-300 relative"
            >
              <div>
                {/* Header Strip: Rating & Verification */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{t.verifiedLabel}</span>
                  </span>
                </div>

                {/* Attributed Item & Impact Pill */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-md">
                    {t.attributedItem}
                  </span>

                  {t.highlightMetric && (
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full">
                      {t.highlightMetric}
                    </span>
                  )}
                </div>

                {/* Review Title */}
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white leading-snug mb-3">
                  &ldquo;{t.title}&rdquo;
                </h3>

                {/* Review Body */}
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {t.content}
                </p>
              </div>

              {/* Author Attribution Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3 mt-auto">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${t.avatarBg} text-white flex items-center justify-center font-heading font-bold text-sm shadow-xs shrink-0`}
                  >
                    {t.avatarInitials}
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white leading-none">
                      {t.author}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t.role} • <span className="font-medium text-slate-700 dark:text-slate-300">{t.company}</span>
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-medium">
                  {t.date}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Aggregate Social Proof & Platform Metrics Banner */}
        <div className="mt-16 p-8 sm:p-10 rounded-[24px] bg-gradient-to-r from-slate-900 via-[#0E1526] to-slate-900 text-white border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {/* Metric 1 */}
            <div className="text-center sm:text-left sm:pr-6">
              <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
                4.96 / 5.0
              </p>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                Average Rating Across 340+ Reviews
              </p>
            </div>

            {/* Metric 2 */}
            <div className="text-center sm:text-left pt-6 sm:pt-0 sm:px-6">
              <p className="font-heading font-extrabold text-3xl sm:text-4xl text-blue-400">
                2,800+
              </p>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                Digital Starters &amp; UI Kits Downloaded
              </p>
            </div>

            {/* Metric 3 */}
            <div className="text-center sm:text-left pt-6 sm:pt-0 sm:px-6">
              <p className="font-heading font-extrabold text-3xl sm:text-4xl text-emerald-400">
                100%
              </p>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                On-Time Delivery Rate for Sprints
              </p>
            </div>

            {/* Metric 4 */}
            <div className="text-center sm:text-left pt-6 sm:pt-0 sm:pl-6">
              <p className="font-heading font-extrabold text-3xl sm:text-4xl text-indigo-400">
                $0 Debt
              </p>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                Zero-Tech-Debt Guarantee on Handoff
              </p>
            </div>
          </div>

          {/* Action strip */}
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-slate-300 text-center sm:text-left">
              Ready to experience senior engineering and iconic design for your digital product?
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="glow"
                size="default"
                className="rounded-full font-heading font-semibold text-xs sm:text-sm"
                asChild
              >
                <Link href="#contact" className="flex items-center gap-2">
                  <span>Start Your Project</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="default"
                className="rounded-full font-heading font-medium text-xs sm:text-sm text-white border-white/20 bg-white/5 hover:bg-white/10"
                asChild
              >
                <Link href="#products">
                  <span>Browse Starters</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
