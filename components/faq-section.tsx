"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  Search,
  MessageCircle,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  FileText,
} from "lucide-react";

export type FaqCategory = "all" | "templates" | "sprints" | "retainers" | "ip-billing";

export interface FaqItem {
  id: string;
  category: "templates" | "sprints" | "retainers" | "ip-billing";
  categoryLabel: string;
  question: string;
  answer: string;
  highlights?: string[];
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "templates-included",
    category: "templates",
    categoryLabel: "Templates & Starters",
    question: "What is included with a digital template or UI kit purchase?",
    answer:
      "Every template purchase includes the complete, uncompiled production source code, lifetime access to private GitHub repository updates, extensive markdown documentation, Figma token files (when applicable), and a perpetual commercial license. There are no recurring fees or licensing royalties.",
    highlights: [
      "Full Next.js 15 / TypeScript source code",
      "Lifetime updates and bug patches",
      "Comprehensive setup & environment guides",
      "Commercial license for unlimited personal & client projects",
    ],
  },
  {
    id: "commercial-license",
    category: "templates",
    categoryLabel: "Templates & Starters",
    question: "Can I use purchased templates for client work or commercial SaaS products?",
    answer:
      "Yes! Our standard commercial license permits you to use our templates and UI kits to build unlimited commercial SaaS applications, client websites, and internal business tools. The only restriction is that you cannot re-sell, redistribute, or open-source the raw template boilerplate as a standalone competing starter kit.",
    highlights: [
      "Build unlimited revenue-generating SaaS apps",
      "Deploy unlimited client client websites",
      "Keep 100% of all software revenue and client fees",
    ],
  },
  {
    id: "mvp-sprint-process",
    category: "sprints",
    categoryLabel: "Custom Sprints",
    question: "How does the 14-day MVP Rapid Launch Sprint work from start to finish?",
    answer:
      "Our 14-day sprint operates on a structured, milestone-driven timeline. Days 1–3 focus on system architecture, user flow mapping, and database schema locking. Days 4–7 deliver high-fidelity interactive Figma prototypes and design tokens. Days 8–12 are dedicated to full-stack Next.js 15 engineering, auth, and Stripe integration. Days 13–14 are reserved for accessibility audits, Lighthouse 98+ tuning, custom domain deployment, and Loom video handover.",
    highlights: [
      "Fixed timeline and fixed-price scope",
      "Daily asynchronous progress updates via Loom and Slack",
      "Automated CI/CD staging environments for live testing",
    ],
  },
  {
    id: "ip-code-ownership",
    category: "ip-billing",
    categoryLabel: "IP & Contracts",
    question: "Who owns the intellectual property (IP) and code for bespoke engineering work?",
    answer:
      "You do — 100%. Upon completion of milestones and final invoice settlement, all intellectual property, copyright, Figma design files, database schemas, and Git repositories are formally transferred to your company. We retain zero claims, royalties, or proprietary hooks. You are free to audit, modify, and host your software anywhere.",
    highlights: [
      "Complete IP assignment upon project completion",
      "Zero vendor lock-in or licensing royalties",
      "Direct GitHub repository transfer to your organization",
    ],
  },
  {
    id: "tech-stack-flexibility",
    category: "sprints",
    categoryLabel: "Custom Sprints",
    question: "What tech stack do you engineer with, and can you adapt to our backend?",
    answer:
      "Our core engineering stack is Next.js 15 (App Router with Turbopack), TypeScript (100% strict mode), and Tailwind CSS v4. On the data layer, we primarily use Supabase, PostgreSQL, Prisma, and Redis. However, we regularly integrate with external client architectures, including Python/FastAPI, Node/NestJS, Go, AWS Lambda, GraphQL, and legacy REST backends.",
    highlights: [
      "Modern React 19 / Next.js 15 App Router",
      "Tailwind CSS v4 with unified design tokens",
      "Seamless integration with third-party REST, GraphQL & WebSockets",
    ],
  },
  {
    id: "fractional-retainer-model",
    category: "retainers",
    categoryLabel: "Retainers",
    question: "How does the Fractional Design & Engineering Retainer operate?",
    answer:
      "Our retainer provides you with a dedicated senior design-engineer without the multi-month hiring cycle or full-time payroll overhead. We work through your prioritized backlog one active deliverable at a time, with an average turnaround of 48 hours for new features or UI components. Communication happens directly in your private Slack/Discord channel. You can pause or cancel anytime at the end of each 30-day billing period.",
    highlights: [
      "Average 48-hour delivery on UI tasks and features",
      "Direct private Slack/Discord communication",
      "Flexible: pause or cancel your subscription anytime",
    ],
  },
  {
    id: "post-launch-warranty",
    category: "sprints",
    categoryLabel: "Custom Sprints",
    question: "What is your post-launch support and bug warranty policy?",
    answer:
      "Every bespoke web application we build includes 30 to 60 days of complimentary post-launch bug warranty and performance telemetry. If an issue arises from code written during the sprint, we remediate it immediately at zero extra cost. We also provide optional ongoing SLA maintenance retainers for continuous security patching and feature growth.",
    highlights: [
      "30–60 days complimentary post-launch bug warranty",
      "Live error tracking and performance monitoring",
      "Loom walkthrough video library for internal training",
    ],
  },
  {
    id: "nda-confidentiality",
    category: "ip-billing",
    categoryLabel: "IP & Contracts",
    question: "Do you sign Non-Disclosure Agreements (NDAs) before reviewing project briefs?",
    answer:
      "Absolutely. We routinely sign bilateral or client-provided NDAs prior to reviewing proprietary business logic, technical architecture specs, or confidential pitch decks. Your IP, product concepts, and business secrets are treated with the highest degree of professional confidentiality.",
    highlights: [
      "Bilateral NDA execution within 24 hours",
      "Secure handling of proprietary product specs",
      "SOC2-ready secure local development environment",
    ],
  },
  {
    id: "billing-payment-terms",
    category: "ip-billing",
    categoryLabel: "IP & Contracts",
    question: "What payment methods and milestone structures do you accept?",
    answer:
      "For digital templates, payments are processed securely via Stripe (Credit Card, Apple Pay, Google Pay). For custom engineering sprints, we accept international wire transfers (USD, EUR, GBP) and Stripe invoicing. Typical sprint billing is structured as 50% upon project kickoff and 50% upon final production deployment and handover approval.",
    highlights: [
      "Secure Stripe checkout with instant digital fulfillment",
      "International wire transfer support (ACH / SEPA / SWIFT)",
      "Transparent milestone-based invoicing",
    ],
  },
];

