"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Trash2,
  Link2,
  Ban,
  Loader2,
  ShieldCheck,
  RotateCcw,
  X,
} from "lucide-react";
import { uploadNoticeDocumentAction } from "@/lib/server/notice-actions";
import { documentLinkSchema } from "@/lib/validation/notices";

export interface AttachmentWidgetValue {
  mode: "upload" | "link" | "none";
  // Upload metadata
  fileStorageKey: string | null;
  fileSizeBytes: number | null;
  fileSha256: string | null;
  fileOriginalName: string | null;
  fileUploadedAt: string | null;
  // External link metadata
  fileUrl: string | null;
  fileSize: string | null;
}

interface NoticeAttachmentWidgetProps {
  value: AttachmentWidgetValue;
  onChange: (next: AttachmentWidgetValue) => void;
  noticeId?: string | null;
  disabled?: boolean;
  fieldErrors?: Record<string, string[]>;
}

const ATTACHMENT_MODES = [
  { id: "upload", label: "Upload PDF", icon: UploadCloud },
  { id: "link", label: "External Link", icon: Link2 },
  { id: "none", label: "No Document", icon: Ban },
] as const;

type AttachmentMode = (typeof ATTACHMENT_MODES)[number]["id"];

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MiB
const MIN_PDF_SIZE_BYTES = 32;

function formatByteSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function NoticeAttachmentWidget({
  value,
  onChange,
  noticeId,
  disabled = false,
  fieldErrors = {},
}: NoticeAttachmentWidgetProps) {
  // Ephemeral upload action phase: "uploading" | "scanning" | "error" | null
  const [activeUploadPhase, setActiveUploadPhase] = useState<
    "uploading" | "scanning" | "error" | null
  >(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const radioRefs = useRef<Record<AttachmentMode, HTMLButtonElement | null>>({
    upload: null,
    link: null,
    none: null,
  });

  // Derived effective upload status - avoids cascading setState in effects
  const uploadStatus: "idle" | "uploading" | "scanning" | "success" | "error" =
    activeUploadPhase ?? (value.fileStorageKey || localBlobUrl ? "success" : "idle");

  // Clean up blob URL and interval on unmount
  useEffect(() => {
    return () => {
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [localBlobUrl]);

  // Handle switching modes (mutually exclusive)
  const handleModeChange = useCallback(
    (newMode: AttachmentMode) => {
      if (disabled) return;
      if (newMode === value.mode) return;

      setErrorMessage(null);
      setUrlValidationError(null);
      setActiveUploadPhase(null);

      if (newMode === "upload") {
        onChange({
          mode: "upload",
          fileStorageKey: value.fileStorageKey || null,
          fileSizeBytes: value.fileSizeBytes || null,
          fileSha256: value.fileSha256 || null,
          fileOriginalName: value.fileOriginalName || null,
          fileUploadedAt: value.fileUploadedAt || null,
          fileUrl: null,
          fileSize: null,
        });
      } else if (newMode === "link") {
        onChange({
          mode: "link",
          fileStorageKey: null,
          fileSizeBytes: null,
          fileSha256: null,
          fileOriginalName: null,
          fileUploadedAt: null,
          fileUrl: value.fileUrl || "",
          fileSize: value.fileSize || "",
        });
      } else {
        // none
        onChange({
          mode: "none",
          fileStorageKey: null,
          fileSizeBytes: null,
          fileSha256: null,
          fileOriginalName: null,
          fileUploadedAt: null,
          fileUrl: null,
          fileSize: null,
        });
      }
    },
    [disabled, onChange, value]
  );

  // Arrow key navigation for radiogroup
  const handleRadioKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentMode: AttachmentMode
  ) => {
    if (disabled) return;
    const modes: AttachmentMode[] = ["upload", "link", "none"];
    const currentIndex = modes.indexOf(currentMode);
    let targetIndex = -1;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % modes.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + modes.length) % modes.length;
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleModeChange(currentMode);
      return;
    }

    if (targetIndex !== -1) {
      const nextMode = modes[targetIndex];
      handleModeChange(nextMode);
      radioRefs.current[nextMode]?.focus();
    }
  };

  // Upload handler with client-side pre-validation and progression
  const handleProcessFile = useCallback(
    async (file: File) => {
      setErrorMessage(null);

      // Client pre-validation
      const name = file.name || "document.pdf";
      const isPdf =
        name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";

      if (!isPdf) {
        setErrorMessage("Only PDF documents (.pdf) are permitted.");
        setActiveUploadPhase("error");
        return;
      }

      if (file.size > MAX_PDF_SIZE_BYTES) {
        setErrorMessage(
          `File size (${(file.size / (1024 * 1024)).toFixed(
            2
          )} MB) exceeds the maximum permitted limit of 10 MiB.`
        );
        setActiveUploadPhase("error");
        return;
      }

      if (file.size < MIN_PDF_SIZE_BYTES) {
        setErrorMessage(
          `File is too small (${file.size} bytes) to be a valid PDF document (minimum ${MIN_PDF_SIZE_BYTES} bytes required).`
        );
        setActiveUploadPhase("error");
        return;
      }

      // Generate local preview URL
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
      const blobUrl = URL.createObjectURL(file);
      setLocalBlobUrl(blobUrl);

      // Set uploading progress state
      setActiveUploadPhase("uploading");
      setUploadProgress(15);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 65) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 65;
          }
          return prev + 15;
        });
      }, 120);

      try {
        const formData = new FormData();
        formData.append("file", file);
        if (noticeId) {
          formData.append("noticeId", noticeId);
        }

        // Transition to scanning state after short upload indication
        setTimeout(() => {
          setActiveUploadPhase("scanning");
          setUploadProgress(85);
        }, 350);

        const res = await uploadNoticeDocumentAction(formData);
        if (timerRef.current) clearInterval(timerRef.current);

        if (res.success && res.data) {
          setUploadProgress(100);
          setActiveUploadPhase(null);
          onChange({
            mode: "upload",
            fileStorageKey: res.data.fileStorageKey,
            fileSizeBytes: res.data.fileSizeBytes,
            fileSha256: res.data.fileSha256,
            fileOriginalName: res.data.fileOriginalName,
            fileUploadedAt:
              res.data.fileUploadedAt instanceof Date
                ? res.data.fileUploadedAt.toISOString()
                : String(res.data.fileUploadedAt),
            fileUrl: null,
            fileSize: null,
          });
        } else {
          setActiveUploadPhase("error");
          setErrorMessage(
            res.error || "Document upload rejected by server scanner."
          );
        }
      } catch (err) {
        if (timerRef.current) clearInterval(timerRef.current);
        setActiveUploadPhase("error");
        const rawMessage = err instanceof Error ? err.message : String(err);
        if (
          rawMessage.toLowerCase().includes("body exceeded") ||
          rawMessage.toLowerCase().includes("bodysizelimit") ||
          rawMessage.toLowerCase().includes("payload too large") ||
          rawMessage.toLowerCase().includes("request entity too large")
        ) {
          setErrorMessage(
            "File size exceeds the server request limit. Maximum permitted PDF size is 10 MiB."
          );
        } else {
          setErrorMessage(
            rawMessage || "An unexpected network or server error occurred."
          );
        }
      }
    },
    [localBlobUrl, noticeId, onChange]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // Reset file input so re-selecting same file triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Drag and drop event listeners
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Cancel in-progress upload
  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setActiveUploadPhase(null);
    setUploadProgress(0);
    setErrorMessage(null);
  };

  // Preview document:
  // - For newly selected local file: preview via local blob URL
  // - For persisted managed attachment: triggers admin download via GET /api/admin/notices/[noticeId]/document
  const handlePreview = () => {
    if (localBlobUrl) {
      window.open(localBlobUrl, "_blank", "noopener,noreferrer");
    } else if (noticeId && value.fileStorageKey) {
      const adminDownloadUrl = `/api/admin/notices/${noticeId}/document`;
      const link = document.createElement("a");
      link.href = adminDownloadUrl;
      link.setAttribute("download", value.fileOriginalName || "document.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Remove attachment
  const handleRemove = () => {
    if (localBlobUrl) {
      URL.revokeObjectURL(localBlobUrl);
      setLocalBlobUrl(null);
    }
    setActiveUploadPhase(null);
    setErrorMessage(null);
    onChange({
      mode: "upload",
      fileStorageKey: null,
      fileSizeBytes: null,
      fileSha256: null,
      fileOriginalName: null,
      fileUploadedAt: null,
      fileUrl: null,
      fileSize: null,
    });
  };

  // Trigger file replacement
  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  // External link validation on blur
  const handleLinkBlur = (url: string) => {
    if (!url || url.trim() === "") {
      setUrlValidationError(null);
      return;
    }
    const parse = documentLinkSchema.safeParse(url.trim());
    if (!parse.success) {
      setUrlValidationError(
        parse.error.issues[0]?.message ||
          "Link must be a safe root-relative path (/documents/...) or secure HTTPS URL."
      );
    } else {
      setUrlValidationError(null);
    }
  };

  return (
    <div className="notice-attachment-widget" aria-label="Notice Document Attachment">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        tabIndex={-1}
        onChange={handleFileInputChange}
        disabled={disabled || uploadStatus === "uploading" || uploadStatus === "scanning"}
      />

      {/* Mode Selector Radio Group */}
      <div
        className="notice-attachment-radiogroup notice-attachment-tabs"
        role="radiogroup"
        aria-label="Document attachment method"
      >
        {ATTACHMENT_MODES.map(({ id: modeId, label, icon: Icon }) => {
          const isSelected = value.mode === modeId;
          return (
            <button
              key={modeId}
              ref={(el) => {
                radioRefs.current[modeId] = el;
              }}
              type="button"
              role="radio"
              id={`notice-attachment-mode-${modeId}`}
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              className={`notice-attachment-radio notice-attachment-tab ${
                isSelected
                  ? "notice-attachment-radio--selected notice-attachment-tab--active"
                  : ""
              }`}
              onClick={() => handleModeChange(modeId)}
              onKeyDown={(e) => handleRadioKeyDown(e, modeId)}
              disabled={disabled}
            >
              <Icon size={15} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* MODE 1: UPLOAD PDF */}
      {value.mode === "upload" && (
        <div className="notice-attachment-upload-area">
          {/* State 1: Success / Existing Uploaded File */}
          {uploadStatus === "success" && (value.fileStorageKey || localBlobUrl) && (
            <div className="notice-attachment-card">
              <div className="notice-attachment-card__info">
                <div className="notice-attachment-card__icon" aria-hidden="true">
                  <FileText size={20} />
                </div>
                <div className="notice-attachment-card__meta">
                  <span
                    className="notice-attachment-card__name"
                    title={value.fileOriginalName || "Attached Document.pdf"}
                  >
                    {value.fileOriginalName || "Attached Document.pdf"}
                  </span>
                  <div className="notice-attachment-card__details">
                    <span>{formatByteSize(value.fileSizeBytes) || "PDF Document"}</span>
                    <span>&bull;</span>
                    <span
                      style={{
                        color: "#16a34a",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                        fontWeight: 500,
                      }}
                    >
                      <CheckCircle2 size={13} aria-hidden="true" />
                      <span>Scanned &amp; Verified</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="notice-attachment-card__actions">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="topper-button topper-button--secondary"
                  title="Download / preview attached PDF document"
                  disabled={disabled}
                  style={{ height: "32px", padding: "0 10px", fontSize: "0.75rem" }}
                >
                  <Eye size={13} aria-hidden="true" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={handleReplace}
                  className="topper-button topper-button--secondary"
                  title="Replace with a different PDF document"
                  disabled={disabled}
                  style={{ height: "32px", padding: "0 10px", fontSize: "0.75rem" }}
                >
                  <RefreshCw size={13} aria-hidden="true" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="topper-button topper-button--danger"
                  title="Remove this attachment"
                  disabled={disabled}
                  style={{ height: "32px", padding: "0 10px", fontSize: "0.75rem" }}
                >
                  <Trash2 size={13} aria-hidden="true" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}

          {/* State 2: Uploading Progress */}
          {uploadStatus === "uploading" && (
            <div className="notice-attachment-progress" role="status" aria-live="polite">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.8125rem",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#1e293b",
                    fontWeight: 500,
                  }}
                >
                  <Loader2
                    size={15}
                    className="animate-spin text-blue-600"
                    aria-hidden="true"
                  />
                  Uploading PDF Document...
                </span>
                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="topper-button topper-button--secondary"
                  style={{ height: "26px", padding: "0 8px", fontSize: "0.6875rem" }}
                >
                  <X size={12} aria-hidden="true" />
                  Cancel
                </button>
              </div>
              <div className="notice-attachment-progress__bar-bg">
                <div
                  className="notice-attachment-progress__bar-fill"
                  style={{ width: `${uploadProgress}%` }}
                  role="progressbar"
                  aria-valuenow={uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          {/* State 3: Security & Malware Scanning */}
          {uploadStatus === "scanning" && (
            <div className="notice-attachment-progress" role="status" aria-live="polite">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.8125rem",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#1e293b",
                    fontWeight: 500,
                  }}
                >
                  <ShieldCheck
                    size={16}
                    className="text-emerald-600 animate-pulse"
                    aria-hidden="true"
                  />
                  Scanning file for malware and structural exploits...
                </span>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Multi-layer scan
                </span>
              </div>
              <div className="notice-attachment-progress__bar-bg">
                <div
                  className="notice-attachment-progress__bar-fill"
                  style={{ width: `${uploadProgress}%`, backgroundColor: "#059669" }}
                  role="progressbar"
                  aria-valuenow={uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          {/* State 4: Error State with Retry */}
          {uploadStatus === "error" && (
            <div className="notice-attachment-error" role="alert">
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <AlertCircle
                  size={16}
                  className="shrink-0 mt-0.5 text-red-600"
                  aria-hidden="true"
                />
                <div style={{ flex: 1 }}>
                  <p
                    className="notice-attachment-error__title"
                    style={{ margin: "0 0 2px 0", fontWeight: 600, color: "#991b1b" }}
                  >
                    Upload Failed
                  </p>
                  <p
                    className="notice-attachment-error__message"
                    style={{ margin: 0, fontSize: "0.8125rem", color: "#7f1d1d", lineHeight: "1.4" }}
                  >
                    {errorMessage || "Document was rejected by validation."}
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "4px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="topper-button topper-button--secondary"
                  style={{ height: "28px", padding: "0 10px", fontSize: "0.75rem" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="topper-button topper-button--primary"
                  style={{ height: "28px", padding: "0 10px", fontSize: "0.75rem" }}
                >
                  <RotateCcw size={13} aria-hidden="true" />
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* State 5: Idle Dropzone */}
          {uploadStatus === "idle" && (
            <div
              className={`notice-upload-dropzone ${
                isDragging ? "notice-upload-dropzone--dragging" : ""
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Upload PDF attachment dropzone"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  marginBottom: "10px",
                }}
              >
                <UploadCloud size={22} aria-hidden="true" />
              </div>
              <p
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              >
                Drag and drop your official PDF here
              </p>
              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "0.75rem",
                  color: "#64748b",
                }}
              >
                Only PDF files up to 10 MiB are permitted
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={disabled}
                className="topper-button topper-button--secondary"
                style={{ height: "32px", fontSize: "0.75rem" }}
              >
                Browse File
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: EXTERNAL HTTPS LINK */}
      {value.mode === "link" && (
        <div className="topper-form-grid" style={{ marginTop: "4px" }}>
          <div className="topper-field">
            <label htmlFor="notice-attachment-fileUrl" className="topper-label">
              Document URL / HTTPS Link <span className="topper-required">*</span>
            </label>
            <input
              id="notice-attachment-fileUrl"
              type="text"
              disabled={disabled}
              value={value.fileUrl || ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  fileUrl: e.target.value,
                })
              }
              onBlur={(e) => handleLinkBlur(e.target.value)}
              placeholder="https://example.com/circular.pdf or /documents/..."
              className={`topper-input ${
                urlValidationError || fieldErrors.fileUrl
                  ? "topper-input--error"
                  : ""
              }`}
              aria-invalid={Boolean(urlValidationError || fieldErrors.fileUrl)}
              aria-describedby="fileUrl-hint fileUrl-err"
            />
            {(urlValidationError || fieldErrors.fileUrl) && (
              <p id="fileUrl-err" className="topper-field-error">
                {urlValidationError || fieldErrors.fileUrl?.[0]}
              </p>
            )}
            <p id="fileUrl-hint" className="topper-field-note">
              Safe root-relative path (/documents/...) or secure external link (https://...).
            </p>
          </div>

          <div className="topper-field">
            <label htmlFor="notice-attachment-fileSize" className="topper-label">
              File Size Indicator <span className="topper-label-optional">(Optional)</span>
            </label>
            <input
              id="notice-attachment-fileSize"
              type="text"
              disabled={disabled}
              value={value.fileSize || ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  fileSize: e.target.value,
                })
              }
              placeholder="e.g. 245 KB or 1.2 MB"
              className={`topper-input ${
                fieldErrors.fileSize ? "topper-input--error" : ""
              }`}
              aria-describedby="fileSize-hint"
            />
            {fieldErrors.fileSize && (
              <p className="topper-field-error">{fieldErrors.fileSize[0]}</p>
            )}
            <p id="fileSize-hint" className="topper-field-note">
              Human-readable size displayed to public visitors.
            </p>
          </div>
        </div>
      )}

      {/* MODE 3: NONE */}
      {value.mode === "none" && (
        <div className="notice-attachment-none-card">
          <p style={{ margin: 0 }}>
            No document will be attached to this notice. Readers will view the title, summary, and text announcement only.
          </p>
        </div>
      )}
    </div>
  );
}
