"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, X, AlertCircle } from "lucide-react";
import {
  createAboutNarrativeSectionAction,
  updateAboutNarrativeSectionAction,
} from "@/lib/server/about-leadership-actions";

export interface SerializedAboutNarrativeSection {
  id: string;
  heading: string | null;
  body: string;
  imageUrl: string | null;
  imageStorageKey: string | null;
  imageAlt: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NarrativeSectionFormDialogProps {
  isOpen: boolean;
  section: SerializedAboutNarrativeSection | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function NarrativeSectionFormDialog({
  isOpen,
  section,
  onClose,
  onSuccess,
}: NarrativeSectionFormDialogProps) {
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
      <NarrativeSectionFormInner
        key={section?.id || "new-section"}
        section={section}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}

function NarrativeSectionFormInner({
  section,
  onClose,
  onSuccess,
}: {
  section: SerializedAboutNarrativeSection | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    heading: section?.heading || "",
    body: section?.body || "",
    imageUrl: section?.imageUrl || "",
    imageAlt: section?.imageAlt || "",
    displayOrder: section?.displayOrder ?? 0,
    isPublished: section?.isPublished ?? true,
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value, 10) || 0
          : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    startTransition(async () => {
      let res;
      if (section) {
        res = await updateAboutNarrativeSectionAction(null, {
          id: section.id,
          ...formData,
        });
      } else {
        res = await createAboutNarrativeSectionAction(null, formData);
      }

      if (!res.success) {
        setServerError(res.error || "Failed to save narrative section");
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
      aria-labelledby="narrative-dialog-title"
      className="topper-dialog-container"
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="topper-dialog-form">
        <div className="topper-dialog-header">
          <h2 id="narrative-dialog-title" className="topper-dialog-title">
            {section ? "Edit School Story Section" : "Add School Story Section"}
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
            <label htmlFor="narrative-heading" className="topper-label">
              Section Heading (Optional)
            </label>
            <input
              ref={firstInputRef}
              id="narrative-heading"
              type="text"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              placeholder="e.g. Genesis & Ballia Heritage, CBSE Affiliation Milestone"
              className={`topper-input ${fieldErrors.heading ? "topper-input--error" : ""}`}
            />
            {fieldErrors.heading && (
              <p className="topper-field-error">{fieldErrors.heading}</p>
            )}
          </div>

          <div className="topper-field topper-field--full">
            <label htmlFor="narrative-body" className="topper-label">
              Narrative Text / Paragraph <span className="text-red-500">*</span>
            </label>
            <textarea
              id="narrative-body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              rows={5}
              placeholder="Full paragraph text detailing this chapter of the school's story..."
              className={`topper-input ${fieldErrors.body ? "topper-input--error" : ""}`}
              required
            />
            {fieldErrors.body && (
              <p className="topper-field-error">{fieldErrors.body}</p>
            )}
          </div>

          <div className="topper-form-grid">
            <div className="topper-field">
              <label htmlFor="narrative-imageUrl" className="topper-label">
                Supporting Photo URL (Optional)
              </label>
              <input
                id="narrative-imageUrl"
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="e.g. /images/about/campus-history.jpg"
                className={`topper-input ${fieldErrors.imageUrl ? "topper-input--error" : ""}`}
              />
              {fieldErrors.imageUrl && (
                <p className="topper-field-error">{fieldErrors.imageUrl}</p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="narrative-imageAlt" className="topper-label">
                Photo Alt Text
              </label>
              <input
                id="narrative-imageAlt"
                type="text"
                name="imageAlt"
                value={formData.imageAlt}
                onChange={handleChange}
                placeholder="e.g. Archival photo of the school foundation stone"
                className={`topper-input ${fieldErrors.imageAlt ? "topper-input--error" : ""}`}
              />
              {fieldErrors.imageAlt && (
                <p className="topper-field-error">{fieldErrors.imageAlt}</p>
              )}
            </div>
          </div>

          <div className="topper-field">
            <label htmlFor="narrative-displayOrder" className="topper-label">
              Display Order
            </label>
            <input
              id="narrative-displayOrder"
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
              min={0}
              className={`topper-input ${fieldErrors.displayOrder ? "topper-input--error" : ""}`}
            />
            {fieldErrors.displayOrder && (
              <p className="topper-field-error">{fieldErrors.displayOrder}</p>
            )}
          </div>

          <div className="topper-field topper-field--checkbox">
            <label className="topper-checkbox-wrapper min-h-[44px]">
              <input
                type="checkbox"
                id="isPublishedNarrative"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="topper-checkbox"
              />
              <span className="topper-checkbox-label">Publish on public About page</span>
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
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{section ? "Save Changes" : "Create Section"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