export function FaqSection() {
  const [activeCategory, setActiveCategory] = React.useState<FaqCategory>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({
    "templates-included": true,
    "mvp-sprint-process": true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="faq" className="relative py-20 lg:py-28 overflow-hidden bg-slate-50/70 dark:bg-[#0B1020]/70">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 -left-36 w-80 h-80 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-36 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/40 mb-4 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Got Questions? We Have Answers</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Everything you need to know regarding template licensing, custom sprint timelines, IP code ownership, and retainer terms.
          </p>

          {/* Interactive Search Bar */}
          <div className="mt-8 w-full max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions by keyword (e.g. license, IP, Next.js, refund)..."
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-full bg-white dark:bg-[#0E1526] border border-slate-200/90 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-xs transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 p-1.5 rounded-full bg-slate-200/70 dark:bg-[#0E1526] border border-slate-300/60 dark:border-white/10 shadow-inner">
            {[
              { id: "all", label: "All Questions" },
              { id: "templates", label: "Templates & Licensing" },
              { id: "sprints", label: "Custom Sprints" },
              { id: "retainers", label: "Retainer Model" },
              { id: "ip-billing", label: "IP & Billing" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as FaqCategory)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${
                  activeCategory === tab.id
                    ? "bg-blue-600 text-white shadow-sm dark:bg-blue-600 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion Questions List */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 p-8 rounded-[20px] bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-white/10">
              <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <p className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">
                No matching questions found
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching with different terms or reach out directly to our architecture team.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = !!openItems[faq.id];
              return (
                <div
                  key={faq.id}
                  className="rounded-[20px] border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0E1526] overflow-hidden transition-all duration-200 shadow-xs hover:border-blue-500/40 dark:hover:border-indigo-400/40"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(faq.id)}
                    className="w-full text-left p-6 sm:p-7 flex items-center justify-between gap-4 focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 shrink-0 hidden sm:inline-block">
                        {faq.categoryLabel}
                      </span>
                      <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                        {faq.question}
                      </h3>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen
                          ? "bg-blue-600 text-white rotate-180"
                          : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-1 border-t border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                      <p className="mb-4">{faq.answer}</p>

                      {faq.highlights && (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                            Key Highlights
                          </p>
                          <ul className="space-y-1.5">
                            {faq.highlights.map((h, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions Consultation Dock */}
        <div className="mt-14 p-8 rounded-[24px] bg-white dark:bg-[#0E1526] border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/40">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                Have a unique question or custom inquiry?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Speak directly with our lead architect. We respond within 4 hours.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="glow"
              size="default"
              className="rounded-full font-heading font-semibold text-xs sm:text-sm"
              asChild
            >
              <Link href="#contact" className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Book 20-Min Call</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="default"
              className="rounded-full font-heading font-medium text-xs sm:text-sm"
              asChild
            >
              <Link href="/contact">
                <span>Send Brief</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
