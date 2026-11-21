"use client";

import { useState, useTransition, useId } from "react";
import { X, Loader2 } from "lucide-react";
import {
  createAdmissionStep,
  updateAdmissionStep,
} from "@/lib/server/admissions-actions";

export interface SerializedAdmissionStep {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdmissionStepDialogProps {
  isOpen: boolean;
  step: SerializedAdmissionStep | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdmissionStepDialog({
  isOpen,
  step,
  onClose,
  onSuccess,
}: AdmissionStepDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [stepNumber, setStepNumber] = useState(step?.stepNumber || "");
  const [title, setTitle] = useState(step?.title || "");
  const [description, setDescription] = useState(step?.description || "");
  const [displayOrder, setDisplayOrder] = useState<number>(step?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(step?.isPublished ?? true);
  const [error, setError] = useState<string | null>(null);

  const stepNumberId = useId();
  const titleId = useId();
  const descId = useId();
  const orderId = useId();
  const publishedId = useId();

  if (!isOpen) return null;

  const isEdit = Boolean(step);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stepNumber.trim() || !title.trim() || !description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          stepNumber: stepNumber.trim(),
          title: title.trim(),
          description: description.trim(),
          displayOrder: Number(displayOrder),
          isPublished,
        };

        const res = isEdit
          ? await updateAdmissionStep(step!.id, payload)
          : await createAdmissionStep(payload);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Failed to save admission step.");
        }
      } catch (err) {
        console.error("Save admission step error:", err);
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
        aria-labelledby="step-dialog-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "520px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 id="step-dialog-title" style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>
            {isEdit ? "Edit Admission Step" : "Add Admission Step"}
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
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "12px", marginBottom: "14px" }}>
            <div>
              <label htmlFor={stepNumberId} style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                Step # *
              </label>
              <input
                id={stepNumberId}
                type="text"
                value={stepNumber}
                onChange={(e) => setStepNumber(e.target.value)}
                placeholder="01"
                className="admin-input"
                style={{ width: "100%" }}
                required
              />
            </div>
            <div>
              <label htmlFor={titleId} style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                Title *
              </label>
              <input
                id={titleId}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Online Enquiry"
                className="admin-input"
                style={{ width: "100%" }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label htmlFor={descId} style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Description *
            </label>
            <textarea
              id={descId}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the actions parents or students must take in this step..."
              className="admin-input"
              style={{ width: "100%", resize: "vertical" }}
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
                <span>{isEdit ? "Update Step" : "Create Step"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
