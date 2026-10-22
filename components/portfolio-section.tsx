"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Code2,
  Layers,
  Palette,
  Terminal,
  Quote,
  Star,
  CheckCircle,
} from "lucide-react";

export type PortfolioCategory = "all" | "saas" | "fintech" | "ecommerce" | "design-system";

export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  category: PortfolioCategory;
  categoryLabel: string;
  client: string;
  year: string;
  metricHighlight: string;
  metricLabel: string;
  summary: string;
  techStack: string[];
  deliverables: string[];
  gradient: string;
  previewColor: string;
  demoUrl: string;
  caseStudyUrl: string;
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "hyperflow-ai",
    title: "HyperFlow AI — Enterprise Workflow Orchestration",
    subtitle: "AI Agents & Autonomous Pipeline Canvas",
    category: "saas",
    categoryLabel: "SaaS & AI",
    client: "HyperFlow Technologies, SF",
    year: "2026",
    metricHighlight: "$2.4M Seed",
    metricLabel: "Raised Post-Launch • 40k+ Active Workflows",
    summary:
      "Engineered an enterprise canvas application that enables engineering teams to visually assemble, test, and deploy multi-model AI agent workflows with real-time streaming execution.",
    techStack: ["Next.js 15", "TypeScript", "Tailwind v4", "FastAPI", "Supabase", "Stripe"],
    deliverables: ["Visual Canvas Engine", "Streaming Token UI", "Design System", "Billing Architecture"],
    gradient: "from-blue-600/20 via-indigo-600/20 to-purple-600/20",
    previewColor: "bg-blue-950/40 border-blue-500/30",
    demoUrl: "https://example.com/demo/hyperflow",
    caseStudyUrl: "#contact",
    testimonial: {
      quote:
        "DevCraft built our entire product in 4 weeks flat. The code quality blew our seed investors away. Unmatched velocity and visual polish.",
      author: "Julian Vance",
      role: "Founder & CEO, HyperFlow AI",
    },
  },
  {
    id: "novapay-global",
    title: "NovaPay — Cross-Border Treasury & FX Portal",
    subtitle: "Institutional Banking & WebSocket Telemetry",
    category: "fintech",
    categoryLabel: "Fintech",
    client: "Nova Financial Corp, London",
    year: "2025",
    metricHighlight: "$18M+",
    metricLabel: "Monthly Settlement Volume • 0.18s TTFB",
    summary:
      "Designed and developed a low-latency multi-currency treasury portal with sub-second order-book charting, automated KYC identity verification, and multi-tenant RBAC permissions.",
    techStack: ["React 19", "Next.js App Router", "Tailwind v4", "WebSockets", "Prisma", "PostgreSQL"],
    deliverables: ["High-Frequency Telemetry", "KYC Flow", "Multi-Tenant Roles", "SOC2 Compliance"],
    gradient: "from-emerald-600/20 via-teal-600/20 to-blue-600/20",
    previewColor: "bg-emerald-950/40 border-emerald-500/30",
    demoUrl: "https://example.com/demo/novapay",
    caseStudyUrl: "#contact",
    testimonial: {
      quote:
        "Sub-second load times and zero UI glitching across 50,000 live trades. The standard of engineering is tier-1 Silicon Valley grade.",
      author: "Elena Rostova",
      role: "VP of Product, NovaPay",
    },
  },
  {
    id: "aura-atelier",
    title: "Aura Atelier — Luxury Headless Commerce",
    subtitle: "Digital Flagship with 3D Configurator",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    client: "Aura Paris & Milan",
    year: "2025",
    metricHighlight: "+44% Lift",
    metricLabel: "Checkout Conversion Rate • 99 Lighthouse",
    summary:
      "A high-fashion headless storefront built with Next.js App Router and Shopify Storefront GraphQL, featuring an interactive 3D product customizer and ultra-smooth editorial page transitions.",
    techStack: ["Next.js 15", "Shopify Storefront", "Tailwind v4", "Three.js", "Framer Motion"],
    deliverables: ["3D WebGL Configurator", "Micro-Interactions", "Custom Cart Drawer", "Global CDN"],
    gradient: "from-purple-600/20 via-pink-600/20 to-amber-600/20",
    previewColor: "bg-purple-950/40 border-purple-500/30",
    demoUrl: "https://example.com/demo/aura",
    caseStudyUrl: "#contact",
    testimonial: {
      quote:
        "Our digital flagship feels like walking into our flagship store in Milan. Our bounce rate dropped by 38% the first weekend.",
      author: "Mathieu Laurent",
      role: "Creative Director, Aura Paris",
    },
  },
  {
    id: "syntax-system",
    title: "Syntax — Enterprise Multi-Brand Design System",
    subtitle: "Unified Design Tokens for 120+ Engineers",
    category: "design-system",
    categoryLabel: "Design System",
    client: "Syntax Cloud Ecosystem",
    year: "2025",
    metricHighlight: "65% Faster",
    metricLabel: "Time-to-Ship Across 6 Product Teams",
    summary:
      "Architected a scalable multi-brand component library and automated Figma-to-code token sync engine supporting 42 accessible UI primitives and full WCAG 2.2 AAA color pairings.",
    techStack: ["Figma Tokens", "Tailwind v4", "TypeScript", "Radix UI", "Storybook", "NPM Package"],
    deliverables: ["Token Pipeline", "42 Accessible Primitives", "Documentation Site", "NPM Monorepo"],
    gradient: "from-amber-600/20 via-orange-600/20 to-red-600/20",
    previewColor: "bg-amber-950/40 border-amber-500/30",
    demoUrl: "https://example.com/demo/syntax",
    caseStudyUrl: "#contact",
    testimonial: {
      quote:
        "Syntax eliminated months of redundant UI re-builds. It is the single highest-ROI infrastructure decision our engineering org made this year.",
      author: "David Chen",
      role: "Principal Architect, Syntax Group",
    },
  },
];

