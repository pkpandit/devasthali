"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import {
  createHomepageHighlightAction,
  updateHomepageHighlightAction,
} from "@/lib/server/homepage-actions";
import { AdminImageUploadField } from "@/components/admin/ui/AdminImageUploadField";

export interface SerializedHighlight {
  id: string;
  title: string;
  description: string;
  badge: string | null;
  iconName: string | null;
  imageUrl: string | null;
  imageStorageKey: string | null;
  ctaLabel: string;
  ctaHref: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HighlightFormDialogProps {
  isOpen: boolean;
  highlight?: SerializedHighlight | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function HighlightFormDialog({
  isOpen,
  highlight,
  onClose,
  onSuccess,
}: HighlightFormDialogProps) {
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
    <div className="topper-dialog-backdrop" onClick={onClose}>
      <HighlightFormInner
        key={highlight?.id || "new-highlight"}
        highlight={highlight}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}

function HighlightFormInner({
  highlight,
  onClose,
  onSuccess,
}: {
  highlight?: SerializedHighlight | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: highlight?.title || "",
    description: highlight?.description || "",
    badge: highlight?.badge || "",
    iconName: highlight?.iconName || "",
    imageUrl: highlight?.imageUrl || "",
    ctaLabel: highlight?.ctaLabel || "Open",
    ctaHref: highlight?.ctaHref || "",
    isPublished: highlight ? highlight.isPublished : true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setServerError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    startTransition(async () => {
      const payload = new FormData();
      if (highlight) {
        payload.append("id", highlight.id);
      }
      payload.append("title", formData.title.trim());
      payload.append("description", formData.description.trim());
      if (formData.badge.trim()) payload.append("badge", formData.badge.trim());
      if (formData.iconName.trim()) payload.append("iconName", formData.iconName.trim());
      payload.append("ctaLabel", formData.ctaLabel.trim());
      payload.append("ctaHref", formData.ctaHref.trim());
      payload.append("isPublished", String(formData.isPublished));

      if (selectedFile) {
        payload.append("imageFile", selectedFile);
      } else if (isImageRemoved) {
        payload.append("removeImage", "true");
      } else if (formData.imageUrl) {
        payload.append("imageUrl", formData.imageUrl);
      }

      let res;
      if (highlight) {
        res = await updateHomepageHighlightAction(null, payload);
      } else {
        res = await createHomepageHighlightAction(null, payload);
      }

      if (!res.success) {
        setServerError(res.error || "Failed to save highlight");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      } else {
        onSuccess();
        onClose();
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hl-dialog-title"
      className="topper-dialog-container"
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="topper-dialog-form">
        <div className="topper-dialog-header">
          <div>
            <h2 id="hl-dialog-title" className="topper-dialog-title">
              {highlight ? "Edit Promotional Highlight" : "Add Promotional Highlight"}
            </h2>
            <p className="admin-field-note" style={{ margin: "2px 0 0" }}>
              {highlight
                ? "Update callouts, destination links, badges, and background visual."
                : "Create an action-oriented callout banner for the homepage grid."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="topper-dialog-close"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="topper-dialog-body">
          {serverError && (
            <div className="topper-dialog-error-banner" role="alert">
              {serverError}
            </div>
          )}

          <div className="topper-field topper-field--full">
            <label htmlFor="hl-title" className="topper-label">
              Highlight Card Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="hl-title"
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Download School Prospectus"
              maxLength={120}
              className={`topper-input ${fieldErrors.title ? "topper-input--error" : ""}`}
            />
            {fieldErrors.title && (
              <p className="topper-field-error">{fieldErrors.title}</p>
            )}
          </div>

          <div className="topper-field topper-field--full">
            <label htmlFor="hl-description" className="topper-label">
              Short Description / Sub-Hint <span className="text-red-500">*</span>
            </label>
            <input
              id="hl-description"
              type="text"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Admissions PDF Brochure"
              maxLength={255}
              className={`topper-input ${fieldErrors.description ? "topper-input--error" : ""}`}
            />
            {fieldErrors.description && (
              <p className="topper-field-error">{fieldErrors.description}</p>
            )}
          </div>

          <div className="topper-form-grid">
            <div className="topper-field">
              <label htmlFor="hl-badge" className="topper-label">
                Category Pill Badge
              </label>
              <input
                id="hl-badge"
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                placeholder="e.g. PDF, Fees, Routes, CBSE"
                maxLength={40}
                className={`topper-input ${fieldErrors.badge ? "topper-input--error" : ""}`}
              />
              {fieldErrors.badge && (
                <p className="topper-field-error">{fieldErrors.badge}</p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="hl-iconName" className="topper-label">
                Lucide Icon Name
              </label>
              <input
                id="hl-iconName"
                type="text"
                name="iconName"
                value={formData.iconName}
                onChange={handleChange}
                placeholder="e.g. Download, FileText, Bus, Award, Calendar"
                maxLength={60}
                className={`topper-input ${fieldErrors.iconName ? "topper-input--error" : ""}`}
              />
              {fieldErrors.iconName && (
                <p className="topper-field-error">{fieldErrors.iconName}</p>
              )}
            </div>
          </div>

          <div className="topper-form-grid">
            <div className="topper-field">
              <label htmlFor="hl-ctaLabel" className="topper-label">
                CTA Button Label <span className="text-red-500">*</span>
              </label>
              <input
                id="hl-ctaLabel"
                type="text"
                name="ctaLabel"
                required
                value={formData.ctaLabel}
                onChange={handleChange}
                placeholder="e.g. Download PDF"
                maxLength={60}
                className={`topper-input ${fieldErrors.ctaLabel ? "topper-input--error" : ""}`}
              />
              {fieldErrors.ctaLabel && (
                <p className="topper-field-error">{fieldErrors.ctaLabel}</p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="hl-ctaHref" className="topper-label">
                CTA Destination URL <span className="text-red-500">*</span>
              </label>
              <input
                id="hl-ctaHref"
                type="text"
                name="ctaHref"
                required
                value={formData.ctaHref}
                onChange={handleChange}
                placeholder="e.g. /school-prospectus"
                maxLength={500}
                className={`topper-input ${fieldErrors.ctaHref ? "topper-input--error" : ""}`}
              />
              {fieldErrors.ctaHref && (
                <p className="topper-field-error">{fieldErrors.ctaHref}</p>
              )}
            </div>
          </div>

          {/* Standardized Background Image Upload */}
          <div style={{ marginTop: "14px" }}>
            <AdminImageUploadField
              label="Photographic Background Image"
              variant="landscape"
              currentImageUrl={formData.imageUrl}
              selectedFile={selectedFile}
              isRemoved={isImageRemoved}
              onFileSelect={(file) => {
                setSelectedFile(file);
                setIsImageRemoved(false);
              }}
              onRemove={() => {
                setSelectedFile(null);
                setIsImageRemoved(true);
              }}
              error={fieldErrors.imageFile || fieldErrors.imageUrl}
              disabled={isPending}
              isPending={isPending}
              helperText="Supported formats: JPEG, PNG, WebP (max 2 MiB). High-resolution image is automatically converted to optimized WebP."
            />
          </div>

          <div className="topper-field--checkbox">
            <label className="topper-checkbox-wrapper">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="topper-checkbox"
              />
              <span className="topper-checkbox-label">Published (Visible on Live Website)</span>
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
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="topper-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>{highlight ? "Update Highlight" : "Create Highlight"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
