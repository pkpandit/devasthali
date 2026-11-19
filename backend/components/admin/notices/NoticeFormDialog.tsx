"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  X,
  Loader2,
  FileText,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  UploadCloud,
  Link2,
} from "lucide-react";
import {
  createNoticeAction,
  updateNoticeAction,
  uploadNoticeDocumentAction,
} from "@/lib/server/notice-actions";
import {
  NOTICE_CATEGORIES,
  documentLinkSchema,
  type NoticeCategoryType,
} from "@/lib/validation/notices";
import { Badge } from "@/components/ui/Badge";

export interface SerializedNoticeAttachment {
  id: string;
  noticeId?: string;
  title: string;
  fileUrl: string | null;
  fileStorageKey?: string | null;
  fileSizeBytes?: number | null;
  fileSize?: string | null;
  fileType: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SerializedNotice {
  id: string;
  title: string;
  slug: string;
  category: NoticeCategoryType;
  summary: string | null;
  content: string | null;
  isUrgent: boolean;
  isPublished: boolean;
  fileUrl: string | null;
  fileSize: string | null;
  fileStorageKey?: string | null;
  fileSizeBytes?: number | null;
  fileSha256?: string | null;
  fileOriginalName?: string | null;
  fileUploadedAt?: string | null;
  publishDate: string;
  publishedAt: string | null;
  expiryDate: string | null;
  displayOrder: number;
  attachments?: SerializedNoticeAttachment[];
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NoticeFormDialogProps {
  isOpen: boolean;
  initialNotice?: SerializedNotice | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface NoticeFormInnerProps {
  initialNotice?: SerializedNotice | null;
  onClose: () => void;
  onSuccess: () => void;
}

export interface FormAttachmentItem {
  id?: string;
  title: string;
  fileUrl: string | null;
  fileStorageKey: string | null;
  fileSizeBytes: number | null;
  fileSize: string | null;
  fileType: string;
  displayOrder: number;
  isPublished: boolean;
  fileOriginalName?: string | null;
}

function formatDateForInput(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

function formatByteSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function NoticeFormInner({
  initialNotice,
  onClose,
  onSuccess,
}: NoticeFormInnerProps) {
  const isEdit = Boolean(initialNotice);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialNotice?.title ?? "");
  const [category, setCategory] = useState<NoticeCategoryType>(
    initialNotice?.category ?? "CIRCULAR"
  );
  const [summary, setSummary] = useState(initialNotice?.summary ?? "");
  const [content, setContent] = useState(initialNotice?.content ?? "");
  const [publishDate, setPublishDate] = useState(
    formatDateForInput(initialNotice?.publishDate) ||
      new Date().toISOString().split("T")[0]
  );
  const [expiryDate, setExpiryDate] = useState(
    formatDateForInput(initialNotice?.expiryDate)
  );
  const [isUrgent, setIsUrgent] = useState(initialNotice?.isUrgent ?? false);
  const [isPublished, setIsPublished] = useState(
    initialNotice?.isPublished ?? false
  );
  const [displayOrder, setDisplayOrder] = useState(
    initialNotice ? String(initialNotice.displayOrder) : "0"
  );

  const [attachments, setAttachments] = useState<FormAttachmentItem[]>(() => {
    if (initialNotice?.attachments && initialNotice.attachments.length > 0) {
      return initialNotice.attachments.map((att, index) => ({
        id: att.id,
        title: att.title,
        fileUrl: att.fileUrl,
        fileStorageKey: att.fileStorageKey ?? null,
        fileSizeBytes: att.fileSizeBytes ?? null,
        fileSize: att.fileSize ?? null,
        fileType: att.fileType || "application/pdf",
        displayOrder: att.displayOrder ?? index,
        isPublished: att.isPublished ?? true,
      }));
    }
    if (initialNotice?.fileStorageKey || initialNotice?.fileUrl) {
      return [
        {
          id: undefined,
          title: initialNotice.fileOriginalName || initialNotice.title,
          fileUrl: initialNotice.fileUrl,
          fileStorageKey: initialNotice.fileStorageKey ?? null,
          fileSizeBytes: initialNotice.fileSizeBytes ?? null,
          fileSize: initialNotice.fileSize ?? null,
          fileType: "application/pdf",
          displayOrder: 0,
          isPublished: true,
          fileOriginalName: initialNotice.fileOriginalName ?? null,
        },
      ];
    }
    return [];
  });

  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [addMode, setAddMode] = useState<"upload" | "link">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkSize, setLinkSize] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    firstInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleMoveAttachment = (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= attachments.length) return;
    const reordered = [...attachments];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setAttachments(
      reordered.map((item, idx) => ({ ...item, displayOrder: idx }))
    );
  };

  const handleDeleteAttachment = (index: number) => {
    setAttachments((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({ ...item, displayOrder: idx }))
    );
  };

  const handleToggleAttachmentPublished = (index: number) => {
    setAttachments((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, isPublished: !item.isPublished } : item
      )
    );
  };

