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
  createDownloadDocumentAction,
  updateDownloadDocumentAction,
  uploadDownloadDocumentAction,
} from "@/lib/server/download-actions";

export interface SerializedDownloadDocument {
  id: string;
  title: string;
  description: string | null;
  categoryId: string;
  fileUrl: string | null;
  fileStorageKey?: string | null;
  fileSizeBytes: number | null;
  fileSize: string | null;
  fileType: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryOption {
  id: string;
  title: string;
}

interface DownloadDocumentDialogProps {
  isOpen: boolean;
  categories: CategoryOption[];
  defaultCategoryId?: string;
  document?: SerializedDownloadDocument | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface DocumentFormInnerProps {
  categories: CategoryOption[];
  defaultCategoryId?: string;
  document?: SerializedDownloadDocument | null;
  onClose: () => void;
  onSuccess: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentFormInner({
  categories,
  defaultCategoryId,
  document,
  onClose,
  onSuccess,
}: DocumentFormInnerProps) {
  const isEdit = Boolean(document);
  const [isPending, startTransition] = useTransition();

  // Form Fields - initialized directly from props (keyed remounting pattern)
  const [categoryId, setCategoryId] = useState(
    document?.categoryId ?? (defaultCategoryId || categories[0]?.id || "")
  );
  const [title, setTitle] = useState(document?.title ?? "");
  const [description, setDescription] = useState(document?.description ?? "");
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
  const [uploadedOriginalName, setUploadedOriginalName] = useState<string | null>(
    document?.fileSize ?? null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Link state (Link mode)
  const [fileUrl, setFileUrl] = useState(document?.fileUrl ?? "");
  const [fileSize, setFileSize] = useState(document?.fileSize ?? "");

  // Error banners
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

    if (file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only authoritative PDF documents are accepted.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10 MiB limit.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadDownloadDocumentAction(formData);

      if (res.success && res.data) {
        setUploadedKey(res.data.fileStorageKey);
        setUploadedSizeBytes(res.data.fileSizeBytes);
        setUploadedOriginalName(res.data.fileOriginalName);

        // Autofill title if empty
        if (!title.trim()) {
          const cleanName = res.data.fileOriginalName.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
          setTitle(cleanName);
        }
      } else {
        setUploadError(res.error || "File upload failed.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError("An error occurred during file upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending || isUploading) return;

    setGeneralError(null);
    setFieldErrors({});

    if (!categoryId) {
      setGeneralError("Please select a target category.");
      return;
    }

    if (!title.trim()) {
      setGeneralError("Document title is required.");
      return;
    }

    const hasUpload = Boolean(uploadedKey);
    const hasLink = Boolean(fileUrl.trim());

    if (!hasUpload && !hasLink) {
      setGeneralError("Please upload a PDF document or provide a safe document link.");
      return;
    }

    const payload = {
      ...(isEdit ? { id: document!.id } : {}),
      title: title.trim(),
      description: description.trim() || null,
      categoryId,
      fileUrl: sourceMode === "link" ? fileUrl.trim() : null,
      fileStorageKey: sourceMode === "upload" ? uploadedKey : null,
      fileSizeBytes: sourceMode === "upload" ? uploadedSizeBytes : null,
      fileSize: sourceMode === "upload" && uploadedSizeBytes ? formatBytes(uploadedSizeBytes) : (fileSize.trim() || null),
      fileType: "application/pdf",
      displayOrder: parseInt(displayOrder, 10) || 0,
      isPublished,
    };

    startTransition(async () => {
      try {
        const res = isEdit
          ? await updateDownloadDocumentAction(null, payload)
          : await createDownloadDocumentAction(null, payload);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setGeneralError(res.error || "Failed to save document. Please review inputs.");
          if (res.fieldErrors) {
            setFieldErrors(res.fieldErrors);
          }
        }
      } catch (err) {
        console.error("Save document error:", err);
        setGeneralError("An unexpected server error occurred.");
      }
    });
  };

  return (
    <div
      className="admin-dialog-container"
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-dialog-title"
      onClick={(e) => e.stopPropagation()}
      style={{ maxWidth: "600px" }}
    >
      <div className="admin-dialog-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={18} color="var(--red)" aria-hidden="true" />
          <h2 id="document-dialog-title" style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#111827" }}>
            {isEdit ? "Edit Document" : "Add Download Document"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isPending || isUploading}
          className="admin-icon-button"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-dialog-body">
          {generalError && (
            <div className="admin-banner--error" role="alert">
              <span>{generalError}</span>
            </div>
          )}

          <div>
            <label htmlFor="doc-category" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Category <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <select
              id="doc-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="admin-select"
              disabled={isPending}
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="doc-title" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Document Title <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              ref={firstInputRef}
              id="doc-title"
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Official School Prospectus (Session 2026–27)"
              className="admin-input"
              disabled={isPending}
            />
            {fieldErrors.title && (
              <p className="admin-field-error">{fieldErrors.title[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="doc-desc" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Description (Optional)
            </label>
            <textarea
              id="doc-desc"
              rows={2}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary or context..."
              className="admin-select admin-textarea"
              disabled={isPending}
            />
          </div>

          {/* Document Source Selection */}
          <div style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "14px", background: "#f9fafb" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <button
                type="button"
                onClick={() => setSourceMode("upload")}
                className={`admin-button ${sourceMode === "upload" ? "admin-button--primary" : "admin-button--secondary"}`}
                style={{ minHeight: "36px", padding: "6px 14px", fontSize: "0.8125rem" }}
              >
                <UploadCloud size={14} aria-hidden="true" />
                <span>Upload PDF File</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceMode("link")}
                className={`admin-button ${sourceMode === "link" ? "admin-button--primary" : "admin-button--secondary"}`}
                style={{ minHeight: "36px", padding: "6px 14px", fontSize: "0.8125rem" }}
              >
                <Link2 size={14} aria-hidden="true" />
                <span>File URL / Static Path</span>
              </button>
            </div>

            {sourceMode === "upload" ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  id="doc-file-upload"
                />
                {uploadedKey ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", padding: "10px 14px", borderRadius: "8px", border: "1px solid #10b981" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CheckCircle2 size={18} color="#10b981" aria-hidden="true" />
                      <div>
                        <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>
                          {uploadedOriginalName || "PDF File Staged"}
                        </p>
                        {uploadedSizeBytes && (
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>
                            {formatBytes(uploadedSizeBytes)} • Ready to save
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isPending}
                      className="admin-button admin-button--secondary"
                      style={{ minHeight: "32px", padding: "4px 10px", fontSize: "0.75rem" }}
                    >
                      Replace File
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isPending}
                      className="admin-button admin-button--secondary"
                      style={{ width: "100%", justifyContent: "center", gap: "10px", borderStyle: "dashed", minHeight: "60px" }}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                          <span>Scanning and staging PDF...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={18} aria-hidden="true" />
                          <span>Choose PDF File (Max 10 MB)</span>
                        </>
                      )}
                    </button>
                    {uploadError && (
                      <p className="admin-field-error" style={{ marginTop: "6px" }}>{uploadError}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <label htmlFor="doc-url" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                    Document Path or HTTPS URL
                  </label>
                  <input
                    id="doc-url"
                    type="text"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="/documents/original/prospectus-2.pdf"
                    className="admin-input"
                    disabled={isPending}
                  />
                  {fieldErrors.fileUrl && (
                    <p className="admin-field-error">{fieldErrors.fileUrl[0]}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="doc-size" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                    Display Size (e.g. 5.6 MB, 722 KB)
                  </label>
                  <input
                    id="doc-size"
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="e.g. 5.6 MB"
                    className="admin-input"
                    disabled={isPending}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "center" }}>
            <div>
              <label htmlFor="doc-order" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Display Order
              </label>
              <input
                id="doc-order"
                type="number"
                min={0}
                max={9999}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="admin-input"
                disabled={isPending}
              />
            </div>

            <div style={{ paddingTop: "24px" }}>
              <label className="admin-checkbox-row">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="admin-toggle"
                  disabled={isPending}
                />
                <span>Published &amp; Active</span>
              </label>
            </div>
          </div>
        </div>

        <div className="admin-dialog-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending || isUploading}
            className="admin-button admin-button--secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || isUploading || !title.trim()}
            className="admin-button admin-button--primary"
          >
            {isPending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            <span>{isPending ? "Saving..." : isEdit ? "Update Document" : "Save Document"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export function DownloadDocumentDialog({
  isOpen,
  categories,
  defaultCategoryId,
  document,
  onClose,
  onSuccess,
}: DownloadDocumentDialogProps) {
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
      className="admin-dialog-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <DocumentFormInner
        key={document?.id ?? `create-${defaultCategoryId ?? ""}`}
        categories={categories}
        defaultCategoryId={defaultCategoryId}
        document={document}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
