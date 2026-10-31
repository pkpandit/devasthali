import React from "react";
import type { Metadata } from "next";
import { Download, FileText, Sparkles, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Downloads & Entrance Examination Results | Devasthaly Vidyapeeth",
  description:
    "Official downloads hub for Devasthaly Vidyapeeth, Chilkahar, Ballia. Download school prospectus, 2026 entrance exam results for Class XI and LKG to IX, and annual calendar.",
};

export default function DownloadsPage() {
  const downloadSections = [
    {
      category: "School Prospectus & Fee Charts",
      docs: [
        { title: "Official School Prospectus (Session 2026–27)", size: "5.6 MB", file: "/documents/original/prospectus-2.pdf" },
        { title: "New Admission Fee Chart 2026–27", size: "722 KB", file: "/documents/original/new-admission-chart-2026-27.pdf" },
        { title: "Annual Holidays & Academic Calendar", size: "541 KB", file: "/documents/original/holydays-calender-2025-26.pdf" },
      ],
    },
    {
      category: "Entrance Examination Results (Session 2026–27)",
      docs: [
        { title: "Result of Entrance Exam held on 29.03.2026 Class – XI", size: "145 KB", file: "/documents/original/entrance-2026-29th-march-2026-class-11.pdf" },
        { title: "Result of Entrance Exam held on 29.03.2026 Class – LKG to IX", size: "262 KB", file: "/documents/original/entrance-2026-29th-march-2026-lkg-to-9th.pdf" },
        { title: "Result of Entrance Exam held on 15.03.2026 Class – XI", size: "233 KB", file: "/documents/original/class-11-entrance-2026-15th-march-2026.pdf" },
        { title: "Result of Entrance Exam held on 15.03.2026 Class – LKG to IX", size: "282 KB", file: "/documents/original/class-lkg-to-9-entrance-2026-15th-march-2026.pdf" },
        { title: "Result of Entrance Exam held on 22.02.2026", size: "360 KB", file: "/documents/original/entrance-2026-22nd-feb-2026.pdf" },
      ],
    },
    {
      category: "CBSE Statutory Compliance Documents",
      docs: [
        { title: "Mandatory Public Disclosure (Appendix IX Format)", size: "970 KB", file: "/documents/original/general-information-1.pdf" },
        { title: "CBSE Affiliation Extension / Upgradation Letter", size: "152 KB", file: "/documents/original/affliation-certificate-2025.pdf" },
        { title: "Society & Trust Registration Certificate", size: "95 KB", file: "/documents/original/trustsociety.pdf" },
        { title: "Building Safety Certificate (National Building Code)", size: "237 KB", file: "/documents/original/building-safety.pdf" },
        { title: "Fire Safety Compliance Certificate", size: "286 KB", file: "/documents/original/fire-service-_-uttar-pradesh-3.pdf" },
        { title: "Safe Drinking Water & Sanitary Certificate", size: "253 KB", file: "/documents/original/health1_health2_merged-1.pdf" },
      ],
    },
  ];

  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Full-Width White Edunex Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>Students & Parents / Downloads</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            Downloads &amp; Public Records
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Official downloads repository of Devasthaly Vidyapeeth, Chilkahar, Ballia. Access the 2026–27 prospectus, entrance test results, and compliance certificates.
          </p>
        </div>
      </div>

      <div className="site-container space-y-10">
        {downloadSections.map((section, idx) => (
          <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
            <h2 className="font-heading text-xl font-bold text-[#111827] flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#B91C1C]" />
              </div>
              <span>{section.category}</span>
            </h2>

            <div className="space-y-3">
              {section.docs.map((doc, dIdx) => (
                <div
                  key={dIdx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#F3F4F6] border border-gray-200/90 hover:border-red-300 hover:shadow-2xs transition-all gap-3 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-[#B91C1C] flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#B91C1C] group-hover:text-white transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-[#111827] group-hover:text-[#B91C1C] transition-colors">
                        {doc.title}
                      </h3>
                      <span className="text-sm text-gray-500 font-sans">PDF Document • {doc.size}</span>
                    </div>
                  </div>

                  <a
                    href={doc.file}
                    download
                    aria-label={`Download ${doc.title} (${doc.size})`}
                    className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-heading font-bold transition-all shadow-xs hover:shadow-md border border-[#991B1B] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#B91C1C]"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>Download PDF</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
