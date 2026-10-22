import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SCHOOL_INFO } from "@/lib/school-data";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#111827] text-white pt-16 pb-24 lg:pb-12 border-t border-gray-800">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          {/* Column 1: Institutional Authority */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm border border-gray-700 shrink-0 overflow-hidden">
                <Image
                  src="/images/devasthalyballia.webp"
                  alt="Devasthaly Vidyapeeth Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-white leading-tight">
                  Devasthaly Vidyapeeth
                </h3>
                <p className="text-xs text-gray-400 font-medium">Chilkahar, Ballia (U.P.)</p>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              Established in 1988, Devasthaly Vidyapeeth stands as Purvanchal’s premier CBSE-affiliated co-educational residential and day-boarding institution, imparting holistic moral values alongside academic brilliance.
            </p>

            <div className="bg-[#1F2937] p-3 rounded-xl border border-gray-700 flex flex-col gap-1 text-xs text-gray-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4F46E5]" />
                <span>CBSE Affiliation No: <strong>{SCHOOL_INFO.affiliationNo}</strong></span>
              </div>
              <div className="text-gray-400 pl-6">School Code: {SCHOOL_INFO.schoolCode}</div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-base text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              {[
                { name: "About the Legacy (1988)", href: "/about" },
                { name: "Vision & Mission", href: "/vision-mission" },
                { name: "Principal's Desk", href: "/principals-message" },
                { name: "Academics (LKG to XII)", href: "/academics" },
                { name: "Campus Facilities & Labs", href: "/facilities" },
                { name: "Residential Hostel & Mess", href: "/facilities#hostel" },
                { name: "Faculty & Mentors", href: "/faculty" },
                { name: "Alumni Network", href: "/alumni" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Admissions & Compliance */}
          <div>
            <h4 className="font-heading font-bold text-base text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              Admissions & Compliance
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              {[
                { name: "Admissions 2025–26 Overview", href: "/admissions" },
                { name: "Admission Procedure & Guidelines", href: "/admissions/procedure" },
                { name: "Fee Schedule & Structure", href: "/admissions/fees" },
                { name: "CBSE Mandatory Public Disclosure", href: "/downloads" },
                { name: "Board Examination Results", href: "/results" },
                { name: "Transfer Certificate (TC) Requests", href: "/downloads" },
                { name: "Anti-Ragging & POCSO Safety", href: "/privacy-policy#safety" },
                { name: "Privacy Policy", href: "/privacy-policy" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="flex flex-col gap-4">
            <h4 className="font-heading font-bold text-base text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              Campus Location
            </h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-[#4F46E5] shrink-0 mt-0.5" />
                <address className="not-italic leading-snug">
                  Devasthaly Vidyapeeth, Chilkahar, Tehsil Rasra, District Ballia, Uttar Pradesh — 277123
                  <span className="block text-xs text-gray-400 mt-1">
                    (Near Chilkahar Railway Crossing / Ballia-Rasra State Highway)
                  </span>
                </address>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#4F46E5] shrink-0" />
                <Link
                  href={`tel:${SCHOOL_INFO.contacts.admissionsPhone.replace(/\s+/g, "")}`}
                  className="hover:text-white"
                >
                  Admissions: {SCHOOL_INFO.contacts.admissionsPhone}
                </Link>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#4F46E5] shrink-0" />
                <Link href={`mailto:${SCHOOL_INFO.contacts.email}`} className="hover:text-white">
                  {SCHOOL_INFO.contacts.email}
                </Link>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-gray-400">
                <Clock className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                <span>{SCHOOL_INFO.contacts.workingHours}</span>
              </div>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl transition-colors mt-2 shadow-sm border border-[#4338CA]"
            >
              <span>Get Driving Directions / Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom Strip: Copyright & Technical Standards */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© 2025 Devasthaly Vidyapeeth, Chilkahar, Ballia. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span>CBSE Affiliation: 2130238</span>
            <span>•</span>
            <span>WCAG 2.2 AA Accessible</span>
            <span>•</span>
            <Link href="/admin" className="hover:text-white underline">
              Staff / Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
