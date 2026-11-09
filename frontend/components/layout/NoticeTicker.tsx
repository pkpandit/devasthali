"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NOTICES_DATA } from "@/lib/school-data";
import { Bell, ChevronRight, Pause, Play } from "lucide-react";

export function NoticeTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const activeNotices = NOTICES_DATA.slice(0, 4);

  return (
    <div
      className="w-full bg-[#F3F4F6] text-[#111827] text-sm py-2 sm:py-2.5 border-b border-[#E5E7EB] shadow-xs"
      role="region"
      aria-label="Latest Announcements and Urgent Notices"
    >
      <div className="site-container flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-heading font-bold shrink-0 text-white bg-[#B91C1C] px-3 py-1 rounded-md text-xs sm:text-sm uppercase tracking-wider shadow-xs">
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          <span>Latest Updates</span>
        </div>

        <div
          className="flex-1 overflow-hidden mx-2 sm:mx-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className={`flex items-center gap-8 whitespace-nowrap transition-transform duration-500 ${
              isPaused ? "" : "hover:pause"
            }`}
          >
            {activeNotices.map((notice, idx) => (
              <Link
                key={notice.id}
                href="/notices"
                className="inline-flex items-center gap-2 hover:underline hover:text-[#B91C1C] transition-colors text-sm"
              >
                {notice.isNew && (
                  <span className="bg-[#B91C1C] text-white text-xs font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    New
                  </span>
                )}
                <span className="text-[#111827] font-heading font-semibold text-xs sm:text-sm">{notice.title}</span>
                <span className="text-gray-500 text-xs sm:text-sm">({notice.date})</span>
                {idx < activeNotices.length - 1 && (
                  <span className="text-gray-300 ml-4 font-bold">•</span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="text-gray-600 hover:text-[#111827] min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors focus-visible:outline-2 focus-visible:outline-[#B91C1C]"
            title={isPaused ? "Resume Ticker" : "Pause Ticker"}
            aria-label={isPaused ? "Resume Announcements" : "Pause Announcements"}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          <Link
            href="/notices"
            className="hidden md:inline-flex items-center gap-1 text-sm text-[#B91C1C] hover:text-[#991B1B] font-heading font-bold transition-colors focus-visible:outline-2 focus-visible:outline-[#B91C1C] rounded-md px-1.5 py-1 min-h-[40px]"
          >
            <span>All Notices</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
