"use client";

import { useState, useTransition, useId } from "react";
import { X, Loader2 } from "lucide-react";
import {
  createAdmissionEligibility,
  updateAdmissionEligibility,
} from "@/lib/server/admissions-actions";

export interface SerializedEligibilityCriteria {
  id: string;
  classGrade: string;
  ageRequirement: string;
  evaluationMode: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EligibilityCriteriaDialogProps {
  isOpen: boolean;
  criteria: SerializedEligibilityCriteria | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EligibilityCriteriaDialog({
  isOpen,
  criteria,
  onClose,
  onSuccess,
}: EligibilityCriteriaDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [classGrade, setClassGrade] = useState(criteria?.classGrade || "");
  const [ageRequirement, setAgeRequirement] = useState(criteria?.ageRequirement || "");
  const [evaluationMode, setEvaluationMode] = useState(criteria?.evaluationMode || "");
  const [displayOrder, setDisplayOrder] = useState<number>(criteria?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(criteria?.isPublished ?? true);
  const [error, setError] = useState<string | null>(null);

  const gradeId = useId();
  const ageId = useId();
  const modeId = useId();
  const orderId = useId();
  const publishedId = useId();

  if (!isOpen) return null;

  const isEdit = Boolean(criteria);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!classGrade.trim() || !ageRequirement.trim() || !evaluationMode.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          classGrade: classGrade.trim(),
          ageRequirement: ageRequirement.trim(),
          evaluationMode: evaluationMode.trim(),
          displayOrder: Number(displayOrder),
          isPublished,
        };

        const res = isEdit
          ? await updateAdmissionEligibility(criteria!.id, payload)
          : await createAdmissionEligibility(payload);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Failed to save eligibility criteria.");
        }
      } catch (err) {
        console.error("Save eligibility criteria error:", err);
        setError("An unexpected error occurred.");
      }
    });
  };

  return (
    <div className="admin-dialog-backdrop" onClick={onClose} role="presentation">
      <div
        className="admin-dialog-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="eligibility-dialog-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "520px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 id="eligibility-dialog-title" style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>
            {isEdit ? "Edit Eligibility Criteria" : "Add Eligibility Criteria"}
          </h3>
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

        <form onSubmit={handleSubmit} className="admin-form">
          <div style={{ marginBottom: "14px" }}>
            <label htmlFor={gradeId} style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Class / Grade *
            </label>
            <input
              id={gradeId}
              type="text"
              value={classGrade}
              onChange={(e) => setClassGrade(e.target.value)}
              placeholder="e.g. Class I or Classes II to VIII"
              className="admin-input"
              style={{ width: "100%" }}
              required
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label htmlFor={ageId} style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Required Age Requirement *
            </label>
            <input
              id={ageId}
              type="text"
              value={ageRequirement}
              onChange={(e) => setAgeRequirement(e.target.value)}
              placeholder="e.g. 6+ Years (NEP Mandate)"
              className="admin-input"
              style={{ width: "100%" }}
              required
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label htmlFor={modeId} style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Evaluation Mode *
            </label>
            <input
              id={modeId}
              type="text"
              value={evaluationMode}
              onChange={(e) => setEvaluationMode(e.target.value)}
              placeholder="e.g. Written Aptitude Test (English & Mathematics)"
              className="admin-input"
              style={{ width: "100%" }}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label htmlFor={orderId} style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                Display Order
              </label>
              <input
                id={orderId}
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                className="admin-input"
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", paddingTop: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                <input
                  id={publishedId}
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <span>Published (Visible)</span>
              </label>
            </div>
          </div>

          <div className="admin-dialog-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
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
                <span>{isEdit ? "Update Criteria" : "Create Criteria"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
