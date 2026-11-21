"use client";

import { useState, useTransition, useId } from "react";
import { X, Loader2 } from "lucide-react";
import {
  createAdmissionFaq,
  updateAdmissionFaq,
} from "@/lib/server/admissions-actions";

export interface SerializedAdmissionFaq {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdmissionFaqDialogProps {
  isOpen: boolean;
  faq: SerializedAdmissionFaq | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdmissionFaqDialog({
  isOpen,
  faq,
  onClose,
  onSuccess,
}: AdmissionFaqDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [question, setQuestion] = useState(faq?.question || "");
  const [answer, setAnswer] = useState(faq?.answer || "");
  const [displayOrder, setDisplayOrder] = useState<number>(faq?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(faq?.isPublished ?? true);
  const [error, setError] = useState<string | null>(null);

  const qId = useId();
  const aId = useId();
  const orderId = useId();
  const publishedId = useId();

  if (!isOpen) return null;

  const isEdit = Boolean(faq);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!question.trim() || !answer.trim()) {
      setError("Please fill in both question and answer.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          question: question.trim(),
          answer: answer.trim(),
          displayOrder: Number(displayOrder),
          isPublished,
        };

        const res = isEdit
          ? await updateAdmissionFaq(faq!.id, payload)
          : await createAdmissionFaq(payload);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Failed to save admission FAQ.");
        }
      } catch (err) {
        console.error("Save admission FAQ error:", err);
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
        aria-labelledby="faq-dialog-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "520px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 id="faq-dialog-title" style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>
            {isEdit ? "Edit Admission FAQ" : "Add Admission FAQ"}
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
            <label htmlFor={qId} style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Question *
            </label>
            <input
              id={qId}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What is the procedure for admission for 2026–27?"
              className="admin-input"
              style={{ width: "100%" }}
              required
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label htmlFor={aId} style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Answer *
            </label>
            <textarea
              id={aId}
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide a comprehensive and parent-friendly answer..."
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
                <span>{isEdit ? "Update FAQ" : "Create FAQ"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
