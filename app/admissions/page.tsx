import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SCHOOL_INFO, FAQ_DATA } from "@/lib/school-data";
import { AdmissionEnquiryForm } from "@/components/features/admissions/AdmissionEnquiryForm";
import {
  Sparkles,
  Download,
  CheckCircle2,
  Phone,
  MessageCircle,
  FileText,
  Calendar,
  Clock,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Admissions 2026–27 (LKG to Class XI) | CBSE Ballia",
  description:
    "Apply for admission at Devasthaly Vidyapeeth, Chilkahar, Ballia for the 2026–27 session. Day-scholar and residential boarding options. Download prospectus and fee structure.",
};

export default function AdmissionsPage() {
  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Edunex Page Header */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-heading font-bold bg-red-50 text-[#B91C1C] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Admissions / Session 2026–27</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            Admissions Open for Session 2026–27
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-2 max-w-3xl leading-relaxed font-sans">
            Welcoming bright young minds from Foundational LKG to Senior Secondary Class XI (Science, Commerce, and Humanities). Limited seats available for Day-Scholars and Boarding Scholars.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/admissions/procedure"
              className="px-6 py-2.5 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-heading font-bold uppercase tracking-wider transition-colors shadow-xs hover:shadow-md border border-[#991B1B] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2"
            >
              View 4-Step Admission Procedure
            </Link>
            <Link
              href="/admissions/fees"
              className="px-6 py-2.5 rounded-full bg-white text-[#111827] border border-[#E5E7EB] text-sm font-heading font-bold uppercase tracking-wider hover:bg-[#B91C1C] hover:text-white hover:border-[#B91C1C] focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2 transition-colors shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
            >
              Download Fee Structure
            </Link>
            <Link
              href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}?text=Hello%20Devasthaly%20Vidyapeeth,%20I%20want%20to%20enquire%20about%20admission%202026-27.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-full bg-[#25D366] text-white text-sm font-heading font-bold uppercase tracking-wider hover:bg-[#1ebd5b] transition-colors inline-flex items-center gap-1.5 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#25D366] focus-visible:outline-offset-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Helpdesk
            </Link>
          </div>
        </div>
      </div>

      <div className="site-container space-y-10">

        {/* 4-Step Admission Journey (Edunex Steps Archetype) */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/90 shadow-xs space-y-6">
          <div className="text-left">
            <span className="text-sm font-bold text-[#B91C1C] uppercase tracking-wider bg-red-50 border border-red-100/60 px-3 py-1 rounded-full inline-block mb-2">
              Step-by-Step Flow
            </span>
            <h2 className="font-heading text-2xl sm:text-[30px] sm:leading-[40px] lg:text-[35px] lg:leading-[47px] font-semibold text-[#111827]">
              The 4-Step Parent Admission Journey
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Online Enquiry",
                desc: "Submit the quick form below or send a WhatsApp message to receive the 2026–27 prospectus.",
              },
              {
                step: "02",
                title: "Campus Interaction",
                desc: "Visit our Chilkahar campus for an informal interaction (LKG-I) or diagnostic assessment (II-XI).",
              },
              {
                step: "03",
                title: "Document Verification",
                desc: "Verification of child's birth certificate, Aadhaar card, previous report cards, and transfer certificate.",
              },
              {
                step: "04",
                title: "Provisional Enrollment",
                desc: "Complete registration fee payment, uniform requisition, and hostel room allocation (for boarders).",
              },
            ].map((st) => (
              <div key={st.step} className="p-6 rounded-2xl bg-[#F3F4F6] border border-gray-200/90 hover:border-red-300 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center font-heading font-black text-lg mb-3 shadow-2xs border border-red-100/60">
                    {st.step}
                  </div>
                  <h3 className="font-heading font-bold text-base text-[#111827] mb-2">
                    {st.title}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed font-sans">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Criteria & Eligibility Table */}
        <div className="bg-white p-4 sm:p-10 rounded-3xl border border-gray-200/90 shadow-xs space-y-4">
          <h2 className="font-heading text-2xl font-bold text-[#111827]">
            Age Criteria & Eligibility Table (Session 2026–27)
          </h2>
          <p className="text-base text-gray-600 font-sans">
            Age is calculated as on <strong>31st March 2025</strong> in compliance with CBSE & National Education Policy guidelines:
          </p>

          <div className="overflow-x-auto border border-gray-200 rounded-2xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#111827] text-white">
                <tr>
                  <th className="py-3 px-4 font-bold font-heading">Class / Grade</th>
                  <th className="py-3 px-4 font-bold font-heading">Required Age (as of 31 March 2025)</th>
                  <th className="py-3 px-4 font-bold font-heading">Evaluation Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 font-sans">
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3.5 px-4 font-bold text-[#111827]">LKG / Nursery</td>
                  <td className="py-3.5 px-4">3 to 4 Years</td>
                  <td className="py-3.5 px-4">Informal Parent-Child Observation</td>
                </tr>
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3.5 px-4 font-bold text-[#111827]">UKG / KG</td>
                  <td className="py-3.5 px-4">4 to 5 Years</td>
                  <td className="py-3.5 px-4">Basic Learning Readiness Assessment</td>
                </tr>
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3.5 px-4 font-bold text-[#111827]">Class I</td>
                  <td className="py-3.5 px-4">6+ Years (NEP Mandate)</td>
                  <td className="py-3.5 px-4">Oral & Written Readiness</td>
                </tr>
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3.5 px-4 font-bold text-[#111827]">Classes II to VIII</td>
                  <td className="py-3.5 px-4">Age commensurate with grade</td>
                  <td className="py-3.5 px-4">Written Aptitude Test (English & Mathematics)</td>
                </tr>
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3.5 px-4 font-bold text-[#111827]">Class IX & X</td>
                  <td className="py-3.5 px-4">13+ / 14+ Years</td>
                  <td className="py-3.5 px-4">Diagnostic Test (Eng, Math, Sci) & Previous Marksheet</td>
                </tr>
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3.5 px-4 font-bold text-[#111827]">Class XI (Sci/Com/Hum)</td>
                  <td className="py-3.5 px-4">Class X Board Qualified</td>
                  <td className="py-3.5 px-4">Class X Board Percentage & Stream Aptitude Counselling</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Inline Enquiry Form */}
        <div id="enquiry" className="scroll-mt-24">
          <AdmissionEnquiryForm />
        </div>

        {/* Admissions FAQ */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#B91C1C] uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#B91C1C]" />
            <span>Common Admission Questions</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-[#111827]">
            Frequently Asked Admission Questions
          </h2>
          <div className="space-y-3 pt-2">
            {FAQ_DATA.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-2xl border border-gray-200 hover:border-[#B91C1C] open:border-[#B91C1C] p-5 transition-all"
              >
                <summary className="font-heading font-bold text-sm sm:text-base text-[#111827] cursor-pointer list-none flex items-center justify-between group-hover:text-[#B91C1C]">
                  <span>{faq.question}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="text-base text-gray-600 mt-3 pt-3 border-t border-gray-100 leading-relaxed font-sans">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
