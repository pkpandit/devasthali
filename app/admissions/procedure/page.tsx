import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, FileText, ArrowRight, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Admission Procedure & Required Documents 2025–26",
  description:
    "Step-by-step admission procedure and mandatory document checklist for Devasthaly Vidyapeeth, Chilkahar, Ballia. Guidelines for day-scholars and boarding admissions.",
};

export default function AdmissionProcedurePage() {
  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-10">
        <div className="border-b border-[#E5E7EB] pb-6 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Admissions / Guidelines
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#111827]">
            Step-by-Step Admission Procedure 2025–26
          </h1>
          <p className="text-sm text-[#4B5563] mt-2">
            A transparent and parent-friendly guide to securing enrollment at Devasthaly Vidyapeeth, Chilkahar, Ballia.
          </p>
        </div>

        {/* The 4 Detailed Steps */}
        <div className="space-y-6">
          {[
            {
              num: "Step 1",
              title: "Procurement of Registration Form & Prospectus",
              details:
                "Parents can obtain the official School Prospectus and Admission Form either directly from the school administrative office in Chilkahar or submit an initial application via our Online Enquiry portal. A nominal registration fee applies.",
            },
            {
              num: "Step 2",
              title: "Aptitude Assessment & Informal Interaction",
              details:
                "For Foundational classes (LKG to Class I), an informal interaction is conducted to assess social readiness, motor coordination, and curiosity. For Classes II through IX and Class XI, a written diagnostic evaluation is conducted covering English, Mathematics, and General Science to understand baseline academic aptitude.",
            },
            {
              num: "Step 3",
              title: "Parent Counselling & Document Verification",
              details:
                "Parents meet with the Principal / Vice Principal to discuss curriculum goals, transport or boarding requirements, and student interests. Original certificates are verified.",
            },
            {
              num: "Step 4",
              title: "Admission Confirmation & Fee Deposit",
              details:
                "Upon selection notification, admission is finalized by submitting the admission fee installment. Day-scholars receive bus pass details, while residential scholars receive hostel room and locker allocations.",
            },
          ].map((st, i) => (
            <div key={i} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row gap-6 hover:border-[#4F46E5] transition-colors">
              <div className="w-16 h-16 rounded-xl bg-[#111827] border border-gray-700 text-white flex items-center justify-center font-heading font-black text-xl shrink-0 shadow-xs">
                {st.num}
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-[#111827] mb-2">{st.title}</h3>
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">{st.details}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Required Documents Checklist */}
        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#111827]">
            Mandatory Documents Required at Confirmation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#4B5563] pt-2">
            {[
              "Attested photocopy of official Municipal Birth Certificate (LKG - Class I)",
              "Original Transfer Certificate (TC) counter-signed by CBSE/competent board (Class II upwards)",
              "Previous class Report Card / Marksheet from recognized school",
              "Photocopy of Student's Aadhaar Card",
              "Photocopy of Parent's / Guardian's Aadhaar Cards",
              "6 recent passport-sized color photographs of the student",
              "2 passport-sized photographs of Father, Mother, and local Guardian (for boarders)",
              "Medical Fitness Certificate & Blood Group report by a certified doctor",
            ].map((doc, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/admissions#enquiry"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs border border-[#4338CA]"
          >
            <span>Proceed to Online Admission Enquiry</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
