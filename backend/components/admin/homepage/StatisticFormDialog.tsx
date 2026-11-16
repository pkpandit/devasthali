"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, Loader2, Save, AlertCircle } from "lucide-react";
import {
  createHomepageStatisticAction,
  updateHomepageStatisticAction,
} from "@/lib/server/homepage-actions";

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
  statistic: SerializedStatistic | null; // null for Create mode
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
  statistic: SerializedStatistic | null;
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
      let res;
      if (statistic) {
        res = await updateHomepageStatisticAction(null, {
          id: statistic.id,
          ...formData,
        });
      } else {
        res = await createHomepageStatisticAction(null, formData);
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
          <h2 id="stat-dialog-title" className="topper-dialog-title">
            {statistic ? "Edit Trust Statistic" : "Add Trust Statistic"}
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

          <div className="topper-form-grid">
            <div className="topper-field">
              <label htmlFor="stat-label" className="topper-label">
                Metric Label <span className="text-red-500">*</span>
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

          <div className="topper-field topper-field--full">
            <label htmlFor="stat-imageUrl" className="topper-label">
              Photographic Background Image URL
            </label>
            <input
              id="stat-imageUrl"
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="e.g. /images/about/campus-showcase.jpg"
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
                <span>{statistic ? "Update Statistic" : "Create Statistic"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
