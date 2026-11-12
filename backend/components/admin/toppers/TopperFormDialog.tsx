"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, Loader2 } from "lucide-react";
import {
  createTopperAction,
  updateTopperAction,
} from "@/lib/server/topper-actions";

export interface SerializedTopper {
  id: string;
  studentName: string;
  scorePercent: number;
  grade: string;
  stream: string | null;
  academicYear: string;
  achievement: string;
  photoUrl: string | null;
  displayOrder: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TopperFormDialogProps {
  isOpen: boolean;
  initialTopper?: SerializedTopper | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface TopperFormInnerProps {
  initialTopper?: SerializedTopper | null;
  onClose: () => void;
  onSuccess: () => void;
}

function TopperFormInner({
  initialTopper,
  onClose,
  onSuccess,
}: TopperFormInnerProps) {
  const isEdit = Boolean(initialTopper);
  const [isPending, startTransition] = useTransition();

  // Initialize state directly from props (keyed remounting pattern)
  const [studentName, setStudentName] = useState(initialTopper?.studentName ?? "");
  const [scorePercent, setScorePercent] = useState(
    initialTopper ? initialTopper.scorePercent.toFixed(2) : ""
  );
  const [grade, setGrade] = useState(initialTopper?.grade ?? "Class X");
  const [stream, setStream] = useState(initialTopper?.stream ?? "");
  const [academicYear, setAcademicYear] = useState(initialTopper?.academicYear ?? "");
  const [achievement, setAchievement] = useState(initialTopper?.achievement ?? "");
  const [photoUrl, setPhotoUrl] = useState(initialTopper?.photoUrl ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    initialTopper ? String(initialTopper.displayOrder) : "0"
  );
  const [isFeatured, setIsFeatured] = useState(initialTopper?.isFeatured ?? true);

  // Errors state
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first input on mount
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    startTransition(async () => {
      const payload: Record<string, unknown> = {
        studentName,
        scorePercent: scorePercent.trim() !== "" ? Number(scorePercent) : scorePercent,
        grade,
        stream: stream.trim() === "" ? null : stream.trim(),
        academicYear: academicYear.trim(),
        achievement: achievement.trim(),
        photoUrl: photoUrl.trim() === "" ? null : photoUrl.trim(),
        displayOrder: displayOrder.trim() !== "" ? Number(displayOrder) : 0,
        isFeatured,
      };

      if (isEdit && initialTopper) {
        payload.id = initialTopper.id;
        const res = await updateTopperAction(null, payload);
        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setGeneralError(res.error || "Failed to update topper record.");
          if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        }
      } else {
        const res = await createTopperAction(null, payload);
        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setGeneralError(res.error || "Failed to create topper record.");
          if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="topper-dialog-form">
      {/* Pinned Header */}
      <div className="topper-dialog-header">
        <h2 id="topper-dialog-title" className="topper-dialog-title">
          {isEdit ? "Edit Academic Topper Record" : "Add Academic Topper Record"}
        </h2>
        <button
          type="button"
          className="topper-dialog-close"
          onClick={onClose}
          disabled={isPending}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Form Body */}
      <div className="topper-dialog-body">
        {generalError && (
          <div className="topper-dialog-error-banner" role="alert">
            {generalError}
          </div>
        )}

        <div className="topper-form-grid">
          {/* Student Name */}
          <div className="topper-field topper-field--full">
            <label htmlFor="studentName" className="topper-label">
              Student Name <span className="text-red-600">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="studentName"
              name="studentName"
              type="text"
              required
              disabled={isPending}
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className={`topper-input ${fieldErrors.studentName ? "topper-input--error" : ""}`}
              aria-invalid={Boolean(fieldErrors.studentName)}
              aria-describedby={fieldErrors.studentName ? "studentName-error" : undefined}
              placeholder="e.g. Ananya Sharma"
            />
            {fieldErrors.studentName && (
              <p id="studentName-error" className="topper-field-error">
                {fieldErrors.studentName[0]}
              </p>
            )}
          </div>

          {/* Score Percentage */}
          <div className="topper-field">
            <label htmlFor="scorePercent" className="topper-label">
              Score Percentage (%) <span className="text-red-600">*</span>
            </label>
            <input
              id="scorePercent"
              name="scorePercent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
              disabled={isPending}
              value={scorePercent}
              onChange={(e) => setScorePercent(e.target.value)}
              className={`topper-input ${fieldErrors.scorePercent ? "topper-input--error" : ""}`}
              aria-invalid={Boolean(fieldErrors.scorePercent)}
              aria-describedby={fieldErrors.scorePercent ? "scorePercent-error" : undefined}
              placeholder="e.g. 98.40"
            />
            {fieldErrors.scorePercent && (
              <p id="scorePercent-error" className="topper-field-error">
                {fieldErrors.scorePercent[0]}
              </p>
            )}
          </div>

          {/* Academic Year */}
          <div className="topper-field">
            <label htmlFor="academicYear" className="topper-label">
              Academic Session <span className="text-red-600">*</span>
            </label>
            <input
              id="academicYear"
              name="academicYear"
              type="text"
              required
              disabled={isPending}
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className={`topper-input ${fieldErrors.academicYear ? "topper-input--error" : ""}`}
              aria-invalid={Boolean(fieldErrors.academicYear)}
              aria-describedby={fieldErrors.academicYear ? "academicYear-error" : undefined}
              placeholder="YYYY-YY (e.g. 2024-25)"
            />
            {fieldErrors.academicYear && (
              <p id="academicYear-error" className="topper-field-error">
                {fieldErrors.academicYear[0]}
              </p>
            )}
          </div>

          {/* Grade */}
          <div className="topper-field">
            <label htmlFor="grade" className="topper-label">
              Grade / Class <span className="text-red-600">*</span>
            </label>
            <select
              id="grade"
              name="grade"
              disabled={isPending}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="topper-input"
            >
              <option value="Class X">Class X</option>
              <option value="Class XII">Class XII</option>
            </select>
          </div>

          {/* Stream */}
          <div className="topper-field">
            <label htmlFor="stream" className="topper-label">
              Stream (Optional)
            </label>
            <input
              id="stream"
              name="stream"
              type="text"
              disabled={isPending}
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className={`topper-input ${fieldErrors.stream ? "topper-input--error" : ""}`}
              aria-invalid={Boolean(fieldErrors.stream)}
              aria-describedby={fieldErrors.stream ? "stream-error" : undefined}
              placeholder="e.g. Science (PCM), Commerce"
            />
            {fieldErrors.stream && (
              <p id="stream-error" className="topper-field-error">
                {fieldErrors.stream[0]}
              </p>
            )}
          </div>

          {/* Achievement */}
          <div className="topper-field topper-field--full">
            <label htmlFor="achievement" className="topper-label">
              Achievement / Merit Citation <span className="text-red-600">*</span>
            </label>
            <input
              id="achievement"
              name="achievement"
              type="text"
              required
              disabled={isPending}
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              className={`topper-input ${fieldErrors.achievement ? "topper-input--error" : ""}`}
              aria-invalid={Boolean(fieldErrors.achievement)}
              aria-describedby={fieldErrors.achievement ? "achievement-error" : undefined}
              placeholder="e.g. School Topper - 98.40%"
            />
            {fieldErrors.achievement && (
              <p id="achievement-error" className="topper-field-error">
                {fieldErrors.achievement[0]}
              </p>
            )}
          </div>

          {/* Photo URL */}
          <div className="topper-field topper-field--full">
            <label htmlFor="photoUrl" className="topper-label">
              Photo Reference URL (Optional)
            </label>
            <input
              id="photoUrl"
              name="photoUrl"
              type="text"
              disabled={isPending}
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className={`topper-input ${fieldErrors.photoUrl ? "topper-input--error" : ""}`}
              aria-invalid={Boolean(fieldErrors.photoUrl)}
              aria-describedby={fieldErrors.photoUrl ? "photoUrl-error" : "photoUrl-note"}
              placeholder="HTTP(S) URL or root-relative path (e.g. /images/toppers/ananya.jpg)"
            />
            <p id="photoUrl-note" className="topper-field-note">
              Optional reference path or public URL. Storage uploads are not enabled in this increment.
            </p>
            {fieldErrors.photoUrl && (
              <p id="photoUrl-error" className="topper-field-error">
                {fieldErrors.photoUrl[0]}
              </p>
            )}
          </div>

          {/* Display Order */}
          <div className="topper-field">
            <label htmlFor="displayOrder" className="topper-label">
              Display Order
            </label>
            <input
              id="displayOrder"
              name="displayOrder"
              type="number"
              min="0"
              disabled={isPending}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className={`topper-input ${fieldErrors.displayOrder ? "topper-input--error" : ""}`}
              aria-invalid={Boolean(fieldErrors.displayOrder)}
              aria-describedby={fieldErrors.displayOrder ? "displayOrder-error" : undefined}
            />
            {fieldErrors.displayOrder && (
              <p id="displayOrder-error" className="topper-field-error">
                {fieldErrors.displayOrder[0]}
              </p>
            )}
          </div>

          {/* Publication Notice & Homepage Feature Checkbox */}
          <div className="topper-field topper-field--full bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              <strong>Publication Notice:</strong> Saving this record publishes it on the public Results page. Administrators are responsible for entering only content approved for public display.
            </p>
            <div className="pt-2 border-t border-slate-200/80">
              <label htmlFor="isFeatured" className="topper-checkbox-wrapper">
                <input
                  id="isFeatured"
                  name="isFeatured"
                  type="checkbox"
                  disabled={isPending}
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="topper-checkbox"
                />
                <span className="topper-checkbox-label">
                  Also feature on homepage
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Action Footer */}
      <div className="topper-dialog-actions">
        <button
          type="button"
          className="topper-button topper-button--secondary"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="topper-button topper-button--primary"
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending && <Loader2 size={16} className="animate-spin mr-2" />}
          {isPending ? "Saving..." : isEdit ? "Update Topper" : "Add Topper"}
        </button>
      </div>
    </form>
  );
}

export function TopperFormDialog({
  isOpen,
  initialTopper,
  onClose,
  onSuccess,
}: TopperFormDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle Escape key to close dialog
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="topper-dialog-backdrop" onClick={onClose}>
      <div
        className="topper-dialog-container"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="topper-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <TopperFormInner
          key={initialTopper?.id ?? "new"}
          initialTopper={initialTopper}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
