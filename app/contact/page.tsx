import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SCHOOL_INFO } from "@/lib/school-data";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us & Campus Location | Devasthaly Vidyapeeth",
  description:
    "Contact Devasthaly Vidyapeeth in Chilkahar, Ballia, UP. Phone numbers, WhatsApp helpdesk, email addresses, driving directions, and interactive Google map.",
};

export default function ContactPage() {
  return (
    <div className="w-full bg-[#F3F4F6] py-12">
      <div className="site-container space-y-12">
        <div className="border-b border-[#E5E7EB] pb-6 text-left">
          <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-widest mb-2">
            Connect / Location
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black text-[#111827]">
            Contact Us & Visit Our Campus
          </h1>
          <p className="text-sm text-[#4B5563] mt-2 max-w-3xl">
            We welcome parents, prospective students, and guardians to reach out via phone, WhatsApp, or visit our green campus at Chilkahar, Ballia.
          </p>
        </div>

        {/* Directory & Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] text-[#4F46E5] flex items-center justify-center border border-[#E5E7EB]">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-[#111827]">Admissions & General Desk</h3>
            <p className="text-xs text-[#4B5563]">For admissions, prospectus, and fee enquiries:</p>
            <div className="space-y-1 pt-1 text-xs">
              <a
                href={`tel:${SCHOOL_INFO.contacts.admissionsPhone.replace(/\s+/g, "")}`}
                className="block text-[#4F46E5] font-bold hover:underline"
              >
                {SCHOOL_INFO.contacts.admissionsPhone}
              </a>
              <a
                href={`tel:${SCHOOL_INFO.contacts.primaryPhone.replace(/\s+/g, "")}`}
                className="block text-[#4B5563] hover:underline"
              >
                {SCHOOL_INFO.contacts.primaryPhone}
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#25D366] flex items-center justify-center border border-emerald-100">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-[#111827]">WhatsApp Helpdesk</h3>
            <p className="text-xs text-[#4B5563]">Instant answers to parent queries in Hindi / English:</p>
            <div className="pt-1">
              <a
                href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}?text=Hello%20Devasthaly%20Vidyapeeth`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1ebd5b] transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] text-[#4F46E5] flex items-center justify-center border border-[#E5E7EB]">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-[#111827]">Official Correspondence</h3>
            <p className="text-xs text-[#4B5563]">For administrative, transfer certificate & careers:</p>
            <div className="space-y-1 pt-1 text-xs">
              <a
                href={`mailto:${SCHOOL_INFO.contacts.email}`}
                className="block text-[#4F46E5] font-bold hover:underline"
              >
                {SCHOOL_INFO.contacts.email}
              </a>
              <a
                href={`mailto:${SCHOOL_INFO.contacts.officeEmail}`}
                className="block text-[#4B5563] hover:underline"
              >
                {SCHOOL_INFO.contacts.officeEmail}
              </a>
            </div>
          </div>
        </div>

        {/* Map & Driving Directions */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
              Campus Directions
            </span>
            <h2 className="font-heading text-2xl font-bold text-[#111827]">
              How to Reach Chilkahar Campus
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-[#4B5563]">
              <p>
                <strong className="text-[#111827] block mb-1">From Ballia Railway Station:</strong> Approximately 26 km along the Ballia–Rasra State Highway. Regular private buses, auto-rickshaws, and school transport buses operate throughout the day.
              </p>
              <p>
                <strong className="text-[#111827] block mb-1">From Rasra Tehsil:</strong> Approximately 14 km east towards Ballia. Conveniently located near the Chilkahar Railway Crossing.
              </p>
              <p>
                <strong className="text-[#111827] block mb-1">Visiting Hours:</strong> {SCHOOL_INFO.contacts.workingHours} (Prior appointment recommended).
              </p>
            </div>
          </div>

          <div className="w-full h-[420px] sm:h-[480px] rounded-xl overflow-hidden border border-[#E5E7EB]">
            <iframe
              title="Devasthaly Vidyapeeth Campus Location in Chilkahar Ballia"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14372.416823334255!2d84.0152431!3d25.8643212!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39925bf784a6c4f7%3A0xbcf0bf5377f0a9a1!2sChilkahar%2C%20Uttar%20Pradesh%20277123!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
