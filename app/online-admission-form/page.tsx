"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, AlertCircle, Send, ShieldCheck } from "lucide-react";
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

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreement) {
      setStatus("error");
      setErrorMessage("Please check the declaration checkbox to confirm your agreement before submitting.");
      const declCheckbox = document.getElementById("declaration-agreement");
      declCheckbox?.focus();
      return;
    }
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: formData.studentName,
          parentName: formData.fatherName || formData.motherName,
          phone: formData.mobile,
          grade: formData.appliedClass,
          admissionType: "Day-Scholar",
          city: formData.city,
          sendToWhatsapp: true,
          website_honey: formData.website_honey,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to submit form. Please contact school desk.");
    }
  };

  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Full-Width White Edunex Page Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>Admissions / Online Portal</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            ONLINE REGISTRATION FORM 2026-27
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Official student registration and admission application for Devasthaly Vidyapeeth, Chilkahar, Ballia.
          </p>
        </div>
      </div>

      <div className="site-container max-w-4xl">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/90 shadow-sm space-y-8">
          {status === "success" ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-[#111827]">
                Registration Submitted Successfully!
              </h2>
              <p className="text-sm text-gray-600 max-w-lg mx-auto font-sans leading-relaxed">
                Thank you for applying. The application for <strong>{formData.studentName}</strong> (Class {formData.appliedClass}) has been recorded. Our admissions office will contact you at <strong>{formData.mobile}</strong>.
              </p>
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
                      <label htmlFor="reg-father-name" className="block text-sm font-heading font-bold uppercase mb-1">Father's Name *</label>
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
                      <label htmlFor="reg-father-mobile" className="block text-sm font-heading font-bold uppercase mb-1">Father's Mobile</label>
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
                      <label htmlFor="reg-father-occupation" className="block text-sm font-heading font-bold uppercase mb-1">Father's Occupation</label>
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
                      <label htmlFor="reg-mother-name" className="block text-sm font-heading font-bold uppercase mb-1">Mother's Name</label>
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
                      <label htmlFor="reg-mother-mobile" className="block text-sm font-heading font-bold uppercase mb-1">Mother's Mobile</label>
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
                      <label htmlFor="reg-mother-occupation" className="block text-sm font-heading font-bold uppercase mb-1">Mother's Occupation</label>
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
                  disabled={status === "submitting"}
                  className="w-full py-4 px-8 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-heading font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 border border-[#991B1B] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>{status === "submitting" ? "Submitting Registration..." : "Submit Online Registration Form"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

