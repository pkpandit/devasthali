"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import {
  createGalleryAlbum,
  updateGalleryAlbum,
} from "@/lib/server/gallery-actions";
import { AdminImageUploadField } from "@/components/admin/ui/AdminImageUploadField";
import { GALLERY_CATEGORIES, type GalleryCategory } from "@/lib/validation/gallery";
import type { SerializedGalleryImage } from "./PhotoUploadDialog";

export interface SerializedGalleryAlbum {
  id: string;
  title: string;
  description: string | null;
  category: string;
  coverImageUrl: string;
  coverImageStorageKey: string | null;
  coverImageAlt: string;
  displayOrder: number;
  isPublished: boolean;
  images: SerializedGalleryImage[];
  createdAt: string;
  updatedAt: string;
}

interface AlbumFormDialogProps {
  isOpen: boolean;
  album: SerializedGalleryAlbum | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AlbumFormDialog({
  isOpen,
  album,
  onClose,
  onSuccess,
}: AlbumFormDialogProps) {
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
      <AlbumFormInner
        key={album?.id || "new-album"}
        album={album}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}

function AlbumFormInner({
  album,
  onClose,
  onSuccess,
}: {
  album: SerializedGalleryAlbum | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: album?.title || "",
    description: album?.description || "",
    category: (album?.category as GalleryCategory) || "Campus",
    coverImageUrl: album?.coverImageUrl || "",
    coverImageAlt: album?.coverImageAlt || "",
    displayOrder: album?.displayOrder || 0,
    isPublished: album ? album.isPublished : true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    startTransition(async () => {
      const payload = new FormData();
      if (album) {
        payload.append("id", album.id);
      }
      payload.append("title", formData.title.trim());
      if (formData.description.trim()) {
        payload.append("description", formData.description.trim());
      }
      payload.append("category", formData.category);
      payload.append("coverImageAlt", formData.coverImageAlt.trim());
      payload.append("displayOrder", String(formData.displayOrder));
      payload.append("isPublished", String(formData.isPublished));

      if (selectedFile) {
        payload.append("coverImageFile", selectedFile);
      } else if (formData.coverImageUrl) {
        payload.append("coverImageUrl", formData.coverImageUrl);
      }

      let result;
      if (album) {
        result = await updateGalleryAlbum(payload);
      } else {
        result = await createGalleryAlbum(payload);
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
      style={{ maxWidth: "680px" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="album-dialog-title"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="topper-dialog-header">
        <div>
          <h2 id="album-dialog-title" className="topper-dialog-title">
            {album ? "Edit Gallery Album" : "Create New Gallery Album"}
          </h2>
          <p className="topper-dialog-subtitle">
            {album
              ? "Update album title, category, description, or cover image."
              : "Create a categorized album. Photos can be added once created."}
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

          {/* Title */}
          <div className="admin-form-group" style={{ marginBottom: "16px" }}>
            <label className="admin-form-label" htmlFor="album-title">
              Album Title <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              ref={titleInputRef}
              id="album-title"
              type="text"
              className="admin-form-input"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Campus Grounds & Academic Infrastructure"
              maxLength={150}
              required
              disabled={isPending}
            />
            {errors.title && <span className="admin-form-field-error">{errors.title}</span>}
          </div>

          {/* Row: Category & Display Order */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="album-category">
                Category <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                id="album-category"
                className="admin-form-select"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as GalleryCategory }))}
                disabled={isPending}
              >
                {GALLERY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <span className="admin-form-field-error">{errors.category}</span>}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="album-order">
                Display Order
              </label>
              <input
                id="album-order"
                type="number"
                min="0"
                className="admin-form-input"
                value={formData.displayOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Description */}
          <div className="admin-form-group" style={{ marginBottom: "16px" }}>
            <label className="admin-form-label" htmlFor="album-desc">
              Description (Optional)
            </label>
            <textarea
              id="album-desc"
              rows={3}
              className="admin-form-textarea"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief summary of photos in this album..."
              maxLength={1000}
              disabled={isPending}
            />
            {errors.description && <span className="admin-form-field-error">{errors.description}</span>}
          </div>

          {/* Cover Image Upload Field */}
          <div style={{ marginBottom: "20px" }}>
            <AdminImageUploadField
              label="Album Cover Image"
              currentImageUrl={formData.coverImageUrl}
              selectedFile={selectedFile}
              onFileSelect={(file) => {
                setSelectedFile(file);
                if (file && errors.coverImageFile) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.coverImageFile;
                    delete next.coverImageUrl;
                    return next;
                  });
                }
              }}
              onRemove={() => {
                setSelectedFile(null);
                setFormData((prev) => ({ ...prev, coverImageUrl: "" }));
              }}
              disabled={isPending}
              isPending={isPending}
              variant="landscape"
              required={!album && !selectedFile}
              error={errors.coverImageFile || errors.coverImageUrl}
              altText={formData.coverImageAlt}
              onAltChange={(alt) => {
                setFormData((prev) => ({ ...prev, coverImageAlt: alt }));
                if (errors.coverImageAlt) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.coverImageAlt;
                    return next;
                  });
                }
              }}
              altLabel="Cover Image Alt Text (Required)"
              altPlaceholder="e.g. High-angle view of Devasthaly Vidyapeeth academic campus"
              altRequired={true}
              altError={errors.coverImageAlt}
              helperText="Upload a high-resolution cover image for the album card. Supported: JPG, PNG, WebP (max 2 MiB)."
            />
          </div>

          {/* Published Toggle */}
          <div className="admin-form-group" style={{ marginBottom: "16px" }}>
            <label className="admin-form-label" htmlFor="album-published">
              Publication Status
            </label>
            <select
              id="album-published"
              className="admin-form-select"
              value={formData.isPublished ? "true" : "false"}
              onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.value === "true" }))}
              disabled={isPending}
            >
              <option value="true">Published (Visible on public gallery)</option>
              <option value="false">Draft (Hidden)</option>
            </select>
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
                Saving Album...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                {album ? "Update Album" : "Create Album"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
