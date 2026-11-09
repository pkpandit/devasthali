import React from "react";
import Link from "next/link";
import { SCHOOL_INFO } from "@/lib/school-data";
import { Phone, MessageCircle, FilePenLine } from "lucide-react";

export function MobileStickyDock() {
  return (
    <div
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] px-3 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
      role="navigation"
      aria-label="Mobile Quick Conversion Actions"
    >
      <div className="grid grid-cols-3 gap-2">
        {/* 1. Direct Call */}
        <Link
          href={`tel:${SCHOOL_INFO.contacts.admissionsPhone.replace(/\s+/g, "")}`}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-lg bg-[#F3F4F6] text-[#111827] active:bg-gray-200 transition-colors text-center border border-[#E5E7EB]"
          aria-label="Call Admissions Office"
        >
          <Phone className="w-5 h-5 text-[#B91C1C] mb-0.5" />
          <span className="text-sm font-heading font-bold tracking-tight">Call Campus</span>
        </Link>

        {/* 2. Direct WhatsApp */}
        <Link
          href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}?text=Hello%20Devasthaly%20Vidyapeeth,%20I%20would%20like%20to%20enquire%20about%20admissions.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-lg bg-[#25D366] text-white active:bg-[#1ebd5b] transition-colors text-center shadow-sm"
          aria-label="Chat with Admissions Counsellor on WhatsApp"
        >
          <MessageCircle className="w-5 h-5 mb-0.5" />
          <span className="text-sm font-heading font-bold tracking-tight">WhatsApp</span>
        </Link>

        {/* 3. Online Admission Form */}
        <Link
          href="/admissions"
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-lg bg-[#B91C1C] text-white active:bg-[#991B1B] transition-colors text-center shadow-sm border border-[#991B1B]"
          aria-label="Apply Online for Admission"
        >
          <FilePenLine className="w-5 h-5 text-white mb-0.5" />
          <span className="text-sm font-heading font-bold tracking-tight">Apply Now</span>
        </Link>
      </div>
    </div>
  );
}
