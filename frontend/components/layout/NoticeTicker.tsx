import React from "react";
import { Bell } from "lucide-react";
import { NOTICES_DATA } from "@/lib/school-data";
import { getPublicNotices } from "@/lib/api/notices";
import { NoticeTickerClient } from "./NoticeTickerClient";

/**
 * Deterministic skeleton fallback for the Global Announcements Ticker.
 * Matches exact container dimensions, badge, and reserved spacing with zero dynamic values.
 */
export function NoticeTickerFallback() {
  return (
    <div
      className="w-full bg-[#F3F4F6] text-[#111827] text-sm py-2 sm:py-2.5 border-b border-[#E5E7EB] shadow-xs min-h-[41px]"
      role="region"
      aria-label="Latest Announcements and Urgent Notices"
    >
      <div className="site-container flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-heading font-bold shrink-0 text-white bg-[#B91C1C] px-3 py-1 rounded-md text-xs sm:text-sm uppercase tracking-wider shadow-xs">
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          <span>Latest Updates</span>
        </div>

        <div className="flex-1 overflow-hidden mx-2 sm:mx-4 flex items-center">
          <div className="h-4 bg-gray-200/80 rounded w-48 sm:w-96 animate-pulse" />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-[40px] h-[40px] rounded-lg bg-gray-200/60 animate-pulse"
            aria-hidden="true"
          />
          <div
            className="hidden md:block w-20 h-5 bg-gray-200/60 rounded animate-pulse"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Server Component wrapper for the Global Announcements Ticker.
 * Fetches published notices once per server render with static fallback,
 * ensuring zero hydration layout shift and complete offline resilience.
 */
export async function NoticeTicker() {
  const { notices } = await getPublicNotices({ limit: 5 });
  const activeNotices = notices && notices.length > 0 ? notices.slice(0, 4) : NOTICES_DATA.slice(0, 4);

  return <NoticeTickerClient notices={activeNotices} />;
}
