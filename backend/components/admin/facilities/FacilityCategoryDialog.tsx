"use client";

import { useState, useTransition, useId } from "react";
import { X, Loader2, FolderPlus, Edit3 } from "lucide-react";
import {
  createFacilityCategoryAction,
  updateFacilityCategoryAction,
} from "@/lib/server/facility-actions";

export interface SerializedFacilityCategory {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FacilityCategoryDialogProps {
  isOpen: boolean;
  category: SerializedFacilityCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

function FacilityCategoryFormInner({
  category,
  onClose,
  onSuccess,
}: {
  category: SerializedFacilityCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(category?.title || "");
  const [description, setDescription] = useState(category?.description || "");
  const [displayOrder, setDisplayOrder] = useState<number>(category?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(category?.isPublished ?? true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const titleId = useId();
  const descId = useId();
  const orderId = useId();
  const publishedId = useId();

  const isEdit = Boolean(category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!title.trim()) {
      setError("Category title is required.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = isEdit
          ? {
              id: category!.id,
              title: title.trim(),
              description: description.trim() || null,
              displayOrder: Number(displayOrder),
              isPublished,
            }
          : {
              title: title.trim(),
              description: description.trim() || null,
              displayOrder: Number(displayOrder),
              isPublished,
            };

        const res = isEdit
          ? await updateFacilityCategoryAction(payload)
          : await createFacilityCategoryAction(payload);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Failed to save category.");
          if (res.fieldErrors) {
            setFieldErrors(res.fieldErrors);
          }
        }
      } catch (err) {
        console.error("Save category error:", err);
        setError("An unexpected error occurred.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-dialog-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isEdit ? <Edit3 size={18} color="#0284c7" /> : <FolderPlus size={18} color="#0284c7" />}
          <h2 id="category-dialog-title" style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#111827" }}>
            {isEdit ? "Edit Facility Category" : "New Facility Category"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="admin-dialog-close"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      </div>

      <div className="admin-dialog-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {error && (
          <div className="admin-error-banner" role="alert">
            {error}
          </div>
        )}

        <div className="admin-field">
          <label htmlFor={titleId} className="admin-label">
            Category Title <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            id={titleId}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Academic, Sports, Residential, Transport"
            className="admin-input"
            required
            maxLength={150}
            disabled={isPending}
          />
          {fieldErrors.title && (
            <p className="admin-field-error">{fieldErrors.title[0]}</p>
          )}
        </div>

        <div className="admin-field">
          <label htmlFor={descId} className="admin-label">
            Description
          </label>
          <textarea
            id={descId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of this category's infrastructure and amenities..."
            className="admin-textarea"
            rows={3}
            maxLength={500}
            disabled={isPending}
          />
          {fieldErrors.description && (
            <p className="admin-field-error">{fieldErrors.description[0]}</p>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="admin-field">
            <label htmlFor={orderId} className="admin-label">
              Display Order
            </label>
            <input
              id={orderId}
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
              className="admin-input"
              disabled={isPending}
            />
            {fieldErrors.displayOrder && (
              <p className="admin-field-error">{fieldErrors.displayOrder[0]}</p>
            )}
          </div>

          <div className="admin-field" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "8px" }}>
            <label
              htmlFor={publishedId}
              style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}
            >
              <input
                id={publishedId}
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                disabled={isPending}
                style={{ width: "16px", height: "16px", accentColor: "#0284c7" }}
              />
              <span>Published (Visible publicly)</span>
            </label>
          </div>
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
            <span>{isEdit ? "Update Category" : "Create Category"}</span>
          )}
        </button>
      </div>
    </form>
  );
}

export function FacilityCategoryDialog({
  isOpen,
  category,
  onClose,
  onSuccess,
}: FacilityCategoryDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="admin-dialog-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="admin-dialog-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-dialog-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "520px" }}
      >
        <FacilityCategoryFormInner
          key={category?.id || "new-category"}
          category={category}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
