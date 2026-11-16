"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, X, AlertCircle } from "lucide-react";
import {
  createAboutCredentialAction,
  updateAboutCredentialAction,
} from "@/lib/server/about-leadership-actions";

export interface SerializedAboutCredential {
  id: string;
  category: string;
  title: string;
  subtext: string;
  iconName: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CredentialFormDialogProps {
  isOpen: boolean;
  credential: SerializedAboutCredential | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CredentialFormDialog({
  isOpen,
  credential,
  onClose,
  onSuccess,
}: CredentialFormDialogProps) {
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
      <CredentialFormInner
        key={credential?.id || "new-credential"}
        credential={credential}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}

function CredentialFormInner({
  credential,
  onClose,
  onSuccess,
}: {
  credential: SerializedAboutCredential | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    category: credential?.category || "",
    title: credential?.title || "",
    subtext: credential?.subtext || "",
    iconName: credential?.iconName || "Award",
    displayOrder: credential?.displayOrder ?? 0,
    isPublished: credential?.isPublished ?? true,
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
    setServerError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    startTransition(async () => {
      let res;
      if (credential) {
        res = await updateAboutCredentialAction(null, {
          id: credential.id,
          ...formData,
        });
      } else {
        res = await createAboutCredentialAction(null, formData);
      }

      if (!res.success) {
        setServerError(res.error || "Failed to save credential");
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
      aria-labelledby="credential-dialog-title"
      className="topper-dialog-container"
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="topper-dialog-form">
        <div className="topper-dialog-header">
          <h2 id="credential-dialog-title" className="topper-dialog-title">
            {credential ? "Edit Institutional Credential" : "Add Institutional Credential"}
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
            <label htmlFor="cred-category" className="topper-label">
              Category / Eyebrow <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="cred-category"
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. CBSE Affiliation, Heritage & Legacy"
              className={`topper-input ${fieldErrors.category ? "topper-input--error" : ""}`}
              required
            />
            {fieldErrors.category && (
              <p className="topper-field-error">{fieldErrors.category}</p>
            )}
          </div>

          <div className="topper-field topper-field--full">
            <label htmlFor="cred-title" className="topper-label">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="cred-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Affiliation No. 2133848"
              className={`topper-input ${fieldErrors.title ? "topper-input--error" : ""}`}
              required
            />
            {fieldErrors.title && (
              <p className="topper-field-error">{fieldErrors.title}</p>
            )}
          </div>

          <div className="topper-field topper-field--full">
            <label htmlFor="cred-subtext" className="topper-label">
              Subtext / Detail <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cred-subtext"
              name="subtext"
              value={formData.subtext}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Affiliated up to Senior Secondary level (Class XII) in Science and Commerce."
              className={`topper-input ${fieldErrors.subtext ? "topper-input--error" : ""}`}
              required
            />
            {fieldErrors.subtext && (
              <p className="topper-field-error">{fieldErrors.subtext}</p>
            )}
          </div>

          <div className="topper-form-grid">
            <div className="topper-field">
              <label htmlFor="cred-iconName" className="topper-label">
                Icon Name (Lucide)
              </label>
              <input
                id="cred-iconName"
                type="text"
                name="iconName"
                value={formData.iconName}
                onChange={handleChange}
                placeholder="e.g. Award, ShieldCheck, Landmark"
                className={`topper-input ${fieldErrors.iconName ? "topper-input--error" : ""}`}
              />
              {fieldErrors.iconName && (
                <p className="topper-field-error">{fieldErrors.iconName}</p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="cred-displayOrder" className="topper-label">
                Display Order
              </label>
              <input
                id="cred-displayOrder"
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
                id="isPublishedCredential"
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
            <span>{credential ? "Save Changes" : "Create Credential"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
