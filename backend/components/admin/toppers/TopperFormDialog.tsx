"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, Loader2, Upload, Trash2, Image as ImageIcon } from "lucide-react";
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
  const [displayOrder, setDisplayOrder] = useState(
    initialTopper ? String(initialTopper.displayOrder) : "0"
  );
  const [isFeatured, setIsFeatured] = useState(initialTopper?.isFeatured ?? true);

  // Photo state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialTopper?.photoUrl ?? null
  );
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);

  // Errors state
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const firstInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Focus first input on mount
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFileSelect = (file: File | null) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (file) {
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setSelectedFile(file);
      setIsPhotoRemoved(false);
      setPreviewUrl(url);
    } else {
      setSelectedFile(null);
      if (!isPhotoRemoved && initialTopper?.photoUrl) {
        setPreviewUrl(initialTopper.photoUrl);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemovePhoto = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSelectedFile(null);
    setIsPhotoRemoved(true);
    setPreviewUrl(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    startTransition(async () => {
      const formData = new FormData();
      formData.append("studentName", studentName.trim());
      formData.append("scorePercent", scorePercent.trim());
      formData.append("grade", grade);
      if (stream.trim()) formData.append("stream", stream.trim());
      formData.append("academicYear", academicYear.trim());
      formData.append("achievement", achievement.trim());
      formData.append("displayOrder", displayOrder.trim() || "0");
      formData.append("isFeatured", String(isFeatured));

      if (selectedFile) {
        formData.append("photoFile", selectedFile);
      } else if (isPhotoRemoved) {
        formData.append("removePhoto", "true");
      } else if (initialTopper?.photoUrl) {
        formData.append("photoUrl", initialTopper.photoUrl);
      }

      if (isEdit && initialTopper) {
        formData.append("id", initialTopper.id);
        const res = await updateTopperAction(null, formData);
        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setGeneralError(res.error || "Failed to update topper record.");
          if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        }
      } else {
        const res = await createTopperAction(null, formData);
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

          {/* Student Photo Upload */}
          <div className="topper-field topper-field--full">
            <label className="topper-label">
              Student Photo (Optional)
            </label>
            <div className="topper-photo-upload-container">
              {/* Preview Box - Strictly bounded circular thumbnail */}
              <div
                className="topper-photo-preview-box"
                style={{
                  width: "80px",
                  height: "80px",
                  minWidth: "80px",
                  minHeight: "80px",
                  maxWidth: "80px",
                  maxHeight: "80px",
                }}
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Topper preview"
                    className="topper-photo-preview-img"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top center",
                    }}
                  />
                ) : (
                  <div className="topper-photo-preview-placeholder">
                    <ImageIcon size={28} />
                  </div>
                )}
                {isPending && selectedFile && (
                  <div className="topper-photo-preview-overlay">
                    <Loader2 size={20} className="topper-photo-spinner" />
                  </div>
                )}
              </div>

              {/* Controls & Help */}
              <div className="topper-photo-controls">
                <div className="topper-photo-btn-group">
                  <input
                    ref={fileInputRef}
                    id="photoFileInput"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="topper-photo-hidden-input"
                    style={{ display: "none" }}
                    disabled={isPending}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileSelect(file);
                    }}
                  />
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => fileInputRef.current?.click()}
                    className="topper-button topper-button--secondary topper-photo-btn-sm"
                  >
                    <Upload size={14} />
                    <span>{previewUrl ? "Replace Photo" : "Upload Photo"}</span>
                  </button>

                  {previewUrl && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleRemovePhoto}
                      className="topper-photo-remove-btn"
                    >
                      <Trash2 size={14} />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                <p className="topper-photo-help-text">
                  Supported formats: JPEG, PNG, WebP (max 2 MiB). High-resolution photos are automatically resized and converted to optimized WebP.
                </p>
                {selectedFile && (
                  <p className="topper-photo-status-text">
                    Ready to upload: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </p>
                )}
              </div>
            </div>
            {fieldErrors.photoFile && (
              <p id="photoFile-error" className="topper-field-error">
                {fieldErrors.photoFile[0]}
              </p>
            )}
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
          {isPending && <Loader2 size={16} className="topper-photo-spinner" style={{ marginRight: "8px" }} />}
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
