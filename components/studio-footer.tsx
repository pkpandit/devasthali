"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Calendar,
  MessageCircle,
  ExternalLink,
  Code2,
  Palette,
  Layers,
  Heart,
  Send,
} from "lucide-react";

export function StudioFooter() {
  const [newsletterEmail, setNewsletterEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setNewsletterEmail("");
    }
  };

  return (
    <footer className="relative bg-slate-900 dark:bg-[#060A14] text-white border-t border-slate-800 dark:border-white/10 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Pre-Footer Newsletter Strip */}
      <div className="border-b border-slate-800/80 dark:border-white/5 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join 4,800+ Engineers &amp; Founders</span>
            </div>
            <h3 className="font-heading font-bold text-2xl sm:text-3xl text-white">
              Get Notified of New Digital Starters &amp; Design Releases
            </h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed font-normal">
              Zero spam. We only send new Next.js 15 templates, free Figma component drops, and full-stack engineering teardowns once a month.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your work email..."
                className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-full bg-slate-800/90 dark:bg-white/5 border border-slate-700 dark:border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-heading font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {subscribed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Subscribed!</span>
                </>
              ) : (
                <>
                  <span>Join Newsletter</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Main Multi-Column Sitemap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-16 border-b border-slate-800 dark:border-white/10">
          {/* Column 1: Brand Authority (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-3 group focus:outline-none">
              <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#0E1526] p-1 border border-slate-700 dark:border-white/15 flex items-center justify-center shadow-md shadow-blue-500/10 group-hover:scale-105 transition-all overflow-hidden shrink-0">
                <Image
                  src="/images/devasthalyballia.webp"
                  alt="DevCraft Studio Logo"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl text-white tracking-tight flex items-center gap-1.5">
                  DevCraft <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium border border-blue-400/30">Studio</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Digital Starters &amp; Bespoke Engineering
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              We design and engineer iconic digital products, production-ready Next.js 15 starters, and high-converting web applications for founders who refuse to compromise on craft.
            </p>

            {/* Live Availability Status */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 dark:bg-white/5 border border-slate-700/80 dark:border-white/5 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium">2 Sprint Slots Open for Q4</span>
              </div>
              <Link
                href="#contact"
                className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4"
              >
                Inquire →
              </Link>
            </div>

            {/* Direct Contact Utilities */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <a
                href="mailto:hello@devcraft.studio"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>hello@devcraft.studio</span>
              </a>
              <span>•</span>
              <a
                href="https://wa.me/919935105260"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Desk</span>
              </a>
            </div>
          </div>

          {/* Column 2: Digital Templates (3 Cols) */}
          <div className="lg:col-span-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-4 border-b border-slate-800 dark:border-white/10 pb-2">
              Digital Templates
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              {[
                { name: "SaaSify Pro — Next.js 15 AI Starter", href: "#products" },
                { name: "Apex — Modern Admin Dashboard", href: "#products" },
                { name: "Velocity — Design System (Figma)", href: "#products" },
                { name: "Nexus — Crypto & DeFi Platform", href: "#products" },
                { name: "Horizon — Creative Portfolio Theme", href: "#products" },
                { name: "Prism — Brand & Social Media Kit", href: "#products" },
                { name: "Commercial Licensing Terms", href: "#faq" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="hover:text-blue-400 hover:translate-x-1 transition-all inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Bespoke Services (3 Cols) */}
          <div className="lg:col-span-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-4 border-b border-slate-800 dark:border-white/10 pb-2">
              Bespoke Engineering
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              {[
                { name: "MVP Rapid Sprint (14 Days)", href: "#services" },
                { name: "Bespoke Web App & System", href: "#services" },
                { name: "Fractional Design Retainer", href: "#services" },
                { name: "Client Case Studies & Proof", href: "#portfolio" },
                { name: "Zero-Tech-Debt Guarantee", href: "#services" },
                { name: "Lighthouse 98+ Optimization", href: "#services" },
                { name: "Book Architecture Call", href: "#contact" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="hover:text-blue-400 hover:translate-x-1 transition-all inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Trust & Standards (2 Cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-4 border-b border-slate-800 dark:border-white/10 pb-2">
              Trust &amp; Legal
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              {[
                { name: "Mutual NDA Policy", href: "#faq" },
                { name: "100% IP Code Ownership", href: "#faq" },
                { name: "60-Day Bug Warranty", href: "#faq" },
                { name: "WCAG 2.2 AA Standards", href: "#faq" },
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Terms of Service", href: "/privacy-policy" },
                { name: "Security Disclosure", href: "#faq" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="hover:text-blue-400 hover:translate-x-1 transition-all inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Strip: Copyright, Standards & Theme Toggle */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© 2026 DevCraft Studio. Handcrafted with obsessive precision.</p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>All Systems Operational (99.98% Uptime)</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Next.js 15 • Tailwind v4 • TypeScript Strict</span>
            <span className="hidden sm:inline">•</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}

export { StudioFooter as Footer };
