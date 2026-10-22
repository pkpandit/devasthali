import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SCHOOL_INFO, FAQ_DATA } from "@/lib/school-data";
import { AdmissionEnquiryForm } from "@/components/AdmissionEnquiryForm";
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
  title: "Admissions 2025–26 (LKG to Class XI) | CBSE Ballia",
  description:
    "Apply for admission at Devasthaly Vidyapeeth, Chilkahar, Ballia for the 2025–26 session. Day-scholar and residential boarding options. Download prospectus and fee structure.",
};

export default function AdmissionsPage() {
  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-12">
        {/* Header */}
        <div className="border-b border-[#E5E7EB] pb-8 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Admissions / Session 2025–26
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#111827]">
            Admissions Open for Session 2025–26
          </h1>
          <p className="text-sm sm:text-base text-[#4B5563] mt-2 max-w-3xl leading-relaxed">
            Welcoming bright young minds from Foundational LKG to Senior Secondary Class XI (Science, Commerce, and Humanities). Limited seats available for Day-Scholars and Boarding Scholars.
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              href="/admissions/procedure"
              className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-bold hover:bg-[#4338CA] transition-colors shadow-xs border border-[#4338CA]"
            >
              View 4-Step Admission Procedure
            </Link>
            <Link
              href="/admissions/fees"
              className="px-4 py-2 rounded-xl bg-white text-[#111827] border border-[#E5E7EB] text-xs font-bold hover:bg-[#4F46E5] hover:text-white hover:border-[#4F46E5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 transition-[color,background-color,border-color] duration-150 shadow-xs"
            >
              Download Fee Structure
            </Link>
            <Link
              href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}?text=Hello%20Devasthaly%20Vidyapeeth,%20I%20want%20to%20enquire%20about%20admission%202025-26.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1ebd5b] transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Helpdesk
            </Link>
          </div>
        </div>

        {/* 4-Step Admission Journey */}
        <div className="bg-white p-8 rounded-2xl shadow-md space-y-6">
          <h2 className="font-heading text-2xl font-bold text-[#111827]">
            The 4-Step Parent Admission Journey
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Online Enquiry",
                desc: "Submit the quick form below or send a WhatsApp message to receive the 2025–26 prospectus.",
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
              <div key={st.step} className="p-4 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex flex-col justify-between">
                <div>
                  <span className="font-heading font-black text-2xl text-[#4F46E5]">{st.step}</span>
                  <h3 className="font-heading font-bold text-base text-[#111827] mt-1 mb-1">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Criteria & Eligibility Table */}
        <div className="bg-white p-8 rounded-2xl shadow-md space-y-4">
          <h2 className="font-heading text-2xl font-bold text-[#111827]">
            Age Criteria & Eligibility Table (Session 2025–26)
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563]">
            Age is calculated as on <strong>31st March 2025</strong> in compliance with CBSE & National Education Policy guidelines:
          </p>

          <div className="overflow-x-auto border border-[#E5E7EB] rounded-xl">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-[#111827] text-white">
                <tr>
                  <th className="py-3 px-4 font-bold">Class / Grade</th>
                  <th className="py-3 px-4 font-bold">Required Age (as of 31 March 2025)</th>
                  <th className="py-3 px-4 font-bold">Evaluation Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[#374151]">
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3 px-4 font-bold text-[#111827]">LKG / Nursery</td>
                  <td className="py-3 px-4">3 to 4 Years</td>
                  <td className="py-3 px-4">Informal Parent-Child Observation</td>
                </tr>
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3 px-4 font-bold text-[#111827]">UKG / KG</td>
                  <td className="py-3 px-4">4 to 5 Years</td>
                  <td className="py-3 px-4">Basic Learning Readiness Assessment</td>
                </tr>
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3 px-4 font-bold text-[#111827]">Class I</td>
                  <td className="py-3 px-4">6+ Years (NEP Mandate)</td>
                  <td className="py-3 px-4">Oral & Written Readiness</td>
                </tr>
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3 px-4 font-bold text-[#111827]">Classes II to VIII</td>
                  <td className="py-3 px-4">Age commensurate with grade</td>
                  <td className="py-3 px-4">Written Aptitude Test (English & Mathematics)</td>
                </tr>
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3 px-4 font-bold text-[#111827]">Class IX & X</td>
                  <td className="py-3 px-4">13+ / 14+ Years</td>
                  <td className="py-3 px-4">Diagnostic Test (Eng, Math, Sci) & Previous Marksheet</td>
                </tr>
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3 px-4 font-bold text-[#111827]">Class XI (Sci/Com/Hum)</td>
                  <td className="py-3 px-4">Class X Board Qualified</td>
                  <td className="py-3 px-4">Class X Board Percentage & Stream Aptitude Counselling</td>
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
        <div className="bg-white p-8 rounded-2xl space-y-4 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-[#4F46E5]" />
            <span>Common Admission Questions</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-[#111827]">
            Frequently Asked Admission Questions
          </h2>
          <div className="space-y-3 pt-2">
            {FAQ_DATA.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-xl border border-[#E5E7EB] hover:border-[#4F46E5] open:border-[#4F46E5] p-4 transition-all"
              >
                <summary className="font-bold text-sm text-[#111827] cursor-pointer list-none flex items-center justify-between">
                  <span>{faq.question}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="text-xs sm:text-sm text-[#4B5563] mt-2 pt-2 border-t border-[#E5E7EB] leading-relaxed">
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
