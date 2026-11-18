"use client";

import { useEffect, useRef, useState, useId } from "react";
import { Upload, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";

export type AdminImageUploadVariant = "circular" | "landscape" | "signature";

export interface AdminImageUploadFieldProps {
  label: string;
  id?: string;
  currentImageUrl?: string | null;
  selectedFile: File | null;
  isRemoved?: boolean;
  onFileSelect: (file: File | null) => void;
  onRemove: () => void;
  disabled?: boolean;
  isPending?: boolean;
  variant?: AdminImageUploadVariant;
  helperText?: string;
  error?: string | string[];
  required?: boolean;

  // Optional Alt-text field embedded
  altText?: string;
  onAltChange?: (alt: string) => void;
  altLabel?: string;
  altPlaceholder?: string;
  altRequired?: boolean;
  altError?: string | string[];
}

export function AdminImageUploadField({
  label,
  id,
  currentImageUrl,
  selectedFile,
  isRemoved = false,
  onFileSelect,
  onRemove,
  disabled = false,
  isPending = false,
  variant = "landscape",
  helperText = "Supported formats: JPEG, PNG, WebP (max 2 MiB). Images are automatically processed and converted to optimized WebP.",
  error,
  required = false,
  altText,
  onAltChange,
  altLabel,
  altPlaceholder,
  altRequired = false,
  altError,
}: AdminImageUploadFieldProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (file) {
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setObjectUrl(url);
    } else {
      setObjectUrl(null);
    }

    onFileSelect(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setObjectUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove();
  };

  const previewUrl = selectedFile ? objectUrl : isRemoved ? null : (currentImageUrl || null);

  const typeName =
    variant === "signature"
      ? "Signature"
      : variant === "circular"
      ? "Photo"
      : "Image";

  const errorMessage = Array.isArray(error) ? error[0] : error;
  const altErrorMessage = Array.isArray(altError) ? altError[0] : altError;

  const previewBoxClass =
    variant === "circular"
      ? "admin-image-preview-box admin-image-preview-box--circular"
      : variant === "signature"
      ? "admin-image-preview-box admin-image-preview-box--signature"
      : "admin-image-preview-box admin-image-preview-box--landscape";

  return (
    <div className="admin-image-upload-wrapper topper-field">
      <label htmlFor={inputId} className="topper-label">
        {label}
        {required && <span style={{ color: "var(--red)", marginLeft: 3 }}>*</span>}
      </label>

      <div className="admin-image-upload-container">
        {/* Preview Frame */}
        <div className={previewBoxClass}>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={altText || `${label} preview`}
              className="admin-image-preview-img"
            />
          ) : (
            <div className="admin-image-preview-placeholder">
              <ImageIcon size={28} />
            </div>
          )}

          {isPending && selectedFile && (
            <div className="admin-image-preview-overlay">
              <Loader2 size={20} className="admin-image-spinner" />
            </div>
          )}
        </div>

        {/* Controls & Help */}
        <div className="admin-image-controls">
          <div className="admin-image-btn-group">
            <input
              ref={fileInputRef}
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="admin-image-hidden-input"
              disabled={disabled || isPending}
              onChange={handleInputChange}
            />

            <button
              type="button"
              disabled={disabled || isPending}
              onClick={() => fileInputRef.current?.click()}
              className="topper-button topper-button--secondary admin-image-btn-sm"
            >
              <Upload size={14} />
              <span>
                {previewUrl ? `Replace ${typeName}` : `Upload ${typeName}`}
              </span>
            </button>

            {previewUrl && (
              <button
                type="button"
                disabled={disabled || isPending}
                onClick={handleRemove}
                className="admin-image-remove-btn"
              >
                <Trash2 size={14} />
                <span>Remove {typeName}</span>
              </button>
            )}
          </div>

          <p className="admin-image-help-text">{helperText}</p>

          {selectedFile && (
            <p className="admin-image-status-text">
              Ready to upload: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
            </p>
          )}
        </div>
      </div>

      {errorMessage && (
        <p className="topper-field-error" role="alert">
          {errorMessage}
        </p>
      )}

      {/* Embedded Alt Text Input when requested */}
      {onAltChange && (
        <div className="admin-image-alt-field topper-field">
          <label htmlFor={`${inputId}-alt`} className="topper-label">
            {altLabel || `${typeName} Alt Text (Accessibility Description)`}
            {altRequired && <span style={{ color: "var(--red)", marginLeft: 3 }}>*</span>}
          </label>
          <input
            id={`${inputId}-alt`}
            type="text"
            className={`topper-input ${altErrorMessage ? "topper-input--error" : ""}`}
            value={altText || ""}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder={altPlaceholder || `Describe the ${typeName.toLowerCase()} for screen readers`}
            disabled={disabled || isPending}
          />
          {altErrorMessage && (
            <p className="topper-field-error" role="alert">
              {altErrorMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
