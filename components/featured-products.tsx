"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ShoppingBag,
  ExternalLink,
  Star,
  Sparkles,
  Code2,
  Layout,
  Palette,
  Layers,
  Zap,
  ArrowRight,
  Filter,
  Check,
} from "lucide-react";

export type ProductCategory = "all" | "nextjs" | "admin" | "figma" | "graphics";

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  categoryLabel: string;
  badge?: string;
  badgeColor?: "amber" | "blue" | "purple" | "emerald";
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  downloadsCount: string;
  techStack: string[];
  features: string[];
  previewUrl: string;
  purchaseUrl: string;
  highlightStat: string;
}

const PRODUCTS_DATA: ProductItem[] = [
  {
    id: "saasify-pro",
    title: "SaaSify Pro — Next.js 15 AI Startup Starter",
    description:
      "Production-grade full-stack boilerplate with Supabase auth, Stripe billing subscriptions, AI streaming, and dark/light mode.",
    category: "nextjs",
    categoryLabel: "Next.js & React",
    badge: "Featured Best-Seller",
    badgeColor: "amber",
    price: 49,
    originalPrice: 89,
    rating: 4.9,
    reviewsCount: 184,
    downloadsCount: "2.8k+",
    techStack: ["Next.js 15", "Tailwind v4", "TypeScript", "Supabase", "Stripe"],
    features: [
      "App Router & Server Actions",
      "Stripe Customer Portal & Webhooks",
      "AI Chat & Streaming Route Handler",
      "Role-Based Access Control (RBAC)",
    ],
    previewUrl: "#preview-saasify",
    purchaseUrl: "#buy-saasify",
    highlightStat: "Save 120+ Dev Hours",
  },
  {
    id: "apex-admin",
    title: "Apex Admin — Real-Time Analytics & CRM Suite",
    description:
      "Data-dense analytics portal with 60+ pre-built widgets, chart engines, interactive tables, and CSV export capabilities.",
    category: "admin",
    categoryLabel: "Admin Dashboards",
    badge: "Most Popular",
    badgeColor: "blue",
    price: 59,
    originalPrice: 99,
    rating: 4.9,
    reviewsCount: 142,
    downloadsCount: "3.4k+",
    techStack: ["React 19", "Next.js 15", "Recharts", "Tailwind v4", "Zod"],
    features: [
      "60+ Modular Analytics Widgets",
      "Faceted Data Tables & Filtering",
      "Automated Dark & Light Mode",
      "Full Keyboard Accessibility",
    ],
    previewUrl: "#preview-apex",
    purchaseUrl: "#buy-apex",
    highlightStat: "60+ Prebuilt Views",
  },
  {
    id: "nexus-figma",
    title: "Nexus UI — Universal Figma Design System",
    description:
      "Comprehensive design kit with 400+ auto-layout components, color variables, typography scales, and WCAG AA tokens.",
    category: "figma",
    categoryLabel: "Figma UI Kits",
    badge: "Design System",
    badgeColor: "purple",
    price: 45,
    originalPrice: 79,
    rating: 5.0,
    reviewsCount: 98,
    downloadsCount: "1.9k+",
    techStack: ["Figma", "Auto-Layout 5.0", "Variables", "WCAG 2.2 AA"],
    features: [
      "400+ Components & Variants",
      "32 Desktop & Mobile Screen Layouts",
      "Pre-configured Tokens for Tailwind",
      "Free Quarterly Token Updates",
    ],
    previewUrl: "#preview-nexus",
    purchaseUrl: "#buy-nexus",
    highlightStat: "400+ Components",
  },
  {
    id: "nova-portfolio",
    title: "Nova — Interactive Creative Portfolio Starter",
    description:
      "Minimal editorial showcase template engineered for digital designers, art directors, and frontend engineers.",
    category: "nextjs",
    categoryLabel: "Next.js & React",
    badge: "Staff Pick",
    badgeColor: "emerald",
    price: 39,
    originalPrice: 69,
    rating: 4.8,
    reviewsCount: 87,
    downloadsCount: "1.6k+",
    techStack: ["Next.js 15", "Framer Motion", "Tailwind v4", "MDX"],
    features: [
      "8-Phase Case Study Narrative Engine",
      "Silk-Smooth Page Transitions",
      "MDX-Powered Engineering Blog",
      "Instant 100/100 Lighthouse Score",
    ],
    previewUrl: "#preview-nova",
    purchaseUrl: "#buy-nova",
    highlightStat: "100/100 Lighthouse",
  },
  {
    id: "veloce-storefront",
    title: "Veloce — Headless E-Commerce Storefront",
    description:
      "Blazing-fast modern e-commerce storefront with slide-over cart, instant search indexing, and Shopify/Medusa backend hooks.",
    category: "nextjs",
    categoryLabel: "Next.js & React",
    badge: "High Conversion",
    badgeColor: "blue",
    price: 69,
    originalPrice: 119,
    rating: 4.9,
    reviewsCount: 116,
    downloadsCount: "2.1k+",
    techStack: ["Next.js 15", "Shopify API", "Tailwind v4", "Zustand"],
    features: [
      "Optimistic Slide-Over Cart Drawer",
      "Instant Microsecond Search",
      "Product Variant Image Selector",
      "Complete Checkout Webhook Flow",
    ],
    previewUrl: "#preview-veloce",
    purchaseUrl: "#buy-veloce",
    highlightStat: "+42% Conversion Rate",
  },
  {
    id: "kinetic-brand",
    title: "Kinetic — Brand Identity & Social Vector Kit",
    description:
      "Cohesive brand design asset kit containing vector logos, social post templates, pitch deck slide masters, and mockups.",
    category: "graphics",
    categoryLabel: "Graphic Design",
    badge: "Brand Assets",
    badgeColor: "purple",
    price: 35,
    originalPrice: 59,
    rating: 4.8,
    reviewsCount: 64,
    downloadsCount: "1.2k+",
    techStack: ["Figma", "Illustrator", "Vector SVGs", "1080p Assets"],
    features: [
      "120+ Social Media & Ad Templates",
      "Pitch Deck 16:9 Presentation System",
      "SVG Vector Icon & Badge Library",
      "Commercial Royalty-Free Rights",
    ],
    previewUrl: "#preview-kinetic",
    purchaseUrl: "#buy-kinetic",
    highlightStat: "120+ Asset Files",
  },
];

