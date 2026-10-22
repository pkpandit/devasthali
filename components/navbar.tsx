"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Layers,
  Layout,
  Palette,
  Code2,
  ArrowRight,
  Briefcase,
  ShoppingBag,
} from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [templatesDropdownOpen, setTemplatesDropdownOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const templateCategories = [
    {
      title: "React & Next.js Templates",
      desc: "Full-stack SaaS, landing pages & portfolio starters",
      icon: Code2,
      href: "#templates-nextjs",
    },
    {
      title: "Admin Dashboard UI Kits",
      desc: "Data-dense analytics, CRM & management portals",
      icon: Layout,
      href: "#templates-admin",
    },
    {
      title: "Figma Design Systems",
      desc: "Component libraries, typography & auto-layout kits",
      icon: Palette,
      href: "#templates-figma",
    },
    {
      title: "Graphic & Brand Templates",
      desc: "Social media kits, presentations & vector graphics",
      icon: Layers,
      href: "#templates-graphics",
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-slate-200/80 bg-white/80 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-[#090D16]/80"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group focus-visible:outline-none">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0E1526] p-0.5 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-md shadow-blue-500/10 group-hover:scale-105 transition-all overflow-hidden shrink-0">
              <Image
                src="/images/devasthalyballia.webp"
                alt="Devasthaly Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                DevCraft <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium border border-blue-200/60 dark:border-blue-800/60">Studio</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Digital Templates & Bespoke Design
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* Templates Dropdown Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setTemplatesDropdownOpen(true)}
              onMouseLeave={() => setTemplatesDropdownOpen(false)}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-[#131C31]/60 transition-colors"
                aria-expanded={templatesDropdownOpen}
              >
                <span>Templates</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${templatesDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Mega Dropdown Menu */}
              {templatesDropdownOpen && (
                <div className="absolute top-full left-0 w-80 pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="rounded-[20px] border border-slate-200/80 bg-white p-2.5 shadow-xl dark:border-white/10 dark:bg-[#0E1526]/95 backdrop-blur-xl">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Digital Product Catalog
                      </span>
                    </div>
                    {templateCategories.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 dark:hover:bg-[#131C31] transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {item.desc}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="#services"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
            >
              Services
            </Link>

            <Link
              href="#portfolio"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
            >
              Portfolio
            </Link>

            <Link
              href="#testimonials"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
            >
              Reviews
            </Link>

            <Link
              href="#faq"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
            >
              FAQ
            </Link>
          </nav>

          {/* Right Utilities: Theme Toggle & CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />

            <Link href="#templates">
              <Button variant="outline" size="sm" className="hidden lg:inline-flex gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Store</span>
              </Button>
            </Link>

            <Link href="#contact">
              <Button variant="glow" size="sm" className="gap-1.5">
                <span>Hire Me</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 px-4 pt-3 pb-6 shadow-xl dark:border-white/10 dark:bg-[#080D1A]/95 backdrop-blur-lg">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
              Templates Catalog
            </div>
            {templateCategories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <cat.icon className="w-4 h-4 text-indigo-500" />
                <span>{cat.title}</span>
              </Link>
            ))}

            <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1">
              <Link
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Custom Design Services
              </Link>
              <Link
                href="#portfolio"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Portfolio & Case Studies
              </Link>
              <Link
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Client Reviews
              </Link>
              <Link
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Contact & Project Inquiry
              </Link>
            </div>

            <div className="pt-4">
              <Link href="#contact" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="glow" className="w-full">
                  Start a Custom Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
