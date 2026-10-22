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
      className="w-full bg-[#F3F4F6] text-[#111827] text-xs sm:text-sm py-2 border-b border-[#E5E7EB] shadow-xs"
      role="region"
      aria-label="Latest Announcements and Urgent Notices"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold shrink-0 text-white bg-[#4F46E5] px-2.5 py-1 rounded-md text-xs uppercase tracking-wider shadow-xs">
          <Bell className="w-3.5 h-3.5 text-white" />
          <span>Latest Updates</span>
        </div>

        <div
          className="flex-1 overflow-hidden mx-3 sm:mx-6"
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
                className="inline-flex items-center gap-2 hover:underline hover:text-[#4F46E5] transition-colors"
              >
                {notice.isNew && (
                  <span className="bg-[#4F46E5] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    New
                  </span>
                )}
                <span className="text-[#111827] font-semibold">{notice.title}</span>
                <span className="text-gray-500 text-xs">({notice.date})</span>
                {idx < activeNotices.length - 1 && (
                  <span className="text-gray-300 ml-4 font-bold">•</span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="text-gray-500 hover:text-[#111827] p-1 rounded hover:bg-gray-200 transition-colors"
            title={isPaused ? "Resume Ticker" : "Pause Ticker"}
            aria-label={isPaused ? "Resume Announcements" : "Pause Announcements"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          <Link
            href="/notices"
            className="hidden md:inline-flex items-center gap-1 text-xs text-[#4F46E5] hover:text-[#4338CA] font-bold transition-colors"
          >
            <span>All Notices</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
