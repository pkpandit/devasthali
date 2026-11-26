"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save, User, Phone, Mail, MapPin, Calendar, BookOpen, AlertCircle } from "lucide-react";
import {
  updateAdmissionApplicationStatusAction,
} from "@/lib/server/online-admission-actions";
import {
  ALLOWED_STATUS_TRANSITIONS,
  type ApplicationStatusType,
} from "@/lib/validation/online-admissions";

export interface SerializedApplication {
  id: string;
  applicationNumber: string;
  idempotencyKey: string;
  sessionCode: string;
  appliedClass: string;
  studentName: string;
  dob: string;
  gender: string;
  nationality: string | null;
  religion: string | null;
  category: string | null;
  mobile: string;
  email: string | null;
  address: string;
  city: string;
  fatherName: string;
  fatherMobile: string | null;
  fatherOccupation: string | null;
  motherName: string | null;
  motherMobile: string | null;
  motherOccupation: string | null;
  lastAttendedClass: string | null;
  previousSchoolName: string | null;
  previousSchoolBoard: string | null;
  declarationAgreed: boolean;
  status: ApplicationStatusType;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationDetailDialogProps {
  isOpen: boolean;
  application: SerializedApplication | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplicationDetailDialog({
  isOpen,
  application,
  onClose,
  onSuccess,
}: ApplicationDetailDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ApplicationStatusType>(
    application?.status || "SUBMITTED"
  );
  const [adminNotes, setAdminNotes] = useState<string>(
    application?.adminNotes || ""
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !application) return null;

  const currentStatus = application.status;
  const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  // Status options available: current status + allowed next transitions
  const availableStatuses: ApplicationStatusType[] = [
    currentStatus,
    ...allowedNext,
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await updateAdmissionApplicationStatusAction({
          id: application.id,
          status,
          adminNotes: adminNotes.trim() || null,
        });

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Failed to update application.");
        }
      } catch (err) {
        console.error("Update application error:", err);
        setError("An unexpected error occurred while updating the application.");
      }
    });
  };

  const statusBadgeColors: Record<ApplicationStatusType, { bg: string; text: string }> = {
    SUBMITTED: { bg: "#e0e7ff", text: "#3730a3" },
    UNDER_REVIEW: { bg: "#fef3c7", text: "#92400e" },
    VERIFIED: { bg: "#dcfce7", text: "#166534" },
    WITHDRAWN: { bg: "#f3f4f6", text: "#4b5563" },
    REJECTED: { bg: "#fee2e2", text: "#991b1b" },
    ARCHIVED: { bg: "#f1f5f9", text: "#475569" },
  };

  return (
    <div className="admin-dialog-backdrop" onClick={onClose} role="presentation">
      <div
        className="admin-dialog-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-detail-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "680px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h3 id="app-detail-title" style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>
              {application.applicationNumber}
            </h3>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "12px",
                backgroundColor: statusBadgeColors[application.status]?.bg || "#f3f4f6",
                color: statusBadgeColors[application.status]?.text || "#111827",
              }}
            >
              {application.status}
            </span>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              Session: {application.sessionCode} • Class: {application.appliedClass}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="admin-button admin-button--icon"
            aria-label="Close dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#fee2e2",
              border: "1px solid #f87171",
              borderRadius: "6px",
              color: "#b91c1c",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ overflowY: "auto", flex: 1, paddingRight: "4px" }}>
          {/* Student Bio Details */}
          <div style={{ padding: "14px", backgroundColor: "#f9fafb", borderRadius: "8px", marginBottom: "14px" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 700, color: "#374151" }}>
              Student Personal Details
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", fontSize: "13px" }}>
              <div><strong>Full Name:</strong> {application.studentName}</div>
              <div><strong>Applied Class:</strong> {application.appliedClass}</div>
              <div><strong>Date of Birth:</strong> {application.dob}</div>
              <div><strong>Gender:</strong> {application.gender}</div>
              <div><strong>Nationality:</strong> {application.nationality || "Indian"}</div>
              <div><strong>Religion:</strong> {application.religion || "—"}</div>
              <div><strong>Category:</strong> {application.category || "—"}</div>
              <div><strong>Primary Mobile:</strong> {application.mobile}</div>
              <div><strong>Email:</strong> {application.email || "—"}</div>
              <div style={{ gridColumn: "1 / -1" }}><strong>Permanent Address:</strong> {application.address}, {application.city}</div>
            </div>
          </div>

          {/* Parents Details */}
          <div style={{ padding: "14px", backgroundColor: "#f9fafb", borderRadius: "8px", marginBottom: "14px" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 700, color: "#374151" }}>
              Parent & Guardian Information
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", fontSize: "13px" }}>
              <div><strong>Father&apos;s Name:</strong> {application.fatherName}</div>
              <div><strong>Father&apos;s Mobile:</strong> {application.fatherMobile || "—"}</div>
              <div><strong>Father&apos;s Occupation:</strong> {application.fatherOccupation || "—"}</div>
              <div><strong>Mother&apos;s Name:</strong> {application.motherName || "—"}</div>
              <div><strong>Mother&apos;s Mobile:</strong> {application.motherMobile || "—"}</div>
              <div><strong>Mother&apos;s Occupation:</strong> {application.motherOccupation || "—"}</div>
            </div>
          </div>

          {/* Academic History */}
          <div style={{ padding: "14px", backgroundColor: "#f9fafb", borderRadius: "8px", marginBottom: "14px" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 700, color: "#374151" }}>
              Previous Academic Qualification
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", fontSize: "13px" }}>
              <div><strong>Last Attended Class:</strong> {application.lastAttendedClass || "—"}</div>
              <div><strong>Previous School:</strong> {application.previousSchoolName || "—"}</div>
              <div><strong>School Board:</strong> {application.previousSchoolBoard || "—"}</div>
              <div><strong>Declaration Agreed:</strong> {application.declarationAgreed ? "Yes (Certified)" : "No"}</div>
              <div><strong>Submitted At:</strong> {new Date(application.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Status Update Form */}
          <form onSubmit={handleSubmit} style={{ borderTop: "1px solid #e5e7eb", paddingTop: "14px" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 700, color: "#111827" }}>
              Desk Status & Internal Notes
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label
                  htmlFor="app-status-select"
                  style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
                >
                  Status
                </label>
                <select
                  id="app-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatusType)}
                  className="admin-input"
                  style={{ width: "100%", padding: "8px 10px", fontSize: "13px" }}
                >
                  {availableStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px", display: "block" }}>
                  Allowed next: {allowedNext.length > 0 ? allowedNext.join(", ") : "None (Terminal status)"}
                </span>
              </div>

              <div>
                <label
                  htmlFor="app-admin-notes"
                  style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
                >
                  Admissions Desk Internal Notes
                </label>
                <textarea
                  id="app-admin-notes"
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record verification notes, interaction appointment dates, etc..."
                  className="admin-input"
                  style={{ width: "100%", padding: "8px 10px", fontSize: "13px", resize: "vertical" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="admin-button admin-button--secondary"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="admin-button admin-button--primary"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} aria-hidden="true" />
                    <span>Update Status & Notes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
