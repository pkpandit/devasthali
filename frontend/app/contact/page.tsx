import React from "react";
import type { Metadata } from "next";
import { Phone, Mail, MessageCircle, Sparkles, Shield, UserCheck, HeartPulse } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us & Campus Directory | Devasthaly Vidyapeeth",
  description:
    "Official directory and contact information for Devasthaly Vidyapeeth, Chilkahar, Ballia. Phone numbers for administration, hostel wardens, class coordinators, medical desk, and accounts office.",
};

export default function ContactPage() {
  const hostelContacts = [
    { sno: "1", role: "Main Gate Security", phone: "7753914135" },
    { sno: "2", role: "Reception – Mr. B. C. Dubey", phone: "9554960415" },
    { sno: "3", role: "Mrs. Shalini Singh", phone: "9519051030" },
    { sno: "4", role: "Draupadi Niketan – Mrs. Shanti Verma (Kids Wing)", phone: "8810973997, 8887526375" },
    { sno: "5", role: "Mrs. Beena Singh", phone: "8858451165, 9198069451" },
    { sno: "6", role: "Mrs. Archana Rai", phone: "8176841070, 7800529868" },
    { sno: "7", role: "Sadanand Niketan – Mr. Amit Singh", phone: "7309186668" },
    { sno: "8", role: "Mr. Purushottam Ojha", phone: "7355467982, 7003176352" },
    { sno: "9", role: "Mr. Ravi Prakash", phone: "6387266720, 9473723117" },
    { sno: "10", role: "Mr. Akash", phone: "8756641048, 9984117456" },
    { sno: "11", role: "J.P. Niketan – Mr. M. K. Ojha", phone: "9140702961, 9554960406" },
    { sno: "12", role: "Mr. Mrityunjay Singh", phone: "8318399947, 7307368482" },
    { sno: "13", role: "Mr. Ashish Mani", phone: "9651904529, 7052921300" },
    { sno: "14", role: "Chief Warden – Mr. Dhirendra Singh", phone: "6307010040" },
  ];

  const authorityContacts = [
    { sno: "1", name: "MRS. MAMTA SINGH", designation: "VICE-PRINCIPAL", assigned: "Administration", phone: "6306580532" },
    { sno: "2", name: "MRS. ANITA SINGH", designation: "CO-ORDINATOR", assigned: "IX to XII (GIRLS)", phone: "9616148210" },
    { sno: "3", name: "MRS. SADHANA MISHRA", designation: "CO-ORDINATOR", assigned: "VI to VIII (GIRLS)", phone: "9161762457" },
    { sno: "4", name: "MR. NEERAJ SINGH", designation: "CO-ORDINATOR", assigned: "XI & XII (BOYS)", phone: "9005122930" },
    { sno: "5", name: "MR. CHITRASEN SINGH", designation: "CO-ORDINATOR", assigned: "IX & X (BOYS)", phone: "7376867376" },
    { sno: "6", name: "MR. RAMESHWAR SINGH", designation: "CO-ORDINATOR", assigned: "VI to VIII (BOYS)", phone: "7860436565" },
    { sno: "7", name: "MRS. SITA SINGH", designation: "CO-ORDINATOR", assigned: "L.K.G. to II nd", phone: "9415830247" },
    { sno: "8", name: "MRS. SADHANA ASTHANA", designation: "CO-ORDINATOR", assigned: "III rd to V th", phone: "9506892222" },
  ];

  const officeContacts = [
    { sno: "1", name: "Mr. Mukesh Prasad", role: "Fee Counter", phone: "9250930763" },
    { sno: "2", name: "Mr. Satyendra Singh", role: "Fee Counter", phone: "9451491906" },
    { sno: "3", name: "Mr. Dhananjay", role: "Accountant", phone: "9554960408" },
  ];

  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Full-Width White Edunex Page Header Banner */}
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
            Devasthaly Vidyapeeth, Chilkahar, Ballia- 221701. Complete official directory of academic coordinators, hostel wardens, and administrative offices.
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
              <a href="tel:9554960408" className="text-[#B91C1C] font-heading font-black text-xl hover:underline">
                9554960408
              </a>
              <p className="text-sm text-gray-500 mt-1">Mon – Sat: 8:00 AM – 3:30 PM</p>
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
              <a href="mailto:principaldvp@gmail.com" className="text-[#B91C1C] font-heading font-bold text-base hover:underline break-all">
                principaldvp@gmail.com
              </a>
              <p className="text-sm text-gray-500 mt-1">Website: www.Devasthalyballia.com</p>
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
                href="https://wa.me/919554960408"
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
              <span className="text-sm font-heading font-bold uppercase tracking-wider text-red-600">Medical Emergency Desk</span>
              <h3 className="font-heading font-bold text-base text-[#111827]">Dr. Deepak Chaubey</h3>
              <a href="tel:9415805530" className="text-sm font-bold text-[#B91C1C] hover:underline">9415805530</a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100/60 shadow-2xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-heading font-bold uppercase tracking-wider text-[#B91C1C]">DVP School Security</span>
              <h3 className="font-heading font-bold text-base text-[#111827]">Guard 1st (Main Gate)</h3>
              <a href="tel:6307798158" className="text-sm font-bold text-[#B91C1C] hover:underline">6307798158</a>
            </div>
          </div>
        </div>

        {/* Authorities & Coordinators Table */}
        <div className="bg-white p-4 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#111827] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#B91C1C]" />
            <span>Authorities &amp; Class Coordinators Contact Numbers</span>
          </h2>
          <div className="overflow-x-auto border border-gray-200 rounded-2xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#111827] text-white font-heading">
                <tr>
                  <th className="py-3 px-4 font-bold w-16">S.NO</th>
                  <th className="py-3 px-4 font-bold">NAME</th>
                  <th className="py-3 px-4 font-bold">DESIGNATION</th>
                  <th className="py-3 px-4 font-bold">ASSIGNED CLASSES</th>
                  <th className="py-3 px-4 font-bold">MOBILE NO.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-sans text-gray-800">
                {authorityContacts.map((auth, idx) => (
                  <tr key={idx} className="hover:bg-[#F3F4F6] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#111827]">{auth.sno}</td>
                    <td className="py-3 px-4 font-bold text-[#111827]">{auth.name}</td>
                    <td className="py-3 px-4 font-semibold text-[#B91C1C]">{auth.designation}</td>
                    <td className="py-3 px-4 text-gray-600">{auth.assigned}</td>
                    <td className="py-3 px-4 font-bold text-[#111827]">
                      <a href={`tel:${auth.phone}`} className="hover:text-[#B91C1C] hover:underline">
                        {auth.phone}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hostel Contact Numbers Table */}
        <div className="bg-white p-4 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#111827]">
            Hostel Wardens &amp; Campus Reception Directory
          </h2>
          <div className="overflow-x-auto border border-gray-200 rounded-2xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#111827] text-white font-heading">
                <tr>
                  <th className="py-3 px-4 font-bold w-16">S.NO</th>
                  <th className="py-3 px-4 font-bold">HOSTEL / UNIT</th>
                  <th className="py-3 px-4 font-bold">MOBILE NO.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-sans text-gray-800">
                {hostelContacts.map((hostel, idx) => (
                  <tr key={idx} className="hover:bg-[#F3F4F6] transition-colors">
                    <td className="py-2.5 px-4 font-bold text-[#111827]">{hostel.sno}</td>
                    <td className="py-2.5 px-4 font-medium text-gray-800">{hostel.role}</td>
                    <td className="py-2.5 px-4 font-bold text-[#111827]">
                      {hostel.phone.split(",").map((num, i) => (
                        <span key={i}>
                          {i > 0 && ", "}
                          <a href={`tel:${num.trim()}`} className="hover:text-[#B91C1C] hover:underline">
                            {num.trim()}
                          </a>
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Office & Fee Counters Table */}
        <div className="bg-white p-4 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#111827]">
            Office &amp; Fee Counter Contacts
          </h2>
          <div className="overflow-x-auto border border-gray-200 rounded-2xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#111827] text-white font-heading">
                <tr>
                  <th className="py-3 px-4 font-bold w-16">S.NO</th>
                  <th className="py-3 px-4 font-bold">OFFICIAL NAME</th>
                  <th className="py-3 px-4 font-bold">DEPARTMENT</th>
                  <th className="py-3 px-4 font-bold">MOBILE NO.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-sans text-gray-800">
                {officeContacts.map((off, idx) => (
                  <tr key={idx} className="hover:bg-[#F3F4F6] transition-colors">
                    <td className="py-2.5 px-4 font-bold text-[#111827]">{off.sno}</td>
                    <td className="py-2.5 px-4 font-bold text-[#111827]">{off.name}</td>
                    <td className="py-2.5 px-4 font-semibold text-[#B91C1C]">{off.role}</td>
                    <td className="py-2.5 px-4 font-bold text-[#111827]">
                      <a href={`tel:${off.phone}`} className="hover:text-[#B91C1C] hover:underline">
                        {off.phone}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              Address: Chilkahar, Ballia- 221701, Uttar Pradesh (Located 8 km from Rasra or 25 km from Ballia on Ballia-Lucknow State Highway).
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
