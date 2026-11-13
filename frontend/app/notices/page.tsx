import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { NOTICES_DATA } from "@/lib/school-data";
import { getPublicNotices } from "@/lib/api/notices";
import { FileText, Download, Calendar, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Notices & Official Circulars | Devasthaly Vidyapeeth",
  description:
    "Official school circulars, CBSE announcements, examination schedules, and urgent notices from Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

/**
 * Deterministic skeleton fallback for the public Notices & Circulars list.
 * Matches exact card dimensions, iconography wrapper, and reserved spacing with zero dynamic values.
 */
function NoticesListFallback() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading official notices">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-4 flex-1 w-full sm:w-auto">
            <div className="p-3.5 rounded-2xl bg-gray-100 shrink-0 border border-gray-200">
              <div className="w-6 h-6 bg-gray-200 rounded" />
            </div>
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-5 bg-gray-200 rounded-full w-24" />
                <div className="h-4 bg-gray-100 rounded w-28" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-4/5 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-3/5" />
            </div>
          </div>
          <div className="shrink-0 w-36 h-10 bg-gray-100 rounded-full border border-gray-200" />
        </div>
      ))}
    </div>
  );
}

/**
 * Async server component to fetch and stream the notices list.
 */
async function NoticesListSection() {
  const { notices } = await getPublicNotices();
  const displayNotices = notices && notices.length > 0 ? notices : NOTICES_DATA;

  return (
    <div className="space-y-4">
      {displayNotices.map((notice) => {
        const hasDirectFile = Boolean(notice.fileUrl);

        return (
          <div
            key={notice.id}
            className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-red-50 text-[#B91C1C] shrink-0 border border-red-100/60 shadow-2xs group-hover:bg-[#B91C1C] group-hover:text-white transition-colors duration-300">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-sm font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full border border-gray-200">
                    {notice.category}
                  </span>
                  {notice.isNew && (
                    <span className="bg-[#B91C1C] text-white text-sm font-extrabold px-2 py-0.5 rounded-full uppercase shadow-2xs">
                      New
                    </span>
                  )}
                  <span className="text-sm text-gray-500 font-sans flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#B91C1C]" />
                    {notice.date}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-[#111827] group-hover:text-[#B91C1C] transition-colors">
                  {notice.title}
                </h3>
                {notice.summary && (
                  <p className="text-sm text-gray-600 font-sans mt-1 leading-relaxed">
                    {notice.summary}
                  </p>
                )}
                {notice.fileSize && (
                  <p className="text-sm text-gray-400 font-sans mt-0.5">
                    Attachment size: {notice.fileSize}
                  </p>
                )}
              </div>
            </div>

            {hasDirectFile ? (
              <a
                href={notice.fileUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-bold transition-all shadow-xs hover:shadow-md border border-[#991B1B] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2"
                aria-label={`Download document for ${notice.title}`}
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download PDF</span>
              </a>
            ) : (
              <Link
                href="/downloads"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-bold transition-all shadow-xs hover:shadow-md border border-[#991B1B] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Downloads Desk</span>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function NoticesPage() {
  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Edunex Page Header */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-heading font-bold bg-red-50 text-[#B91C1C] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Students &amp; Parents / Circulars</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            Official Notices &amp; Circulars
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-2 max-w-3xl leading-relaxed font-sans">
            Stay updated with school schedules, exam dates, holiday notifications, and CBSE instructions.
          </p>
        </div>
      </div>

      <div className="site-container space-y-10">
        <Suspense fallback={<NoticesListFallback />}>
          <NoticesListSection />
        </Suspense>
      </div>
    </div>
  );
}
