"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ChevronUp } from "lucide-react";

/**
 * Scroll threshold (in CSS pixels) before the button becomes visible.
 */
const SCROLL_THRESHOLD = 400;

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Exclude admin dashboard from public scroll-to-top control
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;

    let ticking = false;

    const updateVisibility = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;
      const shouldBeVisible = currentScrollY > SCROLL_THRESHOLD;
      setIsVisible((prev) => (prev !== shouldBeVisible ? shouldBeVisible : prev));
      ticking = false;
    };

    // Initialize visibility from actual scroll position upon mount
    updateVisibility();

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isAdmin]);

  // When route changes, update visibility asynchronously via requestAnimationFrame
  useEffect(() => {
    if (isAdmin) return;
    const rafId = window.requestAnimationFrame(() => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;
      const shouldBeVisible = currentScrollY > SCROLL_THRESHOLD;
      setIsVisible((prev) => (prev !== shouldBeVisible ? shouldBeVisible : prev));
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [pathname, isAdmin]);

  const handleScrollToTop = () => {
    // Check user's motion preference
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scroll main document to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    // Deliberate accessible focus management:
    // Move focus to #main-content so keyboard focus is not stranded on a disappearing button
    const mainContent = document.getElementById("main-content") || document.querySelector("h1");
    if (mainContent) {
      if (prefersReducedMotion) {
        mainContent.focus({ preventScroll: true });
      } else {
        // Allow smooth scroll to initiate before shifting focus smoothly
        setTimeout(() => {
          mainContent.focus({ preventScroll: true });
        }, 300);
      }
    }
  };

  if (isAdmin) {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleScrollToTop}
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
      aria-label="Scroll to top"
      className={`fixed z-30 flex items-center justify-center w-12 h-12 rounded-full bg-[#B91C1C] text-white shadow-lg hover:shadow-xl hover:bg-[#991B1B] active:scale-95 focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2 transition-all duration-200 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto visible"
          : "opacity-0 translate-y-3 pointer-events-none invisible"
      } bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:right-[calc(1.5rem+env(safe-area-inset-right,0px))]`}
    >
      <ChevronUp className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
    </button>
  );
}

