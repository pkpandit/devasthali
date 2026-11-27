"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save, Settings, AlertCircle } from "lucide-react";
import { updateAdmissionOverviewAction } from "@/lib/server/admissions-publication-actions";
import { isValidDocumentUrl } from "@/lib/validation/admissions-publication";

export interface SerializedAdmissionOverview {
  id: string;
  sessionLabel: string;
  feeStructureTitle: string;
  feeStructureSubtitle: string;
  prospectusTitle: string;
  prospectusDescription: string;
  prospectusPdfUrl: string;
  prospectusDisplayLabel: string;
  admissionChartPdfUrl: string;
  admissionChartDisplayLabel: string;
  createdAt: string;
  updatedAt: string;
}

interface FeeOverviewDialogProps {
  isOpen: boolean;
  overview: SerializedAdmissionOverview | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function FeeOverviewDialog({
  isOpen,
  overview,
  onClose,
  onSuccess,
}: FeeOverviewDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [sessionLabel, setSessionLabel] = useState(overview?.sessionLabel ?? "2026-27");
  const [feeStructureTitle, setFeeStructureTitle] = useState(
    overview?.feeStructureTitle ?? "Fee Structure (Session 2026–27)"
  );
  const [feeStructureSubtitle, setFeeStructureSubtitle] = useState(
    overview?.feeStructureSubtitle ??
      "Official statutory fee schedule and prospectus for Devasthaly Vidyapeeth, Chilkahar, Ballia."
  );
  const [admissionChartPdfUrl, setAdmissionChartPdfUrl] = useState(
    overview?.admissionChartPdfUrl ?? "/documents/original/new-admission-chart-2026-27.pdf"
  );
  const [admissionChartDisplayLabel, setAdmissionChartDisplayLabel] = useState(
    overview?.admissionChartDisplayLabel ?? "Admission Chart (722 KB)"
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidDocumentUrl(admissionChartPdfUrl)) {
      setError(
        "Invalid admission chart PDF URL. Must be a valid approved static PDF path under /documents/."
      );
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateAdmissionOverviewAction({
          sessionLabel: sessionLabel.trim(),
          feeStructureTitle: feeStructureTitle.trim(),
          feeStructureSubtitle: feeStructureSubtitle.trim(),
          prospectusTitle: overview?.prospectusTitle ?? "Official Devasthaly Vidyapeeth Prospectus",
          prospectusDescription:
            overview?.prospectusDescription ??
            "Complete publication containing the vision of Founder Shri Chandra Shekhar, admission eligibility, code of conduct, academic syllabus, examination assessment rules, and hostel guidelines.",
          prospectusPdfUrl: overview?.prospectusPdfUrl ?? "/documents/original/prospectus-2.pdf",
          prospectusDisplayLabel: overview?.prospectusDisplayLabel ?? "Prospectus PDF (5.6 MB)",
          admissionChartPdfUrl: admissionChartPdfUrl.trim(),
          admissionChartDisplayLabel: admissionChartDisplayLabel.trim(),
        });

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Failed to update fee overview settings.");
        }
      } catch (err) {
        console.error("Update fee overview error:", err);
        setError("An unexpected error occurred while updating fee overview.");
      }
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "560px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Settings size={20} style={{ color: "#b91c1c" }} />
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#111827" }}>
              Edit Fee Structure Page Header &amp; Chart
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
              padding: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#991b1b",
                fontSize: "13px",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="overview-session-label" style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Publication Display Session *
            </label>
            <input
              id="overview-session-label"
              type="text"
              required
              value={sessionLabel}
              onChange={(e) => setSessionLabel(e.target.value)}
              className="admin-input"
              placeholder="e.g. 2026-27"
              style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
            />
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
              Display session for public fee and prospectus pages (independent of online registration).
            </p>
          </div>

          <div>
            <label htmlFor="overview-fee-title" style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Page Header Title *
            </label>
            <input
              id="overview-fee-title"
              type="text"
              required
              value={feeStructureTitle}
              onChange={(e) => setFeeStructureTitle(e.target.value)}
              className="admin-input"
              style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label htmlFor="overview-fee-subtitle" style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Page Header Subtitle *
            </label>
            <textarea
              id="overview-fee-subtitle"
              rows={2}
              required
              value={feeStructureSubtitle}
              onChange={(e) => setFeeStructureSubtitle(e.target.value)}
              className="admin-input"
              style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label htmlFor="overview-chart-url" style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                Admission Chart PDF Path *
              </label>
              <input
                id="overview-chart-url"
                type="text"
                required
                value={admissionChartPdfUrl}
                onChange={(e) => setAdmissionChartPdfUrl(e.target.value)}
                className="admin-input"
                placeholder="/documents/original/..."
                style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label htmlFor="overview-chart-label" style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                Display Button Label *
              </label>
              <input
                id="overview-chart-label"
                type="text"
                required
                value={admissionChartDisplayLabel}
                onChange={(e) => setAdmissionChartDisplayLabel(e.target.value)}
                className="admin-input"
                placeholder="Admission Chart (722 KB)"
                style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
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
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} aria-hidden="true" />
                  <span>Save Header Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
