import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, ShieldCheck, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Downloads & CBSE Mandatory Public Disclosure",
  description:
    "Official downloads hub for Devasthaly Vidyapeeth, Chilkahar, Ballia. Access CBSE mandatory disclosure, fee structure, transfer certificate forms, and academic calendars.",
};

export default function DownloadsPage() {
  const downloadItems = [
    {
      category: "CBSE Statutory Disclosures",
      docs: [
        { title: "CBSE Mandatory Public Disclosure (Appendix IX Format)", size: "3.8 MB" },
        { title: "CBSE Affiliation Extension Letter (No. 2130238)", size: "1.4 MB" },
        { title: "School Management Committee (SMC) Member List", size: "620 KB" },
        { title: "Building Safety & Fire Safety Compliance Certificates", size: "2.1 MB" },
        { title: "Water, Health & Sanitation Certificate", size: "780 KB" },
      ],
    },
    {
      category: "Admissions & Prospectus",
      docs: [
        { title: "Official Admission Prospectus & Brochure 2025–26", size: "2.4 MB" },
        { title: "Admission Registration Application Form", size: "950 KB" },
        { title: "Fee Schedule & Installment Policy 2025–26", size: "820 KB" },
        { title: "Hostel Rules, Mess Menu & Packing Checklist", size: "1.1 MB" },
      ],
    },
    {
      category: "Parent & Student Forms",
      docs: [
        { title: "Application for Transfer Certificate (TC) Issuance", size: "480 KB" },
        { title: "Annual Academic Calendar & Holiday Schedule 2025–26", size: "1.2 MB" },
        { title: "School Transport Route Map & Bus Stop Nodes", size: "1.6 MB" },
        { title: "Prescribed NCERT Textbooks & Uniform Matrix", size: "750 KB" },
      ],
    },
  ];

  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-10">
        <div className="border-b border-[#E5E7EB] pb-6 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Documents Desk / Repository
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#111827]">
            Downloads & Mandatory Public Disclosures
          </h1>
          <p className="text-sm text-[#4B5563] mt-2">
            In compliance with CBSE guidelines and right-to-information transparency norms, all official school documents and certificates are downloadable below.
          </p>
        </div>

        {downloadItems.map((section, idx) => (
          <div key={idx} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <h2 className="font-heading text-xl font-bold text-[#111827] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#4F46E5]" />
              <span>{section.category}</span>
            </h2>

            <div className="space-y-3">
              {section.docs.map((doc, dIdx) => (
                <div
                  key={dIdx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] hover:border-[#4F46E5] transition-all gap-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#4F46E5] shrink-0" />
                    <div>
                      <h3 className="font-medium text-xs sm:text-sm text-[#111827]">{doc.title}</h3>
                      <span className="text-[11px] text-gray-500">PDF Document • {doc.size}</span>
                    </div>
                  </div>

                  <a
                    href="#download"
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-colors shadow-xs border border-[#4338CA]"
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
