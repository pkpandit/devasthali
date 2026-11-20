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
import type { SerializedDisclosureSection } from "./DisclosureSectionDialog";
import type { SerializedDisclosureDocument } from "./DisclosureDocumentDialog";
import { DisclosureDocumentTable } from "./DisclosureDocumentTable";

export interface SerializedSectionWithDocs extends SerializedDisclosureSection {
  documents: SerializedDisclosureDocument[];
}

interface DisclosureSectionCardProps {
  section: SerializedSectionWithDocs;
  sectionIndex: number;
  totalSections: number;
  isPending: boolean;
  onEditSection: (sec: SerializedDisclosureSection) => void;
  onDeleteSection: (sec: SerializedDisclosureSection) => void;
  onToggleSectionStatus: (sec: SerializedDisclosureSection) => void;
  onMoveSection: (currentIndex: number, direction: "UP" | "DOWN") => void;
  onAddDocument: (sectionId: string) => void;
  onEditDocument: (doc: SerializedDisclosureDocument) => void;
  onDeleteDocument: (doc: SerializedDisclosureDocument) => void;
  onToggleDocumentStatus: (doc: SerializedDisclosureDocument) => void;
  onMoveDocument: (sectionId: string, currentIndex: number, direction: "UP" | "DOWN") => void;
}

export function DisclosureSectionCard({
  section,
  sectionIndex,
  totalSections,
  isPending,
  onEditSection,
  onDeleteSection,
  onToggleSectionStatus,
  onMoveSection,
  onAddDocument,
  onEditDocument,
  onDeleteDocument,
  onToggleDocumentStatus,
  onMoveDocument,
}: DisclosureSectionCardProps) {
  const isFirst = sectionIndex === 0;
  const isLast = sectionIndex === totalSections - 1;

  const handleDocMove = (currentIndex: number, direction: "UP" | "DOWN") => {
    onMoveDocument(section.id, currentIndex, direction);
  };

  return (
    <div
      className="category-card"
      style={{
        background: "#ffffff",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        padding: "20px",
        marginBottom: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Section Header */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div
            style={{
              padding: "8px",
              borderRadius: "10px",
              background: "#FEE2E2",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Folder size={20} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--foreground)",
                  margin: 0,
                }}
              >
                {section.title}
              </h3>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "10px",
                  background: section.isPublished ? "#DEF7EC" : "#F3F4F6",
                  color: section.isPublished ? "#03543F" : "#6B7280",
                }}
              >
                {section.isPublished ? "Published" : "Draft"}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  background: "#F3F4F6",
                  color: "var(--muted-foreground)",
                  fontWeight: 500,
                }}
              >
                {section.documents.length} document{section.documents.length === 1 ? "" : "s"}
              </span>
            </div>
            {section.description && (
              <p
                style={{
                  fontSize: "0.825rem",
                  color: "var(--muted-foreground)",
                  margin: "4px 0 0 0",
                }}
              >
                {section.description}
              </p>
            )}
          </div>
        </div>

        {/* Section Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Order arrows */}
          <button
            type="button"
            disabled={isFirst || isPending}
            onClick={() => onMoveSection(sectionIndex, "UP")}
            aria-label="Move section up"
            className="action-btn"
            style={{
              padding: "6px",
              background: "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              cursor: isFirst || isPending ? "not-allowed" : "pointer",
              opacity: isFirst ? 0.3 : 1,
              color: "var(--foreground)",
            }}
          >
            <ArrowUp size={16} />
          </button>
          <button
            type="button"
            disabled={isLast || isPending}
            onClick={() => onMoveSection(sectionIndex, "DOWN")}
            aria-label="Move section down"
            className="action-btn"
            style={{
              padding: "6px",
              background: "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              cursor: isLast || isPending ? "not-allowed" : "pointer",
              opacity: isLast ? 0.3 : 1,
              color: "var(--foreground)",
            }}
          >
            <ArrowDown size={16} />
          </button>

          {/* Status Toggle */}
          <button
            type="button"
            disabled={isPending}
            onClick={() => onToggleSectionStatus(section)}
            aria-label={section.isPublished ? "Unpublish section" : "Publish section"}
            className="action-btn"
            style={{
              padding: "6px",
              background: "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              cursor: isPending ? "not-allowed" : "pointer",
              color: "var(--foreground)",
            }}
          >
            {section.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>

          {/* Edit */}
          <button
            type="button"
            disabled={isPending}
            onClick={() => onEditSection(section)}
            aria-label={`Edit ${section.title}`}
            className="action-btn"
            style={{
              padding: "6px",
              background: "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              cursor: isPending ? "not-allowed" : "pointer",
              color: "var(--foreground)",
            }}
          >
            <Edit2 size={16} />
          </button>

          {/* Delete */}
          <button
            type="button"
            disabled={isPending}
            onClick={() => onDeleteSection(section)}
            aria-label={`Delete ${section.title}`}
            className="action-btn"
            style={{
              padding: "6px",
              background: "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              cursor: isPending ? "not-allowed" : "pointer",
              color: "var(--destructive)",
            }}
          >
            <Trash2 size={16} />
          </button>

          {/* Add Document to this Section */}
          <button
            type="button"
            disabled={isPending}
            onClick={() => onAddDocument(section.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "6px",
              border: "none",
              background: "var(--primary)",
              color: "#ffffff",
              fontSize: "0.825rem",
              fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
              marginLeft: "4px",
            }}
          >
            <Plus size={15} />
            <span>Add Document</span>
          </button>
        </div>
      </div>

      {/* Embedded Documents Table */}
      <DisclosureDocumentTable
        documents={section.documents}
        isPending={isPending}
        onEdit={onEditDocument}
        onDelete={onDeleteDocument}
        onToggleStatus={onToggleDocumentStatus}
        onMove={handleDocMove}
      />
    </div>
  );
}
