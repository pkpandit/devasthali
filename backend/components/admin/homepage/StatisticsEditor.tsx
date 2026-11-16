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
} from "lucide-react";
import {
  toggleHomepageStatisticStatusAction,
  deleteHomepageStatisticAction,
  reorderHomepageStatisticsAction,
} from "@/lib/server/homepage-actions";
import {
  StatisticFormDialog,
  type SerializedStatistic,
} from "./StatisticFormDialog";
import { DeleteHomepageDialog } from "./DeleteHomepageDialog";

interface StatisticsEditorProps {
  statistics: SerializedStatistic[];
  onRefresh: () => void;
}

export function StatisticsEditor({ statistics, onRefresh }: StatisticsEditorProps) {
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<SerializedStatistic | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<SerializedStatistic | null>(null);

  const handleCreate = () => {
    setEditingStat(null);
    setIsFormOpen(true);
  };

  const handleEdit = (stat: SerializedStatistic) => {
    setEditingStat(stat);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (stat: SerializedStatistic) => {
    startTransition(async () => {
      await toggleHomepageStatisticStatusAction(null, {
        id: stat.id,
        isPublished: !stat.isPublished,
      });
      onRefresh();
    });
  };

  const handleMove = (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= statistics.length) return;

    const reordered = [...statistics];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const payload = reordered.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    startTransition(async () => {
      await reorderHomepageStatisticsAction(null, { statistics: payload });
      onRefresh();
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteHomepageStatisticAction(null, { id: deleteTarget.id });
    onRefresh();
  };

  return (
    <div className="admin-workspace">
      <div className="admin-section-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-workspace-toolbar__title">
              Key Statistics &amp; Trust Metrics
            </h2>
            <p className="admin-workspace-toolbar__count">
              Institutional milestones, student-teacher ratio, and heritage numbers ({statistics.length} total).
            </p>
          </div>

          <div className="admin-card-actions">
            <button
              type="button"
              onClick={handleCreate}
              className="admin-button admin-button--primary"
            >
              <Plus size={16} />
              <span>Add Statistic</span>
            </button>
          </div>
        </div>

        {statistics.length === 0 ? (
          <div className="admin-empty-state">
            <p>No statistics configured yet. Click &quot;Add Statistic&quot; to create one.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table" aria-label="Key Statistics Roster">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "48px", textAlign: "center" }}>#</th>
                  <th scope="col">Metric &amp; Value</th>
                  <th scope="col">Subtext &amp; Badge</th>
                  <th scope="col">Photo</th>
                  <th scope="col" style={{ textAlign: "center" }}>Status</th>
                  <th scope="col" style={{ textAlign: "center" }}>Reorder</th>
                  <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {statistics.map((stat, idx) => (
                  <tr
                    key={stat.id}
                    style={{ opacity: !stat.isPublished ? 0.6 : 1 }}
                  >
                    <td style={{ textAlign: "center", fontFamily: "monospace", color: "#9ca3af", fontSize: "0.75rem" }}>
                      {idx + 1}
                    </td>

                    <td>
                      <div style={{ fontFamily: "var(--heading-font)", fontWeight: 700, color: "#111827", fontSize: "1rem" }}>
                        {stat.numericValue} {stat.suffix && <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#6b7280" }}>{stat.suffix}</span>}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#4b5563", fontWeight: 500 }}>{stat.label}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: "0.75rem", color: "#4b5563" }}>{stat.subtext || "—"}</div>
                      {stat.badge && (
                        <span style={{ display: "inline-block", marginTop: "2px", padding: "1px 6px", borderRadius: "4px", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }}>
                          {stat.badge}
                        </span>
                      )}
                    </td>

                    <td>
                      {stat.imageUrl ? (
                        <div style={{ position: "relative", width: "48px", height: "48px", borderRadius: "8px", overflow: "hidden", background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                          <Image
                            src={stat.imageUrl}
                            alt={stat.label}
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
                        onClick={() => handleToggleStatus(stat)}
                        disabled={isPending}
                        aria-label={`Toggle status for ${stat.label}`}
                        className={`admin-pill ${stat.isPublished ? "admin-pill--published" : "admin-pill--draft"}`}
                        style={{ cursor: "pointer", border: "none", minHeight: "28px" }}
                      >
                        {stat.isPublished ? (
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
                          aria-label={`Move ${stat.label} up`}
                          className="admin-icon-button"
                          style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px" }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "DOWN")}
                          disabled={isPending || idx === statistics.length - 1}
                          aria-label={`Move ${stat.label} down`}
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
                          onClick={() => handleEdit(stat)}
                          aria-label={`Edit ${stat.label}`}
                          className="admin-icon-button"
                          style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px" }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(stat)}
                          aria-label={`Delete ${stat.label}`}
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
      <StatisticFormDialog
        isOpen={isFormOpen}
        statistic={editingStat}
        onClose={() => setIsFormOpen(false)}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteHomepageDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Statistic"
        itemDescription={deleteTarget ? `${deleteTarget.label} (${deleteTarget.numericValue})` : ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