const CATEGORIES: { id: ProductCategory; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All Products", icon: Filter },
  { id: "nextjs", label: "Next.js Starters", icon: Code2 },
  { id: "admin", label: "Admin Dashboards", icon: Layout },
  { id: "figma", label: "Figma UI Kits", icon: Palette },
  { id: "graphics", label: "Graphic Assets", icon: Layers },
];

export function FeaturedProducts() {
  const [selectedCategory, setSelectedCategory] = React.useState<ProductCategory>("all");

  const filteredProducts = React.useMemo(() => {
    if (selectedCategory === "all") return PRODUCTS_DATA;
    return PRODUCTS_DATA.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <section id="templates" className="relative py-20 md:py-28 lg:py-32 bg-slate-50/60 dark:bg-[#080D1A] border-t border-slate-200/80 dark:border-white/10 overflow-hidden">
      {/* Ambient background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-500/10 dark:bg-blue-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 dark:border-blue-500/25 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Curated Digital Marketplace</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight">
            Production-Grade Starters &amp;{" "}
            <span className="gradient-text">Design Systems</span>
          </h2>

          <p className="font-sans text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Every product is tested against rigorous performance, accessibility, and code-quality benchmarks. Includes full commercial licenses and lifetime updates.
          </p>

          {/* Interactive Category Filter Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105"
                      : "bg-white dark:bg-[#0E1526] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/60 dark:hover:bg-[#131C31]"
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-blue-700/60 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {cat.id === "all"
                      ? PRODUCTS_DATA.length
                      : PRODUCTS_DATA.filter((p) => p.category === cat.id).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid: Equal Height Flex Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            return (
              <Card
                key={product.id}
                className="group flex flex-col h-full rounded-[20px] border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0E1526] overflow-hidden shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl dark:hover:shadow-[0_16px_36px_-12px_rgba(99,102,241,0.25)]"
              >
                {/* 16:10 Aspect Ratio Preview Canvas */}
                <div className="relative aspect-[16/10] w-full bg-slate-100 dark:bg-[#090D1A] border-b border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col justify-between p-4">
                  {/* Mock Browser Header */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                    </div>

                    {/* Badge */}
                    {product.badge && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          product.badgeColor === "amber"
                            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60"
                            : product.badgeColor === "purple"
                            ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60"
                            : product.badgeColor === "emerald"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60"
                            : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60"
                        }`}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Center Graphic Artwork Mockup */}
                  <div className="my-auto py-2 text-center space-y-1">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-[#131C31] shadow-md border border-slate-200/80 dark:border-white/10 group-hover:scale-110 transition-transform duration-300">
                      {product.category === "nextjs" && <Code2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                      {product.category === "admin" && <Layout className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                      {product.category === "figma" && <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                      {product.category === "graphics" && <Layers className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
                    </div>
                    <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      {product.highlightStat}
                    </div>
                  </div>

                  {/* Bottom Strip inside Canvas */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {product.rating} ({product.reviewsCount})
                    </span>
                    <span className="font-medium">{product.downloadsCount} downloads</span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-6 flex flex-col flex-1 space-y-4">
                  {/* Category overline */}
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {product.categoryLabel}
                  </div>

                  {/* Product Title */}
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {product.title}
                  </h3>

                  {/* Description */}
                  <p className="font-sans text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {product.description}
                  </p>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {product.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Feature Checklist */}
                  <div className="pt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {product.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Auto-Margin Action Footer pinned to bottom */}
                  <div className="mt-auto pt-5 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-3">
                    {/* Price Block */}
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                          ${product.price}
                        </span>
                        <span className="text-xs line-through text-slate-400 dark:text-slate-500">
                          ${product.originalPrice}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Lifetime license
                      </span>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Link href={product.previewUrl}>
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          <span>Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>

                      <Link href={product.purchaseUrl}>
                        <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Buy</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom Banner: Custom Client Engineering Bridge */}
        <div className="mt-16 p-6 sm:p-8 rounded-[20px] border border-blue-200/80 dark:border-blue-500/20 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white dark:from-[#0E1526] dark:via-[#131C31] dark:to-[#0E1526] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Need Custom Adaptations or a Bespoke MVP?</span>
            </h4>
            <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              We customize any template for your brand or architect full-stack applications from scratch in 2–3 weeks.
            </p>
          </div>

          <Link href="#contact" className="shrink-0 w-full sm:w-auto">
            <Button variant="glow" size="default" className="w-full sm:w-auto gap-2">
              <span>Schedule Intro Sprint</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
