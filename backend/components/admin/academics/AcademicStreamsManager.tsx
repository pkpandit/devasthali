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
  FlaskConical,
  Award,
  BookOpen,
} from "lucide-react";
import {
  createAcademicStreamAction,
  updateAcademicStreamAction,
  deleteAcademicStreamAction,
  reorderAcademicStreamsAction,
  toggleAcademicStreamStatusAction,
} from "@/lib/server/academic-actions";
import {
  ALLOWED_ACADEMIC_STREAM_ICONS,
  type AcademicStreamIcon,
} from "@/lib/validation/academics";

export interface SerializedAcademicStream {
  id: string;
  slug: string;
  title: string;
  iconName: string;
  subjects: string[];
  careerHighlight: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicStreamsManagerProps {
  streams: SerializedAcademicStream[];
}

export function AcademicStreamsManager({ streams }: AcademicStreamsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Dialog & confirm states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<SerializedAcademicStream | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [iconName, setIconName] = useState<AcademicStreamIcon>("BookOpen");
  const [subjectsText, setSubjectsText] = useState("");
  const [careerHighlight, setCareerHighlight] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const openCreateDialog = () => {
    setEditingStream(null);
    setTitle("");
    setIconName("FlaskConical");
    setSubjectsText("");
    setCareerHighlight("");
    setDisplayOrder(streams.length);
    setIsPublished(true);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (stream: SerializedAcademicStream) => {
    setEditingStream(stream);
    setTitle(stream.title);
    setIconName(
      ALLOWED_ACADEMIC_STREAM_ICONS.includes(stream.iconName as AcademicStreamIcon)
        ? (stream.iconName as AcademicStreamIcon)
        : "BookOpen"
    );
    setSubjectsText(stream.subjects.join("\n"));
    setCareerHighlight(stream.careerHighlight);
    setDisplayOrder(stream.displayOrder);
    setIsPublished(stream.isPublished);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingStream(null);
    setFormErrors({});
  };

  const handleSave = () => {
    setFeedback(null);
    setFormErrors({});

    startTransition(async () => {
      const payload = {
        title,
        iconName,
        subjects: subjectsText,
        careerHighlight,
        displayOrder,
        isPublished,
      };

      let result;
      if (editingStream) {
        result = await updateAcademicStreamAction({ id: editingStream.id, ...payload });
      } else {
        result = await createAcademicStreamAction(payload);
      }

      if (result.success) {
        setFeedback({
          type: "success",
          message: editingStream ? "Stream updated successfully." : "Stream created successfully.",
        });
        closeDialog();
        router.refresh();
      } else {
        setFeedback({ type: "error", message: result.error || "Failed to save stream." });
        if (result.fieldErrors) setFormErrors(result.fieldErrors);
      }
    });
  };

  const handleDelete = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await deleteAcademicStreamAction({ id });
      if (res.success) {
        setFeedback({ type: "success", message: "Academic stream deleted." });
        setDeleteConfirmId(null);
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to delete stream." });
      }
    });
  };

  const handleToggle = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await toggleAcademicStreamStatusAction({ id });
      if (res.success) {
        setFeedback({
          type: "success",
          message: `Stream publication ${res.data?.isPublished ? "enabled" : "disabled"}.`,
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
      (direction === "down" && index === streams.length - 1)
    ) {
      return;
    }
    const newItems = [...streams];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const orderedIds = newItems.map((item) => item.id);
    startTransition(async () => {
      const res = await reorderAcademicStreamsAction({ orderedIds });
      if (res.success) {
        setFeedback({ type: "success", message: "Streams reordered successfully." });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to reorder streams." });
      }
    });
  };

  const renderIcon = (name: string) => {
    if (name === "FlaskConical") return <FlaskConical style={{ width: "16px", height: "16px" }} />;
    if (name === "Award") return <Award style={{ width: "16px", height: "16px" }} />;
    return <BookOpen style={{ width: "16px", height: "16px" }} />;
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
            Senior Secondary Streams (Classes XI &amp; XII)
          </h2>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0 0" }}>
            Manage Science, Commerce, and Humanities streams, subject offerings, and career foundation highlights.
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
          <span>Add Stream</span>
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

      {/* Streams Table */}
      {streams.length === 0 ? (
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
          <BookOpen style={{ width: "36px", height: "36px", margin: "0 auto 12px", color: "#9CA3AF" }} />
          <p style={{ fontWeight: 600, fontSize: "14px", color: "#374151", margin: 0 }}>No streams configured</p>
          <p style={{ fontSize: "13px", margin: "4px 0 0 0" }}>Click &quot;Add Stream&quot; to configure a senior secondary stream.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid #E5E7EB", borderRadius: "8px", background: "#FFFFFF" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", color: "#4B5563" }}>
                <th style={{ padding: "12px 14px", width: "50px", fontWeight: 600 }}>Order</th>
                <th style={{ padding: "12px 14px", width: "80px", fontWeight: 600 }}>Icon</th>
                <th style={{ padding: "12px 14px", fontWeight: 600 }}>Stream Title</th>
                <th style={{ padding: "12px 14px", fontWeight: 600 }}>Subjects</th>
                <th style={{ padding: "12px 14px", fontWeight: 600 }}>Career Foundation Note</th>
                <th style={{ padding: "12px 14px", width: "90px", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "12px 14px", width: "160px", textAlign: "right", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {streams.map((stream, idx) => (
                <tr key={stream.id} style={{ borderBottom: idx < streams.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                  <td style={{ padding: "12px 14px", color: "#6B7280", fontWeight: 600 }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "#FEF2F2",
                        color: "#B91C1C",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #FEE2E2",
                      }}
                    >
                      {renderIcon(stream.iconName)}
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827" }}>
                    {stream.title}
                  </td>
                  <td style={{ padding: "12px 14px", color: "#4B5563" }}>
                    {stream.subjects.length} subject(s)
                  </td>
                  <td style={{ padding: "12px 14px", color: "#B91C1C", fontWeight: 600 }}>
                    {stream.careerHighlight}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <button
                      type="button"
                      onClick={() => handleToggle(stream.id)}
                      disabled={isPending}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: stream.isPublished ? "#059669" : "#6B7280",
                        fontWeight: 600,
                        fontSize: "12px",
                        padding: 0,
                      }}
                    >
                      {stream.isPublished ? (
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
                        disabled={isPending || idx === streams.length - 1}
                        title="Move Down"
                        style={{
                          background: "#F3F4F6",
                          border: "1px solid #E5E7EB",
                          borderRadius: "4px",
                          padding: "5px",
                          cursor: idx === streams.length - 1 ? "not-allowed" : "pointer",
                          color: idx === streams.length - 1 ? "#9CA3AF" : "#374151",
                        }}
                      >
                        <ArrowDown style={{ width: "13px", height: "13px" }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditDialog(stream)}
                        disabled={isPending}
                        title="Edit Stream"
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
                        onClick={() => setDeleteConfirmId(stream.id)}
                        disabled={isPending}
                        title="Delete Stream"
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
              {editingStream ? "Edit Senior Secondary Stream" : "Add Senior Secondary Stream"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                  Stream Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Science Stream"
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
                  Icon *
                </label>
                <select
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value as AcademicStreamIcon)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    fontSize: "13px",
                    border: "1px solid #D1D5DB",
                    borderRadius: "6px",
                    boxSizing: "border-box",
                    background: "#FFFFFF",
                  }}
                >
                  <option value="FlaskConical">FlaskConical (Science / Laboratory)</option>
                  <option value="Award">Award (Commerce / Honors)</option>
                  <option value="BookOpen">BookOpen (Humanities / Arts)</option>
                </select>
                {formErrors.iconName && (
                  <p style={{ color: "#B91C1C", fontSize: "11px", margin: "4px 0 0" }}>{formErrors.iconName[0]}</p>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                  Subjects List (one per line)
                </label>
                <textarea
                  rows={4}
                  value={subjectsText}
                  onChange={(e) => setSubjectsText(e.target.value)}
                  placeholder="English Core (Compulsory)&#10;Physics & Chemistry&#10;Mathematics (PCM) OR Biology (PCB)&#10;Elective: Computer Science / Physical Ed"
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
                  Enter up to 10 subject bullets, one per line. Blank lines are ignored.
                </span>
                {formErrors.subjects && (
                  <p style={{ color: "#B91C1C", fontSize: "11px", margin: "4px 0 0" }}>{formErrors.subjects[0]}</p>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                  Career Foundation Note *
                </label>
                <input
                  type="text"
                  value={careerHighlight}
                  onChange={(e) => setCareerHighlight(e.target.value)}
                  placeholder="e.g. Includes NEET/JEE Foundation"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    fontSize: "13px",
                    border: "1px solid #D1D5DB",
                    borderRadius: "6px",
                    boxSizing: "border-box",
                  }}
                />
                {formErrors.careerHighlight && (
                  <p style={{ color: "#B91C1C", fontSize: "11px", margin: "4px 0 0" }}>{formErrors.careerHighlight[0]}</p>
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
                    id="streamIsPublished"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <label htmlFor="streamIsPublished" style={{ fontSize: "13px", fontWeight: 600, color: "#374151", cursor: "pointer" }}>
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
                <span>{editingStream ? "Save Changes" : "Create Stream"}</span>
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
              Delete Stream?
            </h3>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 20px 0" }}>
              Are you sure you want to delete this senior secondary stream? This action cannot be undone.
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
