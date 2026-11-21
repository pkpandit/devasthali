"use client";

import { useState, useTransition } from "react";
import { X, Loader2, User, Phone, Mail, GraduationCap, Calendar } from "lucide-react";
import { updateEnquiryStatus } from "@/lib/server/admissions-actions";

export interface SerializedEnquiry {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  email: string | null;
  grade: string;
  message: string | null;
  status: "PENDING" | "CONTACTED" | "RESOLVED" | "ARCHIVED";
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EnquiryDetailDialogProps {
  isOpen: boolean;
  enquiry: SerializedEnquiry | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EnquiryDetailDialog({
  isOpen,
  enquiry,
  onClose,
  onSuccess,
}: EnquiryDetailDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"PENDING" | "CONTACTED" | "RESOLVED" | "ARCHIVED">(
    enquiry?.status || "PENDING"
  );
  const [adminNotes, setAdminNotes] = useState<string>(enquiry?.adminNotes || "");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !enquiry) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await updateEnquiryStatus({
          id: enquiry.id,
          status,
          adminNotes: adminNotes.trim() || null,
        });

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Failed to update enquiry.");
        }
      } catch (err) {
        console.error("Update enquiry error:", err);
        setError("An unexpected error occurred while updating enquiry.");
      }
    });
  };

  const statusBadgeColors: Record<SerializedEnquiry["status"], { bg: string; text: string }> = {
    PENDING: { bg: "#fef3c7", text: "#92400e" },
    CONTACTED: { bg: "#dbeafe", text: "#1e40af" },
    RESOLVED: { bg: "#dcfce7", text: "#166534" },
    ARCHIVED: { bg: "#f3f4f6", text: "#4b5563" },
  };

  return (
    <div className="admin-dialog-backdrop" onClick={onClose} role="presentation">
      <div
        className="admin-dialog-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-detail-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "560px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3 id="enquiry-detail-title" style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>
              Enquiry Details
            </h3>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "12px",
                backgroundColor: statusBadgeColors[enquiry.status].bg,
                color: statusBadgeColors[enquiry.status].text,
              }}
            >
              {enquiry.status}
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
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div style={{ backgroundColor: "#f9fafb", padding: "10px 12px", borderRadius: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "12px" }}>
              <User size={14} aria-hidden="true" />
              <span>Student Name</span>
            </div>
            <div style={{ fontWeight: 600, color: "#111827", fontSize: "14px", marginTop: "2px" }}>
              {enquiry.studentName}
            </div>
          </div>

          <div style={{ backgroundColor: "#f9fafb", padding: "10px 12px", borderRadius: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "12px" }}>
              <GraduationCap size={14} aria-hidden="true" />
              <span>Grade Sought</span>
            </div>
            <div style={{ fontWeight: 600, color: "#111827", fontSize: "14px", marginTop: "2px" }}>
              {enquiry.grade}
            </div>
          </div>

          <div style={{ backgroundColor: "#f9fafb", padding: "10px 12px", borderRadius: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "12px" }}>
              <User size={14} aria-hidden="true" />
              <span>Parent / Guardian</span>
            </div>
            <div style={{ fontWeight: 600, color: "#111827", fontSize: "14px", marginTop: "2px" }}>
              {enquiry.parentName}
            </div>
          </div>

          <div style={{ backgroundColor: "#f9fafb", padding: "10px 12px", borderRadius: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "12px" }}>
              <Phone size={14} aria-hidden="true" />
              <span>Contact Phone</span>
            </div>
            <div style={{ fontWeight: 600, color: "#111827", fontSize: "14px", marginTop: "2px" }}>
              <a href={`tel:${enquiry.phone}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                {enquiry.phone}
              </a>
            </div>
          </div>

          {enquiry.email && (
            <div style={{ backgroundColor: "#f9fafb", padding: "10px 12px", borderRadius: "8px", gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "12px" }}>
                <Mail size={14} aria-hidden="true" />
                <span>Email Address</span>
              </div>
              <div style={{ fontWeight: 600, color: "#111827", fontSize: "14px", marginTop: "2px" }}>
                <a href={`mailto:${enquiry.email}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                  {enquiry.email}
                </a>
              </div>
            </div>
          )}

          <div style={{ backgroundColor: "#f9fafb", padding: "10px 12px", borderRadius: "8px", gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "12px" }}>
              <Calendar size={14} aria-hidden="true" />
              <span>Submission Timestamp</span>
            </div>
            <div style={{ color: "#374151", fontSize: "13px", marginTop: "2px" }}>
              {new Date(enquiry.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {enquiry.message && (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Parent Message:
            </label>
            <div
              style={{
                padding: "10px 12px",
                backgroundColor: "#f3f4f6",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#1f2937",
                lineHeight: 1.5,
              }}
            >
              {enquiry.message}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div style={{ marginBottom: "14px" }}>
            <label
              htmlFor="enquiry-status-select"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
            >
              Update Status:
            </label>
            <select
              id="enquiry-status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as "PENDING" | "CONTACTED" | "RESOLVED" | "ARCHIVED")}
              className="admin-select"
              style={{ width: "100%" }}
            >
              <option value="PENDING">Pending (Action Required)</option>
              <option value="CONTACTED">Contacted (Parent Reached)</option>
              <option value="RESOLVED">Resolved (Admission Processed)</option>
              <option value="ARCHIVED">Archived (Closed / Not Interested)</option>
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="enquiry-notes-textarea"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
            >
              Administrative Notes:
            </label>
            <textarea
              id="enquiry-notes-textarea"
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Record follow-up calls, interaction schedules, or verification notes..."
              className="admin-input"
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>

          <div
            className="admin-dialog-actions"
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="admin-button admin-button--secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="admin-button admin-button--primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Update Enquiry</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
