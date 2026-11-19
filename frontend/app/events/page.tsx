import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, FileText } from "lucide-react";
import { getPublicEvents } from "@/lib/api/events";

export const metadata: Metadata = {
  title: "Events & Academic Calendar 2025–26 | Devasthaly",
  description:
    "Annual calendar, sports meet, science exhibition, and examination schedule for Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default async function EventsPage() {
  const { events: upcomingEvents } = await getPublicEvents();

  return (
    <div className="w-full bg-[#F3F4F6] min-h-screen pb-24">
      {/* 1. Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-12 sm:py-16 mb-8 sm:mb-12 shadow-2xs">
        <div className="site-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" aria-hidden="true" />
                <span>Academics / Calendar & Events</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
                Events & Academic Calendar 2025–26
              </h1>
              <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
                A vibrant schedule of academic symposiums, athletic competitions, and cultural celebrations at Chilkahar.
              </p>
            </div>

            {/* Official PDF Calendar Document Action */}
            <div className="shrink-0">
              <Link
                href="/downloads"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white border border-gray-300 text-sm font-heading font-bold text-[#111827] hover:border-[#B91C1C] hover:text-[#B91C1C] hover:bg-red-50/40 shadow-xs hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#B91C1C]"
              >
                <FileText className="w-4 h-4 text-[#B91C1C]" aria-hidden="true" />
                <span>Official Calendar & Holidays (PDF)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Calendar Event List Section — Faithful Interpretation of Reference Screenshot */}
      <div className="site-container">
        {upcomingEvents.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-gray-200 shadow-2xs">
            <h3 className="text-lg font-heading font-bold text-gray-700">No upcoming events scheduled</h3>
            <p className="text-sm text-gray-500 mt-1">Please check back soon for updated school calendar announcements.</p>
          </div>
        ) : (
          <div className="border-y border-gray-200/90 divide-y divide-gray-200/90">
            {upcomingEvents.map((ev, idx) => {
              const dateParts = (ev.date || "").split(" ");
              const dayNum = dateParts[0] || "";
              const monthYear = dateParts.length > 2 ? `${dateParts[1]} ${dateParts[2]}` : (dateParts[1] || "");

              return (
                <article
                  key={ev.id || idx}
                  className="py-8 sm:py-10 lg:py-12 flex flex-col md:flex-row md:items-start gap-4 sm:gap-6 lg:gap-12 hover:bg-white/40 transition-colors duration-200 group px-2 sm:px-4"
                >
                  {/* Screen-reader accessible timestamp */}
                  <time dateTime={ev.isoDate} className="sr-only">
                    {ev.date} {ev.time ? `from ${ev.time}` : ""}
                  </time>

                  {/* Column 1 & 2: Outlined Day Numeral + Month/Time Stack */}
                  <div className="flex items-center gap-4 sm:gap-6 shrink-0 md:w-64 lg:w-72">
                    {/* Oversized Outlined Day Numeral matching Reference Screenshot */}
                    <div
                      className="font-heading font-black text-6xl sm:text-7xl lg:text-8xl text-transparent tracking-tighter select-none shrink-0 leading-none transition-transform group-hover:scale-105 duration-200"
                      style={{
                        WebkitTextStroke: "2.5px #B91C1C",
                      }}
                      aria-hidden="true"
                    >
                      {dayNum}
                    </div>

                    {/* Month/Year & Time Stack without icon distraction */}
                    <div className="flex flex-col justify-center">
                      <span className="font-heading font-bold text-sm sm:text-base lg:text-lg text-[#111827] tracking-tight">
                        {monthYear}
                      </span>
                      {ev.time && (
                        <span className="font-sans text-sm text-gray-600 font-medium mt-1">
                          {ev.time}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Column 3: Event Title & Crimson Venue (matching reference typography) + Description */}
                  <div className="flex-1 space-y-1.5 md:pt-1">
                    <h2 className="font-heading font-black text-xl sm:text-2xl lg:text-3xl text-[#111827] group-hover:text-[#B91C1C] transition-colors tracking-tight leading-snug">
                      {ev.title}
                    </h2>

                    {/* Accent Location/Venue in Crimson (#B91C1C) exactly like reference */}
                    {ev.venue && (
                      <div className="font-heading font-semibold text-sm lg:text-base text-[#B91C1C] tracking-wide">
                        {ev.venue}
                      </div>
                    )}

                    {/* Full Original School Description Preserved */}
                    <p className="font-sans text-base text-gray-600 leading-relaxed pt-2 max-w-3xl">
                      {ev.desc}
                    </p>

                    {/* Category Chip */}
                    {ev.category && (
                      <div className="pt-2">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-heading font-bold uppercase tracking-wider bg-red-50 text-[#B91C1C] border border-red-100">
                          {ev.category}
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
