"use client";

import React, { useState } from "react";
import { SCHOOL_INFO } from "@/lib/school-data";
import { Sparkles, MessageCircle, AlertCircle, Info, Phone, MapPin, Mail, ArrowLeft } from "lucide-react";

interface FormProps {
  className?: string;
}

export function AdmissionEnquiryForm({ className = "" }: FormProps) {
  const [formData, setFormData] = useState({
    studentName: "",
    parentName: "",
    phone: "",
    grade: "Class I",
    admissionType: "Day-Scholar",
    city: "Ballia",
    sendToWhatsapp: true,
    message: "",
    website_honey: "", // Anti-spam honeypot
  });

  const [status, setStatus] = useState<"idle" | "notice" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const grades = [
    "LKG / Nursery",
    "UKG / KG",
    "Class I",
    "Class II",
    "Class III",
    "Class IV",
    "Class V",
    "Class VI",
    "Class VII",
    "Class VIII",
    "Class IX",
    "Class X",
    "Class XI (Science - PCM)",
    "Class XI (Science - PCB)",
    "Class XI (Commerce)",
    "Class XI (Humanities)",
  ];

  const cities = [
    "Ballia",
    "Rasra",
    "Chilkahar",
    "Sikanderpur",
    "Bairia",
    "Belthara Road",
    "Ghazipur",
    "Mau",
    "Buxar (Bihar)",
    "Patna (Bihar)",
    "Varanasi",
    "Other Location",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot spam trap
    if (formData.website_honey) {
      setStatus("notice");
      return;
    }

    if (!formData.studentName.trim() || !formData.parentName.trim() || !formData.phone.trim()) {
      setStatus("error");
      setErrorMessage("Please fill all mandatory fields marked with an asterisk (*).");
      return;
    }

    // Phone validation (10 digits)
    const phoneClean = formData.phone.replace(/[^0-9]/g, "");
    if (phoneClean.length < 10) {
      setStatus("error");
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setErrorMessage("");
    // Online submission is not yet available; show verified contact alternatives
    setStatus("notice");
  };

  const whatsappMessage = encodeURIComponent(
    `Namaste Devasthaly Vidyapeeth, I would like to enquire about admission for ${formData.studentName || "my child"} seeking grade ${formData.grade} (${formData.admissionType}). Parent: ${formData.parentName}, Mobile: ${formData.phone}, Location: ${formData.city}.`
  );

  return (
    <div className={`bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 ${className}`}>
      {/* Header Banner (#111827 Dark Surface) */}
      <div className="bg-[#111827] p-6 text-white text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-heading font-bold uppercase tracking-wider mb-2 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
            Admissions Session 2026–27
          </span>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
            Admission Enquiry Desk
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            Direct admission enquiry &amp; verified contact channels for Devasthaly Vidyapeeth.
          </p>
        </div>

        <div className="hidden md:flex flex-col items-end text-sm text-gray-300">
          <span className="text-white font-bold">Admissions Helpline</span>
          <span className="text-[#FBBF24] font-mono font-bold text-base">{SCHOOL_INFO.contacts.admissionsPhone}</span>
        </div>
      </div>

      {status === "notice" ? (
        <div className="p-6 sm:p-10 space-y-6">
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
            <div>
              <h4 className="font-heading text-base font-bold text-amber-950">
                Online Form Submission Not Yet Available
              </h4>
              <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                Automated online submission is currently inactive. Your enquiry details have not been transmitted online. Please use one of the direct verified alternatives below to contact our admissions team:
              </p>
            </div>
          </div>

          {/* Enquiry Summary */}
          <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-sm space-y-2">
            <h5 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-500">
              Enquiry Summary
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-800">
              <p><strong>Student:</strong> {formData.studentName || "—"}</p>
              <p><strong>Class:</strong> {formData.grade} ({formData.admissionType})</p>
              <p><strong>Parent/Guardian:</strong> {formData.parentName || "—"}</p>
              <p><strong>Phone:</strong> {formData.phone || "—"}</p>
              <p><strong>Location:</strong> {formData.city}</p>
            </div>
          </div>

          {/* Verified Contact Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/70 transition-colors flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-[#111827]">Send via WhatsApp</p>
                <p className="text-xs text-gray-600">Open WhatsApp with your enquiry details pre-filled</p>
              </div>
            </a>

            <a
              href={`tel:${SCHOOL_INFO.contacts.admissionsPhone}`}
              className="p-4 rounded-2xl bg-red-50 border border-red-200 hover:bg-red-100/70 transition-colors flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#B91C1C] text-white flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-[#111827]">Call Admissions Desk</p>
                <p className="text-xs text-gray-600 font-mono font-bold text-[#B91C1C]">
                  +91 {SCHOOL_INFO.contacts.admissionsPhone} / {SCHOOL_INFO.contacts.receptionPhone}
                </p>
              </div>
            </a>

            <a
              href={`mailto:${SCHOOL_INFO.contacts.email}?subject=Admission Enquiry for ${encodeURIComponent(formData.studentName || "Student")}`}
              className="p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-700 text-white flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-[#111827]">Email Admissions</p>
                <p className="text-xs text-gray-600">{SCHOOL_INFO.contacts.email}</p>
              </div>
            </a>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gray-700 text-white flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-[#111827]">Campus Admissions Counter</p>
                <p className="text-xs text-gray-600">Chilkahar, Ballia (Mon–Sat: 8:00 AM – 3:30 PM)</p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-[#111827] hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Edit Details / Back to Form</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {/* Honeypot field hidden from real humans */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website_honey">Leave this field blank</label>
            <input
              type="text"
              id="website_honey"
              name="website_honey"
              value={formData.website_honey}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Clear online status notice */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
            <span>
              <strong>Admissions Desk Notice:</strong> Online form submission is not yet available. You may fill your details below to generate a direct WhatsApp message, call our admissions helpline directly at <strong>{SCHOOL_INFO.contacts.admissionsPhone}</strong>, or visit the campus counter.
            </span>
          </div>

          {status === "error" && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Name */}
            <div>
              <label
                htmlFor="enquiry-student-name"
                className="block text-sm font-heading font-bold text-[#111827] uppercase tracking-wider mb-1.5"
              >
                Student Full Name <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                id="enquiry-student-name"
                name="studentName"
                autoComplete="name"
                required
                value={formData.studentName}
                onChange={handleChange}
                placeholder="e.g. Aryan Pandey"
                className="w-full px-3.5 py-3 rounded-xl border border-[#E5E7EB] text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all bg-white"
              />
            </div>

            {/* Parent / Guardian Name */}
            <div>
              <label
                htmlFor="enquiry-parent-name"
                className="block text-sm font-heading font-bold text-[#111827] uppercase tracking-wider mb-1.5"
              >
                Parent / Guardian Name <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                id="enquiry-parent-name"
                name="parentName"
                autoComplete="name"
                required
                value={formData.parentName}
                onChange={handleChange}
                placeholder="e.g. Rameshwar Pandey"
                className="w-full px-3.5 py-3 rounded-xl border border-[#E5E7EB] text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* WhatsApp Mobile Number */}
            <div>
              <label
                htmlFor="enquiry-phone"
                className="block text-sm font-heading font-bold text-[#111827] uppercase tracking-wider mb-1.5"
              >
                WhatsApp Mobile Number <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                  +91
                </span>
                <input
                  type="tel"
                  id="enquiry-phone"
                  name="phone"
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="98765 43210"
                  className="w-full pl-12 pr-3.5 py-3 rounded-xl border border-[#E5E7EB] text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 transition-all outline-none bg-white"
                />
              </div>
            </div>

            {/* Grade Selection */}
            <div>
              <label
                htmlFor="enquiry-grade"
                className="block text-sm font-heading font-bold text-[#111827] uppercase tracking-wider mb-1.5"
              >
                Class Seeking Admission <span className="text-[#DC2626]">*</span>
              </label>
              <select
                id="enquiry-grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-3.5 py-3 rounded-xl border border-[#E5E7EB] text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all bg-white"
              >
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Admission Type (Day vs Boarder) */}
            <div>
              <span className="block text-sm font-heading font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Admission Preference
              </span>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Admission Preference">
                {["Day-Scholar", "Residential Boarder"].map((type) => (
                  <label
                    key={type}
                    className={`flex items-center justify-center px-3 py-2.5 rounded-xl border text-sm font-heading font-bold cursor-pointer transition-all ${
                      formData.admissionType === type
                        ? "bg-[#B91C1C] text-white border-[#B91C1C] shadow-xs"
                        : "bg-[#F3F4F6] text-[#111827] border-[#E5E7EB] hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="admissionType"
                      value={type}
                      checked={formData.admissionType === type}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Town / City */}
            <div>
              <label
                htmlFor="enquiry-city"
                className="block text-sm font-heading font-bold text-[#111827] uppercase tracking-wider mb-1.5"
              >
                Your Current Location / Town
              </label>
              <select
                id="enquiry-city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3.5 py-3 rounded-xl border border-[#E5E7EB] text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all bg-white"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Direct WhatsApp Pre-fill option */}
          <div className="pt-1">
            <label
              htmlFor="enquiry-whatsapp-sync"
              className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700"
            >
              <input
                type="checkbox"
                id="enquiry-whatsapp-sync"
                name="sendToWhatsapp"
                checked={formData.sendToWhatsapp}
                onChange={handleChange}
                className="w-4 h-4 text-[#B91C1C] rounded border-[#E5E7EB] focus:ring-[#B91C1C]"
              />
              <span className="font-medium">
                Include option to chat directly on WhatsApp with pre-filled details
              </span>
            </label>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-full bg-[#B91C1C] text-white font-heading font-bold text-sm tracking-wide uppercase hover:bg-[#991B1B] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg border border-[#991B1B] focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2 cursor-pointer"
            >
              <span>Connect with Admissions Desk</span>
            </button>
            <p className="text-center text-sm text-gray-500 mt-2">
              Admissions Helpline: {SCHOOL_INFO.contacts.admissionsPhone} • Mon–Sat: 8:00 AM – 3:30 PM
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
