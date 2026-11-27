import React from "react";
import type { Metadata } from "next";
import { Sparkles, Download, FileText } from "lucide-react";
import {
  MANDATORY_GENERAL_INFO as generalInfo,
  MANDATORY_STAFF_DETAILS as staffDetails,
  MANDATORY_INFRA_DETAILS as infraDetails,
} from "@/lib/content/mandatory-disclosure";
import { getPublicMandatoryDisclosure } from "@/lib/api/mandatory-disclosure";

export const metadata: Metadata = {
  title: "Mandatory Public Disclosure | Devasthaly Vidyapeeth",
  description:
    "CBSE Mandatory Public Disclosure (Appendix IX) for Devasthaly Vidyapeeth, Chilkahar, Ballia. Affiliation No. 2130238, School Code 70184. General information, compliance certificates, staff, and results.",
};

export default async function MandatoryPublicDisclosurePage() {
  const dynamicSections = await getPublicMandatoryDisclosure();
  const hasResultsSection = dynamicSections.some((s) =>
    s.title.toUpperCase().includes("RESULT")
  );

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

        {/* Dynamic Compliance Sections or Authoritative Empty State */}
        {dynamicSections.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-[#B91C1C]" />
            </div>
            <h2 className="font-heading text-xl font-bold text-[#111827]">
              No Compliance Documents Currently Published
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Mandatory compliance certificates and academic documents will be updated shortly. Please check back later or contact the school office.
            </p>
          </div>
        ) : (
          dynamicSections.map((section, sIdx) => {
            const letter = String.fromCharCode(66 + sIdx); // 0 -> B, 1 -> C, ...
            const isResults = section.title.toUpperCase().includes("RESULT");

            return (
              <div
                key={section.id || sIdx}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-4"
              >
                <h2 className="font-heading text-xl font-bold text-[#111827] flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center text-sm font-bold">
                    {letter}
                  </span>
                  <span>{section.title}</span>
                </h2>

                {section.description && (
                  <p className="text-sm text-gray-600 font-sans">{section.description}</p>
                )}

                <div
                  className="overflow-x-auto border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B91C1C]"
                  role="region"
                  aria-label={`${section.title} Table (Scrollable)`}
                  tabIndex={0}
                >
                  <table className="w-full text-sm text-left">
                    <caption className="sr-only">
                      Table {letter}: {section.title}
                    </caption>
                    <thead className="bg-[#111827] text-white">
                      <tr>
                        <th scope="col" className="py-3 px-4 font-heading font-bold w-16 whitespace-nowrap">
                          S.NO
                        </th>
                        <th scope="col" className="py-3 px-4 font-heading font-bold min-w-[200px]">
                          DOCUMENTS / INFORMATION
                        </th>
                        <th scope="col" className="py-3 px-4 font-heading font-bold text-right whitespace-nowrap w-52 sm:w-56">
                          UPLOADED DOCUMENTS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-sans text-gray-800">
                      {section.documents.map((doc, dIdx) => (
                        <tr key={doc.id || dIdx} className="hover:bg-[#F3F4F6] transition-colors">
                          <td className="py-3 px-4 font-bold text-[#111827] w-16 whitespace-nowrap">{dIdx + 1}</td>
                          <td className="py-3 px-4 font-medium text-gray-700 min-w-[200px]">
                            <div className="break-words">{doc.title}</div>
                            {doc.description && (
                              <div className="text-xs text-gray-500 mt-0.5 break-words">{doc.description}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <a
                              href={doc.fileUrl}
                              download
                              aria-label={`Download ${doc.title} PDF`}
                              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#B91C1C] text-white text-sm font-heading font-bold hover:bg-[#991B1B] transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-[#B91C1C] whitespace-nowrap shrink-0"
                            >
                              <Download className="w-3.5 h-3.5 shrink-0" />
                              <span className="whitespace-nowrap">{doc.linkLabel || "VIEW/DOWNLOAD"}</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* If this is the Results and Academics section, embed Result Class X table */}
                {isResults && (
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
                )}
              </div>
            );
          })
        )}

        {/* If no dynamic section matched RESULTS, preserve Result Class X standalone */}
        {!hasResultsSection && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
            <h2 className="font-heading text-xl font-bold text-[#111827] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center text-sm font-bold">C</span>
              <span>RESULT CLASS X</span>
            </h2>
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
        )}

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
