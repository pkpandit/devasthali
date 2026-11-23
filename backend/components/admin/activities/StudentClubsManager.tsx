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
  Palette,
  Sparkles,
  Compass,
  Music,
  Activity,
  Award,
  Trophy,
  Mic,
  HeartHandshake,
  BookOpen,
  Dumbbell,
  Smile,
} from "lucide-react";
import {
  createStudentClubAction,
  updateStudentClubAction,
  deleteStudentClubAction,
  reorderStudentClubsAction,
  toggleStudentClubStatusAction,
} from "@/lib/server/activity-actions";
import {
  ALLOWED_ACTIVITY_ICONS,
  type AllowedActivityIcon,
} from "@/lib/validation/activities";

export interface SerializedStudentClub {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  iconName: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentClubsManagerProps {
  clubs: SerializedStudentClub[];
}

function renderClubIcon(iconName: string, size = 18) {
  switch (iconName) {
    case "Palette":
      return <Palette size={size} />;
    case "Sparkles":
      return <Sparkles size={size} />;
    case "Compass":
      return <Compass size={size} />;
    case "Music":
      return <Music size={size} />;
    case "Award":
      return <Award size={size} />;
    case "Trophy":
      return <Trophy size={size} />;
    case "Mic":
      return <Mic size={size} />;
    case "HeartHandshake":
      return <HeartHandshake size={size} />;
    case "BookOpen":
      return <BookOpen size={size} />;
    case "Dumbbell":
      return <Dumbbell size={size} />;
    case "Smile":
      return <Smile size={size} />;
    case "Activity":
    default:
      return <Activity size={size} />;
  }
}

export function StudentClubsManager({ clubs }: StudentClubsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Dialog & confirm states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<SerializedStudentClub | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Cultural & Creative");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState<AllowedActivityIcon>("Activity");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const openCreateDialog = () => {
    setEditingClub(null);
    setName("");
    setCategory("Cultural & Creative");
    setDescription("");
    setIconName("Palette");
    setDisplayOrder(clubs.length);
    setIsPublished(true);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (club: SerializedStudentClub) => {
    setEditingClub(club);
    setName(club.name);
    setCategory(club.category);
    setDescription(club.description || "");
    setIconName(
      ALLOWED_ACTIVITY_ICONS.includes(club.iconName as AllowedActivityIcon)
        ? (club.iconName as AllowedActivityIcon)
        : "Activity"
    );
    setDisplayOrder(club.displayOrder);
    setIsPublished(club.isPublished);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingClub(null);
    setFormErrors({});
  };

  const handleSave = () => {
    setFormErrors({});
    setFeedback(null);

    startTransition(async () => {
      let result;
      if (editingClub) {
        result = await updateStudentClubAction({
          id: editingClub.id,
          name,
          category,
          description: description || null,
          iconName,
          displayOrder,
          isPublished,
        });
      } else {
        result = await createStudentClubAction({
          name,
          category,
          description: description || null,
          iconName,
          displayOrder,
          isPublished,
        });
      }

      if (result.success) {
        setFeedback({
          type: "success",
          message: editingClub
            ? `Club "${name}" updated successfully.`
            : `Club "${name}" created successfully.`,
        });
        closeDialog();
        router.refresh();
      } else {
        if (result.fieldErrors) {
          setFormErrors(result.fieldErrors);
        }
        setFeedback({
          type: "error",
          message: result.error || "Failed to save student club.",
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await deleteStudentClubAction({ id });
      if (result.success) {
        setFeedback({ type: "success", message: "Student club deleted successfully." });
        setDeleteConfirmId(null);
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to delete student club.",
        });
      }
    });
  };

  const handleToggleStatus = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await toggleStudentClubStatusAction({ id });
      if (result.success) {
        setFeedback({
          type: "success",
          message: `Club status updated to ${result.data?.isPublished ? "Published" : "Draft"}.`,
        });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to toggle status.",
        });
      }
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === clubs.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...clubs];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((c) => c.id);

    setFeedback(null);
    startTransition(async () => {
      const result = await reorderStudentClubsAction({ orderedIds });
      if (result.success) {
        setFeedback({ type: "success", message: "Student clubs reordered successfully." });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to reorder student clubs.",
        });
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Top action header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--foreground, #0f172a)" }}>
            Student Clubs & Activities
          </h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "var(--muted-foreground, #64748b)" }}>
            Manage the student clubs, visual icons, descriptions, and display hierarchy shown on the co-curricular page.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateDialog}
          disabled={isPending}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <Plus size={16} />
          Add Student Club
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.875rem 1rem",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            backgroundColor: feedback.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: feedback.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${feedback.type === "success" ? "#a7f3d0" : "#fecaca"}`,
          }}
        >
          {feedback.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              fontSize: "1rem",
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Table Card */}
      <div
        style={{
          backgroundColor: "var(--card, #ffffff)",
          borderRadius: "0.5rem",
          border: "1px solid var(--border, #e2e8f0)",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ backgroundColor: "var(--muted, #f8fafc)", borderBottom: "1px solid var(--border, #e2e8f0)" }}>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, width: "60px" }}>Order</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, width: "70px" }}>Icon</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Club Name</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Category</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Description</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, width: "100px" }}>Status</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "right", width: "180px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clubs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "2.5rem 1rem", textAlign: "center", color: "#64748b" }}>
                    No student clubs found. Click &quot;Add Student Club&quot; to configure your first activity club.
                  </td>
                </tr>
              ) : (
                clubs.map((club, idx) => (
                  <tr
                    key={club.id}
                    style={{
                      borderBottom: "1px solid var(--border, #f1f5f9)",
                      backgroundColor: idx % 2 === 0 ? "transparent" : "var(--muted-row, #fafafa)",
                    }}
                  >
                    {/* Order Controls */}
                    <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "up")}
                          disabled={isPending || idx === 0}
                          title="Move up"
                          style={{
                            padding: "0.25rem",
                            borderRadius: "0.25rem",
                            border: "1px solid var(--border, #cbd5e1)",
                            background: "var(--background, #ffffff)",
                            cursor: idx === 0 ? "not-allowed" : "pointer",
                            opacity: idx === 0 ? 0.4 : 1,
                          }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "down")}
                          disabled={isPending || idx === clubs.length - 1}
                          title="Move down"
                          style={{
                            padding: "0.25rem",
                            borderRadius: "0.25rem",
                            border: "1px solid var(--border, #cbd5e1)",
                            background: "var(--background, #ffffff)",
                            cursor: idx === clubs.length - 1 ? "not-allowed" : "pointer",
                            opacity: idx === clubs.length - 1 ? 0.4 : 1,
                          }}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Icon Preview */}
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "0.375rem",
                          backgroundColor: "#eff6ff",
                          color: "#2563eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {renderClubIcon(club.iconName)}
                      </div>
                    </td>

                    {/* Club Name */}
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "var(--foreground, #0f172a)" }}>
                      {club.name}
                    </td>

                    {/* Category */}
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          backgroundColor: "#f1f5f9",
                          color: "#475569",
                        }}
                      >
                        {club.category}
                      </span>
                    </td>

                    {/* Description */}
                    <td style={{ padding: "0.75rem 1rem", color: "#64748b", maxWidth: "260px" }}>
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {club.description || "—"}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(club.id)}
                        disabled={isPending}
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: club.isPublished ? "#dcfce7" : "#f1f5f9",
                          color: club.isPublished ? "#15803d" : "#64748b",
                        }}
                      >
                        {club.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                        <button
                          type="button"
                          onClick={() => openEditDialog(club)}
                          disabled={isPending}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.35rem 0.65rem",
                            borderRadius: "0.25rem",
                            border: "1px solid var(--border, #cbd5e1)",
                            background: "var(--background, #ffffff)",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(club.id)}
                          disabled={isPending}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.35rem 0.65rem",
                            borderRadius: "0.25rem",
                            border: "1px solid #fecaca",
                            background: "#fff5f5",
                            color: "#dc2626",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal Dialog */}
      {isDialogOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--card, #ffffff)",
              borderRadius: "0.5rem",
              width: "100%",
              maxWidth: "540px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.5rem",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "var(--foreground, #0f172a)" }}>
                {editingClub ? "Edit Student Club" : "Add Student Club"}
              </h3>
              <button
                type="button"
                onClick={closeDialog}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                &times;
              </button>
            </div>

            {/* Club Name */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Club Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Science & Innovation Club"
                maxLength={120}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  border: formErrors.name ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              />
              {formErrors.name && (
                <p style={{ color: "#dc2626", fontSize: "0.75rem", margin: "0.25rem 0 0 0" }}>
                  {formErrors.name.join(", ")}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Category *
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Cultural & Creative, Sports & Athletics, Technology"
                maxLength={80}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  border: formErrors.category ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              />
              {formErrors.category && (
                <p style={{ color: "#dc2626", fontSize: "0.75rem", margin: "0.25rem 0 0 0" }}>
                  {formErrors.category.join(", ")}
                </p>
              )}
            </div>

            {/* Icon Picker */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Club Icon *
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "0.5rem",
                  marginTop: "0.25rem",
                }}
              >
                {ALLOWED_ACTIVITY_ICONS.map((icon) => {
                  const isSelected = iconName === icon;
                  return (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setIconName(icon)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.5rem 0.25rem",
                        borderRadius: "0.375rem",
                        border: isSelected ? "2px solid #2563eb" : "1px solid var(--border, #e2e8f0)",
                        backgroundColor: isSelected ? "#eff6ff" : "var(--background, #ffffff)",
                        color: isSelected ? "#2563eb" : "var(--foreground, #0f172a)",
                        cursor: "pointer",
                      }}
                    >
                      {renderClubIcon(icon, 20)}
                      <span style={{ fontSize: "0.7rem", fontWeight: isSelected ? 600 : 400 }}>{icon}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Brief description of the club's activities and student involvement..."
                maxLength={1000}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  border: formErrors.description ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                }}
              />
              {formErrors.description && (
                <p style={{ color: "#dc2626", fontSize: "0.75rem", margin: "0.25rem 0 0 0" }}>
                  {formErrors.description.join(", ")}
                </p>
              )}
            </div>

            {/* Publish Checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                id="clubPublished"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label htmlFor="clubPublished" style={{ fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" }}>
                Publish on public website
              </label>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button
                type="button"
                onClick={closeDialog}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "1px solid var(--border, #cbd5e1)",
                  background: "var(--background, #ffffff)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
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
                  gap: "0.375rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: isPending ? "not-allowed" : "pointer",
                }}
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                {editingClub ? "Save Changes" : "Create Club"}
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
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--card, #ffffff)",
              borderRadius: "0.5rem",
              width: "100%",
              maxWidth: "420px",
              padding: "1.5rem",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "#991b1b" }}>
              Delete Student Club
            </h3>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b", lineHeight: 1.5 }}>
              Are you sure you want to permanently delete this student club? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "1px solid var(--border, #cbd5e1)",
                  background: "var(--background, #ffffff)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
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
                  gap: "0.375rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: isPending ? "not-allowed" : "pointer",
                }}
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
