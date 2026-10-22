"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SCHOOL_INFO } from "@/lib/school-data";
import {
  Phone,
  MapPin,
  Menu,
  X,
  ChevronDown,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    {
      name: "About Us",
      href: "/about",
      dropdown: [
        { name: "About the School & Legacy", href: "/about" },
        { name: "Vision, Mission & Values", href: "/vision-mission" },
        { name: "Principal's Message", href: "/principals-message" },
        { name: "Faculty & Academic Mentors", href: "/faculty" },
      ],
    },
    {
      name: "Academics",
      href: "/academics",
      dropdown: [
        { name: "CBSE Curriculum & Pedagogy", href: "/academics" },
        { name: "Foundational & Middle Wing", href: "/academics#wings" },
        { name: "Senior Secondary Streams (Sci/Com/Hum)", href: "/academics#streams" },
        { name: "NEET/JEE Foundation Guidance", href: "/academics#competitive" },
      ],
    },
    { name: "Facilities", href: "/facilities" },
    {
      name: "Admissions",
      href: "/admissions",
      highlight: true,
      dropdown: [
        { name: "Admissions 2025–26 Overview", href: "/admissions" },
        { name: "Step-by-Step Procedure", href: "/admissions/procedure" },
        { name: "Fee Structure & Prospectus", href: "/admissions/fees" },
        { name: "Online Admission Enquiry", href: "/admissions#enquiry" },
      ],
    },
    {
      name: "Notices",
      href: "/notices",
      dropdown: [
        { name: "Notices & Circulars", href: "/notices" },
        { name: "CBSE Board Results & Toppers", href: "/results" },
        { name: "Downloads & Mandatory Disclosures", href: "/downloads" },
      ],
    },
    {
      name: "Gallery",
      href: "/gallery",
      dropdown: [
        { name: "Photo & Video Gallery", href: "/gallery" },
        { name: "Events & Calendar 2025–26", href: "/events" },
        { name: "Alumni Network & Stories", href: "/alumni" },
      ],
    },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-xs border-b border-[#F3F4F6]">
      {/* 1. TOP UTILITY BAR (#111827 Dark Surface) */}
      <div className="w-full bg-[#111827] text-white text-xs py-2 border-b border-gray-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Left: Affiliation & Location Badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-300">
            <span className="inline-flex items-center gap-1.5 text-white font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4F46E5]" />
              CBSE Affiliation No. <strong className="text-white">{SCHOOL_INFO.affiliationNo}</strong>
            </span>
            <span className="hidden sm:inline text-gray-600">|</span>
            <span className="hidden sm:inline text-gray-300">School Code: {SCHOOL_INFO.schoolCode}</span>
            <span className="hidden lg:inline text-gray-600">|</span>
            <span className="hidden lg:inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#4F46E5]" />
              Chilkahar, Ballia (U.P.)
            </span>
          </div>

          {/* Right: Quick Parent Utilities & Helpline */}
          <div className="flex items-center gap-3 sm:gap-5 text-xs">
            <Link
              href="/downloads"
              className="text-gray-300 hover:text-white transition-colors underline decoration-[#4F46E5] underline-offset-4"
            >
              CBSE Mandatory Disclosure
            </Link>
            <Link
              href="/admissions/fees"
              className="hidden sm:inline-flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
            >
              <CreditCard className="w-3 h-3 text-[#4F46E5]" />
              Pay Fees
            </Link>
            <Link
              href={`tel:${SCHOOL_INFO.contacts.admissionsPhone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1.5 font-bold text-white hover:text-[#4F46E5] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#4F46E5]" />
              <span>{SCHOOL_INFO.contacts.admissionsPhone}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY NAVIGATION BAR (#FFFFFF Pure White Surface) */}
      <div className="w-full bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-3.5 flex items-center justify-between gap-4">
          {/* School Identity & Crest */}
          <Link href="/" className="flex items-center gap-3.5 group focus:outline-none shrink-0">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1 shadow-xs border border-[#E5E7EB] group-hover:border-[#4F46E5] transition-colors shrink-0 overflow-hidden">
              <Image
                src="/images/devasthalyballia.webp"
                alt="Devasthaly Vidyapeeth Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading font-bold text-lg sm:text-xl xl:text-2xl tracking-tight text-[#111827] leading-none group-hover:text-[#4F46E5] transition-colors whitespace-nowrap">
                Devasthaly Vidyapeeth
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium tracking-wide mt-1 whitespace-nowrap hidden sm:block">
                Estd. 1988 • CBSE Residential School • Chilkahar, Ballia
              </span>
            </div>
          </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-3.5 2xl:gap-6 shrink-0" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group shrink-0">
              {link.dropdown ? (
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 py-2 text-xs 2xl:text-sm font-semibold transition-colors whitespace-nowrap ${
                    pathname.startsWith(link.href)
                      ? "text-[#4F46E5] font-bold border-b-2 border-[#4F46E5]"
                      : "text-[#111827] hover:text-[#4F46E5]"
                  }`}
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="whitespace-nowrap">{link.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#4F46E5] transition-transform group-hover:rotate-180 shrink-0" />
                </button>
              ) : (
                <Link
                  href={link.href}
                  className={`text-xs 2xl:text-sm font-semibold py-2 transition-colors whitespace-nowrap inline-block ${
                    pathname === link.href
                      ? "text-[#4F46E5] border-b-2 border-[#4F46E5] font-bold"
                      : "text-[#111827] hover:text-[#4F46E5]"
                  }`}
                >
                  <span className="whitespace-nowrap">{link.name}</span>
                </Link>
              )}

              {/* Dropdown Menu */}
              {link.dropdown && (
                <div className="absolute left-0 top-full hidden group-hover:block w-64 pt-2 z-50">
                  <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] py-2">
                    {link.dropdown.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block px-4 py-2.5 text-xs font-medium text-[#111827] hover:bg-[#F3F4F6] hover:text-[#4F46E5] hover:pl-6 transition-all whitespace-nowrap"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right CTA Buttons */}
        <div className="hidden lg:flex items-center gap-2.5 2xl:gap-3 shrink-0">
          <Link
            href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}?text=Hello%20Devasthaly%20Vidyapeeth,%20I%20would%20like%20to%20enquire%20about%20admissions.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F3F4F6] text-[#111827] font-semibold text-xs border border-[#E5E7EB] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-all whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span className="hidden 2xl:inline">WhatsApp</span>
          </Link>

          {/* Primary Admission Button (#4F46E5 Indigo) */}
          <Link
            href="/admissions"
            className="inline-flex items-center gap-1.5 px-3.5 2xl:px-4 py-2 2xl:py-2.5 rounded-xl bg-[#4F46E5] text-white font-bold text-xs uppercase tracking-wide hover:bg-[#4338CA] shadow-sm hover:shadow transition-all border border-[#4338CA] whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Apply 2025–26</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2.5 rounded-lg text-gray-700 hover:bg-[#F3F4F6] focus:outline-none"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      </div>

      {/* 3. MOBILE FULL DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 top-[108px] bg-white z-40 overflow-y-auto border-t border-[#E5E7EB] px-6 py-6 pb-24 shadow-2xl">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <div key={link.name} className="border-b border-[#F3F4F6] pb-2">
                {link.dropdown ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(link.name)}
                      className="w-full flex items-center justify-between py-2 text-base font-bold text-[#111827]"
                    >
                      <span>{link.name}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          activeDropdown === link.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {activeDropdown === link.name && (
                      <div className="pl-4 mt-1 flex flex-col gap-2 py-2 bg-[#F3F4F6] rounded-lg border border-[#E5E7EB]">
                        {link.dropdown.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="py-1.5 text-sm font-medium text-gray-700 hover:text-[#4F46E5]"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-base font-bold text-[#111827] hover:text-[#4F46E5]"
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}

            {/* Quick Actions in Mobile Drawer */}
            <div className="pt-4 flex flex-col gap-3">
              <Link
                href="/admissions"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold rounded-xl shadow-md text-sm transition-colors"
              >
                Apply for Admission 2025–26
              </Link>
              <Link
                href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-[#F3F4F6] border border-[#E5E7EB] text-[#111827] font-bold rounded-xl shadow-xs text-sm flex items-center justify-center gap-2 hover:border-[#4F46E5]"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                Chat on WhatsApp
              </Link>
              <Link
                href={`tel:${SCHOOL_INFO.contacts.admissionsPhone.replace(/\s+/g, "")}`}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-[#111827] hover:bg-black text-white font-bold rounded-xl shadow-md text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#4F46E5]" />
                Call Admissions: {SCHOOL_INFO.contacts.admissionsPhone}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
