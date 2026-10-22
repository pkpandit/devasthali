"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, Sparkles, MessageCircle } from "lucide-react";
import { SCHOOL_INFO } from "@/lib/school-data";

export function AdmissionEnquiryForm({ className = "" }: { className?: string }) {
  const [formData, setFormData] = useState({
    studentName: "",
    parentName: "",
    phone: "",
    grade: "Class I",
    admissionType: "Day-Scholar",
    city: "Ballia",
    sendToWhatsapp: true,
    message: "",
    // Honeypot field for bot spam prevention (must remain empty for humans)
    website_honey: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
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
    "Class XI (Science - PCM/PCB)",
    "Class XI (Commerce)",
    "Class XI (Humanities)",
  ];

  const cities = ["Chilkahar", "Rasra", "Ballia City", "Sikanderpur", "Bansdih", "Nagra", "Buxar", "Mau", "Other"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    setStatus("submitting");
    setErrorMessage("");

    // Spam honeypot trap
    if (formData.website_honey) {
      // Bot detected, silently fake success
      setTimeout(() => setStatus("success"), 500);
      return;
    }

    // Phone validation
    const phoneClean = formData.phone.replace(/[^0-9]/g, "");
    if (phoneClean.length < 10) {
      setStatus("error");
      setErrorMessage("Please enter a valid 10-digit mobile number for callback.");
      return;
    }

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Something went wrong while submitting. Please call our admission desk.");
      }

      setStatus("success");

      // If user chose WhatsApp sync, open WhatsApp with pre-filled message
      if (formData.sendToWhatsapp) {
        const text = encodeURIComponent(
          `Namaste Devasthaly Vidyapeeth, I have submitted an admission enquiry for ${formData.studentName} for grade ${formData.grade} (${formData.admissionType}). Parent: ${formData.parentName}, Contact: ${formData.phone}, Location: ${formData.city}.`
        );
        window.open(`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}?text=${text}`, "_blank");
      }
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to connect to server. Please try calling directly.");
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header Banner (#111827 Dark Surface) */}
      <div className="bg-[#111827] p-6 text-white text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-2 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
            Admissions Session 2025–26
          </span>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
            Online Admission Enquiry Desk
          </h3>
          <p className="text-xs text-gray-300 mt-1">
            Fill this quick 60-second form to receive the prospectus, entrance syllabus & callback.
          </p>
        </div>

        <div className="hidden md:flex flex-col items-end text-xs text-gray-300">
          <span className="text-white font-bold">Fast-Track Admission</span>
          <span>Response time: Under 4 hours</span>
        </div>
      </div>

      {status === "success" ? (
        <div className="p-8 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="font-heading text-2xl font-bold text-[#111827]">
            Enquiry Received Successfully!
          </h4>
          <p className="text-sm text-gray-600 max-w-md">
            Thank you, <strong>{formData.parentName}</strong>. Our admissions coordinator will reach out to you at <strong>{formData.phone}</strong> with the 2025–26 prospectus and entrance syllabus.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => {
                setStatus("idle");
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
              }}
              className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#111827] hover:bg-[#F3F4F6] transition-colors"
            >
              Submit Another Enquiry
            </button>
            <a
              href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1ebd5b] transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp Directly
            </a>
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

          {status === "error" && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Student Full Name <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                name="studentName"
                required
                value={formData.studentName}
                onChange={handleChange}
                placeholder="e.g. Aryan Pandey"
                className="w-full px-3.5 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#111827] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all outline-none bg-white"
              />
            </div>

            {/* Parent / Guardian Name */}
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Parent / Guardian Name <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                name="parentName"
                required
                value={formData.parentName}
                onChange={handleChange}
                placeholder="e.g. Rameshwar Pandey"
                className="w-full px-3.5 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#111827] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all outline-none bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* WhatsApp Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                WhatsApp Mobile Number <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                  +91
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="98765 43210"
                  className="w-full pl-12 pr-3.5 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#111827] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all outline-none bg-white"
                />
              </div>
            </div>

            {/* Grade Selection */}
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Class Seeking Admission <span className="text-[#DC2626]">*</span>
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-3.5 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#111827] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all outline-none bg-white"
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
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Admission Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Day-Scholar", "Residential Boarder"].map((type) => (
                  <label
                    key={type}
                    className={`flex items-center justify-center px-3 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      formData.admissionType === type
                        ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs"
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
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Your Current Location / Town
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3.5 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#111827] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all outline-none bg-white"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* WhatsApp Notification Checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-700">
              <input
                type="checkbox"
                name="sendToWhatsapp"
                checked={formData.sendToWhatsapp}
                onChange={handleChange}
                className="w-4 h-4 text-[#4F46E5] rounded border-[#E5E7EB] focus:ring-[#4F46E5]"
              />
              <span className="font-medium">
                Send syllabus, fee schedule, and prospectus copy directly to my WhatsApp
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full py-4 px-6 rounded-xl bg-[#4F46E5] text-white font-bold text-sm tracking-wide uppercase hover:bg-[#4338CA] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 border border-[#4338CA]"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Enquiry...</span>
                </>
              ) : (
                <>
                  <span>Submit Admission Enquiry 2025–26</span>
                  <Send className="w-4 h-4 text-white" />
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-gray-500 mt-2">
              🔒 100% Confidential. Devasthaly Vidyapeeth will never share your contact details.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
