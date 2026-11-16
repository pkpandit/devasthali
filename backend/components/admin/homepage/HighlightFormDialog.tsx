"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, Loader2, Save, AlertCircle } from "lucide-react";
import {
  createHomepageHighlightAction,
  updateHomepageHighlightAction,
} from "@/lib/server/homepage-actions";

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
  highlight: SerializedHighlight | null; // null for Create mode
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
  highlight: SerializedHighlight | null;
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
      let res;
      if (highlight) {
        res = await updateHomepageHighlightAction(null, {
          id: highlight.id,
          ...formData,
        });
      } else {
        res = await createHomepageHighlightAction(null, formData);
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
          <h2 id="hl-dialog-title" className="topper-dialog-title">
            {highlight ? "Edit Promotional Highlight" : "Add Promotional Highlight"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="topper-dialog-close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="topper-dialog-body space-y-4">
          {serverError && (
            <div className="topper-dialog-error-banner flex items-center gap-2" role="alert">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="topper-field topper-field--full">
            <label htmlFor="hl-title" className="topper-label">
              Highlight Title <span className="text-red-500">*</span>
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
                placeholder="e.g. Download, View Details"
                maxLength={60}
                className={`topper-input ${fieldErrors.ctaLabel ? "topper-input--error" : ""}`}
              />
              {fieldErrors.ctaLabel && (
                <p className="topper-field-error">{fieldErrors.ctaLabel}</p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="hl-ctaHref" className="topper-label">
                Destination URL <span className="text-red-500">*</span>
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

          <div className="topper-field topper-field--full">
            <label htmlFor="hl-imageUrl" className="topper-label">
              Photographic Background Image URL
            </label>
            <input
              id="hl-imageUrl"
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="e.g. /images/admissions/prospectus-brochure.jpg"
              maxLength={500}
              className={`topper-input ${fieldErrors.imageUrl ? "topper-input--error" : ""}`}
            />
            {fieldErrors.imageUrl && (
              <p className="topper-field-error">{fieldErrors.imageUrl}</p>
            )}
            <p className="topper-field-note">
              Use a root-relative path (e.g. /images/...) or secure HTTPS image URL.
            </p>
          </div>

          <div className="topper-field topper-field--checkbox">
            <label className="topper-checkbox-wrapper min-h-[44px]">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="topper-checkbox"
              />
              <span className="topper-checkbox-label">Published on Public Homepage</span>
            </label>
          </div>
        </div>

        <div className="topper-dialog-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="topper-button topper-button--secondary min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="topper-button topper-button--primary min-h-[44px] gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{highlight ? "Update Highlight" : "Create Highlight"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
