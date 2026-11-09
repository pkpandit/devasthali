"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { APPROVED_TESTIMONIALS, type TestimonialItem } from "@/lib/testimonials-data";
import { Play, Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";

interface TestimonialSectionProps {
  testimonials?: TestimonialItem[];
  /** Flag to show draft preview banner when no approved testimonials are present */
  showDraftPlaceholder?: boolean;
}

export function TestimonialSection({
  testimonials = APPROVED_TESTIMONIALS,
  showDraftPlaceholder = false,
}: TestimonialSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // If no testimonials exist and draft placeholder is requested
  if (!testimonials || testimonials.length === 0) {
    if (showDraftPlaceholder) {
      return (
        <section
          id="testimonials-draft"
          aria-label="Testimonials Preview (Draft)"
          className="w-full py-16 bg-gray-50 border-y border-dashed border-gray-300 text-center"
        >
          <Container>
            <div className="max-w-xl mx-auto p-8 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-sm font-heading font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
                Draft State • Pending Testimonial Approval
              </span>
              <h3 className="text-xl font-heading font-bold text-[#111827]">
                Dedicated Testimonial Section
              </h3>
              <p className="text-sm text-gray-600 mt-2 font-sans leading-relaxed">
                Awaiting verified school-approved parent or alumni testimonials. No fabricated
                reviews are published on the live website.
              </p>
            </div>
          </Container>
        </section>
      );
    }
    // Do not publish fabricated reviews; keep empty section out of production
    return null;
  }

  const count = testimonials.length;

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? count - 1 : prev - 1));
  }, [count]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === count - 1 ? 0 : prev + 1));
  }, [count]);

  // Accessible keyboard controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative w-full py-20 sm:py-28 lg:py-32 overflow-hidden bg-[#111827] text-white border-b border-gray-800"
    >
      {/* 1. Full-Bleed Campus Landscape Background Image */}
      <div className="absolute inset-0 select-none pointer-events-none">
        <Image
          src="/images/about/campus-showcase.jpg"
          alt="Devasthaly Vidyapeeth Campus Architecture and Grounds"
          fill
          sizes="100vw"
          quality={85}
          className="object-cover object-center"
        />
        {/* Contrast overlay ensuring WCAG 2.2 AAA legibility */}
        <div className="absolute inset-0 bg-[#111827]/75 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111827]/95 via-[#111827]/80 to-[#111827]/65" />
      </div>

      {/* 2. Fluid Organic Wave Accent on Left (Matching Attached Screenshot Composition) */}
      <svg
        className="absolute bottom-0 left-0 w-[60%] lg:w-[48%] h-[88%] pointer-events-none select-none text-[#B91C1C] opacity-90 hidden sm:block"
        viewBox="0 0 700 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,220 C100,210 160,260 210,320 C270,390 320,240 430,220 C540,200 620,380 570,490 C530,570 440,600 0,600 Z"
          fill="currentColor"
        />
      </svg>

      <Container className="relative z-10">
        {/* Section Header with Slider Navigation Controls on Right Top */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-6">
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#F4CD13] text-sm font-heading font-bold uppercase tracking-wider mb-3.5 backdrop-blur-sm">
              <span>Testimonials</span>
            </div>
            <h2
              id="testimonials-heading"
              className="text-2xl sm:text-[30px] sm:leading-[40px] lg:text-[35px] lg:leading-[47px] font-semibold text-white tracking-tight"
            >
              What Parents Say About Devasthaly
            </h2>
            <p className="text-base text-gray-200 mt-3 font-sans leading-relaxed">
              Real feedback and authentic experiences from parents whose children thrive in our CBSE day-boarding and residential campus.
            </p>
          </div>

          {/* Slider Arrow Navigation Controls Positioned on Right Top */}
          {count > 1 && (
            <div
              className="flex items-center gap-3.5 shrink-0 self-start sm:self-end pb-1"
              role="group"
              aria-label="Testimonial Navigation Controls"
            >
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="w-12 h-12 rounded-full bg-white text-[#111827] hover:bg-[#B91C1C] hover:text-white border border-white/30 shadow-xl flex items-center justify-center transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next testimonial"
                className="w-12 h-12 rounded-full bg-white text-[#111827] hover:bg-[#B91C1C] hover:text-white border border-white/30 shadow-xl flex items-center justify-center transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-gray-300 pl-1 font-heading tracking-wide">
                {activeIndex + 1} / {count}
              </span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* =========================================================================
              LEFT COLUMN: VIDEO TOUR HOOK & CAROUSEL NAVIGATION (Screenshot Reference)
          ========================================================================= */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left justify-center">
            <div className="relative group flex flex-col items-center lg:items-start">
              {/* Concentric Play Button with White Ripple Outer Ring */}
              <Link
                href="/gallery"
                aria-label="View Campus Virtual Tour and Photo Gallery"
                className="relative inline-flex items-center justify-center w-24 h-24 rounded-full border border-white/60 hover:border-white transition-all duration-300 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 group"
              >
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white text-[#B91C1C] flex items-center justify-center shadow-2xl group-hover:scale-105 group-hover:bg-[#B91C1C] group-hover:text-white transition-all duration-300">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
                </div>
              </Link>

              {/* Title & Subtitle Below Play Button */}
              <h3 className="font-heading font-semibold text-2xl sm:text-3xl lg:text-[32px] lg:leading-[42px] text-white mt-6 tracking-tight">
                Campus Tour Video
              </h3>
              <p className="text-base text-gray-200 mt-2 font-sans max-w-sm leading-relaxed">
                Experience our 15-acre green campus, modern smart classrooms, laboratories, and student hostel life.
              </p>
            </div>


          </div>

          {/* =========================================================================
              RIGHT COLUMN: WHITE TESTIMONIAL CARD (.testimoinals_wrap in Screenshot)
          ========================================================================= */}
          <div className="lg:col-span-6 w-full">
            <div
              tabIndex={0}
              onKeyDown={handleKeyDown}
              role="region"
              aria-roledescription="carousel"
              aria-label="Parent and Community Testimonials"
              className="bg-white text-[#111827] rounded-3xl p-7 sm:p-10 lg:p-12 shadow-2xl border border-gray-100/90 relative overflow-hidden focus-visible:ring-2 focus-visible:ring-[#B91C1C] outline-none"
            >
              {/* Large Decorative Quote Shape in Top-Right Corner */}
              <Quote
                className="w-16 h-16 sm:w-20 sm:h-20 text-slate-100 absolute top-6 right-6 select-none pointer-events-none rotate-180"
                aria-hidden="true"
                strokeWidth={2.5}
              />



              {/* Testimonial Slides: All pre-rendered for SEO and screen-reader accessibility */}
              <div className="relative z-10">
                {testimonials.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <figure
                      key={item.id}
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`Testimonial ${idx + 1} of ${count}: ${item.author}`}
                      aria-hidden={!isActive}
                      className={`m-0 transition-opacity duration-300 ${isActive ? "block" : "hidden"}`}
                    >
                      {/* Author Information Header (.tes_top) */}
                      <div className="flex items-center gap-4 mb-4 text-left">
                        {item.avatar ? (
                          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#E5E7EB] shrink-0">
                            <Image
                              src={item.avatar}
                              alt=""
                              aria-hidden="true"
                              fill
                              className="object-cover object-center"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#B91C1C] text-white flex items-center justify-center font-heading font-bold text-lg sm:text-xl shadow-xs shrink-0 select-none"
                            aria-hidden="true"
                          >
                            {item.monogram}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="font-heading font-bold text-lg sm:text-xl text-[#111827] leading-snug">
                            {item.author}
                          </div>
                          <div className="text-[15px] font-medium text-[#B91C1C] mt-0.5 truncate">
                            {item.relationship}
                          </div>
                        </div>
                      </div>

                      {/* Subject / Context Tag if Present */}
                      {item.subject && (
                        <div className="text-left mb-3">
                          <span className="inline-block text-sm font-heading font-semibold text-gray-800 bg-gray-50 border border-gray-200/80 px-3 py-1 rounded-lg">
                            {item.subject}
                          </span>
                        </div>
                      )}

                      {/* Quotation Body Text */}
                      <blockquote className="text-base sm:text-[17px] text-gray-600 leading-[1.7] font-sans text-left my-3 italic">
                        &ldquo;{item.quote}&rdquo;
                      </blockquote>

                      {/* Star Ratings (Preserving Existing 5-Star Benchmark) */}
                      {item.rating && (
                        <div
                          className="flex items-center gap-1 mt-4 text-[#F59E0B]"
                          aria-label={`${item.rating} out of 5 stars`}
                        >
                          {[...Array(item.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
                          ))}
                        </div>
                      )}
                    </figure>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
