"use client";

import {
  Folder,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react";
import type { SerializedDownloadCategory } from "./DownloadCategoryDialog";
import type { SerializedDownloadDocument } from "./DownloadDocumentDialog";
import { DownloadDocumentTable } from "./DownloadDocumentTable";

export interface SerializedCategoryWithDocs extends SerializedDownloadCategory {
  documents: SerializedDownloadDocument[];
}

interface DownloadCategoryCardProps {
  category: SerializedCategoryWithDocs;
  categoryIndex: number;
  totalCategories: number;
  isPending: boolean;
  onEditCategory: (cat: SerializedDownloadCategory) => void;
  onDeleteCategory: (cat: SerializedDownloadCategory) => void;
  onToggleCategoryStatus: (cat: SerializedDownloadCategory) => void;
  onMoveCategory: (currentIndex: number, direction: "UP" | "DOWN") => void;
  onAddDocument: (categoryId: string) => void;
  onEditDocument: (doc: SerializedDownloadDocument) => void;
  onDeleteDocument: (doc: SerializedDownloadDocument) => void;
  onToggleDocumentStatus: (doc: SerializedDownloadDocument) => void;
  onMoveDocument: (categoryId: string, currentIndex: number, direction: "UP" | "DOWN") => void;
}

export function DownloadCategoryCard({
  category,
  categoryIndex,
  totalCategories,
  isPending,
  onEditCategory,
  onDeleteCategory,
  onToggleCategoryStatus,
  onMoveCategory,
  onAddDocument,
  onEditDocument,
  onDeleteDocument,
  onToggleDocumentStatus,
  onMoveDocument,
}: DownloadCategoryCardProps) {
  const isFirst = categoryIndex === 0;
  const isLast = categoryIndex === totalCategories - 1;

  const handleDocMove = (currentIndex: number, direction: "UP" | "DOWN") => {
    onMoveDocument(category.id, currentIndex, direction);
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        padding: "20px",
        marginBottom: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Category Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          paddingBottom: "14px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "#fee2e2",
              color: "var(--red)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Folder size={18} aria-hidden="true" />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#111827" }}>
                {category.title}
              </h3>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  background: category.isPublished ? "#ecfdf5" : "#f3f4f6",
                  color: category.isPublished ? "#065f46" : "#6b7280",
                  border: `1px solid ${category.isPublished ? "#a7f3d0" : "#d1d5db"}`,
                }}
              >
                {category.isPublished ? "Published" : "Draft"}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  background: "#f3f4f6",
                  padding: "2px 8px",
                  borderRadius: "6px",
                }}
              >
                {category.documents.length} {category.documents.length === 1 ? "document" : "documents"}
              </span>
            </div>
            {category.description && (
              <p style={{ margin: "4px 0 0 0", fontSize: "0.8125rem", color: "#6b7280" }}>
                {category.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions for Category */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => onMoveCategory(categoryIndex, "UP")}
            disabled={isPending || isFirst}
            className="admin-icon-button"
            title="Move Category Up"
            aria-label={`Move category ${category.title} up`}
          >
            <ArrowUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => onMoveCategory(categoryIndex, "DOWN")}
            disabled={isPending || isLast}
            className="admin-icon-button"
            title="Move Category Down"
            aria-label={`Move category ${category.title} down`}
          >
            <ArrowDown size={16} />
          </button>

          <button
            type="button"
            onClick={() => onToggleCategoryStatus(category)}
            disabled={isPending}
            className="admin-icon-button"
            title={`Click to ${category.isPublished ? "unpublish" : "publish"} category`}
            aria-label={`Toggle status for category ${category.title}`}
          >
            {category.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>

          <button
            type="button"
            onClick={() => onEditCategory(category)}
            disabled={isPending}
            className="admin-icon-button"
            title="Edit Category"
            aria-label={`Edit category ${category.title}`}
          >
            <Edit2 size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDeleteCategory(category)}
            disabled={isPending}
            className="admin-icon-button"
            style={{ color: "#dc2626" }}
            title="Delete Category"
            aria-label={`Delete category ${category.title}`}
          >
            <Trash2 size={16} />
          </button>

          <button
            type="button"
            onClick={() => onAddDocument(category.id)}
            disabled={isPending}
            className="admin-button admin-button--primary"
            style={{ minHeight: "36px", padding: "6px 14px", fontSize: "0.8125rem", marginLeft: "4px" }}
          >
            <Plus size={14} aria-hidden="true" />
            <span>Add Document</span>
          </button>
        </div>
      </div>

      {/* Documents Table for this Category */}
      <DownloadDocumentTable
        documents={category.documents}
        isPending={isPending}
        onEdit={onEditDocument}
        onDelete={onDeleteDocument}
        onToggleStatus={onToggleDocumentStatus}
        onMove={handleDocMove}
      />
    </div>
  );
}
