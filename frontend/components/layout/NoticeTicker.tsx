import React from "react";
import { NOTICES_DATA } from "@/lib/school-data";
import { getPublicNotices } from "@/lib/api/notices";
import { NoticeTickerClient } from "./NoticeTickerClient";

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
