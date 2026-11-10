"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { homeAnnouncement } from "@/lib/content/announcements";

export function HomeAnnouncement() {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // Check dismissal state and schedule initial appearance
  useEffect(() => {
    if (!homeAnnouncement.enabled) return;

    let isDismissed = false;
    try {
      isDismissed = Boolean(
        sessionStorage.getItem(homeAnnouncement.dismissalKey),
      );
    } catch {
      // Storage unavailable in private/sandboxed contexts; proceed safely
      isDismissed = false;
    }

    if (isDismissed) return;

    let retryTimer: NodeJS.Timeout | null = null;

    const checkAndOpen = () => {
      // Avoid opening over an active mobile drawer to prevent competing modal states
      if (document.getElementById("mobile-navigation-drawer")) {
        retryTimer = setTimeout(checkAndOpen, 1000);
        return;
      }
      if (document.activeElement instanceof HTMLElement) {
        previouslyFocusedElementRef.current = document.activeElement;
      }
      setIsOpen(true);
    };

    const initialTimer = setTimeout(checkAndOpen, homeAnnouncement.delayMs ?? 3000);

    return () => {
      clearTimeout(initialTimer);
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(homeAnnouncement.dismissalKey, "1");
    } catch {
      // Handle unavailable storage gracefully
    }
    // Restore focus to previous element
    window.requestAnimationFrame(() => {
      previouslyFocusedElementRef.current?.focus();
    });
  }, []);

  // Trap focus, handle Escape key, and lock background scrolling
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Set initial focus to close button
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleDismiss();
        return;
      }

      if (e.key === "Tab") {
        if (!modalRef.current) return;
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex="0"]',
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleDismiss]);

  if (!isOpen || !homeAnnouncement.enabled) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-modal-title"
      aria-describedby="announcement-modal-desc"
    >
      {/* Backdrop click dismisses */}
      <div
        className="absolute inset-0 -z-10"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        className="relative w-full max-w-[500px] max-h-[92vh] flex flex-col bg-[#0F192D] text-white rounded-2xl shadow-2xl border-2 border-[#D97706]/40 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 bg-[#090527] border-b border-[#D97706]/30 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {homeAnnouncement.badge && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider bg-[#B91C1C] text-white shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#F4CD13]" aria-hidden="true" />
                <span>{homeAnnouncement.badge}</span>
              </span>
            )}
            <h2
              id="announcement-modal-title"
              className="text-base sm:text-base font-heading font-bold text-[#F4CD13] tracking-wide"
            >
              {homeAnnouncement.title}
            </h2>
          </div>

          {/* Accessible Close Button (Minimum 44x44px target) */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleDismiss}
            aria-label="Close announcement modal"
            className="p-2 min-w-[44px] min-h-[44px] -mr-1 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#F4CD13] transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Poster Body (Ensures complete visibility on short viewports) */}
        <div className="overflow-y-auto p-3 sm:p-4 flex flex-col items-center gap-3">
          {/* Main Visual Poster Link */}
          <Link
            href={homeAnnouncement.link.href}
            onClick={handleDismiss}
            aria-label={`View full details for ${homeAnnouncement.title}`}
            className="group relative block w-full rounded-xl overflow-hidden border border-white/10 shadow-lg focus-visible:outline-2 focus-visible:outline-[#F4CD13] transition-transform hover:scale-[1.01]"
          >
            <Image
              src={homeAnnouncement.image.src}
              alt={homeAnnouncement.image.alt}
              width={homeAnnouncement.image.width}
              height={homeAnnouncement.image.height}
              priority
              quality={92}
              className="w-full h-auto object-contain rounded-xl"
            />
          </Link>

          {/* Screen Reader Transcription */}
          <div id="announcement-modal-desc" className="sr-only">
            {homeAnnouncement.title}. {homeAnnouncement.subtitle}. Official invitation to all alumni of Devasthaly Vidyapeeth. Click the action button to visit Alumni Corner.
          </div>

          {/* Bottom Action CTA Button */}
          <div className="w-full flex flex-col gap-2 pt-1">
            <Link
              href={homeAnnouncement.link.href}
              onClick={handleDismiss}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 min-h-[44px] rounded-xl bg-gradient-to-r from-[#B91C1C] to-[#991B1B] hover:from-[#991B1B] hover:to-[#7F1D1D] text-white font-heading font-bold text-sm sm:text-base uppercase tracking-wider shadow-md hover:shadow-lg transition-all border border-red-500/40 focus-visible:outline-2 focus-visible:outline-[#F4CD13]"
            >
              <span>{homeAnnouncement.link.label}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors py-1 text-center focus-visible:outline-2 focus-visible:outline-[#F4CD13] rounded-md min-h-[32px] flex items-center justify-center"
            >
              Dismiss and continue to website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
