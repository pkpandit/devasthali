import React from "react";
import type { Metadata } from "next";
import { Sparkles, Download } from "lucide-react";
import {
  MANDATORY_GENERAL_INFO as generalInfo,
  MANDATORY_COMPLIANCE_DOCS as complianceDocs,
  MANDATORY_RESULTS_ACADEMICS as resultsAcademics,
  MANDATORY_STAFF_DETAILS as staffDetails,
  MANDATORY_INFRA_DETAILS as infraDetails,
} from "@/lib/content/mandatory-disclosure";

export const metadata: Metadata = {
  title: "Mandatory Public Disclosure | Devasthaly Vidyapeeth",
  description:
    "CBSE Mandatory Public Disclosure (Appendix IX) for Devasthaly Vidyapeeth, Chilkahar, Ballia. Affiliation No. 2130238, School Code 70184. General information, compliance certificates, staff, and results.",
};

export default function MandatoryPublicDisclosurePage() {
  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Full-Width White Edunex Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>CBSE Statutory Compliance</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            Mandatory Public Disclosure
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            In compliance with CBSE Circular Appendix IX norms, all statutory institutional information, compliance certificates, staff matrix, and academic results are published below.
          </p>
        </div>
      </div>

      <div className="site-container space-y-10">
        {/* Table A: General Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#111827] flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center text-sm font-bold">A</span>
            <span>GENERAL INFORMATION</span>
          </h2>
          <div
            className="overflow-x-auto border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B91C1C]"
            role="region"
            aria-label="General Information Table (Scrollable)"
            tabIndex={0}
          >
            <table className="w-full text-sm text-left">
              <caption className="sr-only">Table A: General Information</caption>
              <thead className="bg-[#111827] text-white">
                <tr>
                  <th scope="col" className="py-3 px-4 font-heading font-bold w-16">S.NO</th>
                  <th scope="col" className="py-3 px-4 font-heading font-bold">INFORMATION</th>
                  <th scope="col" className="py-3 px-4 font-heading font-bold">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-sans text-gray-800">
                {generalInfo.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F3F4F6] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#111827]">{row.sno}</td>
                    <td className="py-3 px-4 font-medium text-gray-700">{row.info}</td>
                    <td className="py-3 px-4 font-bold text-[#111827]">{row.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table B: Documents & Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#111827] flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center text-sm font-bold">B</span>
            <span>DOCUMENTS AND INFORMATION</span>
          </h2>
          <div
            className="overflow-x-auto border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B91C1C]"
            role="region"
            aria-label="Documents and Information Table (Scrollable)"
            tabIndex={0}
          >
            <table className="w-full text-sm text-left">
              <caption className="sr-only">Table B: Documents and Compliance Certificates</caption>
              <thead className="bg-[#111827] text-white">
                <tr>
                  <th scope="col" className="py-3 px-4 font-heading font-bold w-16">S.NO</th>
                  <th scope="col" className="py-3 px-4 font-heading font-bold">DOCUMENTS / INFORMATION</th>
                  <th scope="col" className="py-3 px-4 font-heading font-bold text-right w-44">UPLOADED DOCUMENTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-sans text-gray-800">
                {complianceDocs.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F3F4F6] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#111827]">{row.sno}</td>
                    <td className="py-3 px-4 font-medium text-gray-700">{row.doc}</td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={row.file}
                        download
                        aria-label={`Download ${row.doc} PDF`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#B91C1C] text-white text-sm font-heading font-bold hover:bg-[#991B1B] transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-[#B91C1C]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>VIEW/DOWNLOAD</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table C: Results and Academics */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#111827] flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center text-sm font-bold">C</span>
            <span>RESULTS AND ACADEMICS</span>
          </h2>
          <div
            className="overflow-x-auto border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B91C1C]"
            role="region"
            aria-label="Results and Academics Table (Scrollable)"
            tabIndex={0}
          >
            <table className="w-full text-sm text-left">
              <caption className="sr-only">Table C: Results and Academic Documents</caption>
              <thead className="bg-[#111827] text-white">
                <tr>
                  <th scope="col" className="py-3 px-4 font-heading font-bold w-16">S.NO</th>
                  <th scope="col" className="py-3 px-4 font-heading font-bold">DOCUMENTS / INFORMATION</th>
                  <th scope="col" className="py-3 px-4 font-heading font-bold text-right w-44">UPLOADED DOCUMENTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-sans text-gray-800">
                {resultsAcademics.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F3F4F6] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#111827]">{row.sno}</td>
                    <td className="py-3 px-4 font-medium text-gray-700">{row.doc}</td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={row.file}
                        download
                        aria-label={`Download ${row.doc} PDF`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#B91C1C] text-white text-sm font-heading font-bold hover:bg-[#991B1B] transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-[#B91C1C]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>VIEW/DOWNLOAD</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Result Class X Table */}
          <div className="pt-4 space-y-2">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#111827]">
              RESULT CLASS X
            </h3>
            <div
              className="overflow-x-auto border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B91C1C]"
              role="region"
              aria-label="Result Class X Table (Scrollable)"
              tabIndex={0}
            >
              <table className="w-full text-sm text-left">
                <caption className="sr-only">CBSE Board Examination Class X Results</caption>
                <thead className="bg-[#111827] text-white">
                  <tr>
                    <th scope="col" className="py-2.5 px-4 font-heading font-bold">S.NO.</th>
                    <th scope="col" className="py-2.5 px-4 font-heading font-bold">YEAR</th>
                    <th scope="col" className="py-2.5 px-4 font-heading font-bold">NO. OF REGISTERED STUDENTS</th>
                    <th scope="col" className="py-2.5 px-4 font-heading font-bold">NO. OF STUDENTS PASSED</th>
                    <th scope="col" className="py-2.5 px-4 font-heading font-bold">PASS PERCENTAGE</th>
                    <th scope="col" className="py-2.5 px-4 font-heading font-bold">REMARKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-sans text-gray-800">
                  <tr className="hover:bg-[#F3F4F6]">
                    <td className="py-3 px-4 font-bold">1</td>
                    <td className="py-3 px-4 font-bold text-[#B91C1C]">2025-26</td>
                    <td className="py-3 px-4">288</td>
                    <td className="py-3 px-4">288</td>
                    <td className="py-3 px-4 font-bold text-[#16A34A]">100%</td>
                    <td className="py-3 px-4 text-gray-500">All Passed with Merit Ranks</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Table D: Staff Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#111827] flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center text-sm font-bold">D</span>
            <span>STAFF DETAIL</span>
          </h2>
          <div
            className="overflow-x-auto border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B91C1C]"
            role="region"
            aria-label="Staff Details Table (Scrollable)"
            tabIndex={0}
          >
            <table className="w-full text-sm text-left">
              <caption className="sr-only">Table D: Teaching Staff and Faculty Matrix</caption>
              <thead className="bg-[#111827] text-white">
                <tr>
                  <th scope="col" className="py-3 px-4 font-heading font-bold w-16">S.NO</th>
                  <th scope="col" className="py-3 px-4 font-heading font-bold">INFORMATION</th>
                  <th scope="col" className="py-3 px-4 font-heading font-bold">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-sans text-gray-800">
                {staffDetails.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F3F4F6] transition-colors">
                    <td className="py-2.5 px-4 font-bold text-[#111827]">{row.sno}</td>
                    <td className="py-2.5 px-4 font-medium text-gray-700">{row.info}</td>
                    <td className="py-2.5 px-4 font-bold text-[#111827]">{row.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table E: School Infrastructure */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#111827] flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center text-sm font-bold">E</span>
            <span>SCHOOL INFRASTRUCTURE</span>
          </h2>
          <div
            className="overflow-x-auto border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B91C1C]"
            role="region"
            aria-label="School Infrastructure Table (Scrollable)"
            tabIndex={0}
          >
            <table className="w-full text-sm text-left">
              <caption className="sr-only">Table E: School Campus and Infrastructure Details</caption>
              <thead className="bg-[#111827] text-white">
                <tr>
                  <th scope="col" className="py-3 px-4 font-heading font-bold w-16">SL NO.</th>
                  <th scope="col" className="py-3 px-4 font-heading font-bold">INFORMATION</th>
                  <th scope="col" className="py-3 px-4 font-heading font-bold">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-sans text-gray-800">
                {infraDetails.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F3F4F6] transition-colors">
                    <td className="py-2.5 px-4 font-bold text-[#111827]">{row.sno}</td>
                    <td className="py-2.5 px-4 font-medium text-gray-700">{row.info}</td>
                    <td className="py-2.5 px-4 font-bold text-[#111827]">{row.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


