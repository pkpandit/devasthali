"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, X, AlertCircle } from "lucide-react";
import {
  createInstitutionalCoreValueAction,
  updateInstitutionalCoreValueAction,
} from "@/lib/server/about-leadership-actions";

export interface SerializedInstitutionalCoreValue {
  id: string;
  title: string;
  description: string;
  iconName: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CoreValueFormDialogProps {
  isOpen: boolean;
  coreValue: SerializedInstitutionalCoreValue | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CoreValueFormDialog({
  isOpen,
  coreValue,
  onClose,
  onSuccess,
}: CoreValueFormDialogProps) {
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
      <CoreValueFormInner
        key={coreValue?.id || "new-core-value"}
        coreValue={coreValue}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}

function CoreValueFormInner({
  coreValue,
  onClose,
  onSuccess,
}: {
  coreValue: SerializedInstitutionalCoreValue | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: coreValue?.title || "",
    description: coreValue?.description || "",
    iconName: coreValue?.iconName || "Compass",
    displayOrder: coreValue?.displayOrder ?? 0,
    isPublished: coreValue?.isPublished ?? true,
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
      if (coreValue) {
        res = await updateInstitutionalCoreValueAction(null, {
          id: coreValue.id,
          ...formData,
        });
      } else {
        res = await createInstitutionalCoreValueAction(null, formData);
      }

      if (!res.success) {
        setServerError(res.error || "Failed to save core value");
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
      aria-labelledby="corevalue-dialog-title"
      className="topper-dialog-container"
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="topper-dialog-form">
        <div className="topper-dialog-header">
          <h2 id="corevalue-dialog-title" className="topper-dialog-title">
            {coreValue ? "Edit Institutional Principle" : "Add Institutional Principle"}
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
            <label htmlFor="cv-title" className="topper-label">
              Value / Principle Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="cv-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Academic Excellence, Moral Character, Modern Outlook"
              className={`topper-input ${fieldErrors.title ? "topper-input--error" : ""}`}
              required
            />
            {fieldErrors.title && (
              <p className="topper-field-error">{fieldErrors.title}</p>
            )}
          </div>

          <div className="topper-field topper-field--full">
            <label htmlFor="cv-description" className="topper-label">
              Description / Guiding Statement <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cv-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief explanation of how this value guides students and faculty..."
              className={`topper-input ${fieldErrors.description ? "topper-input--error" : ""}`}
              required
            />
            {fieldErrors.description && (
              <p className="topper-field-error">{fieldErrors.description}</p>
            )}
          </div>

          <div className="topper-form-grid">
            <div className="topper-field">
              <label htmlFor="cv-iconName" className="topper-label">
                Icon Name (Lucide)
              </label>
              <input
                id="cv-iconName"
                type="text"
                name="iconName"
                value={formData.iconName}
                onChange={handleChange}
                placeholder="e.g. Compass, ShieldCheck, Heart, Sparkles"
                className={`topper-input ${fieldErrors.iconName ? "topper-input--error" : ""}`}
              />
              {fieldErrors.iconName && (
                <p className="topper-field-error">{fieldErrors.iconName}</p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="cv-displayOrder" className="topper-label">
                Display Order
              </label>
              <input
                id="cv-displayOrder"
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
          </div>

          <div className="topper-field topper-field--checkbox">
            <label className="topper-checkbox-wrapper min-h-[44px]">
              <input
                type="checkbox"
                id="isPublishedCoreValue"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="topper-checkbox"
              />
              <span className="topper-checkbox-label">Publish on Vision & Mission page</span>
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
            <span>{coreValue ? "Save Changes" : "Create Principle"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
