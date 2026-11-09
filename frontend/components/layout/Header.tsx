"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronRight,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export interface NavItemChild {
  name: string;
  href: string;
  badge?: string;
}

export interface NavColumn {
  heading?: string;
  items: NavItemChild[];
}

export interface NavItem {
  name: string;
  href: string;
  panelType?: "compact" | "medium" | "mega";
  columns?: NavColumn[];
}

export const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  {
    name: "About Us",
    href: "/about",
    panelType: "mega",
    columns: [
      {
        heading: "Overview & Heritage",
        items: [
          { name: "About School & Heritage", href: "/about" },
          { name: "Vision and Mission", href: "/vision-mission" },
          {
            name: "CBSE Mandatory Disclosure",
            href: "/mandatory-public-disclosure",
          },
        ],
      },
      {
        heading: "Leadership Messages",
        items: [
          { name: "Founder’s Message", href: "/founders-message" },
          { name: "Patron’s Message", href: "/patrons-message" },
          { name: "President’s Message", href: "/presidents-message" },
          { name: "Manager’s Message", href: "/managers-message" },
          { name: "Principal’s Message", href: "/principals-message" },
        ],
      },
    ],
  },
  {
    name: "Academics",
    href: "/academics",
    panelType: "medium",
    columns: [
      {
        heading: "Curriculum & System",
        items: [
          { name: "Curriculum & CBSE Framework", href: "/academics" },
          { name: "Academic System & Assessment", href: "/academic-system" },
        ],
      },
      {
        heading: "Faculty & Achievements",
        items: [
          { name: "Faculty & Academic Mentors", href: "/faculty" },
          { name: "Board Results & Toppers", href: "/results" },
          { name: "Academic Calendar & Events", href: "/events" },
        ],
      },
    ],
  },
  {
    name: "Admissions",
    href: "/admissions",
    panelType: "medium",
    columns: [
      {
        heading: "Guidelines & Fees",
        items: [
          { name: "Admission Overview & Eligibility", href: "/admissions" },
          {
            name: "Admission Procedure & Entrance",
            href: "/admissions/procedure",
          },
          { name: "Fee Structure (2026–27)", href: "/admissions/fees" },
        ],
      },
      {
        heading: "Application & Prospectus",
        items: [
          { name: "School Prospectus", href: "/school-prospectus" },
          {
            name: "Online Admission Form",
            href: "/online-admission-form",
            badge: "Apply Now",
          },
        ],
      },
    ],
  },
  {
    name: "Life at School",
    href: "/facilities",
    panelType: "medium",
    columns: [
      {
        heading: "Campus & Boarding",
        items: [
          { name: "Campus Infrastructure & Facilities", href: "/facilities" },
          { name: "Hostels & Residential Care", href: "/facilities#hostel" },
          { name: "Safe Transport Network", href: "/facilities#transport" },
        ],
      },
      {
        heading: "Activities & Culture",
        items: [
          {
            name: "Co-Curricular Activities & Sports",
            href: "/co-curricular-activities",
          },
          { name: "Campus Photo Gallery", href: "/gallery" },
        ],
      },
    ],
  },
  {
    name: "Students & Parents",
    href: "/notices",
    panelType: "compact",
    columns: [
      {
        items: [
          { name: "Official Notices & Circulars", href: "/notices" },
          { name: "Downloads & Public Records", href: "/downloads" },
          {
            name: "General Instructions & Rules",
            href: "/general-instructions",
          },
          { name: "Alumni Corner & Reunion", href: "/alumni" },
        ],
      },
    ],
  },
  {
    name: "Contact",
    href: "/contact",
    panelType: "compact",
    columns: [
      {
        items: [
          { name: "Contact Us & Directory", href: "/contact" },
          { name: "How to Reach Campus", href: "/contact#location" },
        ],
      },
    ],
  },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);
  const pathname = usePathname();

  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const toggleButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>(
    {},
  );
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const handleMouseEnter = (name: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    const delay = openDesktopMenu ? 50 : 100;
    hoverTimerRef.current = setTimeout(() => {
      setOpenDesktopMenu(name);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    closeTimerRef.current = setTimeout(() => {
      setOpenDesktopMenu(null);
    }, 200);
  };

  const cancelCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Close menus when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDesktopMenu(null);
    setActiveDropdown(null);
  }, [pathname]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Global keydown (Escape) and click-outside listeners for desktop nav & mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openDesktopMenu) {
          const currentMenu = openDesktopMenu;
          setOpenDesktopMenu(null);
          toggleButtonRefs.current[currentMenu]?.focus();
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          mobileMenuButtonRef.current?.focus();
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        desktopNavRef.current &&
        !desktopNavRef.current.contains(e.target as Node)
      ) {
        setOpenDesktopMenu(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDesktopMenu, mobileMenuOpen]);

  // Trap focus and lock background scroll when mobile drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleTrapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !mobileDrawerRef.current) return;
      const focusables = mobileDrawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTrapFocus);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleTrapFocus);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-100 transition-all">
      {/* 1. TOP UTILITY BAR (#111827 Dark Surface) */}
      <div className="w-full bg-[#111827] text-white text-sm py-2.5 border-b border-gray-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-12 flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Left: Affiliation & Location Badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-300">
            <span className="inline-flex items-center gap-1.5 text-white font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F4CD13]" />
              CBSE Affiliation No.{" "}
              <strong className="text-white">
                {SCHOOL_INFO.affiliationNo}
              </strong>
            </span>
            <span className="hidden sm:inline text-gray-600">|</span>
            <span className="hidden sm:inline text-gray-300">
              School Code: {SCHOOL_INFO.schoolCode}
            </span>
            <span className="hidden lg:inline text-gray-600">|</span>
            <span className="hidden lg:inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#F4CD13]" />
              Chilkahar, Ballia (U.P.)
            </span>
          </div>

          {/* Right: Quick Parent Utilities & Helpline */}
          <div className="flex items-center gap-3 sm:gap-5 text-sm">
            <Link
              href="/mandatory-public-disclosure"
              className="text-gray-300 hover:text-white transition-colors underline decoration-[#B91C1C] underline-offset-4"
            >
              CBSE Mandatory Disclosure
            </Link>
            <Link
              href="/downloads"
              className="hidden md:inline-flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
            >
              Downloads
            </Link>
            <Link
              href="/admissions/fees"
              className="hidden sm:inline-flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
            >
              <CreditCard className="w-3 h-3 text-[#F4CD13]" />
              Pay Fees
            </Link>
            <Link
              href={`tel:${SCHOOL_INFO.contacts.admissionsPhone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1.5 font-bold text-white hover:text-[#F4CD13] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#F4CD13]" />
              <span>{SCHOOL_INFO.contacts.admissionsPhone}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY NAVIGATION BAR (#FFFFFF Pure White Surface) */}
      <div className="w-full bg-white relative">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-12 py-3.5 flex items-center justify-between gap-4 2xl:gap-2">
          {/* School Identity & Crest */}
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3.5 group focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2 rounded-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center p-1 shadow-xs border border-[#E5E7EB] group-hover:border-[#B91C1C] transition-colors shrink-0 overflow-hidden">
              <Image
                src="/images/branding/devasthalyballia.webp"
                alt="Devasthaly Vidyapeeth Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading font-bold text-lg sm:text-xl xl:text-2xl tracking-tight text-[#111827] leading-tight group-hover:text-[#B91C1C] transition-colors whitespace-normal sm:whitespace-nowrap">
                Devasthaly Vidyapeeth
              </span>
              <span
                style={{ fontSize: "12px", lineHeight: "16px" }}
                className="text-gray-500 font-medium tracking-normal mt-0.5 whitespace-nowrap hidden sm:block"
              >
                Estd. 1988 • CBSE Residential School • Chilkahar, Ballia
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            ref={desktopNavRef}
            className="hidden 2xl:flex items-center gap-1.5 shrink-0 font-heading"
            aria-label="Main Navigation"
          >
            {navItems.map((link) => {
              const isMenuOpen = openDesktopMenu === link.name;
              const hasChildren = Boolean(
                link.columns && link.columns.length > 0,
              );
              const isCurrentSection =
                (pathname.startsWith(link.href) && link.href !== "/") ||
                Boolean(
                  link.columns?.some((col) =>
                    col.items.some((sub) => {
                      const subPath = sub.href.split("#")[0];
                      return (
                        subPath !== "/" &&
                        (pathname === subPath ||
                          pathname.startsWith(subPath + "/"))
                      );
                    }),
                  ),
                );
              const isCurrentPage = pathname === link.href;
              const dropdownId = `desktop-menu-${link.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
              const isBroadPanel =
                link.panelType === "mega" || link.panelType === "medium";

              return (
                <div
                  key={link.name}
                  className={`shrink-0 ${isBroadPanel ? "static" : "relative"}`}
                  onMouseEnter={() =>
                    hasChildren && handleMouseEnter(link.name)
                  }
                  onMouseLeave={() => hasChildren && handleMouseLeave()}
                >
                  {hasChildren ? (
                    <div
                      className={`inline-flex items-center rounded-lg border transition-all ${
                        isCurrentSection || isMenuOpen
                          ? "border-red-200 bg-red-50/80 text-[#B91C1C]"
                          : "border-transparent text-[#111827] hover:bg-gray-50 hover:text-[#B91C1C]"
                      }`}
                    >
                      {/* Direct Parent Link: Navigates to parent overview page */}
                      <Link
                        href={link.href}
                        className="pl-2.5 2xl:pl-3 pr-1 py-1.5 2xl:py-2 text-[14.5px] 2xl:text-base font-heading font-semibold whitespace-nowrap rounded-l-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#B91C1C]"
                      >
                        {link.name}
                      </Link>

                      {/* Submenu Disclosure Button: Opens/closes mega-menu */}
                      <button
                        ref={(el) => {
                          toggleButtonRefs.current[link.name] = el;
                        }}
                        type="button"
                        onClick={() =>
                          setOpenDesktopMenu(isMenuOpen ? null : link.name)
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key === "ArrowDown" ||
                            e.key === "Enter" ||
                            e.key === " "
                          ) {
                            e.preventDefault();
                            setOpenDesktopMenu(link.name);
                          }
                        }}
                        aria-expanded={isMenuOpen}
                        aria-haspopup="true"
                        aria-controls={dropdownId}
                        aria-label={`Toggle ${link.name} submenu`}
                        className="pl-0.5 pr-2 py-1.5 2xl:py-2 text-gray-400 hover:text-[#B91C1C] rounded-r-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#B91C1C]"
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                            isMenuOpen ? "rotate-180 text-[#B91C1C]" : ""
                          }`}
                        />
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className={`text-[14.5px] 2xl:text-base font-heading font-semibold px-2.5 2xl:px-3 py-1.5 2xl:py-2 rounded-lg transition-all whitespace-nowrap inline-block focus-visible:outline-2 focus-visible:outline-[#B91C1C] ${
                        isCurrentPage
                          ? "text-[#B91C1C] bg-red-50/80 font-bold"
                          : "text-[#111827] hover:text-[#B91C1C] hover:bg-gray-50"
                      }`}
                    >
                      {link.name}
                    </Link>
                  )}

                  {/* Mega-Menu & Submenu Panels */}
                  {hasChildren &&
                    isMenuOpen &&
                    (isBroadPanel ? (
                      <div
                        id={dropdownId}
                        role="region"
                        aria-label={`${link.name} Submenu`}
                        onMouseEnter={cancelCloseTimer}
                        onMouseLeave={handleMouseLeave}
                        className="absolute top-full left-0 right-0 w-full pt-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150"
                      >
                        <div className="site-container px-4 sm:px-6 lg:px-8">
                          <div className="w-full max-w-[1040px] mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 ring-1 ring-black/5 overflow-hidden p-6 lg:p-7 max-h-[calc(100dvh-130px)] overflow-y-auto">
                            <div>
                              <div className="grid grid-cols-2 gap-8 divide-x divide-gray-100">
                                {link.columns?.map((col, cIdx) => (
                                  <div
                                    key={cIdx}
                                    className={cIdx > 0 ? "pl-8" : ""}
                                  >
                                    {col.heading && (
                                      <div className="text-sm font-heading font-bold uppercase tracking-wider text-gray-400 mb-3 px-3 pb-1.5 border-b border-gray-100">
                                        {col.heading}
                                      </div>
                                    )}
                                    <div className="flex flex-col gap-1.5">
                                      {col.items.map((subItem) => {
                                        const isItemActive =
                                          pathname === subItem.href;
                                        return (
                                          <Link
                                            key={subItem.name}
                                            href={subItem.href}
                                            onClick={() =>
                                              setOpenDesktopMenu(null)
                                            }
                                            className={`group/item flex items-start justify-between gap-3 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all ${
                                              isItemActive
                                                ? "bg-red-50 text-[#B91C1C] font-semibold"
                                                : "text-gray-700 hover:text-[#B91C1C] hover:bg-red-50/60"
                                            }`}
                                          >
                                            <span className="break-words leading-snug">
                                              {subItem.name}
                                            </span>
                                            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                                              {subItem.badge && (
                                                <span className="text-sm font-bold px-2 py-0.5 bg-[#B91C1C] text-white rounded-full">
                                                  {subItem.badge}
                                                </span>
                                              )}
                                              <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover/item:text-[#B91C1C] group-hover/item:translate-x-0.5 transition-all" />
                                            </div>
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Institutional Panel Footer Strips */}
                              {link.name === "About Us" && (
                                <div className="mt-5 pt-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
                                  <div className="flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-[#B45309] shrink-0" />
                                    <span>
                                      CBSE Affiliation No.{" "}
                                      <strong className="text-gray-700">
                                        {SCHOOL_INFO.affiliationNo}
                                      </strong>{" "}
                                      • School Code:{" "}
                                      <strong className="text-gray-700">
                                        {SCHOOL_INFO.schoolCode}
                                      </strong>
                                    </span>
                                  </div>
                                  <Link
                                    href="/mandatory-public-disclosure"
                                    onClick={() => setOpenDesktopMenu(null)}
                                    className="text-[#B91C1C] font-semibold hover:underline inline-flex items-center gap-1"
                                  >
                                    <span>CBSE Disclosure</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              )}

                              {link.name === "Admissions" && (
                                <div className="mt-5 pt-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
                                  <span className="text-gray-600 font-medium">
                                    Session 2026–27 Nursery to Class IX &amp; XI
                                  </span>
                                  <Link
                                    href="/online-admission-form"
                                    onClick={() => setOpenDesktopMenu(null)}
                                    className="text-[#B91C1C] font-semibold hover:underline inline-flex items-center gap-1"
                                  >
                                    <span>Apply Online</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        id={dropdownId}
                        role="region"
                        aria-label={`${link.name} Submenu`}
                        onMouseEnter={cancelCloseTimer}
                        onMouseLeave={handleMouseLeave}
                        className="absolute top-full right-0 w-[360px] max-w-[calc(100vw-32px)] pt-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150"
                      >
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 ring-1 ring-black/5 overflow-hidden p-4 max-h-[calc(100dvh-130px)] overflow-y-auto">
                          <div className="flex flex-col gap-1">
                            {link.columns?.[0]?.items.map((subItem) => {
                              const isItemActive = pathname === subItem.href;
                              return (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  onClick={() => setOpenDesktopMenu(null)}
                                  className={`group/item flex items-start justify-between gap-3 px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all ${
                                    isItemActive
                                      ? "bg-red-50 text-[#B91C1C] font-semibold"
                                      : "text-gray-700 hover:text-[#B91C1C] hover:bg-red-50/60"
                                  }`}
                                >
                                  <span className="break-words leading-snug">
                                    {subItem.name}
                                  </span>
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover/item:text-[#B91C1C] group-hover/item:translate-x-0.5 transition-all shrink-0 mt-1" />
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              );
            })}
          </nav>

          {/* Right CTA Buttons */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <Link
              href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}?text=Hello%20Devasthaly%20Vidyapeeth,%20I%20would%20like%20to%20enquire%20about%20admissions.`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Admissions on WhatsApp"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 2xl:w-11 2xl:h-11 2xl:justify-center 2xl:px-0 2xl:py-0 rounded-full bg-[#F3F4F6] text-[#111827] font-semibold text-sm border border-[#E5E7EB] hover:border-[#B91C1C] hover:text-[#B91C1C] focus-visible:outline-2 focus-visible:outline-[#B91C1C] transition-all whitespace-nowrap shrink-0 shadow-2xs hover:shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span className="sr-only">WhatsApp</span>
            </Link>

            {/* Primary Admission Button */}
            <Link
              href="/admissions"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 2xl:hidden rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-heading font-bold text-sm uppercase tracking-wider shadow-sm hover:shadow-md transition-all border border-[#991B1B] whitespace-nowrap shrink-0 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Apply 2026–27</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="2xl:hidden p-2.5 rounded-xl text-gray-700 hover:bg-[#F3F4F6] focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2 transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* 3. MOBILE FULL DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div
          ref={mobileDrawerRef}
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="2xl:hidden absolute top-full left-0 right-0 w-full h-[calc(100dvh-100%)] bg-white z-40 overflow-y-auto border-t border-[#E5E7EB] px-4 sm:px-6 py-6 pb-32 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="w-full max-w-xl mx-auto flex flex-col gap-3 font-heading">
            {navItems.map((link) => {
              const menuId = `mobile-sub-${link.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
              const isAccordionOpen = activeDropdown === link.name;
              const hasChildren = Boolean(
                link.columns && link.columns.length > 0,
              );

              return (
                <div key={link.name} className="border-b border-gray-100 pb-2">
                  {hasChildren ? (
                    <div>
                      <div className="flex items-center justify-between">
                        {/* Parent text link navigates to parent page */}
                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="py-2.5 px-1.5 text-base font-heading font-bold text-[#111827] hover:text-[#B91C1C] focus-visible:outline-2 focus-visible:outline-[#B91C1C] rounded-lg"
                        >
                          {link.name}
                        </Link>
                        {/* Accordion toggle button */}
                        <button
                          type="button"
                          onClick={() => toggleDropdown(link.name)}
                          aria-expanded={isAccordionOpen}
                          aria-controls={menuId}
                          aria-label={`Toggle ${link.name} submenu`}
                          className="p-2 text-gray-500 hover:text-[#B91C1C] focus-visible:outline-2 focus-visible:outline-[#B91C1C] rounded-lg"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isAccordionOpen ? "rotate-180 text-[#B91C1C]" : ""
                            }`}
                          />
                        </button>
                      </div>
                      {isAccordionOpen && (
                        <div
                          id={menuId}
                          className="pl-3 mt-1 flex flex-col gap-3 py-3 bg-[#F9FAFB] rounded-xl border border-gray-100"
                        >
                          {link.columns?.map((col, cIdx) => (
                            <div key={cIdx} className="flex flex-col gap-1">
                              {col.heading && (
                                <span className="text-sm font-heading font-bold uppercase tracking-wider text-gray-400 px-2 py-0.5">
                                  {col.heading}
                                </span>
                              )}
                              {col.items.map((sub) => (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="py-2.5 px-3 text-[15px] font-medium text-gray-700 hover:text-[#B91C1C] hover:bg-white rounded-lg flex items-start justify-between gap-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-[#B91C1C]"
                                >
                                  <span className="break-words leading-snug">
                                    {sub.name}
                                  </span>
                                  {sub.badge && (
                                    <span className="text-sm font-bold px-2 py-0.5 bg-[#B91C1C] text-white rounded-full shrink-0 mt-0.5">
                                      {sub.badge}
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2.5 px-1.5 text-base font-heading font-bold text-[#111827] hover:text-[#B91C1C] focus-visible:outline-2 focus-visible:outline-[#B91C1C] rounded-lg"
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              );
            })}

            {/* Quick Actions in Mobile Drawer */}
            <div className="pt-4 flex flex-col gap-3">
              <Link
                href="/admissions"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-heading font-bold rounded-xl shadow-md text-sm transition-colors focus-visible:outline-2 focus-visible:outline-white"
              >
                Apply for Admission 2026–27
              </Link>
              <Link
                href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-[#F3F4F6] border border-[#E5E7EB] text-[#111827] font-bold rounded-xl shadow-xs text-sm flex items-center justify-center gap-2 hover:border-[#B91C1C] focus-visible:outline-2 focus-visible:outline-[#B91C1C]"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                Chat on WhatsApp
              </Link>
              <Link
                href={`tel:${SCHOOL_INFO.contacts.admissionsPhone.replace(/\s+/g, "")}`}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 bg-[#111827] hover:bg-black text-white font-bold rounded-xl shadow-md text-sm flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-white"
              >
                <Phone className="w-4 h-4 text-[#B91C1C]" />
                Call Admissions: {SCHOOL_INFO.contacts.admissionsPhone}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
