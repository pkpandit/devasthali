"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import { X, Plus, ArrowUp, ArrowDown, Edit2, Trash2, Eye, EyeOff, Images } from "lucide-react";
import {
  toggleGalleryImageStatus,
  deleteGalleryImage,
  reorderGalleryImages,
} from "@/lib/server/gallery-actions";
import { PhotoUploadDialog, type SerializedGalleryImage } from "./PhotoUploadDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

export interface SerializedAlbumWithImages {
  id: string;
  title: string;
  category: string;
  images: SerializedGalleryImage[];
}

interface AlbumPhotoManagerDialogProps {
  isOpen: boolean;
  album: SerializedAlbumWithImages;
  onClose: () => void;
  onRefresh: () => void;
}

export function AlbumPhotoManagerDialog({
  isOpen,
  album,
  onClose,
  onRefresh,
}: AlbumPhotoManagerDialogProps) {
  const [isPending, startTransition] = useTransition();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<SerializedGalleryImage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SerializedGalleryImage | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isUploadOpen && !deleteTarget) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isUploadOpen, deleteTarget, onClose]);

  if (!isOpen) return null;

  const handleCreatePhoto = () => {
    setEditingPhoto(null);
    setIsUploadOpen(true);
  };

  const handleEditPhoto = (photo: SerializedGalleryImage) => {
    setEditingPhoto(photo);
    setIsUploadOpen(true);
  };

  const handleToggleStatus = (photo: SerializedGalleryImage) => {
    startTransition(async () => {
      await toggleGalleryImageStatus({
        id: photo.id,
        isPublished: !photo.isPublished,
      });
      onRefresh();
    });
  };

  const handleMove = (currentIndex: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= album.images.length) return;

    const reordered = [...album.images];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((item) => item.id);

    startTransition(async () => {
      await reorderGalleryImages({ orderedIds });
      onRefresh();
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteGalleryImage({ id: deleteTarget.id });
    setDeleteTarget(null);
    onRefresh();
  };

  return (
    <>
      <div className="topper-dialog-backdrop" onClick={onClose}>
        <div
          className="topper-dialog-container"
          style={{ maxWidth: "880px" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="album-photo-manager-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="topper-dialog-header">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Images size={20} style={{ color: "var(--color-primary-600, #b91c1c)" }} />
                <h2 id="album-photo-manager-title" className="topper-dialog-title">
                  {album.title}
                </h2>
              </div>
              <p className="topper-dialog-subtitle">
                Category: <strong>{album.category}</strong> • {album.images.length} photo{album.images.length === 1 ? "" : "s"} in album
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleCreatePhoto}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Plus size={16} />
                Add Photo
              </button>
              <button
                type="button"
                className="topper-dialog-close"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body: Photos Grid / List */}
          <div className="topper-dialog-body" style={{ maxHeight: "65vh", overflowY: "auto" }}>
            {album.images.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 16px",
                  background: "var(--color-bg-subtle, #f9fafb)",
                  borderRadius: "8px",
                  border: "1px dashed var(--color-border-subtle, #e5e7eb)",
                }}
              >
                <Images size={36} style={{ color: "#9ca3af", margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 4px", color: "#374151" }}>
                  No photos in this album yet
                </h3>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px" }}>
                  Click &quot;Add Photo&quot; to upload the first image for this album.
                </p>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={handleCreatePhoto}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Plus size={15} />
                  Add Photo Now
                </button>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: "48px" }}>Order</th>
                      <th style={{ width: "90px" }}>Preview</th>
                      <th>Caption &amp; Alt Text</th>
                      <th style={{ width: "100px" }}>Status</th>
                      <th style={{ width: "120px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {album.images.map((photo, index) => (
                      <tr key={photo.id}>
                        {/* Order controls */}
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <button
                              type="button"
                              className="admin-icon-btn"
                              onClick={() => handleMove(index, "UP")}
                              disabled={index === 0 || isPending}
                              aria-label="Move up"
                              title="Move up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              className="admin-icon-btn"
                              onClick={() => handleMove(index, "DOWN")}
                              disabled={index === album.images.length - 1 || isPending}
                              aria-label="Move down"
                              title="Move down"
                            >
                              <ArrowDown size={13} />
                            </button>
                          </div>
                        </td>

                        {/* Thumbnail */}
                        <td>
                          <div
                            style={{
                              position: "relative",
                              width: "72px",
                              height: "48px",
                              borderRadius: "4px",
                              overflow: "hidden",
                              background: "#e5e7eb",
                            }}
                          >
                            <Image
                              src={photo.imageUrl}
                              alt={photo.imageAlt || "Photo preview"}
                              fill
                              sizes="72px"
                              style={{ objectFit: "cover" }}
                              unoptimized
                            />
                          </div>
                        </td>

                        {/* Details */}
                        <td>
                          <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text-primary, #111827)" }}>
                            {photo.caption || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>No caption</span>}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--color-text-secondary, #6b7280)", marginTop: "2px" }}>
                            Alt: {photo.imageAlt}
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <button
                            type="button"
                            className={`admin-badge ${photo.isPublished ? "admin-badge--success" : "admin-badge--draft"}`}
                            onClick={() => handleToggleStatus(photo)}
                            disabled={isPending}
                            style={{ cursor: "pointer", border: "none" }}
                            title="Click to toggle publish status"
                          >
                            {photo.isPublished ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <Eye size={12} /> Published
                              </span>
                            ) : (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <EyeOff size={12} /> Draft
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="admin-icon-btn"
                              onClick={() => handleEditPhoto(photo)}
                              disabled={isPending}
                              title="Edit photo"
                              aria-label="Edit photo"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              className="admin-icon-btn admin-icon-btn--danger"
                              onClick={() => setDeleteTarget(photo)}
                              disabled={isPending}
                              title="Delete photo"
                              aria-label="Delete photo"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="topper-dialog-footer">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Upload/Edit Dialog */}
      {isUploadOpen && (
        <PhotoUploadDialog
          isOpen={isUploadOpen}
          albumId={album.id}
          photo={editingPhoto}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={() => {
            setIsUploadOpen(false);
            onRefresh();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <DeleteConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Delete Gallery Photo"
          message={`Are you sure you want to permanently delete this photo? This will unlink the image and cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
