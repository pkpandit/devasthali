"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Save,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Download,
} from "lucide-react";
import type { SerializedAdmissionOverview } from "./FeeOverviewDialog";
import { updateAdmissionOverviewAction } from "@/lib/server/admissions-publication-actions";
import { isValidDocumentUrl } from "@/lib/validation/admissions-publication";

interface ProspectusWorkspaceProps {
  overview: SerializedAdmissionOverview | null;
}

export function ProspectusWorkspace({ overview }: ProspectusWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [sessionLabel, setSessionLabel] = useState(overview?.sessionLabel ?? "2026-27");
  const [prospectusTitle, setProspectusTitle] = useState(
    overview?.prospectusTitle ?? "Official Devasthaly Vidyapeeth Prospectus"
  );
  const [prospectusDescription, setProspectusDescription] = useState(
    overview?.prospectusDescription ??
      "Complete publication containing the vision of Founder Shri Chandra Shekhar, admission eligibility, code of conduct, academic syllabus, examination assessment rules, and hostel guidelines."
  );
  const [prospectusPdfUrl, setProspectusPdfUrl] = useState(
    overview?.prospectusPdfUrl ?? "/documents/original/prospectus-2.pdf"
  );
  const [prospectusDisplayLabel, setProspectusDisplayLabel] = useState(
    overview?.prospectusDisplayLabel ?? "Prospectus PDF (5.6 MB)"
  );
  const [admissionChartPdfUrl, setAdmissionChartPdfUrl] = useState(
    overview?.admissionChartPdfUrl ?? "/documents/original/new-admission-chart-2026-27.pdf"
  );
  const [admissionChartDisplayLabel, setAdmissionChartDisplayLabel] = useState(
    overview?.admissionChartDisplayLabel ?? "Admission Chart (722 KB)"
  );

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!isValidDocumentUrl(prospectusPdfUrl)) {
      setError(
        "Invalid Prospectus PDF URL. Must be an approved static PDF path under /documents/."
      );
      return;
    }

    if (!isValidDocumentUrl(admissionChartPdfUrl)) {
      setError(
        "Invalid Admission Chart PDF URL. Must be an approved static PDF path under /documents/."
      );
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateAdmissionOverviewAction({
          sessionLabel: sessionLabel.trim(),
          feeStructureTitle:
            overview?.feeStructureTitle ?? "Fee Structure (Session 2026–27)",
          feeStructureSubtitle:
            overview?.feeStructureSubtitle ??
            "Official statutory fee schedule and prospectus for Devasthaly Vidyapeeth, Chilkahar, Ballia.",
          prospectusTitle: prospectusTitle.trim(),
          prospectusDescription: prospectusDescription.trim(),
          prospectusPdfUrl: prospectusPdfUrl.trim(),
          prospectusDisplayLabel: prospectusDisplayLabel.trim(),
          admissionChartPdfUrl: admissionChartPdfUrl.trim(),
          admissionChartDisplayLabel: admissionChartDisplayLabel.trim(),
        });

        if (res.success) {
          setSuccessMessage("School Prospectus publication settings saved successfully.");
          router.refresh();
        } else {
          setError(res.error || "Failed to update prospectus settings.");
        }
      } catch (err) {
        console.error("Prospectus update error:", err);
        setError("An unexpected error occurred while updating prospectus.");
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%", maxWidth: "860px" }}>
      {/* Current Preview Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "9999px",
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            <Sparkles size={14} />
            <span>Admissions / Prospectus (Session {sessionLabel})</span>
          </span>
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 8px 0", color: "#111827" }}>
          {prospectusTitle}
        </h2>
        <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: 1.6, margin: "0 0 16px 0" }}>
          {prospectusDescription}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", paddingTop: "12px", borderTop: "1px solid #f3f4f6" }}>
          <a
            href={prospectusPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "9999px",
              backgroundColor: "#b91c1c",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <Download size={14} />
            <span>{prospectusDisplayLabel}</span>
            <ExternalLink size={14} />
          </a>
          <a
            href={admissionChartPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "9999px",
              backgroundColor: "#f3f4f6",
              color: "#111827",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              border: "1px solid #e5e7eb",
            }}
          >
            <FileText size={14} />
            <span>{admissionChartDisplayLabel}</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Editor Form */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0", color: "#111827" }}>
          Configure Prospectus Publication
        </h3>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px 0" }}>
          Update the official downloadable prospectus metadata, display labels, and target document path delivered on /school-prospectus.
        </p>

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
              marginBottom: "16px",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              color: "#166534",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              htmlFor="prospectus-session-label"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
            >
              Academic Session Label *
            </label>
            <input
              id="prospectus-session-label"
              type="text"
              required
              value={sessionLabel}
              onChange={(e) => setSessionLabel(e.target.value)}
              className="admin-input"
              placeholder="e.g. 2026-27"
              style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
            />
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
              Appears on the prospectus page header and document summary badge.
            </p>
          </div>

          <div>
            <label
              htmlFor="prospectus-title"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
            >
              Prospectus Heading Title *
            </label>
            <input
              id="prospectus-title"
              type="text"
              required
              value={prospectusTitle}
              onChange={(e) => setProspectusTitle(e.target.value)}
              className="admin-input"
              style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label
              htmlFor="prospectus-desc"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
            >
              Prospectus Description *
            </label>
            <textarea
              id="prospectus-desc"
              rows={3}
              required
              value={prospectusDescription}
              onChange={(e) => setProspectusDescription(e.target.value)}
              className="admin-input"
              style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label
                htmlFor="prospectus-pdf-url"
                style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
              >
                Prospectus PDF Path *
              </label>
              <input
                id="prospectus-pdf-url"
                type="text"
                required
                value={prospectusPdfUrl}
                onChange={(e) => setProspectusPdfUrl(e.target.value)}
                className="admin-input"
                placeholder="/documents/original/prospectus-2.pdf"
                style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label
                htmlFor="prospectus-display-label"
                style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
              >
                Prospectus Button Label *
              </label>
              <input
                id="prospectus-display-label"
                type="text"
                required
                value={prospectusDisplayLabel}
                onChange={(e) => setProspectusDisplayLabel(e.target.value)}
                className="admin-input"
                placeholder="Prospectus PDF (5.6 MB)"
                style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label
                htmlFor="admission-chart-pdf-url"
                style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
              >
                Admission Chart PDF Path *
              </label>
              <input
                id="admission-chart-pdf-url"
                type="text"
                required
                value={admissionChartPdfUrl}
                onChange={(e) => setAdmissionChartPdfUrl(e.target.value)}
                className="admin-input"
                placeholder="/documents/original/new-admission-chart-2026-27.pdf"
                style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label
                htmlFor="admission-chart-label"
                style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
              >
                Admission Chart Button Label *
              </label>
              <input
                id="admission-chart-label"
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

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
            <button
              type="submit"
              disabled={isPending}
              className="admin-button admin-button--primary"
              style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "150px", justifyContent: "center" }}
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} aria-hidden="true" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
