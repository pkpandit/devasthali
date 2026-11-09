"use client";

import React, { useState } from "react";
import { Sparkles, AlertCircle, Send, Info, Phone, Mail, MapPin, MessageCircle, ArrowLeft } from "lucide-react";
import { SCHOOL_INFO } from "@/lib/school-data";

export default function OnlineAdmissionFormPage() {
  const [formData, setFormData] = useState({
    appliedClass: "LKG",
    studentName: "",
    dob: "",
    aadhaarNumber: "",
    nationality: "Indian",
    religion: "Hindu",
    category: "General",
    gender: "Male",
    address: "",
    city: "Ballia",
    email: "",
    mobile: "",

    // Father
    fatherName: "",
    fatherMobile: "",
    fatherEmail: "",
    fatherOccupation: "",
    fatherOfficeAddress: "",
    fatherOrganization: "",

    // Mother
    motherName: "",
    motherMobile: "",
    motherEmail: "",
    motherOccupation: "",
    motherOfficeAddress: "",
    motherOrganization: "",

    // Local Guardian
    guardianName: "",
    guardianAddress: "",
    guardianMobile: "",
    guardianEmail: "",

    // Previous School Qualification
    lastAttendedClass: "",
    schoolName: "",
    schoolBoardName: "",
    resultOfLastExam: "",
    year: "2025",
    addressOfSchool: "",

    // Consent
    agreement: false,
    website_honey: "",
  });

  const [status, setStatus] = useState<"idle" | "unavailable" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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

    if (formData.website_honey) {
      setStatus("unavailable");
      return;
    }

    if (!formData.studentName.trim() || !formData.dob || !formData.mobile.trim() || !formData.address.trim()) {
      setStatus("error");
      setErrorMessage("Please fill all mandatory fields marked with an asterisk (*).");
      return;
    }

    if (!formData.agreement) {
      setStatus("error");
      setErrorMessage("Please check the declaration checkbox to confirm your agreement before submitting.");
      const declCheckbox = document.getElementById("declaration-agreement");
      declCheckbox?.focus();
      return;
    }

    setErrorMessage("");
    // Automated online persistence is not available - inform parent accurately with verified options
    setStatus("unavailable");
  };

  const whatsappMessage = encodeURIComponent(
    `Namaste Devasthaly Vidyapeeth, I am seeking registration for my child ${formData.studentName || "Student"} for Class ${formData.appliedClass}. Parent Contact: ${formData.mobile}, Address: ${formData.address}, ${formData.city}.`
  );

  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Full-Width White Edunex Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>Admissions / Registration Portal</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            ONLINE REGISTRATION FORM 2026-27
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Official student registration and admission guidance for Devasthaly Vidyapeeth, Chilkahar, Ballia.
          </p>
        </div>
      </div>

      <div className="site-container max-w-4xl">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/90 shadow-sm space-y-8">
          {status === "unavailable" ? (
            <div className="py-8 space-y-6">
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-amber-950">
                      Online Registration Submission Not Yet Available
                    </h2>
                    <p className="text-sm text-amber-800 mt-0.5">
                      Automated online submissions are not currently active. Your details for <strong>{formData.studentName || "the applicant"}</strong> (Class {formData.appliedClass}) were not submitted online.
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Details Summary */}
              <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-sm space-y-3">
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-500">
                  Form Details Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-800">
                  <p><strong>Student:</strong> {formData.studentName || "—"}</p>
                  <p><strong>Class Applied:</strong> {formData.appliedClass}</p>
                  <p><strong>Date of Birth:</strong> {formData.dob || "—"}</p>
                  <p><strong>Mobile:</strong> {formData.mobile || "—"}</p>
                  <p><strong>Father&apos;s Name:</strong> {formData.fatherName || "—"}</p>
                  <p><strong>City/Address:</strong> {formData.city} • {formData.address || "—"}</p>
                </div>
              </div>

              {/* Verified Alternative Admission Steps */}
              <div className="space-y-3">
                <h3 className="font-heading text-base font-bold text-[#111827]">
                  To complete registration for Session 2026–27, please use our verified channels:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2.5 text-[#B91C1C]">
                      <MapPin className="w-5 h-5 shrink-0" />
                      <h4 className="font-heading font-bold text-sm text-[#111827]">Campus Admissions Counter</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Visit our school counter to collect and submit the physical registration form &amp; prospectus in person.
                    </p>
                    <p className="text-xs font-semibold text-gray-800">
                      Devasthaly Vidyapeeth, Chilkahar, Ballia (Mon–Sat: 8:00 AM – 3:30 PM)
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2.5 text-[#B91C1C]">
                      <Phone className="w-5 h-5 shrink-0" />
                      <h4 className="font-heading font-bold text-sm text-[#111827]">Admissions Helpline</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Call our admissions coordinator directly for eligibility, seat availability, and test dates.
                    </p>
                    <div className="pt-1">
                      <a href={`tel:${SCHOOL_INFO.contacts.admissionsPhone}`} className="text-[#B91C1C] font-mono font-bold text-sm hover:underline">
                        +91 {SCHOOL_INFO.contacts.admissionsPhone} / {SCHOOL_INFO.contacts.receptionPhone}
                      </a>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/70 transition-colors space-y-2 group"
                  >
                    <div className="flex items-center gap-2.5 text-[#25D366]">
                      <MessageCircle className="w-5 h-5 shrink-0" />
                      <h4 className="font-heading font-bold text-sm text-[#111827]">Send Details via WhatsApp</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Click to open WhatsApp with your entered details pre-formatted for direct review by admissions staff.
                    </p>
                  </a>

                  <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2.5 text-[#B91C1C]">
                      <Mail className="w-5 h-5 shrink-0" />
                      <h4 className="font-heading font-bold text-sm text-[#111827]">Official Email</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Email scanned documents or queries to our principal desk.
                    </p>
                    <div className="pt-1">
                      <a href={`mailto:${SCHOOL_INFO.contacts.email}`} className="text-[#B91C1C] font-semibold text-xs hover:underline">
                        {SCHOOL_INFO.contacts.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-300 text-sm font-bold text-[#111827] hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Form</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Anti-spam honeypot */}
              <input
                type="text"
                name="website_honey"
                value={formData.website_honey}
                onChange={handleChange}
                className="hidden"
                tabIndex={-1}
              />

              {/* Informational notice banner */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
                <div>
                  <p className="font-bold">Online Portal Notice</p>
                  <p className="mt-0.5 text-amber-800">
                    Online form submission is not yet available. Physical registration forms can be submitted in person at the school admissions counter (Chilkahar, Ballia). For admissions guidance, call <strong>{SCHOOL_INFO.contacts.admissionsPhone}</strong> or <strong>{SCHOOL_INFO.contacts.receptionPhone}</strong>, or email <strong>{SCHOOL_INFO.contacts.email}</strong>.
                  </p>
                </div>
              </div>

              {status === "error" && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Class Selection */}
              <div className="p-6 rounded-2xl bg-[#F3F4F6] border border-gray-200/80 space-y-3">
                <label htmlFor="reg-applied-class" className="block text-sm font-heading font-bold uppercase tracking-wider text-[#111827]">
                  Applied Class For <span className="text-red-500">*</span>
                </label>
                <select
                  id="reg-applied-class"
                  name="appliedClass"
                  value={formData.appliedClass}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-base text-[#111827] font-sans focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden"
                >
                  {["LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "XI COMM", "XI MATHS", "XI BIO", "XI HUM"].map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* 1. PERSONAL DETAILS */}
              <div className="space-y-4">
                <h2 className="font-heading text-lg font-bold text-[#111827] pb-2 border-b border-gray-200 flex items-center gap-2">
                  <span>PERSONAL DETAILS</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-student-name" className="block text-sm font-heading font-bold text-[#111827] uppercase mb-1">
                      Student Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="reg-student-name"
                      name="studentName"
                      autoComplete="name"
                      required
                      value={formData.studentName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-dob" className="block text-sm font-heading font-bold text-[#111827] uppercase mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="reg-dob"
                      name="dob"
                      autoComplete="bday"
                      required
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-aadhaar" className="block text-sm font-heading font-bold text-[#111827] uppercase mb-1">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      id="reg-aadhaar"
                      name="aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={handleChange}
                      placeholder="12-digit Aadhaar"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-gender" className="block text-sm font-heading font-bold text-[#111827] uppercase mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="reg-gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="reg-nationality" className="block text-sm font-heading font-bold text-[#111827] uppercase mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      id="reg-nationality"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-religion" className="block text-sm font-heading font-bold text-[#111827] uppercase mb-1">
                      Religion
                    </label>
                    <input
                      type="text"
                      id="reg-religion"
                      name="religion"
                      value={formData.religion}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-category" className="block text-sm font-heading font-bold text-[#111827] uppercase mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      id="reg-category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="General / OBC / SC / ST"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-mobile" className="block text-sm font-heading font-bold text-[#111827] uppercase mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="reg-mobile"
                      name="mobile"
                      autoComplete="tel"
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="10-digit mobile"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="reg-address" className="block text-sm font-heading font-bold text-[#111827] uppercase mb-1">
                      Permanent Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="reg-address"
                      name="address"
                      autoComplete="street-address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-city" className="block text-sm font-heading font-bold text-[#111827] uppercase mb-1">
                      City / District <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="reg-city"
                      name="city"
                      autoComplete="address-level2"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-email" className="block text-sm font-heading font-bold text-[#111827] uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="reg-email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 2. PARENTS DETAILS */}
              <div className="space-y-6 pt-4 border-t border-gray-200">
                <h2 className="font-heading text-lg font-bold text-[#111827] pb-2 border-b border-gray-200">
                  PARENTS DETAILS
                </h2>

                {/* Father's Details */}
                <div className="p-5 rounded-2xl bg-[#F3F4F6] space-y-4">
                  <h3 className="font-heading text-sm font-bold uppercase text-[#B91C1C]">
                    Father&apos;s Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="reg-father-name" className="block text-sm font-heading font-bold uppercase mb-1">Father&apos;s Name *</label>
                      <input
                        type="text"
                        id="reg-father-name"
                        name="fatherName"
                        autoComplete="name"
                        required
                        value={formData.fatherName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-father-mobile" className="block text-sm font-heading font-bold uppercase mb-1">Father&apos;s Mobile</label>
                      <input
                        type="tel"
                        id="reg-father-mobile"
                        name="fatherMobile"
                        autoComplete="tel"
                        value={formData.fatherMobile}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-father-occupation" className="block text-sm font-heading font-bold uppercase mb-1">Father&apos;s Occupation</label>
                      <input
                        type="text"
                        id="reg-father-occupation"
                        name="fatherOccupation"
                        value={formData.fatherOccupation}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Mother's Details */}
                <div className="p-5 rounded-2xl bg-[#F3F4F6] space-y-4">
                  <h3 className="font-heading text-sm font-bold uppercase text-[#B91C1C]">
                    Mother&apos;s Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="reg-mother-name" className="block text-sm font-heading font-bold uppercase mb-1">Mother&apos;s Name</label>
                      <input
                        type="text"
                        id="reg-mother-name"
                        name="motherName"
                        autoComplete="name"
                        value={formData.motherName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-mother-mobile" className="block text-sm font-heading font-bold uppercase mb-1">Mother&apos;s Mobile</label>
                      <input
                        type="tel"
                        id="reg-mother-mobile"
                        name="motherMobile"
                        autoComplete="tel"
                        value={formData.motherMobile}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-mother-occupation" className="block text-sm font-heading font-bold uppercase mb-1">Mother&apos;s Occupation</label>
                      <input
                        type="text"
                        id="reg-mother-occupation"
                        name="motherOccupation"
                        value={formData.motherOccupation}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. QUALIFICATION DETAILS */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h2 className="font-heading text-lg font-bold text-[#111827] pb-2 border-b border-gray-200">
                  Qualification Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="reg-last-class" className="block text-sm font-heading font-bold uppercase mb-1">Last Attended Class</label>
                    <input
                      type="text"
                      id="reg-last-class"
                      name="lastAttendedClass"
                      value={formData.lastAttendedClass}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-prev-school" className="block text-sm font-heading font-bold uppercase mb-1">Previous School Name</label>
                    <input
                      type="text"
                      id="reg-prev-school"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-school-board" className="block text-sm font-heading font-bold uppercase mb-1">School Board Name</label>
                    <input
                      type="text"
                      id="reg-school-board"
                      name="schoolBoardName"
                      value={formData.schoolBoardName}
                      onChange={handleChange}
                      placeholder="CBSE / UP Board / ICSE"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 4. VERBATIM DECLARATION */}
              <div className="p-5 rounded-2xl bg-red-50 border border-red-100 space-y-3">
                <label htmlFor="declaration-agreement" className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="declaration-agreement"
                    name="agreement"
                    checked={formData.agreement}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#B91C1C] rounded mt-0.5 shrink-0"
                  />
                  <span className="text-sm text-[#111827] font-sans leading-relaxed">
                    I certify/agree that if I filled up all the entries are correct. If the statement is inaccurate and untrue my application automatically be cancelled and legal proceedings should be against me.
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-8 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-heading font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg border border-[#991B1B] focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Proceed with Registration Details</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
