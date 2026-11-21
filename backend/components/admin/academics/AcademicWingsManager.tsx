"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Loader2,
  GraduationCap,
} from "lucide-react";
import {
  createAcademicWingAction,
  updateAcademicWingAction,
  deleteAcademicWingAction,
  reorderAcademicWingsAction,
  toggleAcademicWingStatusAction,
} from "@/lib/server/academic-actions";

export interface SerializedAcademicWing {
  id: string;
  slug: string;
  stageBadge: string;
  title: string;
  description: string;
  highlights: string[];
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicWingsManagerProps {
  wings: SerializedAcademicWing[];
}

export function AcademicWingsManager({ wings }: AcademicWingsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWing, setEditingWing] = useState<SerializedAcademicWing | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [stageBadge, setStageBadge] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [highlightsText, setHighlightsText] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const openCreateDialog = () => {
    setEditingWing(null);
    setStageBadge("");
    setTitle("");
    setDescription("");
    setHighlightsText("");
    setDisplayOrder(wings.length);
    setIsPublished(true);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (wing: SerializedAcademicWing) => {
    setEditingWing(wing);
    setStageBadge(wing.stageBadge);
    setTitle(wing.title);
    setDescription(wing.description);
    setHighlightsText(wing.highlights.join("\n"));
    setDisplayOrder(wing.displayOrder);
    setIsPublished(wing.isPublished);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingWing(null);
    setFormErrors({});
  };

  const handleSave = () => {
    setFeedback(null);
    setFormErrors({});

    startTransition(async () => {
      const payload = {
        stageBadge,
        title,
        description,
        highlights: highlightsText,
        displayOrder,
        isPublished,
      };

      let result;
      if (editingWing) {
        result = await updateAcademicWingAction({ id: editingWing.id, ...payload });
      } else {
        result = await createAcademicWingAction(payload);
      }

      if (result.success) {
        setFeedback({
          type: "success",
          message: editingWing ? "Academic wing updated successfully." : "Academic wing created successfully.",
        });
        closeDialog();
        router.refresh();
      } else {
        setFeedback({ type: "error", message: result.error || "Failed to save wing." });
        if (result.fieldErrors) setFormErrors(result.fieldErrors);
      }
    });
  };

  const handleDelete = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await deleteAcademicWingAction({ id });
      if (res.success) {
        setFeedback({ type: "success", message: "Academic wing deleted." });
        setDeleteConfirmId(null);
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to delete wing." });
      }
    });
  };

  const handleToggle = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await toggleAcademicWingStatusAction({ id });
      if (res.success) {
        setFeedback({
          type: "success",
          message: `Wing publication ${res.data?.isPublished ? "enabled" : "disabled"}.`,
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to toggle status." });
      }
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === wings.length - 1)
    ) {
      return;
    }
    const newItems = [...wings];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const orderedIds = newItems.map((item) => item.id);
    startTransition(async () => {
      const res = await reorderAcademicWingsAction({ orderedIds });
      if (res.success) {
        setFeedback({ type: "success", message: "Wings reordered successfully." });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to reorder wings." });
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          borderBottom: "1px solid #E5E7EB",
          paddingBottom: "14px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>
            Academic Wings &amp; Stages
          </h2>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0 0" }}>
            Configure school pedagogical wings (Foundational, Preparatory/Middle, Senior Secondary) aligned with NEP 2020.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateDialog}
          disabled={isPending}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#B91C1C",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus style={{ width: "16px", height: "16px" }} />
          <span>Add Academic Wing</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500,
            background: feedback.type === "success" ? "#ECFDF5" : "#FEF2F2",
            color: feedback.type === "success" ? "#065F46" : "#991B1B",
            border: `1px solid ${feedback.type === "success" ? "#A7F3D0" : "#FECACA"}`,
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Wings Table */}
      {wings.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "#F9FAFB",
            border: "1px dashed #D1D5DB",
            borderRadius: "8px",
            color: "#6B7280",
          }}
        >
          <GraduationCap style={{ width: "36px", height: "36px", margin: "0 auto 12px", color: "#9CA3AF" }} />
          <p style={{ fontWeight: 600, fontSize: "14px", color: "#374151", margin: 0 }}>No academic wings created</p>
          <p style={{ fontSize: "13px", margin: "4px 0 0 0" }}>Click &quot;Add Academic Wing&quot; to configure a new stage.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid #E5E7EB", borderRadius: "8px", background: "#FFFFFF" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", color: "#4B5563" }}>
                <th style={{ padding: "12px 14px", width: "50px", fontWeight: 600 }}>Order</th>
                <th style={{ padding: "12px 14px", fontWeight: 600 }}>Stage Badge</th>
                <th style={{ padding: "12px 14px", fontWeight: 600 }}>Title</th>
                <th style={{ padding: "12px 14px", fontWeight: 600 }}>Highlights</th>
                <th style={{ padding: "12px 14px", width: "90px", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "12px 14px", width: "160px", textAlign: "right", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {wings.map((wing, idx) => (
                <tr key={wing.id} style={{ borderBottom: idx < wings.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                  <td style={{ padding: "12px 14px", color: "#6B7280", fontWeight: 600 }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        background: "#FEF2F2",
                        color: "#B91C1C",
                        border: "1px solid #FEE2E2",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {wing.stageBadge}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827" }}>
                    {wing.title}
                  </td>
                  <td style={{ padding: "12px 14px", color: "#4B5563" }}>
                    {wing.highlights.length} bullet point(s)
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <button
                      type="button"
                      onClick={() => handleToggle(wing.id)}
                      disabled={isPending}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: wing.isPublished ? "#059669" : "#6B7280",
                        fontWeight: 600,
                        fontSize: "12px",
                        padding: 0,
                      }}
                    >
                      {wing.isPublished ? (
                        <>
                          <CheckCircle2 style={{ width: "14px", height: "14px" }} />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <XCircle style={{ width: "14px", height: "14px" }} />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "up")}
                        disabled={isPending || idx === 0}
                        title="Move Up"
                        style={{
                          background: "#F3F4F6",
                          border: "1px solid #E5E7EB",
                          borderRadius: "4px",
                          padding: "5px",
                          cursor: idx === 0 ? "not-allowed" : "pointer",
                          color: idx === 0 ? "#9CA3AF" : "#374151",
                        }}
                      >
                        <ArrowUp style={{ width: "13px", height: "13px" }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "down")}
                        disabled={isPending || idx === wings.length - 1}
                        title="Move Down"
                        style={{
                          background: "#F3F4F6",
                          border: "1px solid #E5E7EB",
                          borderRadius: "4px",
                          padding: "5px",
                          cursor: idx === wings.length - 1 ? "not-allowed" : "pointer",
                          color: idx === wings.length - 1 ? "#9CA3AF" : "#374151",
                        }}
                      >
                        <ArrowDown style={{ width: "13px", height: "13px" }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditDialog(wing)}
                        disabled={isPending}
                        title="Edit Wing"
                        style={{
                          background: "#EFF6FF",
                          border: "1px solid #DBEAFE",
                          borderRadius: "4px",
                          padding: "5px",
                          cursor: "pointer",
                          color: "#1D4ED8",
                        }}
                      >
                        <Pencil style={{ width: "13px", height: "13px" }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(wing.id)}
                        disabled={isPending}
                        title="Delete Wing"
                        style={{
                          background: "#FEF2F2",
                          border: "1px solid #FEE2E2",
                          borderRadius: "4px",
                          padding: "5px",
                          cursor: "pointer",
                          color: "#B91C1C",
                        }}
                      >
                        <Trash2 style={{ width: "13px", height: "13px" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Dialog Modal */}
      {isDialogOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "8px",
              padding: "24px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: "0 0 16px 0" }}>
              {editingWing ? "Edit Academic Wing" : "Add Academic Wing"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                  Stage Badge *
                </label>
                <input
                  type="text"
                  value={stageBadge}
                  onChange={(e) => setStageBadge(e.target.value)}
                  placeholder="e.g. Stage 1: Foundational Wing"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    fontSize: "13px",
                    border: "1px solid #D1D5DB",
                    borderRadius: "6px",
                    boxSizing: "border-box",
                  }}
                />
                {formErrors.stageBadge && (
                  <p style={{ color: "#B91C1C", fontSize: "11px", margin: "4px 0 0" }}>{formErrors.stageBadge[0]}</p>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Foundational Stage (LKG, UKG, Classes I & II)"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    fontSize: "13px",
                    border: "1px solid #D1D5DB",
                    borderRadius: "6px",
                    boxSizing: "border-box",
                  }}
                />
                {formErrors.title && (
                  <p style={{ color: "#B91C1C", fontSize: "11px", margin: "4px 0 0" }}>{formErrors.title[0]}</p>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of the pedagogical focus for this stage..."
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    fontSize: "13px",
                    border: "1px solid #D1D5DB",
                    borderRadius: "6px",
                    boxSizing: "border-box",
                  }}
                />
                {formErrors.description && (
                  <p style={{ color: "#B91C1C", fontSize: "11px", margin: "4px 0 0" }}>{formErrors.description[0]}</p>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                  Bullet Highlights (one per line)
                </label>
                <textarea
                  rows={4}
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  placeholder="Phonics, picture-talk & vocabulary building&#10;Number games, counting & spatial geometry"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    fontSize: "13px",
                    border: "1px solid #D1D5DB",
                    borderRadius: "6px",
                    boxSizing: "border-box",
                    fontFamily: "monospace",
                  }}
                />
                <span style={{ fontSize: "11px", color: "#6B7280" }}>
                  Enter up to 10 highlights, one per line. Blank lines are ignored.
                </span>
                {formErrors.highlights && (
                  <p style={{ color: "#B91C1C", fontSize: "11px", margin: "4px 0 0" }}>{formErrors.highlights[0]}</p>
                )}
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: "13px",
                      border: "1px solid #D1D5DB",
                      borderRadius: "6px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "20px" }}>
                  <input
                    type="checkbox"
                    id="wingIsPublished"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <label htmlFor="wingIsPublished" style={{ fontSize: "13px", fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                    Published
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={closeDialog}
                disabled={isPending}
                style={{
                  padding: "8px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "#F3F4F6",
                  color: "#374151",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "#B91C1C",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isPending ? "not-allowed" : "pointer",
                }}
              >
                {isPending && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />}
                <span>{editingWing ? "Save Changes" : "Create Wing"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "8px",
              padding: "24px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: "0 0 10px 0" }}>
              Delete Academic Wing?
            </h3>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 20px 0" }}>
              Are you sure you want to delete this academic wing? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isPending}
                style={{
                  padding: "8px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "#F3F4F6",
                  color: "#374151",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isPending}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "#B91C1C",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isPending ? "not-allowed" : "pointer",
                }}
              >
                {isPending && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
