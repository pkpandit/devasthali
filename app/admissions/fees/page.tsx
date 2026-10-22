import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Download, CreditCard, ShieldCheck, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Fee Structure & Prospectus 2025–26 | Devasthaly Vidyapeeth",
  description:
    "Transparent annual fee structure, payment schedule, and prospectus download for day-scholars and boarding students at Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default function FeesProspectusPage() {
  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-10">
        <div className="border-b border-[#E5E7EB] pb-6 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Admissions / Transparency
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#111827]">
            Fee Structure & Prospectus (Session 2025–26)
          </h1>
          <p className="text-sm text-[#4B5563] mt-2">
            Devasthaly Vidyapeeth maintains full financial transparency in compliance with Uttar Pradesh Self-Financed Independent Schools (Fee Regulation) Act.
          </p>
        </div>

        {/* Prospectus Download Box */}
        <div className="bg-[#111827] text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-gray-800 shadow-md">
          <div>
            <span className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider">
              Official Document
            </span>
            <h2 className="font-heading text-2xl font-bold mt-1">
              Download Complete School Prospectus 2025–26
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              Includes comprehensive curriculum details, code of conduct, hostel routines, and fee breakdown.
            </p>
          </div>
          <Link
            href="/downloads"
            className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shrink-0 flex items-center gap-2 shadow-xs border border-[#4338CA]"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Download PDF (2.4 MB)</span>
          </Link>
        </div>

        {/* Indicative Fee Slabs Table */}
        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#111827]">
            Tuition & Composite Fee Slabs (Indicative)
          </h2>
          <p className="text-xs text-[#4B5563]">
            * Payable in four quarterly installments (April, July, October, January).
          </p>

          <div className="overflow-x-auto border border-[#E5E7EB] rounded-xl">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-[#111827] text-white">
                <tr>
                  <th className="py-3 px-4 font-bold">Grade Level</th>
                  <th className="py-3 px-4 font-bold">One-time Admission Fee</th>
                  <th className="py-3 px-4 font-bold">Quarterly Composite Tuition</th>
                  <th className="py-3 px-4 font-bold">Annual Exam & Lab Charges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[#374151]">
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3 px-4 font-semibold text-[#111827]">LKG & UKG</td>
                  <td className="py-3 px-4">₹ 4,500</td>
                  <td className="py-3 px-4">₹ 3,600 / quarter</td>
                  <td className="py-3 px-4">₹ 1,200 / year</td>
                </tr>
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3 px-4 font-semibold text-[#111827]">Classes I to V</td>
                  <td className="py-3 px-4">₹ 5,500</td>
                  <td className="py-3 px-4">₹ 4,200 / quarter</td>
                  <td className="py-3 px-4">₹ 1,500 / year</td>
                </tr>
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3 px-4 font-semibold text-[#111827]">Classes VI to VIII</td>
                  <td className="py-3 px-4">₹ 6,500</td>
                  <td className="py-3 px-4">₹ 5,100 / quarter</td>
                  <td className="py-3 px-4">₹ 1,800 / year</td>
                </tr>
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3 px-4 font-semibold text-[#111827]">Classes IX & X</td>
                  <td className="py-3 px-4">₹ 7,500</td>
                  <td className="py-3 px-4">₹ 6,300 / quarter</td>
                  <td className="py-3 px-4">₹ 2,400 / year</td>
                </tr>
                <tr className="hover:bg-[#F3F4F6]">
                  <td className="py-3 px-4 font-semibold text-[#111827]">Classes XI & XII (Sci / Com / Hum)</td>
                  <td className="py-3 px-4">₹ 8,500</td>
                  <td className="py-3 px-4">₹ 7,800 / quarter</td>
                  <td className="py-3 px-4">₹ 3,200 / year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Boarding Fee Note */}
        <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl text-xs sm:text-sm text-[#111827] space-y-2 shadow-xs">
          <strong className="block text-[#111827] font-heading text-base">
            Residential Boarding & Mess Charges:
          </strong>
          <p className="text-[#4B5563] leading-relaxed">
            Boarding fee includes air-cooled accommodation, 4 pure vegetarian meals per day, 24/7 laundry, evening supervised coaching, sports kit usage, and emergency infirmary coverage. Please contact the admissions office at <strong>+91 94500 12345</strong> for the current boarding fee breakdown.
          </p>
        </div>
      </div>
    </div>
  );
}
