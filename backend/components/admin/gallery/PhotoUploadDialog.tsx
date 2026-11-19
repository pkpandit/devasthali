"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import {
  createGalleryImage,
  updateGalleryImage,
} from "@/lib/server/gallery-actions";
import { AdminImageUploadField } from "@/components/admin/ui/AdminImageUploadField";

export interface SerializedGalleryImage {
  id: string;
  albumId: string;
  imageUrl: string;
  imageStorageKey: string | null;
  imageAlt: string;
  caption: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PhotoUploadDialogProps {
  isOpen: boolean;
  albumId: string;
  photo: SerializedGalleryImage | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PhotoUploadDialog({
  isOpen,
  albumId,
  photo,
  onClose,
  onSuccess,
}: PhotoUploadDialogProps) {
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
      <PhotoUploadInner
        key={photo?.id || "new-photo"}
        albumId={albumId}
        photo={photo}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}

function PhotoUploadInner({
  albumId,
  photo,
  onClose,
  onSuccess,
}: {
  albumId: string;
  photo: SerializedGalleryImage | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    caption: photo?.caption || "",
    imageAlt: photo?.imageAlt || "",
    imageUrl: photo?.imageUrl || "",
    displayOrder: photo?.displayOrder || 0,
    isPublished: photo ? photo.isPublished : true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const captionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    captionRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    startTransition(async () => {
      const payload = new FormData();
      if (photo) {
        payload.append("id", photo.id);
      }
      payload.append("albumId", albumId);
      if (formData.caption.trim()) {
        payload.append("caption", formData.caption.trim());
      }
      payload.append("imageAlt", formData.imageAlt.trim());
      payload.append("displayOrder", String(formData.displayOrder));
      payload.append("isPublished", String(formData.isPublished));

      if (selectedFile) {
        payload.append("imageFile", selectedFile);
      } else if (formData.imageUrl) {
        payload.append("imageUrl", formData.imageUrl);
      }

      let result;
      if (photo) {
        result = await updateGalleryImage(payload);
      } else {
        result = await createGalleryImage(payload);
      }

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        if (result.error) {
          setGeneralError(result.error);
        }
      }
    });
  };

  return (
    <div
      className="topper-dialog-container"
      style={{ maxWidth: "620px" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-dialog-title"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="topper-dialog-header">
        <div>
          <h2 id="photo-dialog-title" className="topper-dialog-title">
            {photo ? "Edit Gallery Photo" : "Upload New Gallery Photo"}
          </h2>
          <p className="topper-dialog-subtitle">
            {photo
              ? "Update photo caption, descriptive alt text, or replace image."
              : "Upload an image with descriptive alt text for this album."}
          </p>
        </div>
        <button
          type="button"
          className="topper-dialog-close"
          onClick={onClose}
          aria-label="Close dialog"
          disabled={isPending}
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="topper-dialog-body">
          {generalError && (
            <div
              className="admin-form-error"
              style={{
                marginBottom: "16px",
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                color: "#991b1b",
                fontSize: "13px",
              }}
            >
              {generalError}
            </div>
          )}

          {/* Image Upload Field */}
          <div style={{ marginBottom: "20px" }}>
            <AdminImageUploadField
              label="Photo Image"
              currentImageUrl={formData.imageUrl}
              selectedFile={selectedFile}
              onFileSelect={(file) => {
                setSelectedFile(file);
                if (file && errors.imageFile) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.imageFile;
                    delete next.imageUrl;
                    return next;
                  });
                }
              }}
              onRemove={() => {
                setSelectedFile(null);
                setFormData((prev) => ({ ...prev, imageUrl: "" }));
              }}
              disabled={isPending}
              isPending={isPending}
              variant="landscape"
              required={!photo && !selectedFile}
              error={errors.imageFile || errors.imageUrl}
              altText={formData.imageAlt}
              onAltChange={(alt) => {
                setFormData((prev) => ({ ...prev, imageAlt: alt }));
                if (errors.imageAlt) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.imageAlt;
                    return next;
                  });
                }
              }}
              altLabel="Image Alt Text (Accessibility & SEO)"
              altPlaceholder="e.g. Students working on science experiment in chemistry lab"
              altRequired={Boolean(selectedFile || formData.imageUrl)}
              altError={errors.imageAlt}
              helperText="Upload a crisp landscape photo. Supported: JPG, PNG, WebP (max 2 MiB)."
            />
          </div>

          {/* Caption */}
          <div className="admin-form-group" style={{ marginBottom: "16px" }}>
            <label className="admin-form-label" htmlFor="photo-caption">
              Caption (Optional)
            </label>
            <input
              ref={captionRef}
              id="photo-caption"
              type="text"
              className="admin-form-input"
              value={formData.caption}
              onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
              placeholder="e.g. Annual Sports Meet 100m sprint finals"
              maxLength={255}
              disabled={isPending}
            />
            {errors.caption && <span className="admin-form-field-error">{errors.caption}</span>}
          </div>

          {/* Row: Display Order & Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="photo-order">
                Display Order
              </label>
              <input
                id="photo-order"
                type="number"
                min="0"
                className="admin-form-input"
                value={formData.displayOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))}
                disabled={isPending}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="photo-published">
                Publication Status
              </label>
              <select
                id="photo-published"
                className="admin-form-select"
                value={formData.isPublished ? "true" : "false"}
                onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.value === "true" }))}
                disabled={isPending}
              >
                <option value="true">Published</option>
                <option value="false">Draft (Hidden)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="topper-dialog-footer">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={isPending}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving Photo...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                {photo ? "Update Photo" : "Upload Photo"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
