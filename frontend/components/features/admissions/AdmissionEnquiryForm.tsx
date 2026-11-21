"use client";

import React, { useState } from "react";
import { SCHOOL_INFO } from "@/lib/school-data";
import {
  Sparkles,
  MessageCircle,
  AlertCircle,
  Info,
  Phone,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { submitAdmissionEnquiry } from "@/features/admissions/actions";

interface FormProps {
  className?: string;
}

export function AdmissionEnquiryForm({ className = "" }: FormProps) {
  const [formData, setFormData] = useState({
    studentName: "",
    parentName: "",
    phone: "",
    grade: "Class I",
    admissionType: "Day-Scholar" as "Day-Scholar" | "Residential Boarder",
    city: "Ballia",
    sendToWhatsapp: true,
    message: "",
    website_honey: "", // Anti-spam honeypot
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<{ message?: string; whatsappRedirectUrl?: string } | null>(null);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot spam trap: fake success immediately
    if (formData.website_honey && formData.website_honey.trim().length > 0) {
      setStatus("success");
      setSuccessData({
        message: "Enquiry submitted successfully. Our admissions desk will contact you shortly.",
      });
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

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await submitAdmissionEnquiry({
        studentName: formData.studentName.trim(),
        parentName: formData.parentName.trim(),
        phone: phoneClean,
        grade: formData.grade,
        admissionType: formData.admissionType,
        city: formData.city,
        sendToWhatsapp: formData.sendToWhatsapp,
        message: formData.message.trim() || undefined,
        website_honey: formData.website_honey,
      });

      if (res.success) {
        setStatus("success");
        setSuccessData({
          message:
            res.message ||
            "Enquiry submitted successfully. Our admissions desk will contact you shortly.",
          whatsappRedirectUrl: res.data?.whatsappRedirectUrl,
        });
      } else {
        setStatus("error");
        setErrorMessage(
          res.message || "Failed to submit enquiry. Please call our helpline."
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage(
        "Unable to connect to admissions service. Please call our helpline directly."
      );
    }
  };

  const handleReset = () => {
    setFormData({
      studentName: "",
      parentName: "",
      phone: "",
      grade: "Class I",
      admissionType: "Day-Scholar",
      city: "Ballia",
      sendToWhatsapp: true,
      message: "",
      website_honey: "",
    });
    setStatus("idle");
    setErrorMessage("");
    setSuccessData(null);
  };

  const whatsappMessage = encodeURIComponent(
    `Namaste Devasthaly Vidyapeeth, I would like to enquire about admission for ${formData.studentName || "my child"} seeking grade ${formData.grade} (${formData.admissionType}). Parent: ${formData.parentName}, Mobile: ${formData.phone}, Location: ${formData.city}.`
  );

  return (
    <div className={`bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 ${className}`}>
      {/* Header Banner (#111827 Dark Surface) */}
      <div className="bg-[#111827] p-5 sm:p-6 text-white text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs sm:text-sm font-heading font-bold uppercase tracking-wider mb-2 border border-white/15">
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

      {status === "success" ? (
        <div className="p-5 sm:p-8 space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-4">
            <CheckCircle2 className="w-7 h-7 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <h4 className="font-heading text-lg font-bold text-emerald-950">
                Enquiry Registered Successfully!
              </h4>
              <p className="text-sm text-emerald-800 mt-1 leading-relaxed font-sans">
                {successData?.message ||
                  "Thank you for reaching out to Devasthaly Vidyapeeth. Your admission enquiry has been submitted. Our admissions counselor will contact you shortly to assist with prospectus and campus interaction."}
              </p>
            </div>
          </div>

          {/* Enquiry Summary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-sm space-y-2">
            <h5 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-500">
              Submitted Enquiry Summary
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-800 font-sans">
              <p><strong>Student:</strong> {formData.studentName || "—"}</p>
              <p><strong>Class:</strong> {formData.grade} ({formData.admissionType})</p>
              <p><strong>Parent/Guardian:</strong> {formData.parentName || "—"}</p>
              <p><strong>Phone:</strong> {formData.phone || "—"}</p>
              <p><strong>Location:</strong> {formData.city}</p>
            </div>
          </div>

          {/* Immediate Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={successData?.whatsappRedirectUrl || `https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 min-h-[52px] rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/70 transition-colors flex items-center gap-3.5 group focus-visible:outline-2 focus-visible:outline-[#25D366]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-[#111827]">Connect on WhatsApp</p>
                <p className="text-xs text-gray-600">Chat directly with pre-filled details</p>
              </div>
            </a>

            <a
              href={`tel:${SCHOOL_INFO.contacts.admissionsPhone}`}
              className="p-4 min-h-[52px] rounded-2xl bg-red-50 border border-red-200 hover:bg-red-100/70 transition-colors flex items-center gap-3.5 group focus-visible:outline-2 focus-visible:outline-[#B91C1C]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#B91C1C] text-white flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-[#111827]">Call Admissions Desk</p>
                <p className="text-xs text-gray-600 font-mono font-bold text-[#B91C1C]">
                  +91 {SCHOOL_INFO.contacts.admissionsPhone}
                </p>
              </div>
            </a>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl border border-gray-300 text-sm font-bold text-[#111827] hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-[#B91C1C]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Submit Another Enquiry</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5">
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

          {/* Help notice */}
          <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-100 text-[#111827] text-sm flex items-start gap-2.5">
            <Info className="w-4 h-4 shrink-0 text-[#B91C1C] mt-0.5" />
            <span>
              <strong>Admissions Desk Notice:</strong> Submit your details below to register directly with our administrative team for the 2026–27 academic session, or call our admissions helpline directly at <strong>{SCHOOL_INFO.contacts.admissionsPhone}</strong>.
            </span>
          </div>

          {status === "error" && (
            <div
              id="enquiry-error-msg"
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Name */}
            <div>
              <label
                htmlFor="enquiry-student-name"
                className="block text-sm font-heading font-bold text-[#111827] mb-1"
              >
                Student Name <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                type="text"
                id="enquiry-student-name"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                placeholder="Enter student full name"
                required
                className="w-full px-3.5 py-3 min-h-[44px] rounded-xl border border-[#E5E7EB] text-base text-[#111827] placeholder:text-gray-400 focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all bg-white"
              />
            </div>

            {/* Parent Name */}
            <div>
              <label
                htmlFor="enquiry-parent-name"
                className="block text-sm font-heading font-bold text-[#111827] mb-1"
              >
                Parent / Guardian Name <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                type="text"
                id="enquiry-parent-name"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                placeholder="Enter parent / guardian name"
                required
                className="w-full px-3.5 py-3 min-h-[44px] rounded-xl border border-[#E5E7EB] text-base text-[#111827] placeholder:text-gray-400 focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all bg-white"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="enquiry-phone"
                className="block text-sm font-heading font-bold text-[#111827] mb-1"
              >
                Mobile Number <span className="text-[#B91C1C]">*</span>
              </label>
              <input
                type="tel"
                id="enquiry-phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
                className="w-full px-3.5 py-3 min-h-[44px] rounded-xl border border-[#E5E7EB] text-base text-[#111827] placeholder:text-gray-400 focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all bg-white"
              />
            </div>

            {/* Grade */}
            <div>
              <label
                htmlFor="enquiry-grade"
                className="block text-sm font-heading font-bold text-[#111827] mb-1"
              >
                Seeking Admission In <span className="text-[#B91C1C]">*</span>
              </label>
              <select
                id="enquiry-grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-3.5 py-3 min-h-[44px] rounded-xl border border-[#E5E7EB] text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all bg-white"
              >
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Admission Type */}
            <div>
              <label
                htmlFor="enquiry-admission-type"
                className="block text-sm font-heading font-bold text-[#111827] mb-1"
              >
                Scholarship / Residence Type
              </label>
              <select
                id="enquiry-admission-type"
                name="admissionType"
                value={formData.admissionType}
                onChange={handleChange}
                className="w-full px-3.5 py-3 min-h-[44px] rounded-xl border border-[#E5E7EB] text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all bg-white"
              >
                <option value="Day-Scholar">Day-Scholar</option>
                <option value="Residential Boarder">Residential Boarder (Hostel)</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="enquiry-city"
                className="block text-sm font-heading font-bold text-[#111827] mb-1"
              >
                City / Location
              </label>
              <select
                id="enquiry-city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3.5 py-3 min-h-[44px] rounded-xl border border-[#E5E7EB] text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all bg-white"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Message */}
          <div>
            <label
              htmlFor="enquiry-message"
              className="block text-sm font-heading font-bold text-[#111827] mb-1"
            >
              Optional Message / Queries
            </label>
            <textarea
              id="enquiry-message"
              name="message"
              rows={2}
              value={formData.message}
              onChange={handleChange}
              placeholder="Ask about boarding facilities, bus routes, fee structure, or entrance assessment..."
              className="w-full px-3.5 py-3 rounded-xl border border-[#E5E7EB] text-base text-[#111827] placeholder:text-gray-400 focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all bg-white"
            />
          </div>

          {/* Direct WhatsApp Pre-fill option */}
          <div className="pt-1">
            <label
              htmlFor="enquiry-whatsapp-sync"
              className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700 min-h-[36px]"
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
              disabled={status === "submitting"}
              className="w-full py-3.5 sm:py-4 px-6 min-h-[48px] rounded-full bg-[#B91C1C] text-white font-heading font-bold text-sm tracking-wide uppercase hover:bg-[#991B1B] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg border border-[#991B1B] focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2 cursor-pointer disabled:opacity-60"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>Submitting Enquiry...</span>
                </>
              ) : (
                <span>Submit Admission Enquiry</span>
              )}
            </button>
            <p className="text-center text-xs sm:text-sm text-gray-500 mt-2">
              Admissions Helpline: {SCHOOL_INFO.contacts.admissionsPhone} • Mon–Sat: 8:00 AM – 3:30 PM
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
