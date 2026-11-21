"use client";

import { useState, useTransition, useId } from "react";
import { X, Loader2 } from "lucide-react";
import {
  createAdmissionDocumentRequirement,
  updateAdmissionDocumentRequirement,
} from "@/lib/server/admissions-actions";

export interface SerializedDocumentRequirement {
  id: string;
  title: string;
  description: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DocumentRequirementDialogProps {
  isOpen: boolean;
  document: SerializedDocumentRequirement | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentRequirementDialog({
  isOpen,
  document,
  onClose,
  onSuccess,
}: DocumentRequirementDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(document?.title || "");
  const [description, setDescription] = useState(document?.description || "");
  const [displayOrder, setDisplayOrder] = useState<number>(document?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(document?.isPublished ?? true);
  const [error, setError] = useState<string | null>(null);

  const titleId = useId();
  const descId = useId();
  const orderId = useId();
  const publishedId = useId();

  if (!isOpen) return null;

  const isEdit = Boolean(document);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Document requirement title is required.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          title: title.trim(),
          description: description.trim() || null,
          displayOrder: Number(displayOrder),
          isPublished,
        };

        const res = isEdit
          ? await updateAdmissionDocumentRequirement(document!.id, payload)
          : await createAdmissionDocumentRequirement(payload);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Failed to save document requirement.");
        }
      } catch (err) {
        console.error("Save document requirement error:", err);
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
        aria-labelledby="doc-dialog-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "520px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 id="doc-dialog-title" style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>
            {isEdit ? "Edit Document Requirement" : "Add Document Requirement"}
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
            <label htmlFor={titleId} style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Requirement Title *
            </label>
            <input
              id={titleId}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Original Transfer Certificate (TC) countersigned by competent education authority"
              className="admin-input"
              style={{ width: "100%" }}
              required
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label htmlFor={descId} style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Optional Instructions / Notes
            </label>
            <textarea
              id={descId}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Must be issued by the previous recognized school..."
              className="admin-input"
              style={{ width: "100%", resize: "vertical" }}
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
                <span>{isEdit ? "Update Requirement" : "Create Requirement"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