  const handleUpdateAttachmentTitle = (index: number, newTitle: string) => {
    setAttachments((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, title: newTitle } : item
      )
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 10 MiB limit.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF documents (.pdf) are permitted.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);

      const res = await uploadNoticeDocumentAction(formData);
      const uploadData = res.data;
      if (!res.success || !uploadData) {
        setUploadError(res.error || "Document upload failed.");
      } else {
        const defaultTitle = uploadData.fileOriginalName
          .replace(/\.pdf$/i, "")
          .replace(/[_-]/g, " ")
          .trim();

        setAttachments((prev) => [
          ...prev,
          {
            title: defaultTitle || "Document Attachment",
            fileStorageKey: uploadData.fileStorageKey,
            fileSizeBytes: uploadData.fileSizeBytes,
            fileSize: formatByteSize(uploadData.fileSizeBytes),
            fileType: "application/pdf",
            fileUrl: null,
            displayOrder: prev.length,
            isPublished: true,
            fileOriginalName: uploadData.fileOriginalName,
          },
        ]);

        setShowAddDrawer(false);
      }
    } catch (err) {
      console.error("[NoticeFormDialog] Attachment upload error:", err);
      setUploadError("Unexpected error during file upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddLink = () => {
    setLinkError(null);
    const trimmedUrl = linkUrl.trim();
    const trimmedTitle = linkTitle.trim();

    if (!trimmedTitle) {
      setLinkError("Attachment label is required.");
      return;
    }

    if (!trimmedUrl) {
      setLinkError("Document URL or path is required.");
      return;
    }

    const valResult = documentLinkSchema.safeParse(trimmedUrl);
    if (!valResult.success) {
      setLinkError(
        "Invalid document link. Must be a root-relative path (e.g. /documents/...pdf) or secure HTTPS URL."
      );
      return;
    }

    setAttachments((prev) => [
      ...prev,
      {
        title: trimmedTitle,
        fileUrl: trimmedUrl,
        fileStorageKey: null,
        fileSizeBytes: null,
        fileSize: linkSize.trim() || null,
        fileType: "application/pdf",
        displayOrder: prev.length,
        isPublished: true,
      },
    ]);

    setLinkUrl("");
    setLinkTitle("");
    setLinkSize("");
    setShowAddDrawer(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    setGeneralError(null);
    setFieldErrors({});

    for (let i = 0; i < attachments.length; i++) {
      if (!attachments[i].title.trim()) {
        setGeneralError(`Attachment #${i + 1} requires a meaningful label.`);
        return;
      }
    }

    const payload = {
      ...(isEdit ? { id: initialNotice!.id } : {}),
      title: title.trim(),
      category,
      summary: summary.trim() || null,
      content: content.trim() || null,
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isUrgent,
      isPublished,
      displayOrder: parseInt(displayOrder, 10) || 0,
      attachments: attachments.map((att, idx) => ({
        ...(att.id ? { id: att.id } : {}),
        title: att.title.trim(),
        fileUrl: att.fileUrl || null,
        fileStorageKey: att.fileStorageKey || null,
        fileSizeBytes: att.fileSizeBytes || null,
        fileSize: att.fileSize || null,
        fileType: att.fileType || "application/pdf",
        displayOrder: idx,
        isPublished: att.isPublished,
      })),
      fileStorageKey: attachments[0]?.fileStorageKey || null,
      fileUrl: attachments[0]?.fileUrl || null,
      fileSize: attachments[0]?.fileSize || null,
      fileSizeBytes: attachments[0]?.fileSizeBytes || null,
      fileOriginalName:
        attachments[0]?.fileOriginalName || attachments[0]?.title || null,
    };

    startTransition(async () => {
      try {
        const res = isEdit
          ? await updateNoticeAction(null, payload)
          : await createNoticeAction(null, payload);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setGeneralError(res.error || "Operation failed. Please review inputs.");
          if (res.fieldErrors) {
            setFieldErrors(res.fieldErrors);
          }
        }
      } catch (err) {
        console.error("[NoticeFormDialog] Submission error:", err);
        setGeneralError("An unexpected server error occurred. Please try again.");
      }
    });
  };

  return (
    <div
      ref={modalRef}
      className="topper-dialog-container topper-dialog-container--notice"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-dialog-title"
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="topper-dialog-form">
        <div className="topper-dialog-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                padding: "6px",
                backgroundColor: "#eff6ff",
                color: "#1d4ed8",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={18} aria-hidden="true" />
            </div>
            <h2 id="notice-dialog-title" className="topper-dialog-title">
              {isEdit ? "Edit Notice / Circular" : "Publish New Notice / Circular"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="topper-dialog-close"
            aria-label="Close dialog"
            disabled={isPending}
          >
            <X size={18} />
          </button>
        </div>

        {generalError && (
          <div
            className="topper-dialog-error-banner"
            role="alert"
            aria-live="assertive"
            style={{ margin: "16px 24px 0" }}
          >
            {generalError}
          </div>
        )}

        <div className="topper-dialog-body notice-dialog-body">
          <div className="topper-field topper-field--full">
            <label htmlFor="notice-title" className="topper-label">
              Notice Title <span className="topper-required">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="notice-title"
              name="title"
              type="text"
              required
              disabled={isPending}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual Sports Meet 2026 Schedule & Guidelines"
              className={`topper-input ${fieldErrors.title ? "topper-input--error" : ""}`}
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={fieldErrors.title ? "title-error" : undefined}
            />
            {fieldErrors.title && (
              <p id="title-error" className="topper-field-error">
                {fieldErrors.title[0]}
              </p>
            )}
          </div>

          <div className="topper-form-grid">
            <div className="topper-field">
              <label htmlFor="notice-category" className="topper-label">
                Category <span className="topper-required">*</span>
              </label>
              <select
                id="notice-category"
                name="category"
                disabled={isPending}
                value={category}
                onChange={(e) => setCategory(e.target.value as NoticeCategoryType)}
                className={`topper-input ${fieldErrors.category ? "topper-input--error" : ""}`}
                aria-invalid={Boolean(fieldErrors.category)}
              >
                {NOTICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <p className="topper-field-error">{fieldErrors.category[0]}</p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="notice-displayOrder" className="topper-label">
                Display Order Priority
              </label>
              <input
                id="notice-displayOrder"
                name="displayOrder"
                type="number"
                min="0"
                max="9999"
                disabled={isPending}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className={`topper-input ${fieldErrors.displayOrder ? "topper-input--error" : ""}`}
              />
              <p className="topper-field-note">
                Lower numbers appear first within the same publication date.
              </p>
            </div>
          </div>

          <div className="topper-form-grid">
            <div className="topper-field">
              <label htmlFor="notice-publishDate" className="topper-label">
                Publication Date <span className="topper-required">*</span>
              </label>
              <input
                id="notice-publishDate"
                name="publishDate"
                type="date"
                required
                disabled={isPending}
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className={`topper-input ${fieldErrors.publishDate ? "topper-input--error" : ""}`}
              />
            </div>

            <div className="topper-field">
              <label htmlFor="notice-expiryDate" className="topper-label">
                Expiry Date <span className="topper-label-optional">(Optional)</span>
              </label>
              <input
                id="notice-expiryDate"
                name="expiryDate"
                type="date"
                disabled={isPending}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className={`topper-input ${fieldErrors.expiryDate ? "topper-input--error" : ""}`}
              />
              <p className="topper-field-note">
                Notice automatically expires after this date and hides from public views.
              </p>
            </div>
          </div>

          <div className="topper-field topper-field--full">
            <label htmlFor="notice-summary" className="topper-label">
              Short Summary / Excerpt <span className="topper-label-optional">(Optional)</span>
            </label>
            <textarea
              id="notice-summary"
              name="summary"
              rows={2}
              maxLength={500}
              disabled={isPending}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief 1-2 sentence preview for lists and ticker..."
              className={`topper-input ${fieldErrors.summary ? "topper-input--error" : ""}`}
              aria-invalid={Boolean(fieldErrors.summary)}
            />
            {fieldErrors.summary && (
              <p className="topper-field-error">{fieldErrors.summary[0]}</p>
            )}
          </div>

          <div className="topper-field topper-field--full">
            <label htmlFor="notice-content" className="topper-label">
              Detailed Content <span className="topper-label-optional">(Plain Text Only)</span>
            </label>
            <textarea
              id="notice-content"
              name="content"
              rows={4}
              maxLength={10000}
              disabled={isPending}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed notice announcement text, instructions, and circular details..."
              className={`topper-input notice-content-textarea ${fieldErrors.content ? "topper-input--error" : ""}`}
              aria-invalid={Boolean(fieldErrors.content)}
            />
            <p className="topper-field-note">
              Rendered strictly as safe plain text. Arbitrary HTML formatting is not permitted.
            </p>
            {fieldErrors.content && (
              <p className="topper-field-error">{fieldErrors.content[0]}</p>
            )}
          </div>

          {/* Multi-Attachment Manager */}
          <div className="topper-field topper-field--full">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <div>
                <label className="topper-label" style={{ marginBottom: 0 }}>
                  Official Attachments &amp; Documents
                </label>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
                  Attach official PDF circulars or linked public documents.
                </p>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                {attachments.length} {attachments.length === 1 ? "file" : "files"}
              </span>
            </div>

            {attachments.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                {attachments.map((att, idx) => (
                  <div
                    key={att.id || `att-idx-${idx}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <button
                        type="button"
                        className="admin-icon-btn"
                        onClick={() => handleMoveAttachment(idx, "UP")}
                        disabled={idx === 0 || isPending}
                        aria-label="Move attachment up"
                        title="Move up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn"
                        onClick={() => handleMoveAttachment(idx, "DOWN")}
                        disabled={idx === attachments.length - 1 || isPending}
                        aria-label="Move attachment down"
                        title="Move down"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                        minWidth: "46px",
                      }}
                    >
                      <Badge variant="doc">PDF</Badge>
                      {att.fileSize && (
                        <span style={{ fontSize: "10px", color: "#64748b" }}>
                          {att.fileSize}
                        </span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input
                        type="text"
                        value={att.title}
                        onChange={(e) =>
                          handleUpdateAttachmentTitle(idx, e.target.value)
                        }
                        placeholder="Meaningful attachment label (e.g. Schedule PDF) *"
                        className="topper-input"
                        style={{
                          height: "32px",
                          fontSize: "13px",
                          padding: "4px 8px",
                        }}
                        disabled={isPending}
                        required
                      />
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: "2px",
                        }}
                      >
                        {att.fileStorageKey
                          ? "Managed secure storage"
                          : att.fileUrl || "Uploaded document"}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="topper-icon-button"
                      onClick={() => handleToggleAttachmentPublished(idx)}
                      disabled={isPending}
                      aria-label={
                        att.isPublished
                          ? "Attachment published (click to hide)"
                          : "Attachment hidden (click to publish)"
                      }
                      title={
                        att.isPublished
                          ? "Published (click to unpublish)"
                          : "Draft (click to publish)"
                      }
                    >
                      {att.isPublished ? (
                        <Eye size={15} style={{ color: "#059669" }} />
                      ) : (
                        <EyeOff size={15} style={{ color: "#64748b" }} />
                      )}
                    </button>

                    <button
                      type="button"
                      className="topper-icon-button topper-icon-button--danger"
                      onClick={() => handleDeleteAttachment(idx)}
                      disabled={isPending}
                      aria-label={`Remove attachment: ${att.title}`}
                      title="Remove attachment"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "16px",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "6px",
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: "13px",
                  marginBottom: "12px",
                  backgroundColor: "#f8fafc",
                }}
              >
                No document attachments yet. Click below to upload a PDF or link a public document.
              </div>
            )}

            {showAddDrawer ? (
              <div
                style={{
                  padding: "14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  backgroundColor: "#f1f5f9",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setAddMode("upload");
                        setUploadError(null);
                      }}
                      className={`topper-button ${addMode === "upload" ? "topper-button--primary" : "topper-button--secondary"}`}
                      style={{ height: "30px", fontSize: "12px", padding: "0 10px" }}
                    >
                      <UploadCloud size={13} aria-hidden="true" />
                      <span>Upload PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddMode("link");
                        setLinkError(null);
                      }}
                      className={`topper-button ${addMode === "link" ? "topper-button--primary" : "topper-button--secondary"}`}
                      style={{ height: "30px", fontSize: "12px", padding: "0 10px" }}
                    >
                      <Link2 size={13} aria-hidden="true" />
                      <span>Link Document</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddDrawer(false);
                      setUploadError(null);
                      setLinkError(null);
                    }}
                    className="topper-dialog-close"
                    style={{ position: "static" }}
                    aria-label="Cancel adding attachment"
                  >
                    <X size={16} />
                  </button>
                </div>

                {addMode === "upload" && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isPending}
                      className="topper-button topper-button--secondary"
                      style={{ width: "100%", height: "42px", justifyContent: "center" }}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                          <span>Validating &amp; Scanning PDF...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={15} aria-hidden="true" />
                          <span>Select PDF Document (Max 10 MB)</span>
                        </>
                      )}
                    </button>
                    {uploadError && (
                      <p className="topper-field-error" style={{ marginTop: "6px" }}>
                        {uploadError}
                      </p>
                    )}
                  </div>
                )}

                {addMode === "link" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div className="topper-form-grid">
                      <input
                        type="text"
                        placeholder="Attachment Label (e.g. Bus Routes PDF) *"
                        value={linkTitle}
                        onChange={(e) => setLinkTitle(e.target.value)}
                        className="topper-input"
                        style={{ height: "32px", fontSize: "13px" }}
                      />
                      <input
                        type="text"
                        placeholder="File size (e.g. 240 KB)"
                        value={linkSize}
                        onChange={(e) => setLinkSize(e.target.value)}
                        className="topper-input"
                        style={{ height: "32px", fontSize: "13px" }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="URL or Path (e.g. /documents/original/fee.pdf) *"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="topper-input"
                      style={{ height: "32px", fontSize: "13px" }}
                    />
                    {linkError && (
                      <p className="topper-field-error">{linkError}</p>
                    )}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={handleAddLink}
                        className="topper-button topper-button--primary"
                        style={{ height: "32px", fontSize: "12px", padding: "0 12px" }}
                      >
                        <Plus size={13} aria-hidden="true" />
                        <span>Add Link</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddDrawer(true)}
                disabled={isPending}
                className="topper-button topper-button--secondary"
                style={{ height: "34px", fontSize: "13px", padding: "0 12px" }}
              >
                <Plus size={14} aria-hidden="true" />
                <span>Add Attachment</span>
              </button>
            )}
          </div>

          <div className="notice-toggle-grid">
            <label
              htmlFor="notice-isUrgent"
              className={`notice-toggle-card ${isUrgent ? "notice-toggle-card--active" : ""}`}
            >
              <div className="notice-toggle-card__info">
                <span className="notice-toggle-card__title">Urgent Notice Flag</span>
                <p className="notice-toggle-card__desc">
                  Highlights this notice with an urgent badge in listings and public views.
                </p>
              </div>
              <input
                id="notice-isUrgent"
                name="isUrgent"
                type="checkbox"
                checked={isUrgent}
                disabled={isPending}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="notice-toggle-card__checkbox"
              />
            </label>

            <label
              htmlFor="notice-isPublished"
              className={`notice-toggle-card ${isPublished ? "notice-toggle-card--active-publish" : ""}`}
            >
              <div className="notice-toggle-card__info">
                <span className="notice-toggle-card__title">Publish Immediately</span>
                <p className="notice-toggle-card__desc">
                  If unchecked, notice is saved as a Draft visible only to administrators.
                </p>
              </div>
              <input
                id="notice-isPublished"
                name="isPublished"
                type="checkbox"
                checked={isPublished}
                disabled={isPending}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="notice-toggle-card__checkbox"
              />
            </label>
          </div>
        </div>

        <div className="topper-dialog-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="topper-button topper-button--secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="topper-button topper-button--primary"
          >
            {isPending && (
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            )}
            <span>{isEdit ? "Save Changes" : "Create Notice"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export function NoticeFormDialog({
  isOpen,
  initialNotice,
  onClose,
  onSuccess,
}: NoticeFormDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="topper-dialog-backdrop" onClick={onClose}>
      <NoticeFormInner
        key={initialNotice?.id ?? "create"}
        initialNotice={initialNotice}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
