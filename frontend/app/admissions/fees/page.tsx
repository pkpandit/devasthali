import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Download, Sparkles, FileText, AlertCircle } from "lucide-react";
import { getPublicAdmissionsPublications } from "@/lib/api/admissions-publications";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPublicAdmissionsPublications();
  const session = data.overview?.sessionLabel ?? "2026–27";

  return {
    title: `Fee Structure (Session ${session}) | Devasthaly Vidyapeeth`,
    description: `Official statutory fee schedule for session ${session} at Devasthaly Vidyapeeth, Chilkahar, Ballia. Verified charts for day-scholars and boarding students across all classes.`,
  };
}

export default async function FeesProspectusPage() {
  const { overview, feePages } = await getPublicAdmissionsPublications();

  const session = overview?.sessionLabel ?? "2026–27";
  const title = overview?.feeStructureTitle ?? `Fee Structure (Session ${session})`;
  const subtitle =
    overview?.feeStructureSubtitle ??
    "Official statutory fee schedule and prospectus for Devasthaly Vidyapeeth, Chilkahar, Ballia.";
  const prospectusPdf = overview?.prospectusPdfUrl ?? "/documents/original/prospectus-2.pdf";
  const prospectusLabel = overview?.prospectusDisplayLabel ?? "Prospectus PDF (5.6 MB)";
  const chartPdf = overview?.admissionChartPdfUrl ?? "/documents/original/new-admission-chart-2026-27.pdf";
  const chartLabel = overview?.admissionChartDisplayLabel ?? "Admission Chart (722 KB)";

  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Full-Width White Edunex Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>Admissions / Fee Transparency</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            {title}
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="site-container space-y-10">
        {/* Prospectus & Chart Download Bar */}
        <div className="bg-[#111827] text-white p-7 sm:p-10 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-gray-800 shadow-xl">
          <div>
            <span className="text-sm font-heading font-bold text-[#F4CD13] uppercase tracking-wider">
              Official Downloads
            </span>
            <h2 className="font-heading text-2xl font-bold mt-1">
              Download Complete School Prospectus &amp; Fee Chart
            </h2>
            <p className="text-base text-gray-300 mt-1 font-sans">
              Official PDF copy of the {session} Prospectus and New Admission Fee Chart.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={prospectusPdf}
              download
              className="px-6 py-3.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-heading font-bold text-sm uppercase tracking-wider rounded-full transition-all duration-300 flex items-center gap-2 shadow-md border border-[#991B1B] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              <Download className="w-4 h-4" />
              <span>{prospectusLabel}</span>
            </a>
            <a
              href={chartPdf}
              download
              className="px-6 py-3.5 bg-white text-[#111827] border border-[#E5E7EB] hover:bg-[#B91C1C] hover:text-white hover:border-[#B91C1C] [&_svg]:transition-colors [&_svg]:duration-150 hover:[&_svg]:text-white font-heading font-bold text-sm uppercase tracking-wider rounded-full transition-all duration-300 flex items-center gap-2 shadow-md hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              <FileText className="w-4 h-4 text-[#B91C1C]" />
              <span>{chartLabel}</span>
            </a>
          </div>
        </div>

        {/* Official Fee Structure Scanned Pages */}
        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm text-left">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#111827] mb-2">
              Official Fee Structure Charts ({session})
            </h2>
            <p className="text-base text-gray-600 font-sans">
              Verified statutory fee schedules for all grades and categories as approved by the school management committee:
            </p>
          </div>

          {feePages.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-200/90 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#111827]">
                Fee Structure Charts Currently Updating
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto font-sans leading-relaxed">
                The fee schedule charts for Session {session} are currently being finalized. Please download the prospectus or contact our admissions desk for current quarterly dues.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {feePages.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/90 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between px-2">
                    <span className="font-heading font-bold text-sm text-[#111827]">
                      {item.title}
                    </span>
                    <a
                      href={item.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-heading font-bold text-[#B91C1C] hover:underline"
                    >
                      Open Full Size ↗
                    </a>
                  </div>
                  <div className="relative w-full aspect-[1024/791] rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="100vw"
                      className="object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
