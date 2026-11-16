import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SCHOOL_INFO } from "@/lib/content/settings";
import { footerAdmissionsLinks, footerLifeLinks } from "@/lib/content/navigation";
import type { PublicSiteProfileDto } from "@/lib/api/profile";
import type { FooterLinkItem } from "@/types/content";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

interface FooterProps {
  profile?: PublicSiteProfileDto;
  admissionsLinks?: FooterLinkItem[];
  lifeLinks?: FooterLinkItem[];
}

export function Footer({
  profile,
  admissionsLinks: propAdmissions,
  lifeLinks: propLife,
}: FooterProps = {}) {
  const schoolName = profile?.schoolName || SCHOOL_INFO.name;
  const affiliationNo = profile?.affiliationNo || SCHOOL_INFO.affiliationNo;
  const schoolCode = profile?.schoolCode || SCHOOL_INFO.schoolCode;
  const admissionsPhone = profile?.contacts?.admissionsPhone || SCHOOL_INFO.contacts.admissionsPhone;
  const email = profile?.contacts?.email || profile?.contacts?.officeEmail || SCHOOL_INFO.contacts.email;
  const workingHours = profile?.contacts?.workingHours || SCHOOL_INFO.contacts.workingHours;
  const locationTag = profile?.address?.campus && profile?.address?.district
    ? `${profile.address.campus}, ${profile.address.district} (U.P.)`
    : "Chilkahar, Ballia (U.P.)";
  const fullAddress = profile?.address?.campus && profile?.address?.district
    ? `${schoolName}, ${profile.address.campus}, Tehsil ${profile.address.tehsil || "Rasra"}, District ${profile.address.district}, ${profile.address.state || "Uttar Pradesh"} — ${profile.address.pinCode || "277123"}`
    : "Devasthaly Vidyapeeth, Chilkahar, Tehsil Rasra, District Ballia, Uttar Pradesh — 277123";
  const landmark = profile?.address?.landmark || "Near Chilkahar Railway Crossing / Ballia-Rasra State Highway";
  const copyrightText = profile?.copyrightText || "© 2025 Devasthaly Vidyapeeth, Chilkahar, Ballia. All Rights Reserved.";

  const activeAdmissions = propAdmissions ?? footerAdmissionsLinks;
  const activeLife = propLife ?? footerLifeLinks;

  return (
    <footer className="w-full bg-[#111827] text-white pt-16 pb-24 lg:pb-12 border-t border-gray-800">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          {/* Column 1: Institutional Authority */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm border border-gray-700 shrink-0 overflow-hidden">
                <Image
                  src="/images/branding/devasthalyballia.webp"
                  alt={`${schoolName} Logo`}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl lg:text-[22px] text-white leading-tight">
                  {schoolName}
                </h3>
                <p className="text-sm text-gray-400 font-medium">{locationTag}</p>
              </div>
            </div>

            <p className="text-base text-gray-300 leading-relaxed font-sans">
              Established in {profile?.establishedYear || 1988}, {schoolName} stands as Purvanchal’s premier CBSE-affiliated co-educational residential and day-boarding institution, imparting holistic moral values alongside academic brilliance.
            </p>

            <div className="bg-[#1F2937] p-3 rounded-xl border border-gray-700 flex flex-col gap-1 text-sm text-gray-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F4CD13]" />
                <span>CBSE Affiliation No: <strong>{affiliationNo}</strong></span>
              </div>
              <div className="text-gray-400 pl-6">School Code: {schoolCode}</div>
            </div>
          </div>

          {/* Column 2: Admissions & Academics */}
          <div>
            <h4 className="font-heading font-bold text-lg text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              Admissions & Academics
            </h4>
            <ul className="space-y-2.5 text-[15px] text-gray-300">
              {activeAdmissions.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#B91C1C]" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Life at School & Community */}
          <div>
            <h4 className="font-heading font-bold text-lg text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              Life at School & Community
            </h4>
            <ul className="space-y-2.5 text-[15px] text-gray-300">
              {activeLife.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#B91C1C]" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="flex flex-col gap-4">
            <h4 className="font-heading font-bold text-lg text-white uppercase tracking-wider border-b border-gray-800 pb-2">
              Campus Location
            </h4>
            <div className="space-y-3 text-[15px] text-gray-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" />
                <address className="not-italic leading-snug">
                  {fullAddress}
                  <span className="block text-sm text-gray-400 mt-1">
                    ({landmark})
                  </span>
                </address>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#F4CD13] shrink-0" />
                <Link
                  href={`tel:${admissionsPhone.replace(/\s+/g, "")}`}
                  className="hover:text-white"
                >
                  Admissions: {admissionsPhone}
                </Link>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F4CD13] shrink-0" />
                <Link href={`mailto:${email}`} className="hover:text-white">
                  {email}
                </Link>
              </div>

              <div className="flex items-start gap-2.5 text-sm text-gray-400">
                <Clock className="w-4 h-4 text-[#F4CD13] shrink-0 mt-0.5" />
                <span>{workingHours}</span>
              </div>
            </div>

            <Link
              href="/contact#location"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-heading font-bold rounded-full transition-colors mt-2 shadow-sm border border-[#991B1B] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              <span>Get Driving Directions / Map</span>
              <MapPin className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom Strip: Copyright & Technical Standards */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400 gap-4">
          <p>{copyrightText}</p>
          <div className="flex flex-wrap items-center gap-4">
            <span>CBSE Affiliation: {affiliationNo}</span>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-white underline">
              Privacy &amp; Child Safeguarding
            </Link>
            <span>•</span>
            <span>WCAG 2.2 AA Accessible</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
