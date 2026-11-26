"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  AlertCircle,
  Send,
  CheckCircle,
  Info,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Copy,
  Printer,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { SCHOOL_INFO } from "@/lib/school-data";
import {
  getPublicRegistrationSettings,
  submitOnlineAdmissionApplication,
  type PublicRegistrationSettings,
  type SubmissionResponseData,
} from "@/features/admissions/online-actions";

function getOrGenerateIdempotencyKey(): string {
  if (typeof window !== "undefined") {
    let key = sessionStorage.getItem("dvp_admission_idemp_key");
    if (!key) {
      key = "idemp-" + Math.random().toString(36).slice(2) + "-" + Date.now();
      sessionStorage.setItem("dvp_admission_idemp_key", key);
    }
    return key;
  }
  return "idemp-" + Date.now();
}

export default function OnlineAdmissionFormPage() {
  const [settings, setSettings] = useState<PublicRegistrationSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Form input state
  const [formData, setFormData] = useState({
    appliedClass: "LKG",
    studentName: "",
    dob: "",
    gender: "Male",
    nationality: "Indian",
    religion: "", // Optional, blank by default
    category: "", // Optional, blank by default
    address: "",
    city: "Ballia",
    email: "",
    mobile: "",

    // Father
    fatherName: "",
    fatherMobile: "",
    fatherOccupation: "",

    // Mother
    motherName: "",
    motherMobile: "",
    motherOccupation: "",

    // Previous School Qualification
    lastAttendedClass: "",
    schoolName: "",
    schoolBoardName: "",

    // Consent & Honeypot
    declarationAgreed: false,
    website_honey: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submissionReceipt, setSubmissionReceipt] = useState<SubmissionResponseData | null>(null);
  const [receiptMessage, setReceiptMessage] = useState("");
  const [copiedRef, setCopiedRef] = useState(false);

  // Fetch uncached public registration settings
  useEffect(() => {
    getPublicRegistrationSettings()
      .then((s) => {
        setSettings(s);
        setIsLoadingSettings(false);
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setIsLoadingSettings(false);
      });
  }, []);

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

    // Client-side validation checks
    if (
      !formData.studentName.trim() ||
      !formData.dob ||
      !formData.mobile.trim() ||
      !formData.address.trim() ||
      !formData.fatherName.trim()
    ) {
      setStatus("error");
      setErrorMessage("Please fill all mandatory fields marked with an asterisk (*).");
      return;
    }

    if (!formData.declarationAgreed) {
      setStatus("error");
      setErrorMessage("Please check the declaration checkbox to confirm your agreement before submitting.");
      const declCheckbox = document.getElementById("declaration-agreement");
      declCheckbox?.focus();
      return;
    }

    setStatus("submitting");
    setErrorMessage("");
    setFieldErrors({});

    const idempotencyKey = getOrGenerateIdempotencyKey();

    const res = await submitOnlineAdmissionApplication({
      idempotencyKey,
      appliedClass: formData.appliedClass,
      studentName: formData.studentName.trim(),
      dob: formData.dob.trim(),
      gender: formData.gender,
      nationality: formData.nationality.trim() || "Indian",
      religion: formData.religion.trim() || undefined,
      category: formData.category.trim() || undefined,
      mobile: formData.mobile.trim(),
      email: formData.email.trim() || undefined,
      address: formData.address.trim(),
      city: formData.city.trim() || "Ballia",
      fatherName: formData.fatherName.trim(),
      fatherMobile: formData.fatherMobile.trim() || undefined,
      fatherOccupation: formData.fatherOccupation.trim() || undefined,
      motherName: formData.motherName.trim() || undefined,
      motherMobile: formData.motherMobile.trim() || undefined,
      motherOccupation: formData.motherOccupation.trim() || undefined,
      lastAttendedClass: formData.lastAttendedClass.trim() || undefined,
      previousSchoolName: formData.schoolName.trim() || undefined,
      previousSchoolBoard: formData.schoolBoardName.trim() || undefined,
      declarationAgreed: formData.declarationAgreed,
      website_honey: formData.website_honey || "",
    });

    if (res.success && res.data) {
      setSubmissionReceipt(res.data);
      setReceiptMessage(
        res.message ||
          "This reference number confirms receipt of your online application only. It does not confirm admission. The school will review the application and advise you of the next steps."
      );
      setStatus("success");
      // Clear stored idempotency key so future distinct submissions get fresh keys
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("dvp_admission_idemp_key");
      }
    } else {
      setStatus("error");
      setErrorMessage(
        res.error || "An error occurred while submitting your registration. Please try again or contact our helpline."
      );
      if (res.fieldErrors) {
        setFieldErrors(res.fieldErrors);
      }
    }
  };

  const handleCopyReference = () => {
    if (submissionReceipt?.applicationNumber && navigator.clipboard) {
      navigator.clipboard.writeText(submissionReceipt.applicationNumber);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  const handlePrintReceipt = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleNewRegistration = () => {
    if (typeof window !== "undefined") {
      const newKey = "idemp-" + Math.random().toString(36).slice(2) + "-" + Date.now();
      sessionStorage.setItem("dvp_admission_idemp_key", newKey);
    }
    setFormData({
      appliedClass: "LKG",
      studentName: "",
      dob: "",
      gender: "Male",
      nationality: "Indian",
      religion: "",
      category: "",
      address: "",
      city: "Ballia",
      email: "",
      mobile: "",
      fatherName: "",
      fatherMobile: "",
      fatherOccupation: "",
      motherName: "",
      motherMobile: "",
      motherOccupation: "",
      lastAttendedClass: "",
      schoolName: "",
      schoolBoardName: "",
      declarationAgreed: false,
      website_honey: "",
    });
    setSubmissionReceipt(null);
    setStatus("idle");
    setErrorMessage("");
    setFieldErrors({});
  };

  const sessionLabelDisplay = settings?.sessionLabel || "2026-27";
  const isRegistrationOpen = settings?.isRegistrationOpen ?? false;

  return (
    <div className="w-full bg-[#F3F4F6] pb-16">
      {/* Edunex Header Banner */}
      <div className="w-full bg-white border-b border-gray-200/80 py-10 sm:py-14 mb-10">
        <div className="site-container">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#B91C1C] text-sm font-heading font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>Admissions / Registration Portal</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-[40px] lg:leading-[50px] font-bold text-[#111827] tracking-tight">
            ONLINE REGISTRATION FORM {sessionLabelDisplay}
          </h1>
          <p className="text-base text-gray-600 leading-[1.7] mt-3 max-w-3xl leading-relaxed font-sans">
            Official student registration and admission guidance for Devasthaly Vidyapeeth, Chilkahar, Ballia.
          </p>
        </div>
      </div>

      <div className="site-container max-w-4xl">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/90 shadow-sm space-y-8">
          {/* Loading settings state */}
          {isLoadingSettings ? (
            <div className="py-16 text-center space-y-4">
              <Loader2 className="w-8 h-8 text-[#B91C1C] animate-spin mx-auto" />
              <p className="text-sm font-semibold text-gray-600">Verifying registration portal status...</p>
            </div>
          ) : !isRegistrationOpen ? (
            /* CLOSED REGISTRATION STATE (FAIL-CLOSED) */
            <div className="py-8 space-y-6">
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-amber-950">
                      Online Registration Closed
                    </h2>
                    <p className="text-sm text-amber-900 mt-1">
                      {settings?.closedMessage ||
                        `Online registration for Session ${sessionLabelDisplay} is currently closed. For admissions guidance or campus visits, please contact our counter.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verified Alternative Admission Steps */}
              <div className="space-y-4 pt-2">
                <h3 className="font-heading text-base font-bold text-[#111827]">
                  To complete registration or collect forms for Session {sessionLabelDisplay}, please use our verified channels:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-gray-200 space-y-2">
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

                  <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-gray-200 space-y-2">
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

                  <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2.5 text-[#B91C1C]">
                      <Mail className="w-5 h-5 shrink-0" />
                      <h4 className="font-heading font-bold text-sm text-[#111827]">Official Email</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Email admissions enquiries directly to our office.
                    </p>
                    <div className="pt-1">
                      <a href={`mailto:${SCHOOL_INFO.contacts.email}`} className="text-[#B91C1C] font-semibold text-xs hover:underline">
                        {SCHOOL_INFO.contacts.email}
                      </a>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/70 transition-colors space-y-2 group"
                  >
                    <div className="flex items-center gap-2.5 text-[#25D366]">
                      <MessageCircle className="w-5 h-5 shrink-0" />
                      <h4 className="font-heading font-bold text-sm text-[#111827]">WhatsApp Helpdesk</h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Connect with the school helpdesk on WhatsApp for quick guidance.
                    </p>
                  </a>
                </div>
              </div>
            </div>
          ) : status === "success" && submissionReceipt ? (
            /* CONFIRMATION RECEIPT CARD STATE */
            <div className="py-6 space-y-6">
              {/* Status Header */}
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-emerald-950">
                      Application Lodged Successfully
                    </h2>
                    <p className="text-sm text-emerald-800 leading-relaxed">
                      {receiptMessage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reference Number Box */}
              <div className="p-6 rounded-2xl bg-white border border-gray-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-gray-500">
                    Your Application Reference Number
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-[#B91C1C] mt-1 tracking-tight">
                    {submissionReceipt.applicationNumber}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyReference}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copiedRef ? "Copied!" : "Copy Number"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>

              {/* Applicant Summary */}
              <div className="p-6 rounded-2xl bg-[#F9FAFB] border border-gray-200 text-sm space-y-3">
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-500">
                  Registered Details Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-800">
                  <p><strong>Student Name:</strong> {submissionReceipt.studentName}</p>
                  <p><strong>Applied Class:</strong> Class {submissionReceipt.appliedClass}</p>
                  <p><strong>Date of Birth:</strong> {formData.dob || "—"}</p>
                  <p><strong>Primary Mobile:</strong> {formData.mobile}</p>
                  <p><strong>Father&apos;s Name:</strong> {formData.fatherName}</p>
                  <p><strong>Submission Timestamp:</strong> {new Date(submissionReceipt.submittedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Verified Institutional Next Steps */}
              <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4">
                <h3 className="font-heading text-base font-bold text-[#111827]">
                  Important Next Steps:
                </h3>
                <ul className="text-xs sm:text-sm text-gray-700 space-y-2.5 list-disc pl-5 leading-relaxed font-sans">
                  <li>
                    Please quote Reference Number <strong>{submissionReceipt.applicationNumber}</strong> in all correspondence with the school admissions desk.
                  </li>
                  <li>
                    Our admissions team will review your application and advise you of the date and schedule for the on-campus parent interaction / diagnostic assessment.
                  </li>
                  <li>
                    On your scheduled campus visit, please carry the applicant&apos;s birth certificate, recent passport photos, and previous school report card for verification.
                  </li>
                  <li>
                    For direct assistance or status updates, call the Admissions Desk at <strong>+91 {SCHOOL_INFO.contacts.admissionsPhone}</strong> (Mon–Sat, 8:00 AM – 3:30 PM).
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleNewRegistration}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-300 text-sm font-bold text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Register Another Applicant</span>
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE APPLICATION SUBMISSION FORM */
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Anti-spam honeypot */}
              <input
                type="text"
                name="website_honey"
                value={formData.website_honey}
                onChange={handleChange}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Informational Guidance Notice Banner */}
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-[#B91C1C] mt-0.5" />
                <div>
                  <p className="font-bold text-[#B91C1C]">Admissions Guidance — Session {sessionLabelDisplay}</p>
                  <p className="mt-0.5 text-gray-700 leading-relaxed">
                    {settings?.guidanceNotice ||
                      `Please fill in all mandatory details accurately. For assistance, contact our admissions coordinator at +91 ${SCHOOL_INFO.contacts.admissionsPhone}.`}
                  </p>
                </div>
              </div>

              {status === "error" && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Class Selection */}
              <div className="p-6 rounded-2xl bg-[#F3F4F6] border border-gray-200/80 space-y-3">
                <label
                  htmlFor="reg-applied-class"
                  className="block text-sm font-heading font-bold uppercase tracking-wider text-[#111827]"
                >
                  Applied Class For <span className="text-red-500">*</span>
                </label>
                <select
                  id="reg-applied-class"
                  name="appliedClass"
                  value={formData.appliedClass}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-base text-[#111827] font-sans focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden"
                >
                  {[
                    "LKG",
                    "UKG",
                    "I",
                    "II",
                    "III",
                    "IV",
                    "V",
                    "VI",
                    "VII",
                    "VIII",
                    "IX",
                    "XI COMM",
                    "XI MATHS",
                    "XI BIO",
                    "XI HUM",
                  ].map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
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
                      placeholder="Full Name as per official record"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    />
                    {fieldErrors.studentName && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.studentName[0]}</p>
                    )}
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
                    {fieldErrors.dob && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.dob[0]}</p>
                    )}
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
                      Religion (Optional)
                    </label>
                    <input
                      type="text"
                      id="reg-religion"
                      name="religion"
                      value={formData.religion}
                      onChange={handleChange}
                      placeholder="e.g. Hindu / Muslim / Christian / Other"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-category" className="block text-sm font-heading font-bold text-[#111827] uppercase mb-1">
                      Category (Optional)
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
                      Primary Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="reg-mobile"
                      name="mobile"
                      autoComplete="tel"
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    />
                    {fieldErrors.mobile && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.mobile[0]}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="reg-email" className="block text-sm font-heading font-bold text-[#111827] uppercase mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      id="reg-email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.email[0]}</p>
                    )}
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
                      placeholder="House / Village, Post, Tehsil"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus-visible:outline-hidden"
                    />
                    {fieldErrors.address && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.address[0]}</p>
                    )}
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
                      <label htmlFor="reg-father-name" className="block text-sm font-heading font-bold uppercase mb-1">
                        Father&apos;s Name <span className="text-red-500">*</span>
                      </label>
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
                      {fieldErrors.fatherName && (
                        <p className="text-xs text-red-600 mt-1">{fieldErrors.fatherName[0]}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="reg-father-mobile" className="block text-sm font-heading font-bold uppercase mb-1">
                        Father&apos;s Mobile
                      </label>
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
                      <label htmlFor="reg-father-occupation" className="block text-sm font-heading font-bold uppercase mb-1">
                        Father&apos;s Occupation
                      </label>
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
                      <label htmlFor="reg-mother-name" className="block text-sm font-heading font-bold uppercase mb-1">
                        Mother&apos;s Name
                      </label>
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
                      <label htmlFor="reg-mother-mobile" className="block text-sm font-heading font-bold uppercase mb-1">
                        Mother&apos;s Mobile
                      </label>
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
                      <label htmlFor="reg-mother-occupation" className="block text-sm font-heading font-bold uppercase mb-1">
                        Mother&apos;s Occupation
                      </label>
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
                    <label htmlFor="reg-last-class" className="block text-sm font-heading font-bold uppercase mb-1">
                      Last Attended Class
                    </label>
                    <input
                      type="text"
                      id="reg-last-class"
                      name="lastAttendedClass"
                      value={formData.lastAttendedClass}
                      onChange={handleChange}
                      placeholder="e.g. UKG / V"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-[#111827] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/20 focus-visible:outline-hidden transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-prev-school" className="block text-sm font-heading font-bold uppercase mb-1">
                      Previous School Name
                    </label>
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
                    <label htmlFor="reg-school-board" className="block text-sm font-heading font-bold uppercase mb-1">
                      School Board Name
                    </label>
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
                    name="declarationAgreed"
                    checked={formData.declarationAgreed}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#B91C1C] rounded mt-0.5 shrink-0"
                  />
                  <span className="text-sm text-[#111827] font-sans leading-relaxed">
                    I certify/agree that all the entries filled in this registration form are true and correct. If any statement is found inaccurate or untrue, my application is liable to be cancelled according to school regulations.
                  </span>
                </label>
                {fieldErrors.declarationAgreed && (
                  <p className="text-xs text-red-600 pl-7">{fieldErrors.declarationAgreed[0]}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-4 px-8 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-heading font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg border border-[#991B1B] focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Registration Details...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Proceed with Registration Details</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
