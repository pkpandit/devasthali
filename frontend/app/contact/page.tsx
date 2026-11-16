import React from "react";
import type { Metadata } from "next";
import { Phone, Mail, MessageCircle, Sparkles, Shield, UserCheck, HeartPulse, Building2 } from "lucide-react";
import { getPublicSiteProfile, getPublicCampusDirectory } from "@/lib/api/profile";

export const metadata: Metadata = {
  title: "Contact Us & Campus Directory | Devasthaly Vidyapeeth",
  description:
    "Official directory and contact information for Devasthaly Vidyapeeth, Chilkahar, Ballia. Phone numbers for administration, hostel wardens, class coordinators, medical desk, and accounts office.",
};

export default async function ContactPage() {
  const profile = await getPublicSiteProfile();
  const directoryEntries = await getPublicCampusDirectory();

  // Categorized Directory Entries
  const academicCoordinators = directoryEntries.filter(
    (e) => e.category === "ACADEMIC_COORDINATOR"
  );
  const hostelWardens = directoryEntries.filter(
    (e) => e.category === "HOSTEL_WARDEN"
  );
  const securityTransport = directoryEntries.filter(
    (e) => e.category === "SECURITY_TRANSPORT"
  );
  const administration = directoryEntries.filter(
    (e) => e.category === "ADMINISTRATION"
  );
  const officeAccounts = directoryEntries.filter(
    (e) => e.category === "OFFICE_ACCOUNTS"
  );

  // Office & Accounts consolidated list
  const officeAndAccounts = [...administration, ...officeAccounts];

  // Specific emergency/medical desk items if available, else standard fallback
  const medicalDesk = securityTransport.find(
    (e) =>
      e.roleTitle.toLowerCase().includes("medical") ||
      (e.department && e.department.toLowerCase().includes("health"))
  ) || {
    roleTitle: "Medical Emergency Desk",
    contactName: "Dr. Deepak Chaubey",
    phoneNumber: "9415805530",
  };

  const securityDesk = securityTransport.find(
    (e) =>
      e.roleTitle.toLowerCase().includes("security") ||
      e.roleTitle.toLowerCase().includes("gate") ||
      (e.department && e.department.toLowerCase().includes("security"))
  ) || {
    roleTitle: "DVP School Security",
    contactName: "Guard 1st (Main Gate)",
    phoneNumber: "6307798158",
  };

  const primaryPhone = profile.contacts.primaryPhone || profile.contacts.admissionsPhone || "9554960408";
  const primaryEmail = profile.contacts.officeEmail || profile.contacts.email || "principaldvp@gmail.com";
  const rawWhatsApp = profile.contacts.whatsappNumber || "919554960408";
  const cleanWhatsApp = rawWhatsApp.replace(/\D/g, "");

  const fullCampusAddress = `${profile.schoolName}, ${profile.address.campus || "Chilkahar"}, Tehsil ${profile.address.tehsil || "Rasra"}, District ${profile.address.district || "Ballia"}, ${profile.address.state || "Uttar Pradesh"} — ${profile.address.pinCode || "277123"}`;
  const landmarkText = profile.address.landmark || "Located 8 km from Rasra or 25 km from Ballia on Ballia-Lucknow State Highway";

  const renderPhoneLinks = (phoneStr: string) => {
    const parts = phoneStr.split(",").map((p) => p.trim());
    return parts.map((num, i) => (
      <span key={i}>
        {i > 0 && ", "}
        <a href={`tel:${num.replace(/\s+/g, "")}`} className="hover:text-[#B91C1C] hover:underline font-bold text-[#111827]">
          {num}
        </a>
      </span>
    ));
  };

  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Full-Width White Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>Connect / Directory</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            Contact Us &amp; Directory
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            {profile.schoolName}, {profile.address.campus || "Chilkahar"}, {profile.address.district || "Ballia"} - {profile.address.pinCode || "277123"}. Complete official directory of academic coordinators, hostel wardens, and administrative offices.
          </p>
        </div>
      </div>

      <div className="site-container space-y-10">
        {/* Core Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-3xl border border-gray-200/90 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center border border-red-100/60 shadow-2xs mb-4">
                <Phone className="w-5 h-5" />
              </div>
              <h2 className="font-heading font-bold text-lg text-[#111827]">Principal &amp; General Desk</h2>
              <p className="text-sm text-gray-500 font-sans mt-1">Official primary helpline:</p>
            </div>
            <div>
              <a href={`tel:${primaryPhone.replace(/\s+/g, "")}`} className="text-[#B91C1C] font-heading font-black text-xl hover:underline">
                {primaryPhone}
              </a>
              <p className="text-sm text-gray-500 mt-1">{profile.contacts.workingHours || "Mon – Sat: 8:00 AM – 3:30 PM"}</p>
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-gray-200/90 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center border border-red-100/60 shadow-2xs mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="font-heading font-bold text-lg text-[#111827]">Official Email</h2>
              <p className="text-sm text-gray-500 font-sans mt-1">For admissions, certificates &amp; correspondence:</p>
            </div>
            <div>
              <a href={`mailto:${primaryEmail}`} className="text-[#B91C1C] font-heading font-bold text-base hover:underline break-all">
                {primaryEmail}
              </a>
              <p className="text-sm text-gray-500 mt-1">Devasthaly Vidyapeeth Official Correspondence</p>
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-gray-200/90 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#25D366] flex items-center justify-center border border-emerald-100 shadow-2xs mb-4">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h2 className="font-heading font-bold text-lg text-[#111827]">WhatsApp Helpdesk</h2>
              <p className="text-sm text-gray-500 font-sans mt-1">Instant communication with admissions:</p>
            </div>
            <div>
              <a
                href={`https://wa.me/${cleanWhatsApp}?text=Hello%20Devasthaly%20Vidyapeeth,%20I%20would%20like%20to%20enquire%20about%20admissions.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1ebd5b] text-white text-sm font-heading font-bold transition-all shadow-xs hover:shadow-sm hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#25D366] focus-visible:outline-offset-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Emergency & Security Quick Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100 shadow-2xs">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-heading font-bold uppercase tracking-wider text-red-600">
                {medicalDesk.roleTitle}
              </span>
              <h3 className="font-heading font-bold text-base text-[#111827]">
                {medicalDesk.contactName || "Campus Health Centre"}
              </h3>
              <a href={`tel:${medicalDesk.phoneNumber.replace(/\s+/g, "")}`} className="text-sm font-bold text-[#B91C1C] hover:underline">
                {medicalDesk.phoneNumber}
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60 shadow-2xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-heading font-bold uppercase tracking-wider text-[#B91C1C]">
                {securityDesk.roleTitle}
              </span>
              <h3 className="font-heading font-bold text-base text-[#111827]">
                {securityDesk.contactName || "Campus Security Main Gate"}
              </h3>
              <a href={`tel:${securityDesk.phoneNumber.replace(/\s+/g, "")}`} className="text-sm font-bold text-[#B91C1C] hover:underline">
                {securityDesk.phoneNumber}
              </a>
            </div>
          </div>
        </div>

        {/* Authorities & Coordinators Table */}
        <div className="bg-white p-4 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#111827] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#B91C1C]" />
            <span>Authorities &amp; Class Coordinators Contact Numbers</span>
          </h2>
          {academicCoordinators.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500 text-sm">
              No coordinator contacts are currently listed. Please reach out to the Principal desk for assistance.
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#111827] text-white font-heading">
                  <tr>
                    <th className="py-3 px-4 font-bold w-16">S.NO</th>
                    <th className="py-3 px-4 font-bold">NAME</th>
                    <th className="py-3 px-4 font-bold">DESIGNATION</th>
                    <th className="py-3 px-4 font-bold">ASSIGNED CLASSES / DEPT</th>
                    <th className="py-3 px-4 font-bold">MOBILE NO.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-sans text-gray-800">
                  {academicCoordinators.map((auth, idx) => (
                    <tr key={auth.id} className="hover:bg-[#F3F4F6] transition-colors">
                      <td className="py-3 px-4 font-bold text-[#111827]">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-[#111827]">{auth.contactName || "—"}</td>
                      <td className="py-3 px-4 font-semibold text-[#B91C1C]">{auth.roleTitle}</td>
                      <td className="py-3 px-4 text-gray-600">{auth.department || "—"}</td>
                      <td className="py-3 px-4">
                        {renderPhoneLinks(auth.phoneNumber)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Hostel Contact Numbers Table */}
        <div className="bg-white p-4 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#111827] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#B91C1C]" />
            <span>Hostel Wardens &amp; Campus Reception Directory</span>
          </h2>
          {hostelWardens.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500 text-sm">
              No hostel warden contacts are currently listed. Please contact the Chief Hostel Warden or school reception.
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#111827] text-white font-heading">
                  <tr>
                    <th className="py-3 px-4 font-bold w-16">S.NO</th>
                    <th className="py-3 px-4 font-bold">HOSTEL / UNIT</th>
                    <th className="py-3 px-4 font-bold">WARDEN / CONTACT</th>
                    <th className="py-3 px-4 font-bold">MOBILE NO.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-sans text-gray-800">
                  {hostelWardens.map((hostel, idx) => (
                    <tr key={hostel.id} className="hover:bg-[#F3F4F6] transition-colors">
                      <td className="py-2.5 px-4 font-bold text-[#111827]">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-semibold text-[#111827]">{hostel.roleTitle}</td>
                      <td className="py-2.5 px-4 font-medium text-gray-700">{hostel.contactName || "—"}</td>
                      <td className="py-2.5 px-4">
                        {renderPhoneLinks(hostel.phoneNumber)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Office & Fee Counters Table */}
        <div className="bg-white p-4 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#111827]">
            Office &amp; Fee Counter Contacts
          </h2>
          {officeAndAccounts.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500 text-sm">
              No administrative or fee counter contacts are currently listed.
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#111827] text-white font-heading">
                  <tr>
                    <th className="py-3 px-4 font-bold w-16">S.NO</th>
                    <th className="py-3 px-4 font-bold">OFFICIAL NAME</th>
                    <th className="py-3 px-4 font-bold">ROLE / DESIGNATION</th>
                    <th className="py-3 px-4 font-bold">DEPARTMENT</th>
                    <th className="py-3 px-4 font-bold">MOBILE NO.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-sans text-gray-800">
                  {officeAndAccounts.map((off, idx) => (
                    <tr key={off.id} className="hover:bg-[#F3F4F6] transition-colors">
                      <td className="py-2.5 px-4 font-bold text-[#111827]">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-bold text-[#111827]">{off.contactName || off.roleTitle}</td>
                      <td className="py-2.5 px-4 font-semibold text-[#B91C1C]">{off.roleTitle}</td>
                      <td className="py-2.5 px-4 text-gray-600">{off.department || "—"}</td>
                      <td className="py-2.5 px-4">
                        {renderPhoneLinks(off.phoneNumber)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Location & Map Section */}
        <div id="location" className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
          <div className="space-y-2">
            <span className="text-sm font-heading font-bold uppercase tracking-wider text-[#B91C1C] bg-red-50 border border-red-100/60 px-3 py-1 rounded-full inline-block">
              Campus Location
            </span>
            <h2 className="font-heading text-2xl font-bold text-[#111827]">
              How to Reach Chilkahar Campus
            </h2>
            <p className="text-sm text-gray-600 font-sans">
              Address: {fullCampusAddress}. ({landmarkText})
            </p>
          </div>
          <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-xs">
            <iframe
              title="Devasthaly Vidyapeeth Campus Location"
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
