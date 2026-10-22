import React from "react";
import type { Metadata } from "next";
import { ShieldCheck, Lock, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy, Child Safety & Anti-Ragging Policies",
  description:
    "Official institutional privacy policy, student data protection guidelines, POCSO compliance, and anti-ragging code of Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-8">
        <div className="border-b border-[#E5E7EB] pb-6 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Institutional Governance / Compliance
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#111827]">
            Privacy Policy & Child Safeguarding Code
          </h1>
          <p className="text-sm text-[#4B5563] mt-2">
            Devasthaly Vidyapeeth is strictly committed to protecting student and parent privacy, upholding the highest standards of safety, and enforcing zero tolerance for harassment.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6 text-sm text-[#4B5563] leading-relaxed">
          <section>
            <h2 className="font-heading font-bold text-lg text-[#111827] mb-2">
              1. Parent & Student Data Protection
            </h2>
            <p>
              Information collected through our online enquiry forms, admission applications, or parent portal is strictly utilized for educational administration, verification, and parent communication. We do not sell, rent, or trade phone numbers or personal records to any third-party marketing entities.
            </p>
          </section>

          <section id="safety" className="pt-4 border-t border-[#E5E7EB]">
            <h2 className="font-heading font-bold text-lg text-[#111827] mb-2">
              2. Anti-Ragging & Bullying Prohibition
            </h2>
            <p>
              In accordance with Supreme Court directives and CBSE mandates, Devasthaly Vidyapeeth maintains zero tolerance towards ragging or psychological harassment. Any student found engaging in teasing, intimidation, or misconduct in the hostel or school premises faces immediate disciplinary review, suspension, or expulsion.
            </p>
          </section>

          <section className="pt-4 border-t border-[#E5E7EB]">
            <h2 className="font-heading font-bold text-lg text-[#111827] mb-2">
              3. Protection of Children from Sexual Offences (POCSO) Compliance
            </h2>
            <p>
              Our institution maintains a functional Internal Complaints Committee (ICC) and Child Protection Committee. All faculty, hostel wardens, drivers, and campus staff undergo police character verification and child sensitivity training.
            </p>
          </section>

          <section className="pt-4 border-t border-[#E5E7EB]">
            <h2 className="font-heading font-bold text-lg text-[#111827] mb-2">
              4. Media & Photography Safeguarding
            </h2>
            <p>
              Photographs and videos captured during school functions, sports days, or laboratory sessions are published only for institutional documentation and school achievements. No individual student's sensitive identity details are publicly disclosed.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
