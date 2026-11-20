"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  X,
  Loader2,
  FileText,
  UploadCloud,
  Link2,
  CheckCircle2,
} from "lucide-react";
import {
  createDisclosureDocumentAction,
  updateDisclosureDocumentAction,
  uploadDisclosureDocumentAction,
} from "@/lib/server/disclosure-actions";

export interface SerializedDisclosureDocument {
  id: string;
  title: string;
  description: string | null;
  sectionId: string;
  fileUrl: string | null;
  fileStorageKey?: string | null;
  fileSizeBytes: number | null;
  fileSize: string | null;
  fileType: string;
  linkLabel?: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SectionOption {
  id: string;
  title: string;
}

interface DisclosureDocumentDialogProps {
  isOpen: boolean;
  sections: SectionOption[];
  defaultSectionId?: string;
  document?: SerializedDisclosureDocument | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface DocumentFormInnerProps {
  sections: SectionOption[];
  defaultSectionId?: string;
  document?: SerializedDisclosureDocument | null;
  onClose: () => void;
  onSuccess: () => void;
}

function DocumentFormInner({
  sections,
  defaultSectionId,
  document,
  onClose,
  onSuccess,
}: DocumentFormInnerProps) {
  const isEdit = Boolean(document);
  const [isPending, startTransition] = useTransition();

  // Form Fields - initialized directly from props (keyed remounting pattern)
  const [sectionId, setSectionId] = useState(
    document?.sectionId ?? (defaultSectionId || sections[0]?.id || "")
  );
  const [title, setTitle] = useState(document?.title ?? "");
  const [description, setDescription] = useState(document?.description ?? "");
  const [linkLabel, setLinkLabel] = useState(document?.linkLabel ?? "VIEW/DOWNLOAD");
  const [displayOrder, setDisplayOrder] = useState(
    document ? String(document.displayOrder) : "0"
  );
  const [isPublished, setIsPublished] = useState(document?.isPublished ?? true);

  // Document Source Mode: "upload" | "link"
  const [sourceMode, setSourceMode] = useState<"upload" | "link">(
    document?.fileStorageKey ? "upload" : document?.fileUrl ? "link" : "upload"
  );

  // Managed file state (Upload mode)
  const [uploadedKey, setUploadedKey] = useState<string | null>(
    document?.fileStorageKey ?? null
  );
  const [uploadedSizeBytes, setUploadedSizeBytes] = useState<number | null>(
    document?.fileSizeBytes ?? null
  );
  const [uploadedSizeFormatted, setUploadedSizeFormatted] = useState<string | null>(
    document?.fileSize ?? null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Link / Static Path state (Link mode)
  const [fileUrl, setFileUrl] = useState(document?.fileUrl ?? "");
  const [linkSize, setLinkSize] = useState(document?.fileSize ?? "");

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadDisclosureDocumentAction(formData);
      if (res.success && res.data) {
        setUploadedKey(res.data.fileStorageKey);
        setUploadedSizeBytes(res.data.fileSizeBytes);
        setUploadedSizeFormatted(res.data.fileSize);
        if (!title.trim()) {
          const autoTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
          setTitle(autoTitle);
        }
      } else {
        setUploadError(res.error || "Failed to upload file.");
      }
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Upload failed due to network error."
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending || isUploading) return;

    setGeneralError(null);
    setFieldErrors({});

    let payloadFileUrl: string | null = null;
    let payloadStorageKey: string | null = null;
    let payloadSizeBytes: number | null = null;
    let payloadSize: string | null = null;

    if (sourceMode === "upload") {
      if (!uploadedKey) {
        setUploadError("Please upload a PDF document before saving.");
        return;
      }
      payloadStorageKey = uploadedKey;
      payloadSizeBytes = uploadedSizeBytes;
      payloadSize = uploadedSizeFormatted;
    } else {
      if (!fileUrl.trim()) {
        setGeneralError("Please provide a valid document URL or static path.");
        return;
      }
      payloadFileUrl = fileUrl.trim();
      payloadSize = linkSize.trim() || null;
    }

    const payload = {
      ...(isEdit ? { id: document!.id } : {}),
      sectionId,
      title: title.trim(),
      description: description.trim() || null,
      fileUrl: payloadFileUrl,
      fileStorageKey: payloadStorageKey,
      fileSizeBytes: payloadSizeBytes,
      fileSize: payloadSize,
      fileType: "application/pdf",
      linkLabel: linkLabel.trim() || "VIEW/DOWNLOAD",
      displayOrder: parseInt(displayOrder, 10) || 0,
      isPublished,
    };

    startTransition(async () => {
      try {
        const res = isEdit
          ? await updateDisclosureDocumentAction(payload)
          : await createDisclosureDocumentAction(payload);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setGeneralError(res.error || "Failed to save disclosure document.");
          if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        }
      } catch (err) {
        setGeneralError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Modal Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FileText size={20} color="var(--primary)" />
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            {isEdit ? "Edit Disclosure Document" : "Add Disclosure Document"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            color: "var(--muted-foreground)",
            borderRadius: "6px",
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Modal Body */}
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "calc(85vh - 120px)", overflowY: "auto" }}>
        {generalError && (
          <div
            role="alert"
            style={{
              padding: "10px 14px",
              background: "#FEE2E2",
              border: "1px solid #F87171",
              borderRadius: "8px",
              color: "#991B1B",
              fontSize: "0.875rem",
            }}
          >
            {generalError}
          </div>
        )}

        {/* Section Select */}
        <div>
          <label
            htmlFor="doc-sec-select"
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: "6px",
            }}
          >
            Section <span style={{ color: "var(--destructive)" }}>*</span>
          </label>
          <select
            id="doc-sec-select"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "0.95rem",
              color: "var(--foreground)",
              background: "var(--background)",
              boxSizing: "border-box",
            }}
          >
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.title}
              </option>
            ))}
          </select>
        </div>

        {/* Document Title */}
        <div>
          <label
            htmlFor="doc-title"
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: "6px",
            }}
          >
            Document Title <span style={{ color: "var(--destructive)" }}>*</span>
          </label>
          <input
            id="doc-title"
            ref={firstInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Building Safety Certificate 2026"
            required
            maxLength={200}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: fieldErrors.title ? "1px solid #DC2626" : "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "0.95rem",
              color: "var(--foreground)",
              background: "var(--background)",
              boxSizing: "border-box",
            }}
          />
          {fieldErrors.title && (
            <p style={{ color: "#DC2626", fontSize: "0.8rem", marginTop: "4px" }}>
              {fieldErrors.title[0]}
            </p>
          )}
        </div>

        {/* Meaningful Button Label */}
        <div>
          <label
            htmlFor="doc-link-label"
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: "6px",
            }}
          >
            Button / Link Label
          </label>
          <input
            id="doc-link-label"
            type="text"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            placeholder="VIEW/DOWNLOAD"
            maxLength={100}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "0.95rem",
              color: "var(--foreground)",
              background: "var(--background)",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="doc-desc"
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: "6px",
            }}
          >
            Description (Optional)
          </label>
          <textarea
            id="doc-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary or context..."
            rows={2}
            maxLength={500}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "0.95rem",
              color: "var(--foreground)",
              background: "var(--background)",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
        </div>

        {/* Document Source Mode Selector */}
        <div className="notice-attachment-widget" style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "14px" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <button
              type="button"
              onClick={() => setSourceMode("upload")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: sourceMode === "upload" ? "var(--primary)" : "#ffffff",
                color: sourceMode === "upload" ? "#ffffff" : "var(--foreground)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              <UploadCloud size={16} />
              <span>Upload PDF File</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceMode("link")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: sourceMode === "link" ? "var(--primary)" : "#ffffff",
                color: sourceMode === "link" ? "#ffffff" : "var(--foreground)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              <Link2 size={16} />
              <span>File URL / Static Path</span>
            </button>
          </div>

          {sourceMode === "upload" ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileUpload}
                disabled={isUploading}
                style={{ display: "none" }}
                id="doc-file-input"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: "8px",
                  padding: "20px",
                  textAlign: "center",
                  cursor: isUploading ? "not-allowed" : "pointer",
                  background: isUploading ? "#F9FAFB" : "#ffffff",
                  transition: "background 0.2s",
                }}
              >
                {isUploading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "var(--primary)" }}>
                    <Loader2 size={24} className="animate-spin" />
                    <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Scanning & processing PDF...</span>
                  </div>
                ) : uploadedKey ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", color: "#16A34A" }}>
                    <CheckCircle2 size={24} />
                    <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>File Uploaded Successfully</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                      {uploadedSizeFormatted || "PDF Document"} • Click to replace
                    </span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <UploadCloud size={24} color="var(--muted-foreground)" />
                    <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--foreground)" }}>
                      Choose PDF File (Max 10 MB)
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                      Strictly PDF format verified with magic-byte scanner
                    </span>
                  </div>
                )}
              </div>
              {uploadError && (
                <p style={{ color: "#DC2626", fontSize: "0.8rem", marginTop: "6px" }}>{uploadError}</p>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label
                  htmlFor="doc-file-url"
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    marginBottom: "4px",
                  }}
                >
                  File Path or HTTPS URL <span style={{ color: "var(--destructive)" }}>*</span>
                </label>
                <input
                  id="doc-file-url"
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="/documents/original/building-safety.pdf or https://..."
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    color: "var(--foreground)",
                    background: "var(--background)",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="doc-link-size"
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    marginBottom: "4px",
                  }}
                >
                  Displayed File Size (Optional)
                </label>
                <input
                  id="doc-link-size"
                  type="text"
                  value={linkSize}
                  onChange={(e) => setLinkSize(e.target.value)}
                  placeholder="e.g. 231 KB or 3.1 MB"
                  style={{
                    width: "160px",
                    padding: "8px 12px",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    color: "var(--foreground)",
                    background: "var(--background)",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Display Order */}
        <div>
          <label
            htmlFor="doc-order"
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: "6px",
            }}
          >
            Display Order
          </label>
          <input
            id="doc-order"
            type="number"
            min={0}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            style={{
              width: "120px",
              padding: "8px 12px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "0.95rem",
              color: "var(--foreground)",
              background: "var(--background)",
            }}
          />
        </div>

        {/* Status Checkbox */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            id="doc-published"
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
          />
          <label
            htmlFor="doc-published"
            style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)" }}
          >
            Published & Active (visible in public disclosure tables)
          </label>
        </div>
      </div>

      {/* Modal Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          padding: "16px 24px",
          borderTop: "1px solid var(--border)",
          background: "#F9FAFB",
          borderRadius: "0 0 16px 16px",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isPending || isUploading}
          className="admin-btn-secondary"
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "#ffffff",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || isUploading}
          className="admin-btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "8px",
            border: "none",
            background: "var(--primary)",
            color: "#ffffff",
            cursor: isPending || isUploading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {(isPending || isUploading) && <Loader2 size={16} className="animate-spin" />}
          <span>{isEdit ? "Update Document" : "Save Document"}</span>
        </button>
      </div>
    </form>
  );
}

export function DisclosureDocumentDialog({
  isOpen,
  sections,
  defaultSectionId,
  document,
  onClose,
  onSuccess,
}: DisclosureDocumentDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="topper-dialog-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={document ? "Edit Disclosure Document" : "Add Disclosure Document"}
        className="topper-dialog-container topper-dialog-container--notice"
        style={{
          width: "100%",
          maxWidth: "580px",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        <DocumentFormInner
          key={document?.id ?? `create-${defaultSectionId ?? "default"}`}
          sections={sections}
          defaultSectionId={defaultSectionId}
          document={document}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
