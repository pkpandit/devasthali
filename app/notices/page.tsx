import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { NOTICES_DATA } from "@/lib/school-data";
import { FileText, Download, Calendar, Bell, Filter } from "lucide-react";

export const metadata: Metadata = {
  title: "Notices & Official Circulars | Devasthaly Vidyapeeth",
  description:
    "Official school circulars, CBSE announcements, examination schedules, and urgent notices from Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default function NoticesPage() {
  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-8">
        <div className="border-b border-[#E5E7EB] pb-6 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Parent Desk / Circulars
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#111827]">
            Official Notices & Circulars
          </h1>
          <p className="text-sm text-[#4B5563] mt-2">
            Stay updated with school schedules, exam dates, holiday notifications, and CBSE instructions.
          </p>
        </div>

        {/* Notices List */}
        <div className="space-y-4">
          {NOTICES_DATA.map((notice) => (
            <div
              key={notice.id}
              className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#F3F4F6] text-[#4F46E5] shrink-0 border border-[#E5E7EB]">
                  <FileText className="w-6 h-6 text-[#4F46E5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F3F4F6] text-[#374151] px-2 py-0.5 rounded border border-[#E5E7EB]">
                      {notice.category}
                    </span>
                    {notice.isNew && (
                      <span className="bg-[#4F46E5] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                        New
                      </span>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#4F46E5]" />
                      {notice.date}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-[#111827]">
                    {notice.title}
                  </h3>
                  {notice.fileSize && (
                    <p className="text-xs text-gray-500 mt-0.5">Attachment size: {notice.fileSize}</p>
                  )}
                </div>
              </div>

              <Link
                href="/downloads"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-colors shadow-xs border border-[#4338CA]"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download PDF</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
