"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, Loader2, FolderPlus, Edit3 } from "lucide-react";
import {
  createDownloadCategoryAction,
  updateDownloadCategoryAction,
} from "@/lib/server/download-actions";

export interface SerializedDownloadCategory {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DownloadCategoryDialogProps {
  isOpen: boolean;
  category?: SerializedDownloadCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface CategoryFormInnerProps {
  category?: SerializedDownloadCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

function CategoryFormInner({
  category,
  onClose,
  onSuccess,
}: CategoryFormInnerProps) {
  const isEdit = Boolean(category);
  const [isPending, startTransition] = useTransition();

  // Initialize directly from props (keyed remounting pattern)
  const [title, setTitle] = useState(category?.title ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    category ? String(category.displayOrder) : "0"
  );
  const [isPublished, setIsPublished] = useState(category?.isPublished ?? true);

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
      ...(isEdit ? { id: category!.id } : {}),
      title: title.trim(),
      description: description.trim() || null,
      displayOrder: parseInt(displayOrder, 10) || 0,
      isPublished,
    };

    startTransition(async () => {
      try {
        const res = isEdit
          ? await updateDownloadCategoryAction(null, payload)
          : await createDownloadCategoryAction(null, payload);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setGeneralError(res.error || "Failed to save category. Please check inputs.");
          if (res.fieldErrors) {
            setFieldErrors(res.fieldErrors);
          }
        }
      } catch (err) {
        console.error("Save category error:", err);
        setGeneralError("An unexpected server error occurred.");
      }
    });
  };

  return (
    <div
      className="admin-dialog-container"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-dialog-title"
      onClick={(e) => e.stopPropagation()}
      style={{ maxWidth: "540px" }}
    >
      <div className="admin-dialog-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isEdit ? (
            <Edit3 size={18} color="var(--red)" aria-hidden="true" />
          ) : (
            <FolderPlus size={18} color="var(--red)" aria-hidden="true" />
          )}
          <h2 id="category-dialog-title" style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#111827" }}>
            {isEdit ? "Edit Category" : "New Document Category"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
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
            <label htmlFor="cat-title" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Category Title <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              ref={firstInputRef}
              id="cat-title"
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CBSE Statutory Compliance Documents"
              className="admin-input"
              disabled={isPending}
            />
            {fieldErrors.title && (
              <p className="admin-field-error">{fieldErrors.title[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="cat-desc" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Description (Optional)
            </label>
            <textarea
              id="cat-desc"
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of documents in this group..."
              className="admin-select admin-textarea"
              disabled={isPending}
            />
            <p className="admin-field-note">{description.length}/500 characters</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "center" }}>
            <div>
              <label htmlFor="cat-order" style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Display Order
              </label>
              <input
                id="cat-order"
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
            disabled={isPending}
            className="admin-button admin-button--secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !title.trim()}
            className="admin-button admin-button--primary"
          >
            {isPending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            <span>{isPending ? "Saving..." : isEdit ? "Update Category" : "Create Category"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export function DownloadCategoryDialog({
  isOpen,
  category,
  onClose,
  onSuccess,
}: DownloadCategoryDialogProps) {
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
      <CategoryFormInner
        key={category?.id ?? "create"}
        category={category}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
