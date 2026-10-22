import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Star,
  CheckCircle2,
  Code2,
  Palette,
  Zap,
  ShieldCheck,
  ExternalLink,
  Laptop,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 lg:pt-20 lg:pb-32">
      {/* Ambient background glow orbs: subtle blue and purple SaaS glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[360px] bg-blue-600/15 dark:bg-blue-500/20 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[280px] bg-purple-600/12 dark:bg-purple-500/15 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            {/* Animated Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 dark:border-blue-500/30 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold backdrop-blur-xs shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              <span>New: Next.js 15 + Tailwind v4 Starter Kits</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </div>

            {/* Display H1 */}
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Crafting High-Converting Websites &amp;{" "}
              <span className="gradient-text">Premium Digital Templates</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
              Production-grade Next.js starters, sleek dashboard UI kits, and custom full-stack design services engineered to help startups, creators, and agencies launch 10× faster with uncompromised quality.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2 w-full sm:w-auto">
              <Link href="#templates" className="w-full sm:w-auto">
                <Button variant="glow" size="lg" className="w-full sm:w-auto gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Templates</span>
                </Button>
              </Link>

              <Link href="#contact" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  <Laptop className="w-4 h-4" />
                  <span>Custom Design Services</span>
                </Button>
              </Link>
            </div>

            {/* Social Proof & Trust Strip */}
            <div className="pt-6 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">4.9/5</span>
                <span>(350+ reviews)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">14,000+</span>
                <span>Downloads</span>
              </div>

              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span>Commercial License Included</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Product Showcase Mockup */}
          <div className="lg:col-span-5 w-full">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative back card tilt */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/20 rounded-[24px] blur-xl -z-10" />

              <Card className="glow-card border-slate-200/90 dark:border-white/10 overflow-hidden shadow-2xl bg-white/95 dark:bg-[#0E1526]/90 backdrop-blur-md">
                {/* Mock Browser Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#0B1120]/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="px-3 py-1 rounded-md bg-white dark:bg-[#131C31] text-[11px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-white/5">
                    devcraft-studio.com/preview
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                    LIVE
                  </span>
                </div>

                {/* Card Hero Preview Canvas */}
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Featured Best Seller
                      </span>
                      <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                        SaaSify Pro — Next.js 15 Template
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs line-through text-slate-400">$89</span>
                      <div className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                        $49
                      </div>
                    </div>
                  </div>

                  {/* Feature Checklist inside mockup */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131C31]/70 border border-slate-200/60 dark:border-white/5 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-blue-500" />
                      <span>Next.js 15 App Router</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131C31]/70 border border-slate-200/60 dark:border-white/5 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Tailwind CSS v4</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131C31]/70 border border-slate-200/60 dark:border-white/5 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-purple-500" />
                      <span>Figma Design Kit</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131C31]/70 border border-slate-200/60 dark:border-white/5 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Dark / Light Mode</span>
                    </div>
                  </div>

                  {/* Mock Action */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Instant Download • Free Lifetime Updates
                    </span>
                    <Button variant="primary" size="sm" className="gap-1 text-xs">
                      <span>View Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
