"use client";

import { useState, useTransition } from "react";
import { Phone, Mail, Clock, ShieldAlert, HeartPulse, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { updateContactHelplines } from "@/lib/server/contact-actions";
import type { SerializedSiteProfile } from "./ContactLocationForm";

interface ContactHelplinesFormProps {
  initialProfile: SerializedSiteProfile;
  onSuccess?: () => void;
}

export function ContactHelplinesForm({
  initialProfile,
  onSuccess,
}: ContactHelplinesFormProps) {
  const [isPending, startTransition] = useTransition();

  const [primaryPhone, setPrimaryPhone] = useState(initialProfile.primaryPhone || "");
  const [admissionsPhone, setAdmissionsPhone] = useState(initialProfile.admissionsPhone || "");
  const [receptionPhone, setReceptionPhone] = useState(initialProfile.receptionPhone || "");
  const [hostelWardenPhone, setHostelWardenPhone] = useState(initialProfile.hostelWardenPhone || "");
  const [whatsappNumber, setWhatsappNumber] = useState(initialProfile.whatsappNumber || "");
  const [officeEmail, setOfficeEmail] = useState(initialProfile.officeEmail || "");
  const [principalEmail, setPrincipalEmail] = useState(initialProfile.principalEmail || "");
  const [workingHours, setWorkingHours] = useState(initialProfile.workingHours || "");
  const [emergencyMedicalPhone, setEmergencyMedicalPhone] = useState(initialProfile.emergencyMedicalPhone || "");
  const [emergencySecurityPhone, setEmergencySecurityPhone] = useState(initialProfile.emergencySecurityPhone || "");

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setFieldErrors({});

    startTransition(async () => {
      const res = await updateContactHelplines({
        primaryPhone: primaryPhone.trim() || null,
        admissionsPhone: admissionsPhone.trim() || null,
        receptionPhone: receptionPhone.trim() || null,
        hostelWardenPhone: hostelWardenPhone.trim() || null,
        whatsappNumber: whatsappNumber.trim() || null,
        officeEmail: officeEmail.trim() || null,
        principalEmail: principalEmail.trim() || null,
        workingHours: workingHours.trim() || null,
        emergencyMedicalPhone: emergencyMedicalPhone.trim() || null,
        emergencySecurityPhone: emergencySecurityPhone.trim() || null,
      });

      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Contact helplines, emergency numbers, and operational hours updated successfully.",
        });
        if (onSuccess) onSuccess();
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to update contact helplines. Please correct highlighted errors.",
        });
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Status banner */}
      {statusMessage && (
        <div
          role="alert"
          style={{
            padding: "14px 18px",
            borderRadius: "8px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: statusMessage.type === "success" ? "#ECFDF5" : "#FEF2F2",
            color: statusMessage.type === "success" ? "#065F46" : "#991B1B",
            border: `1px solid ${statusMessage.type === "success" ? "#A7F3D0" : "#FECACA"}`,
          }}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 style={{ width: "18px", height: "18px", flexShrink: 0 }} />
          ) : (
            <AlertCircle style={{ width: "18px", height: "18px", flexShrink: 0 }} />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Section 1: Official Helplines */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "10px",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
            borderBottom: "1px solid #F3F4F6",
            paddingBottom: "12px",
          }}
        >
          <Phone style={{ width: "20px", height: "20px", color: "#B91C1C" }} />
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#111827",
              fontFamily: "var(--font-heading, inherit)",
              margin: 0,
            }}
          >
            Campus Reception & Department Numbers
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Primary Phone */}
          <div>
            <label
              htmlFor="primaryPhone"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}
            >
              Main Campus Phone
            </label>
            <input
              id="primaryPhone"
              type="text"
              value={primaryPhone}
              onChange={(e) => setPrimaryPhone(e.target.value)}
              placeholder="e.g. +91 9415805530"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                border: `1px solid ${fieldErrors.primaryPhone ? "#EF4444" : "#D1D5DB"}`,
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            {fieldErrors.primaryPhone && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#DC2626" }}>
                {fieldErrors.primaryPhone[0]}
              </p>
            )}
          </div>

          {/* Admissions Phone */}
          <div>
            <label
              htmlFor="admissionsPhone"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}
            >
              Admissions Helpline
            </label>
            <input
              id="admissionsPhone"
              type="text"
              value={admissionsPhone}
              onChange={(e) => setAdmissionsPhone(e.target.value)}
              placeholder="e.g. +91 6307798158"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                border: `1px solid ${fieldErrors.admissionsPhone ? "#EF4444" : "#D1D5DB"}`,
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            {fieldErrors.admissionsPhone && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#DC2626" }}>
                {fieldErrors.admissionsPhone[0]}
              </p>
            )}
          </div>

          {/* Reception Desk */}
          <div>
            <label
              htmlFor="receptionPhone"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}
            >
              Front Desk / Reception
            </label>
            <input
              id="receptionPhone"
              type="text"
              value={receptionPhone}
              onChange={(e) => setReceptionPhone(e.target.value)}
              placeholder="e.g. +91 9415805530"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                border: `1px solid ${fieldErrors.receptionPhone ? "#EF4444" : "#D1D5DB"}`,
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            {fieldErrors.receptionPhone && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#DC2626" }}>
                {fieldErrors.receptionPhone[0]}
              </p>
            )}
          </div>

          {/* Hostel Warden */}
          <div>
            <label
              htmlFor="hostelWardenPhone"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}
            >
              Hostel Care / Warden
            </label>
            <input
              id="hostelWardenPhone"
              type="text"
              value={hostelWardenPhone}
              onChange={(e) => setHostelWardenPhone(e.target.value)}
              placeholder="e.g. +91 9415805530"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                border: `1px solid ${fieldErrors.hostelWardenPhone ? "#EF4444" : "#D1D5DB"}`,
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            {fieldErrors.hostelWardenPhone && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#DC2626" }}>
                {fieldErrors.hostelWardenPhone[0]}
              </p>
            )}
          </div>

          {/* WhatsApp Desk */}
          <div>
            <label
              htmlFor="whatsappNumber"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}
            >
              WhatsApp Support
            </label>
            <input
              id="whatsappNumber"
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="e.g. +91 9415805530"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                border: `1px solid ${fieldErrors.whatsappNumber ? "#EF4444" : "#D1D5DB"}`,
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            {fieldErrors.whatsappNumber && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#DC2626" }}>
                {fieldErrors.whatsappNumber[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Email & Hours */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "10px",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
            borderBottom: "1px solid #F3F4F6",
            paddingBottom: "12px",
          }}
        >
          <Mail style={{ width: "20px", height: "20px", color: "#B91C1C" }} />
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#111827",
              fontFamily: "var(--font-heading, inherit)",
              margin: 0,
            }}
          >
            Email Inquiries & Operational Schedule
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Office Email */}
          <div>
            <label
              htmlFor="officeEmail"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}
            >
              Administrative Office Email
            </label>
            <input
              id="officeEmail"
              type="email"
              value={officeEmail}
              onChange={(e) => setOfficeEmail(e.target.value)}
              placeholder="info@devasthaly.com"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                border: `1px solid ${fieldErrors.officeEmail ? "#EF4444" : "#D1D5DB"}`,
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            {fieldErrors.officeEmail && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#DC2626" }}>
                {fieldErrors.officeEmail[0]}
              </p>
            )}
          </div>

          {/* Principal Email */}
          <div>
            <label
              htmlFor="principalEmail"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}
            >
              Principal / Executive Email
            </label>
            <input
              id="principalEmail"
              type="email"
              value={principalEmail}
              onChange={(e) => setPrincipalEmail(e.target.value)}
              placeholder="principal@devasthaly.com"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                border: `1px solid ${fieldErrors.principalEmail ? "#EF4444" : "#D1D5DB"}`,
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            {fieldErrors.principalEmail && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#DC2626" }}>
                {fieldErrors.principalEmail[0]}
              </p>
            )}
          </div>

          {/* Working Hours */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              htmlFor="workingHours"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              <Clock style={{ width: "15px", height: "15px", color: "#6B7280" }} />
              <span>Campus Office Hours & Schedule</span>
            </label>
            <input
              id="workingHours"
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              placeholder="Mon–Sat: 8:00 AM – 2:30 PM (Sunday Closed)"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                border: `1px solid ${fieldErrors.workingHours ? "#EF4444" : "#D1D5DB"}`,
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            {fieldErrors.workingHours && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#DC2626" }}>
                {fieldErrors.workingHours[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: 24/7 Emergency Helplines */}
      <div
        style={{
          background: "#FFFBFB",
          border: "1px solid #FCA5A5",
          borderRadius: "10px",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
            borderBottom: "1px solid #FEE2E2",
            paddingBottom: "12px",
          }}
        >
          <ShieldAlert style={{ width: "20px", height: "20px", color: "#DC2626" }} />
          <div>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#991B1B",
                fontFamily: "var(--font-heading, inherit)",
                margin: 0,
              }}
            >
              24/7 Emergency Campus Desks
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#7F1D1D" }}>
              Dedicated instant-response hotlines displayed on the public contact quick-bar for urgent medical or security assistance.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Medical Desk */}
          <div>
            <label
              htmlFor="emergencyMedicalPhone"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#991B1B",
                marginBottom: "6px",
              }}
            >
              <HeartPulse style={{ width: "15px", height: "15px", color: "#DC2626" }} />
              <span>Medical Emergency Desk (10-Digit Mobile)</span>
            </label>
            <input
              id="emergencyMedicalPhone"
              type="text"
              value={emergencyMedicalPhone}
              onChange={(e) => setEmergencyMedicalPhone(e.target.value)}
              placeholder="e.g. 9415805530"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                border: `1px solid ${fieldErrors.emergencyMedicalPhone ? "#DC2626" : "#E5E7EB"}`,
                backgroundColor: "#FFFFFF",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            {fieldErrors.emergencyMedicalPhone && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#DC2626" }}>
                {fieldErrors.emergencyMedicalPhone[0]}
              </p>
            )}
          </div>

          {/* Security Desk */}
          <div>
            <label
              htmlFor="emergencySecurityPhone"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#991B1B",
                marginBottom: "6px",
              }}
            >
              <ShieldAlert style={{ width: "15px", height: "15px", color: "#DC2626" }} />
              <span>Security Emergency Desk (10-Digit Mobile)</span>
            </label>
            <input
              id="emergencySecurityPhone"
              type="text"
              value={emergencySecurityPhone}
              onChange={(e) => setEmergencySecurityPhone(e.target.value)}
              placeholder="e.g. 6307798158"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                border: `1px solid ${fieldErrors.emergencySecurityPhone ? "#DC2626" : "#E5E7EB"}`,
                backgroundColor: "#FFFFFF",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            {fieldErrors.emergencySecurityPhone && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#DC2626" }}>
                {fieldErrors.emergencySecurityPhone[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "12px",
          borderTop: "1px solid #E5E7EB",
        }}
      >
        <button
          type="submit"
          disabled={isPending}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: isPending ? "#9CA3AF" : "#B91C1C",
            color: "#FFFFFF",
            padding: "10px 24px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 600,
            border: "none",
            cursor: isPending ? "not-allowed" : "pointer",
            transition: "background-color 0.15s ease",
          }}
        >
          {isPending && <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />}
          {isPending ? "Saving Helplines..." : "Save Helplines & Schedule"}
        </button>
      </div>
    </form>
  );
}