export function PortfolioSection() {
  const [activeFilter, setActiveFilter] = React.useState<PortfolioCategory>("all");

  const filteredStudies =
    activeFilter === "all"
      ? CASE_STUDIES
      : CASE_STUDIES.filter((item) => item.category === activeFilter);

  return (
    <section id="portfolio" className="relative py-20 lg:py-28 overflow-hidden bg-slate-50/70 dark:bg-[#0B1020]/70">
      {/* Background ambient accents */}
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/40 mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Proven Track Record</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Selected Client Work &amp;{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Case Studies
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Real products built for real businesses. From Silicon Valley AI startups to London fintechs, discover how our technical architecture drives measurable conversion and enterprise scale.
          </p>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2 p-1.5 rounded-full bg-slate-200/70 dark:bg-[#0E1526] border border-slate-300/60 dark:border-white/10 shadow-inner">
            {[
              { id: "all", label: "All Projects" },
              { id: "saas", label: "SaaS & AI" },
              { id: "fintech", label: "Fintech & Treasury" },
              { id: "ecommerce", label: "Luxury E-Commerce" },
              { id: "design-system", label: "Design Systems" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as PortfolioCategory)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${
                  activeFilter === tab.id
                    ? "bg-blue-600 text-white shadow-sm dark:bg-blue-600 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Case Studies Grid (2-Column Large Impact Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {filteredStudies.map((study) => (
            <Card
              key={study.id}
              hoverEffect
              className="flex flex-col rounded-[20px] overflow-hidden border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0E1526] transition-all duration-300 shadow-md hover:shadow-xl"
            >
              {/* Card Visual Hero Banner */}
              <div
                className={`relative h-64 sm:h-72 p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-br ${study.gradient}`}
              >
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-3 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 text-slate-800 dark:bg-slate-900/90 dark:text-slate-200 backdrop-blur-md shadow-xs">
                    <span>{study.categoryLabel}</span>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/60 text-white backdrop-blur-xs">
                    {study.client} • {study.year}
                  </span>
                </div>

                {/* Center Stylized Mockup Canvas */}
                <div className="relative z-10 my-auto p-4 rounded-xl border border-white/20 bg-white/40 dark:bg-slate-950/60 backdrop-blur-md shadow-lg">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                      https://app.{study.id}.io
                    </span>
                    <span className="w-2.5 h-2.5" />
                  </div>

                  {/* Impact Metric Banner Inside Canvas */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                        Primary Impact
                      </p>
                      <p className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                        {study.metricHighlight}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {study.metricLabel}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Deliverables pill strip */}
                <div className="relative z-10 flex flex-wrap gap-1.5">
                  {study.deliverables.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/70 text-slate-800 dark:bg-slate-900/70 dark:text-slate-300 backdrop-blur-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 flex flex-col flex-1">
                <h3 className="font-heading font-bold text-2xl text-slate-900 dark:text-white leading-snug">
                  {study.title}
                </h3>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 mb-3">
                  {study.subtitle}
                </p>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {study.summary}
                </p>

                {/* Tech Stack Chips */}
                <div className="mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Technology Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {study.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300 border border-slate-200/60 dark:border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Client Quote Strip */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 mb-6">
                  <div className="flex items-start gap-2.5">
                    <Quote className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs italic text-slate-600 dark:text-slate-300 leading-relaxed">
                        &ldquo;{study.testimonial.quote}&rdquo;
                      </p>
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white mt-2">
                        {study.testimonial.author} •{" "}
                        <span className="font-normal text-slate-500 dark:text-slate-400">
                          {study.testimonial.role}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
                  <Button
                    variant="glow"
                    size="default"
                    className="rounded-full font-heading font-semibold text-xs sm:text-sm"
                    asChild
                  >
                    <Link href={study.caseStudyUrl} className="flex items-center gap-1.5">
                      <span>Request Case Study &amp; Architecture Spec</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>

                  <a
                    href={study.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2"
                  >
                    <span>Live Preview</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Global Impact Metrics Banner */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-[24px] bg-white dark:bg-[#0E1526] border border-slate-200/90 dark:border-white/10 shadow-sm">
          {[
            { metric: "$32M+", label: "Client Funding & Revenue", sub: "Generated by shipped platforms" },
            { metric: "99.2%", label: "Average Lighthouse Score", sub: "Strict Core Web Vitals pass" },
            { metric: "14 Days", label: "Average MVP Turnaround", sub: "Idea to production launch" },
            { metric: "100%", label: "Client Satisfaction", sub: "5-star rating on code audits" },
          ].map((stat, i) => (
            <div key={i} className="text-center lg:text-left">
              <p className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stat.metric}
                </span>
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {stat.label}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
