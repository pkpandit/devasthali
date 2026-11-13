"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, Loader2, FileText } from "lucide-react";
import {
  createNoticeAction,
  updateNoticeAction,
} from "@/lib/server/notice-actions";
import { NOTICE_CATEGORIES, type NoticeCategoryType } from "@/lib/validation/notices";

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
  publishDate: string; // ISO string
  publishedAt: string | null; // ISO string
  expiryDate: string | null; // ISO string
  displayOrder: number;
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

function formatDateForInput(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

function NoticeFormInner({
  initialNotice,
  onClose,
  onSuccess,
}: NoticeFormInnerProps) {
  const isEdit = Boolean(initialNotice);
  const [isPending, startTransition] = useTransition();

  // Field states
  const [title, setTitle] = useState(initialNotice?.title ?? "");
  const [category, setCategory] = useState<NoticeCategoryType>(
    initialNotice?.category ?? "CIRCULAR"
  );
  const [summary, setSummary] = useState(initialNotice?.summary ?? "");
  const [content, setContent] = useState(initialNotice?.content ?? "");
  const [fileUrl, setFileUrl] = useState(initialNotice?.fileUrl ?? "");
  const [fileSize, setFileSize] = useState(initialNotice?.fileSize ?? "");
  const [publishDate, setPublishDate] = useState(
    formatDateForInput(initialNotice?.publishDate) || new Date().toISOString().split("T")[0]
  );
  const [expiryDate, setExpiryDate] = useState(
    formatDateForInput(initialNotice?.expiryDate)
  );
  const [isUrgent, setIsUrgent] = useState(initialNotice?.isUrgent ?? false);
  const [isPublished, setIsPublished] = useState(initialNotice?.isPublished ?? false);
  const [displayOrder, setDisplayOrder] = useState(
    initialNotice ? String(initialNotice.displayOrder) : "0"
  );

  // Error states
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    setGeneralError(null);
    setFieldErrors({});

    const payload = {
      ...(isEdit ? { id: initialNotice!.id } : {}),
      title: title.trim(),
      category,
      summary: summary.trim() || null,
      content: content.trim() || null,
      fileUrl: fileUrl.trim() || null,
      fileSize: fileSize.trim() || null,
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isUrgent,
      isPublished,
      displayOrder: parseInt(displayOrder, 10) || 0,
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
      className="topper-dialog-container"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-dialog-title"
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="topper-dialog-form">
        {/* Header */}
        <div className="topper-dialog-header">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded-md">
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

        {/* General Error Banner */}
        {generalError && (
          <div
            className="topper-dialog-error-banner"
            role="alert"
            aria-live="assertive"
          >
            {generalError}
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="topper-dialog-body space-y-4">
          {/* Title */}
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

          {/* Category & Display Order Grid */}
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
                Display Order
              </label>
              <input
                id="notice-displayOrder"
                name="displayOrder"
                type="number"
                min="0"
                disabled={isPending}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className={`topper-input ${fieldErrors.displayOrder ? "topper-input--error" : ""}`}
                aria-invalid={Boolean(fieldErrors.displayOrder)}
              />
              {fieldErrors.displayOrder && (
                <p className="topper-field-error">{fieldErrors.displayOrder[0]}</p>
              )}
            </div>
          </div>

          {/* Publish Date & Expiry Date Grid */}
          <div className="topper-form-grid">
            <div className="topper-field">
              <label htmlFor="notice-publishDate" className="topper-label">
                Publish Date <span className="topper-required">*</span>
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
                aria-invalid={Boolean(fieldErrors.publishDate)}
                aria-describedby={fieldErrors.publishDate ? "publishDate-error" : undefined}
              />
              {fieldErrors.publishDate && (
                <p id="publishDate-error" className="topper-field-error">
                  {fieldErrors.publishDate[0]}
                </p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="notice-expiryDate" className="topper-label">
                Expiry Date <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="notice-expiryDate"
                name="expiryDate"
                type="date"
                disabled={isPending}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className={`topper-input ${fieldErrors.expiryDate ? "topper-input--error" : ""}`}
                aria-invalid={Boolean(fieldErrors.expiryDate)}
                aria-describedby={fieldErrors.expiryDate ? "expiryDate-error" : undefined}
              />
              {fieldErrors.expiryDate && (
                <p id="expiryDate-error" className="topper-field-error">
                  {fieldErrors.expiryDate[0]}
                </p>
              )}
            </div>
          </div>

          {/* Summary / Excerpt */}
          <div className="topper-field topper-field--full">
            <label htmlFor="notice-summary" className="topper-label">
              Short Summary / Excerpt <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="notice-summary"
              name="summary"
              rows={2}
              maxLength={500}
              disabled={isPending}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief 1-2 sentence preview for lists and cards..."
              className={`topper-input ${fieldErrors.summary ? "topper-input--error" : ""}`}
              aria-invalid={Boolean(fieldErrors.summary)}
            />
            {fieldErrors.summary && (
              <p className="topper-field-error">{fieldErrors.summary[0]}</p>
            )}
          </div>

          {/* Detailed Content (Rich Text / Semantic HTML) */}
          <div className="topper-field topper-field--full">
            <label htmlFor="notice-content" className="topper-label">
              Detailed Content <span className="text-slate-400 font-normal">(HTML or Plain Text)</span>
            </label>
            <textarea
              id="notice-content"
              name="content"
              rows={5}
              maxLength={10000}
              disabled={isPending}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="<p>Detailed notice announcement text, schedules, or instructions...</p>"
              className={`topper-input font-mono text-xs ${fieldErrors.content ? "topper-input--error" : ""}`}
              aria-invalid={Boolean(fieldErrors.content)}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Supports safe semantic tags: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a href=&quot;...&quot;&gt;. Script and style tags are sanitized.
            </p>
            {fieldErrors.content && (
              <p className="topper-field-error">{fieldErrors.content[0]}</p>
            )}
          </div>

          {/* Document Link & Size Grid */}
          <div className="topper-form-grid">
            <div className="topper-field">
              <label htmlFor="notice-fileUrl" className="topper-label">
                Document URL / Link <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="notice-fileUrl"
                name="fileUrl"
                type="text"
                disabled={isPending}
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="/documents/circular-2026.pdf or https://..."
                className={`topper-input ${fieldErrors.fileUrl ? "topper-input--error" : ""}`}
                aria-invalid={Boolean(fieldErrors.fileUrl)}
                aria-describedby={fieldErrors.fileUrl ? "fileUrl-error" : undefined}
              />
              {fieldErrors.fileUrl && (
                <p id="fileUrl-error" className="topper-field-error">
                  {fieldErrors.fileUrl[0]}
                </p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="notice-fileSize" className="topper-label">
                File Size Indicator <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="notice-fileSize"
                name="fileSize"
                type="text"
                disabled={isPending}
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="e.g. 245 KB"
                className={`topper-input ${fieldErrors.fileSize ? "topper-input--error" : ""}`}
                aria-invalid={Boolean(fieldErrors.fileSize)}
              />
              {fieldErrors.fileSize && (
                <p className="topper-field-error">{fieldErrors.fileSize[0]}</p>
              )}
            </div>
          </div>

          {/* Urgency & Publication Controls */}
          <div className="topper-field topper-field--full bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-800">Urgent Notice Flag</span>
                <p className="text-xs text-slate-500">
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
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-800">Publish Immediately</span>
                <p className="text-xs text-slate-500">
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
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
            {isPending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
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
