"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Images,
} from "lucide-react";
import {
  toggleGalleryAlbumStatus,
  deleteGalleryAlbum,
  reorderGalleryAlbums,
} from "@/lib/server/gallery-actions";
import { AlbumFormDialog, type SerializedGalleryAlbum } from "./AlbumFormDialog";
import { AlbumPhotoManagerDialog } from "./AlbumPhotoManagerDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { GALLERY_CATEGORIES } from "@/lib/validation/gallery";

interface GalleryWorkspaceProps {
  albums: SerializedGalleryAlbum[];
}

export function GalleryWorkspace({ albums }: GalleryWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<SerializedGalleryAlbum | null>(null);
  const [photoManagerAlbum, setPhotoManagerAlbum] = useState<SerializedGalleryAlbum | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SerializedGalleryAlbum | null>(null);

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filteredAlbums = useMemo(() => {
    if (selectedCategory === "ALL") return albums;
    return albums.filter((a) => a.category === selectedCategory);
  }, [albums, selectedCategory]);

  const handleCreate = () => {
    setEditingAlbum(null);
    setIsFormOpen(true);
  };

  const handleEdit = (album: SerializedGalleryAlbum) => {
    setEditingAlbum(album);
    setIsFormOpen(true);
  };

  const handleManagePhotos = (album: SerializedGalleryAlbum) => {
    setPhotoManagerAlbum(album);
  };

  const handleToggleStatus = (album: SerializedGalleryAlbum) => {
    startTransition(async () => {
      await toggleGalleryAlbumStatus({
        id: album.id,
        isPublished: !album.isPublished,
      });
      router.refresh();
    });
  };

  const handleMove = (currentIndex: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= albums.length) return;

    const reordered = [...albums];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((item) => item.id);

    startTransition(async () => {
      await reorderGalleryAlbums({ orderedIds });
      router.refresh();
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteGalleryAlbum({ id: deleteTarget.id });
    setDeleteTarget(null);
    router.refresh();
  };

  return (
    <div className="admin-workspace">
      {/* Workspace Toolbar Card */}
      <div className="admin-section-card">
        <div className="admin-card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 className="admin-workspace-toolbar__title">
                Campus Photo Gallery Albums
              </h2>
              <span className="admin-workspace-toolbar__count">
                ({albums.length} album{albums.length === 1 ? "" : "s"})
              </span>
            </div>
            <p className="admin-card-subtitle">
              Manage categorized photo albums, cover imagery, and individual album photo rosters.
            </p>
          </div>

          <div className="admin-card-actions">
            <button
              type="button"
              onClick={handleCreate}
              className="admin-btn admin-btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={16} />
              New Album
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            padding: "12px 16px",
            borderTop: "1px solid var(--color-border-subtle, #f3f4f6)",
            background: "var(--color-bg-subtle, #fafafa)",
          }}
        >
          <button
            type="button"
            className={`admin-btn admin-btn-sm ${selectedCategory === "ALL" ? "admin-btn-primary" : "admin-btn-secondary"}`}
            onClick={() => setSelectedCategory("ALL")}
          >
            All Categories ({albums.length})
          </button>
          {GALLERY_CATEGORIES.map((cat) => {
            const count = albums.filter((a) => a.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                className={`admin-btn admin-btn-sm ${selectedCategory === cat ? "admin-btn-primary" : "admin-btn-secondary"}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Albums Table */}
      <div className="admin-section-card" style={{ marginTop: "16px" }}>
        {filteredAlbums.length === 0 ? (
          <div
            style={{
              padding: "48px 16px",
              textAlign: "center",
              color: "var(--color-text-secondary, #6b7280)",
            }}
          >
            <Images size={36} style={{ color: "#9ca3af", margin: "0 auto 12px" }} />
            <p style={{ margin: 0, fontWeight: 500 }}>
              No albums found in this category.
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "48px" }}>Order</th>
                  <th style={{ width: "110px" }}>Cover</th>
                  <th>Album Title &amp; Details</th>
                  <th style={{ width: "120px" }}>Category</th>
                  <th style={{ width: "130px" }}>Photos</th>
                  <th style={{ width: "100px" }}>Status</th>
                  <th style={{ width: "170px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlbums.map((album, index) => (
                  <tr key={album.id}>
                    {/* Order Controls */}
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <button
                          type="button"
                          className="admin-icon-btn"
                          onClick={() => handleMove(index, "UP")}
                          disabled={index === 0 || isPending || selectedCategory !== "ALL"}
                          aria-label="Move up"
                          title={selectedCategory !== "ALL" ? "Switch to 'All Categories' to reorder" : "Move up"}
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn"
                          onClick={() => handleMove(index, "DOWN")}
                          disabled={index === filteredAlbums.length - 1 || isPending || selectedCategory !== "ALL"}
                          aria-label="Move down"
                          title={selectedCategory !== "ALL" ? "Switch to 'All Categories' to reorder" : "Move down"}
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </td>

                    {/* Cover Thumbnail */}
                    <td>
                      <div
                        style={{
                          position: "relative",
                          width: "90px",
                          height: "60px",
                          borderRadius: "4px",
                          overflow: "hidden",
                          background: "#e5e7eb",
                        }}
                      >
                        <Image
                          src={album.coverImageUrl}
                          alt={album.coverImageAlt || album.title}
                          fill
                          sizes="90px"
                          style={{ objectFit: "cover" }}
                          unoptimized
                        />
                      </div>
                    </td>

                    {/* Title & Description */}
                    <td>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary, #111827)" }}>
                        {album.title}
                      </div>
                      {album.description && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--color-text-secondary, #6b7280)",
                            marginTop: "2px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {album.description}
                        </div>
                      )}
                      <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
                        Alt: {album.coverImageAlt}
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 500,
                          background: "#f3f4f6",
                          color: "#374151",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        {album.category}
                      </span>
                    </td>

                    {/* Photos Count & Manage Button */}
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        onClick={() => handleManagePhotos(album)}
                        style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                        title="Manage album photos"
                      >
                        <Images size={13} />
                        <span>{album.images.length} Photo{album.images.length === 1 ? "" : "s"}</span>
                      </button>
                    </td>

                    {/* Status */}
                    <td>
                      <button
                        type="button"
                        className={`admin-badge ${album.isPublished ? "admin-badge--success" : "admin-badge--draft"}`}
                        onClick={() => handleToggleStatus(album)}
                        disabled={isPending}
                        style={{ cursor: "pointer", border: "none" }}
                        title="Click to toggle publish status"
                      >
                        {album.isPublished ? (
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
                          onClick={() => handleEdit(album)}
                          disabled={isPending}
                          title="Edit album"
                          aria-label="Edit album"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn admin-icon-btn--danger"
                          onClick={() => setDeleteTarget(album)}
                          disabled={isPending}
                          title="Delete album"
                          aria-label="Delete album"
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

      {/* Album Form Dialog */}
      {isFormOpen && (
        <AlbumFormDialog
          isOpen={isFormOpen}
          album={editingAlbum}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            router.refresh();
          }}
        />
      )}

      {/* Album Photo Manager Dialog */}
      {photoManagerAlbum && (
        <AlbumPhotoManagerDialog
          isOpen={Boolean(photoManagerAlbum)}
          album={photoManagerAlbum}
          onClose={() => setPhotoManagerAlbum(null)}
          onRefresh={() => {
            router.refresh();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <DeleteConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Delete Gallery Album"
          message={`Are you sure you want to permanently delete "${deleteTarget.title}" and all ${deleteTarget.images.length} photo(s) inside it? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
