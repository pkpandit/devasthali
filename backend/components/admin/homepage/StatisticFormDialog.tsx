"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import {
  createHomepageStatisticAction,
  updateHomepageStatisticAction,
} from "@/lib/server/homepage-actions";
import { AdminImageUploadField } from "@/components/admin/ui/AdminImageUploadField";

export interface SerializedStatistic {
  id: string;
  label: string;
  numericValue: string;
  suffix: string | null;
  subtext: string | null;
  badge: string | null;
  iconName: string | null;
  imageUrl: string | null;
  imageStorageKey: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StatisticFormDialogProps {
  isOpen: boolean;
  statistic?: SerializedStatistic | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function StatisticFormDialog({
  isOpen,
  statistic,
  onClose,
  onSuccess,
}: StatisticFormDialogProps) {
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
      <StatisticFormInner
        key={statistic?.id || "new-stat"}
        statistic={statistic}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}

function StatisticFormInner({
  statistic,
  onClose,
  onSuccess,
}: {
  statistic?: SerializedStatistic | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const labelInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    label: statistic?.label || "",
    numericValue: statistic?.numericValue || "",
    suffix: statistic?.suffix || "",
    subtext: statistic?.subtext || "",
    badge: statistic?.badge || "",
    iconName: statistic?.iconName || "",
    imageUrl: statistic?.imageUrl || "",
    isPublished: statistic ? statistic.isPublished : true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    labelInputRef.current?.focus();
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
      if (statistic) {
        payload.append("id", statistic.id);
      }
      payload.append("label", formData.label.trim());
      payload.append("numericValue", formData.numericValue.trim());
      if (formData.suffix.trim()) payload.append("suffix", formData.suffix.trim());
      if (formData.subtext.trim()) payload.append("subtext", formData.subtext.trim());
      if (formData.badge.trim()) payload.append("badge", formData.badge.trim());
      if (formData.iconName.trim()) payload.append("iconName", formData.iconName.trim());
      payload.append("isPublished", String(formData.isPublished));

      if (selectedFile) {
        payload.append("imageFile", selectedFile);
      } else if (isImageRemoved) {
        payload.append("removeImage", "true");
      } else if (formData.imageUrl) {
        payload.append("imageUrl", formData.imageUrl);
      }

      let res;
      if (statistic) {
        res = await updateHomepageStatisticAction(null, payload);
      } else {
        res = await createHomepageStatisticAction(null, payload);
      }

      if (!res.success) {
        setServerError(res.error || "Failed to save statistic");
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
      aria-labelledby="stat-dialog-title"
      className="topper-dialog-container"
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="topper-dialog-form">
        <div className="topper-dialog-header">
          <div>
            <h2 id="stat-dialog-title" className="topper-dialog-title">
              {statistic ? "Edit Key Metric Card" : "Add Key Metric Card"}
            </h2>
            <p className="admin-field-note" style={{ margin: "2px 0 0" }}>
              {statistic
                ? "Update numbers, labels, units, and background visuals."
                : "Create a prominent data statistic for the homepage showcase strip."}
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

          <div className="topper-form-grid">
            <div className="topper-field">
              <label htmlFor="stat-label" className="topper-label">
                Metric Label / Description <span className="text-red-500">*</span>
              </label>
              <input
                ref={labelInputRef}
                id="stat-label"
                type="text"
                name="label"
                required
                value={formData.label}
                onChange={handleChange}
                placeholder="e.g. Years of Heritage"
                maxLength={120}
                className={`topper-input ${fieldErrors.label ? "topper-input--error" : ""}`}
              />
              {fieldErrors.label && (
                <p className="topper-field-error">{fieldErrors.label}</p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="stat-numericValue" className="topper-label">
                Numeric / Metric Value <span className="text-red-500">*</span>
              </label>
              <input
                id="stat-numericValue"
                type="text"
                name="numericValue"
                required
                value={formData.numericValue}
                onChange={handleChange}
                placeholder="e.g. 36+ or 100% or 1 : 25"
                maxLength={40}
                className={`topper-input ${fieldErrors.numericValue ? "topper-input--error" : ""}`}
              />
              {fieldErrors.numericValue && (
                <p className="topper-field-error">{fieldErrors.numericValue}</p>
              )}
            </div>
          </div>

          <div className="topper-form-grid">
            <div className="topper-field">
              <label htmlFor="stat-subtext" className="topper-label">
                Supporting Subtext
              </label>
              <input
                id="stat-subtext"
                type="text"
                name="subtext"
                value={formData.subtext}
                onChange={handleChange}
                placeholder="e.g. Established in 1988"
                maxLength={120}
                className={`topper-input ${fieldErrors.subtext ? "topper-input--error" : ""}`}
              />
              {fieldErrors.subtext && (
                <p className="topper-field-error">{fieldErrors.subtext}</p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="stat-badge" className="topper-label">
                Category Pill Badge
              </label>
              <input
                id="stat-badge"
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                placeholder="e.g. Legacy, Excellence"
                maxLength={40}
                className={`topper-input ${fieldErrors.badge ? "topper-input--error" : ""}`}
              />
              {fieldErrors.badge && (
                <p className="topper-field-error">{fieldErrors.badge}</p>
              )}
            </div>
          </div>

          <div className="topper-form-grid">
            <div className="topper-field">
              <label htmlFor="stat-iconName" className="topper-label">
                Lucide Icon Name
              </label>
              <input
                id="stat-iconName"
                type="text"
                name="iconName"
                value={formData.iconName}
                onChange={handleChange}
                placeholder="e.g. Award, Trophy, Building, Bus"
                maxLength={60}
                className={`topper-input ${fieldErrors.iconName ? "topper-input--error" : ""}`}
              />
              {fieldErrors.iconName && (
                <p className="topper-field-error">{fieldErrors.iconName}</p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="stat-suffix" className="topper-label">
                Optional Unit Suffix
              </label>
              <input
                id="stat-suffix"
                type="text"
                name="suffix"
                value={formData.suffix}
                onChange={handleChange}
                placeholder="e.g. Years, %, Stops"
                maxLength={20}
                className={`topper-input ${fieldErrors.suffix ? "topper-input--error" : ""}`}
              />
              {fieldErrors.suffix && (
                <p className="topper-field-error">{fieldErrors.suffix}</p>
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
                <span>{statistic ? "Update Statistic" : "Create Statistic"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
