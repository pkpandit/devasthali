"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save, BookOpen, AlertCircle } from "lucide-react";
import {
  createEntranceExamSubjectAction,
  updateEntranceExamSubjectAction,
} from "@/lib/server/admissions-publication-actions";

export interface SerializedEntranceSubject {
  id: string;
  classGrade: string;
  subjects: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EntranceSubjectDialogProps {
  isOpen: boolean;
  subject: SerializedEntranceSubject | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EntranceSubjectDialog({
  isOpen,
  subject,
  onClose,
  onSuccess,
}: EntranceSubjectDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [classGrade, setClassGrade] = useState(subject?.classGrade ?? "");
  const [subjects, setSubjects] = useState(subject?.subjects ?? "");
  const [displayOrder, setDisplayOrder] = useState<number>(subject?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(subject?.isPublished ?? true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        let res;
        if (subject) {
          res = await updateEntranceExamSubjectAction({
            id: subject.id,
            classGrade: classGrade.trim(),
            subjects: subjects.trim(),
            displayOrder: Number(displayOrder),
            isPublished,
          });
        } else {
          res = await createEntranceExamSubjectAction({
            classGrade: classGrade.trim(),
            subjects: subjects.trim(),
            displayOrder: Number(displayOrder),
            isPublished,
          });
        }

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Failed to save entrance exam subject row.");
        }
      } catch (err) {
        console.error("Save entrance subject error:", err);
        setError("An unexpected error occurred while saving.");
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
          maxWidth: "540px",
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
            <BookOpen size={20} style={{ color: "#b91c1c" }} />
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#111827" }}>
              {subject ? `Edit Entrance Subject (${subject.classGrade})` : "Add Entrance Exam Subject Row"}
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
            <label
              htmlFor="class-grade-input"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
            >
              Class / Group *
            </label>
            <input
              id="class-grade-input"
              type="text"
              required
              placeholder="e.g. VI to IX or XI (Commerce Group)"
              value={classGrade}
              onChange={(e) => setClassGrade(e.target.value)}
              className="admin-input"
              style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label
              htmlFor="subjects-input"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
            >
              Examination Subjects *
            </label>
            <input
              id="subjects-input"
              type="text"
              required
              placeholder="e.g. English, Maths, Science"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              className="admin-input"
              style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label
                htmlFor="subject-order-input"
                style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
              >
                Display Order
              </label>
              <input
                id="subject-order-input"
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                className="admin-input"
                style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", paddingTop: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <span>Published on table</span>
              </label>
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
                  <span>{subject ? "Update Row" : "Create Row"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
