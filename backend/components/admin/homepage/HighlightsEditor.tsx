"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import {
  toggleHomepageHighlightStatusAction,
  deleteHomepageHighlightAction,
  reorderHomepageHighlightsAction,
} from "@/lib/server/homepage-actions";
import {
  HighlightFormDialog,
  type SerializedHighlight,
} from "./HighlightFormDialog";
import { DeleteHomepageDialog } from "./DeleteHomepageDialog";

interface HighlightsEditorProps {
  highlights: SerializedHighlight[];
  onRefresh: () => void;
}

export function HighlightsEditor({ highlights, onRefresh }: HighlightsEditorProps) {
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<SerializedHighlight | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<SerializedHighlight | null>(null);

  const handleCreate = () => {
    setEditingHighlight(null);
    setIsFormOpen(true);
  };

  const handleEdit = (hl: SerializedHighlight) => {
    setEditingHighlight(hl);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (hl: SerializedHighlight) => {
    startTransition(async () => {
      await toggleHomepageHighlightStatusAction(null, {
        id: hl.id,
        isPublished: !hl.isPublished,
      });
      onRefresh();
    });
  };

  const handleMove = (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= highlights.length) return;

    const reordered = [...highlights];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const payload = reordered.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    startTransition(async () => {
      await reorderHomepageHighlightsAction(null, { highlights: payload });
      onRefresh();
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteHomepageHighlightAction(null, { id: deleteTarget.id });
    onRefresh();
  };

  return (
    <div className="admin-workspace">
      <div className="admin-section-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-workspace-toolbar__title">
              Promotional Highlights &amp; Quick Actions
            </h2>
            <p className="admin-workspace-toolbar__count">
              Key cards for prospectus download, fees, bus routes, toppers, notices, and CBSE disclosure ({highlights.length} total).
            </p>
          </div>

          <div className="admin-card-actions">
            <button
              type="button"
              onClick={handleCreate}
              className="admin-button admin-button--primary"
            >
              <Plus size={16} />
              <span>Add Highlight</span>
            </button>
          </div>
        </div>

        {highlights.length === 0 ? (
          <div className="admin-empty-state">
            <p>No promotional highlights configured yet. Click &quot;Add Highlight&quot; to create one.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table" aria-label="Promotional Highlights Roster">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "48px", textAlign: "center" }}>#</th>
                  <th scope="col">Title &amp; Description</th>
                  <th scope="col">CTA &amp; Target</th>
                  <th scope="col">Photo</th>
                  <th scope="col" style={{ textAlign: "center" }}>Status</th>
                  <th scope="col" style={{ textAlign: "center" }}>Reorder</th>
                  <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {highlights.map((hl, idx) => (
                  <tr
                    key={hl.id}
                    style={{ opacity: !hl.isPublished ? 0.6 : 1 }}
                  >
                    <td style={{ textAlign: "center", fontFamily: "monospace", color: "#9ca3af", fontSize: "0.75rem" }}>
                      {idx + 1}
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "var(--heading-font)", fontWeight: 700, color: "#111827", fontSize: "0.875rem" }}>{hl.title}</span>
                        {hl.badge && (
                          <span style={{ padding: "1px 6px", borderRadius: "4px", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }}>
                            {hl.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "2px" }}>{hl.description}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: "0.75rem", fontFamily: "var(--heading-font)", fontWeight: 700, color: "#b91c1c" }}>
                        {hl.ctaLabel}
                      </div>
                      <div style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <span>{hl.ctaHref}</span>
                        <ExternalLink size={12} style={{ color: "#9ca3af" }} />
                      </div>
                    </td>

                    <td>
                      {hl.imageUrl ? (
                        <div style={{ position: "relative", width: "48px", height: "48px", borderRadius: "8px", overflow: "hidden", background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                          <Image
                            src={hl.imageUrl}
                            alt={hl.title}
                            fill
                            sizes="48px"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontStyle: "italic" }}>No image</span>
                      )}
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(hl)}
                        disabled={isPending}
                        aria-label={`Toggle status for ${hl.title}`}
                        className={`admin-pill ${hl.isPublished ? "admin-pill--published" : "admin-pill--draft"}`}
                        style={{ cursor: "pointer", border: "none", minHeight: "28px" }}
                      >
                        {hl.isPublished ? (
                          <>
                            <Eye size={12} style={{ marginRight: "4px" }} />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} style={{ marginRight: "4px" }} />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "UP")}
                          disabled={isPending || idx === 0}
                          aria-label={`Move ${hl.title} up`}
                          className="admin-icon-button"
                          style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px" }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "DOWN")}
                          disabled={isPending || idx === highlights.length - 1}
                          aria-label={`Move ${hl.title} down`}
                          className="admin-icon-button"
                          style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px" }}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => handleEdit(hl)}
                          aria-label={`Edit ${hl.title}`}
                          className="admin-icon-button"
                          style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px" }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(hl)}
                          aria-label={`Delete ${hl.title}`}
                          className="admin-icon-button"
                          style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px", color: "#dc2626" }}
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

      {/* Form Dialog */}
      <HighlightFormDialog
        isOpen={isFormOpen}
        highlight={editingHighlight}
        onClose={() => setIsFormOpen(false)}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteHomepageDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Highlight"
        itemDescription={deleteTarget ? deleteTarget.title : ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
