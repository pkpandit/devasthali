import React from "react";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy, Child Safety & Anti-Ragging Policies",
  description:
    "Official institutional privacy policy, student data protection guidelines, POCSO compliance, and anti-ragging code of Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Edunex Page Header */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-heading font-bold bg-red-50 text-[#B91C1C] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Institutional Governance / Compliance</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            Privacy Policy & Child Safeguarding Code
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-2 max-w-3xl leading-relaxed font-sans">
            Devasthaly Vidyapeeth is strictly committed to protecting student and parent privacy, upholding the highest standards of safety, and enforcing zero tolerance for harassment.
          </p>
        </div>
      </div>

      <div className="site-container">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/90 shadow-sm space-y-8 text-sm text-[#4B5563] leading-relaxed font-sans">
          <section>
            <h2 className="font-heading font-bold text-lg text-[#111827] mb-2">
              1. Parent & Student Data Protection
            </h2>
            <p>
              Information collected through our online enquiry forms, admission applications, or parent portal is strictly utilized for educational administration, verification, and parent communication. We do not sell, rent, or trade phone numbers or personal records to any third-party marketing entities.
            </p>
          </section>

          <section id="safety" className="pt-6 border-t border-gray-100">
            <h2 className="font-heading font-bold text-lg text-[#111827] mb-2">
              2. Anti-Ragging & Bullying Prohibition
            </h2>
            <p>
              In accordance with Supreme Court directives and CBSE mandates, Devasthaly Vidyapeeth maintains zero tolerance towards ragging or psychological harassment. Any student found engaging in teasing, intimidation, or misconduct in the hostel or school premises faces immediate disciplinary review, suspension, or expulsion.
            </p>
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="font-heading font-bold text-lg text-[#111827] mb-2">
              3. Protection of Children from Sexual Offences (POCSO) Compliance
            </h2>
            <p>
              Our institution maintains a functional Internal Complaints Committee (ICC) and Child Protection Committee. All faculty, hostel wardens, drivers, and campus staff undergo police character verification and child sensitivity training.
            </p>
          </section>

          <section className="pt-6 border-t border-gray-100">
            <h2 className="font-heading font-bold text-lg text-[#111827] mb-2">
              4. Media & Photography Safeguarding
            </h2>
            <p>
              Photographs and videos captured during school functions, sports days, or laboratory sessions are published only for institutional documentation and school achievements. No individual student&apos;s sensitive identity details are publicly disclosed.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
