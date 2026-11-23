"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import {
  createAlumniReunionAction,
  updateAlumniReunionAction,
  deleteAlumniReunionAction,
  reorderAlumniReunionsAction,
  toggleAlumniReunionStatusAction,
} from "@/lib/server/alumni-actions";
import { AdminImageUploadField } from "@/components/admin/ui/AdminImageUploadField";

export interface SerializedAlumniReunion {
  id: string;
  slug: string;
  title: string;
  description: string;
  heroImage: string | null;
  heroImageAlt: string | null;
  eventDate: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AlumniReunionsManagerProps {
  reunions: SerializedAlumniReunion[];
}

export function AlumniReunionsManager({ reunions }: AlumniReunionsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Dialog & confirm states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReunion, setEditingReunion] = useState<SerializedAlumniReunion | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  // Image states
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [heroImageAlt, setHeroImageAlt] = useState("");

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const openCreateDialog = () => {
    setEditingReunion(null);
    setTitle("");
    setDescription("");
    setEventDate("");
    setDisplayOrder(reunions.length + 1);
    setIsPublished(true);
    setCurrentImageUrl(null);
    setSelectedImageFile(null);
    setIsImageRemoved(false);
    setHeroImageAlt("");
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (reunion: SerializedAlumniReunion) => {
    setEditingReunion(reunion);
    setTitle(reunion.title);
    setDescription(reunion.description);
    setEventDate(reunion.eventDate || "");
    setDisplayOrder(reunion.displayOrder);
    setIsPublished(reunion.isPublished);
    setCurrentImageUrl(reunion.heroImage);
    setSelectedImageFile(null);
    setIsImageRemoved(false);
    setHeroImageAlt(reunion.heroImageAlt || "");
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingReunion(null);
    setFormErrors({});
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setFormErrors({});

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("description", description.trim());
    if (eventDate.trim()) {
      fd.append("eventDate", eventDate.trim());
    } else {
      fd.append("eventDate", "");
    }
    fd.append("displayOrder", String(displayOrder));
    fd.append("isPublished", isPublished ? "true" : "false");

    if (heroImageAlt.trim()) {
      fd.append("heroImageAlt", heroImageAlt.trim());
    }

    if (selectedImageFile) {
      fd.append("heroImageFile", selectedImageFile);
    }
    if (isImageRemoved) {
      fd.append("removeHeroImage", "true");
    }

    if (editingReunion) {
      fd.append("id", editingReunion.id);
    }

    startTransition(async () => {
      let result;
      if (editingReunion) {
        result = await updateAlumniReunionAction(fd);
      } else {
        result = await createAlumniReunionAction(fd);
      }

      if (result.success) {
        setFeedback({
          type: "success",
          message: editingReunion
            ? "Alumni reunion updated successfully."
            : "Alumni reunion created successfully.",
        });
        closeDialog();
        router.refresh();
      } else {
        if (result.fieldErrors) {
          setFormErrors(result.fieldErrors);
        }
        setFeedback({
          type: "error",
          message: result.error || "Failed to save alumni reunion.",
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await deleteAlumniReunionAction({ id });
      if (result.success) {
        setFeedback({
          type: "success",
          message: "Alumni reunion deleted successfully.",
        });
        setDeleteConfirmId(null);
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to delete alumni reunion.",
        });
      }
    });
  };

  const handleToggleStatus = (reunion: SerializedAlumniReunion) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await toggleAlumniReunionStatusAction({
        id: reunion.id,
        isPublished: !reunion.isPublished,
      });

      if (result.success) {
        setFeedback({
          type: "success",
          message: `Reunion "${reunion.title}" is now ${
            result.data?.isPublished ? "published" : "hidden"
          }.`,
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
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reunions.length) return;

    const reordered = [...reunions];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const payload = {
      items: reordered.map((item, idx) => ({
        id: item.id,
        displayOrder: idx + 1,
      })),
    };

    setFeedback(null);
    startTransition(async () => {
      const result = await reorderAlumniReunionsAction(payload);
      if (result.success) {
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to reorder alumni reunions.",
        });
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box" }}>
      {/* Top action row */}
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
            Alumni Meets & Reunions
          </h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "var(--muted-foreground, #64748b)" }}>
            Publish upcoming and past alumni homecoming meets, reunion schedules, and showcase imagery.
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
            padding: "0.625rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            borderRadius: "6px",
            background: "var(--primary, #0284c7)",
            color: "#ffffff",
            border: "none",
            cursor: isPending ? "not-allowed" : "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <Plus size={16} />
          Add Reunion Meet
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            fontSize: "0.875rem",
            background: feedback.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${feedback.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            color: feedback.type === "success" ? "#166534" : "#991b1b",
          }}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          ) : (
            <XCircle size={18} style={{ flexShrink: 0 }} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Table Card */}
      <div
        style={{
          border: "1px solid var(--border, #e2e8f0)",
          borderRadius: "8px",
          background: "var(--card, #ffffff)",
          overflow: "hidden",
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
        }}
      >
        <div style={{ overflowX: "auto", width: "100%", maxWidth: "100%", minWidth: 0 }}>
          <table style={{ width: "100%", minWidth: "600px", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--muted, #f8fafc)", borderBottom: "1px solid var(--border, #e2e8f0)" }}>
                <th style={{ padding: "0.75rem 1rem", width: "80px", fontWeight: 600, color: "var(--muted-foreground, #64748b)" }}>Order</th>
                <th style={{ padding: "0.75rem 1rem", width: "100px", fontWeight: 600, color: "var(--muted-foreground, #64748b)" }}>Banner</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "var(--muted-foreground, #64748b)" }}>Meet Details</th>
                <th style={{ padding: "0.75rem 1rem", width: "130px", fontWeight: 600, color: "var(--muted-foreground, #64748b)" }}>Event Date</th>
                <th style={{ padding: "0.75rem 1rem", width: "110px", fontWeight: 600, color: "var(--muted-foreground, #64748b)" }}>Status</th>
                <th style={{ padding: "0.75rem 1rem", width: "120px", fontWeight: 600, textAlign: "right", color: "var(--muted-foreground, #64748b)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reunions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "2.5rem 1rem", textAlign: "center", color: "var(--muted-foreground, #64748b)" }}>
                    No alumni reunions found. Click &quot;Add Reunion Meet&quot; to publish your first announcement.
                  </td>
                </tr>
              ) : (
                reunions.map((reunion, index) => (
                  <tr
                    key={reunion.id}
                    style={{
                      borderBottom: index < reunions.length - 1 ? "1px solid var(--border, #e2e8f0)" : "none",
                      opacity: reunion.isPublished ? 1 : 0.65,
                    }}
                  >
                    {/* Reorder Buttons */}
                    <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <button
                          type="button"
                          onClick={() => handleMove(index, "up")}
                          disabled={isPending || index === 0}
                          title="Move up"
                          style={{
                            padding: "4px",
                            borderRadius: "4px",
                            border: "1px solid var(--border, #e2e8f0)",
                            background: "transparent",
                            cursor: index === 0 || isPending ? "not-allowed" : "pointer",
                            opacity: index === 0 ? 0.3 : 1,
                            color: "inherit",
                          }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, "down")}
                          disabled={isPending || index === reunions.length - 1}
                          title="Move down"
                          style={{
                            padding: "4px",
                            borderRadius: "4px",
                            border: "1px solid var(--border, #e2e8f0)",
                            background: "transparent",
                            cursor: index === reunions.length - 1 || isPending ? "not-allowed" : "pointer",
                            opacity: index === reunions.length - 1 ? 0.3 : 1,
                            color: "inherit",
                          }}
                        >
                          <ArrowDown size={14} />
                        </button>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground, #64748b)", marginLeft: "4px" }}>
                          {index + 1}
                        </span>
                      </div>
                    </td>

                    {/* Image Thumbnail */}
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {reunion.heroImage ? (
                        <div
                          style={{
                            width: "72px",
                            height: "44px",
                            borderRadius: "6px",
                            overflow: "hidden",
                            position: "relative",
                            border: "1px solid var(--border, #e2e8f0)",
                            background: "#f1f5f9",
                          }}
                        >
                          <Image
                            src={reunion.heroImage}
                            alt={reunion.heroImageAlt || reunion.title}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="72px"
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: "72px",
                            height: "44px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f1f5f9",
                            color: "#94a3b8",
                            border: "1px dashed var(--border, #cbd5e1)",
                          }}
                        >
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </td>

                    {/* Meet Details */}
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ fontWeight: 600, color: "var(--foreground, #0f172a)", marginBottom: "0.25rem" }}>
                        {reunion.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--muted-foreground, #64748b)",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: "1.4",
                        }}
                      >
                        {reunion.description}
                      </div>
                    </td>

                    {/* Event Date */}
                    <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                      {reunion.eventDate ? (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "var(--foreground, #334155)" }}>
                          <Calendar size={14} style={{ color: "var(--primary, #0284c7)" }} />
                          <span>{reunion.eventDate}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>—</span>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(reunion)}
                        disabled={isPending}
                        style={{
                          padding: "0.25rem 0.625rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          border: "none",
                          cursor: isPending ? "not-allowed" : "pointer",
                          background: reunion.isPublished ? "#dcfce7" : "#f1f5f9",
                          color: reunion.isPublished ? "#15803d" : "#64748b",
                        }}
                      >
                        {reunion.isPublished ? "Published" : "Hidden"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <button
                          type="button"
                          onClick={() => openEditDialog(reunion)}
                          disabled={isPending}
                          title="Edit"
                          style={{
                            padding: "6px",
                            borderRadius: "4px",
                            border: "1px solid var(--border, #e2e8f0)",
                            background: "transparent",
                            cursor: isPending ? "not-allowed" : "pointer",
                            color: "inherit",
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(reunion.id)}
                          disabled={isPending}
                          title="Delete"
                          style={{
                            padding: "6px",
                            borderRadius: "4px",
                            border: "1px solid #fee2e2",
                            background: "#fff5f5",
                            cursor: isPending ? "not-allowed" : "pointer",
                            color: "#dc2626",
                          }}
                        >
                          <Trash2 size={15} />
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

      {/* Edit / Create Dialog */}
      {isDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              background: "var(--card, #ffffff)",
              borderRadius: "10px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid var(--border, #e2e8f0)",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "var(--foreground, #0f172a)" }}>
                {editingReunion ? "Edit Alumni Reunion Meet" : "Add Alumni Reunion Meet"}
              </h3>
              <button
                type="button"
                onClick={closeDialog}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  color: "var(--muted-foreground, #64748b)",
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Title */}
              <div>
                <label
                  htmlFor="reunion-title"
                  style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
                >
                  Meet Title <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  id="reunion-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual Winter Homecoming 2026"
                  maxLength={200}
                  required
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "6px",
                    border: formErrors.title ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
                {formErrors.title && (
                  <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {formErrors.title[0]}
                  </p>
                )}
              </div>

              {/* Event Date */}
              <div>
                <label
                  htmlFor="reunion-eventDate"
                  style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
                >
                  Event Date / Schedule (Optional)
                </label>
                <input
                  id="reunion-eventDate"
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="e.g. December 20, 2026 or Spring 2027"
                  maxLength={100}
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "6px",
                    border: formErrors.eventDate ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
                {formErrors.eventDate && (
                  <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {formErrors.eventDate[0]}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="reunion-description"
                  style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
                >
                  Meet Description <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  id="reunion-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the agenda, venue, registration guidelines, or nostalgic recap..."
                  rows={4}
                  maxLength={4000}
                  required
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "6px",
                    border: formErrors.description ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
                {formErrors.description && (
                  <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {formErrors.description[0]}
                  </p>
                )}
              </div>

              {/* Hero Image Upload */}
              <div>
                <AdminImageUploadField
                  label="Reunion Banner / Hero Image"
                  variant="landscape"
                  currentImageUrl={currentImageUrl}
                  selectedFile={selectedImageFile}
                  isRemoved={isImageRemoved}
                  onFileSelect={(file) => {
                    setSelectedImageFile(file);
                    setIsImageRemoved(false);
                  }}
                  onRemove={() => {
                    setSelectedImageFile(null);
                    setIsImageRemoved(true);
                  }}
                  altText={heroImageAlt}
                  onAltChange={(alt) => setHeroImageAlt(alt)}
                  altLabel="Image Alt Description (Required when image is present)"
                  altError={formErrors.heroImageAlt}
                  error={formErrors.heroImage || formErrors.heroImageFile}
                  disabled={isPending}
                  isPending={isPending}
                  helperText="Supported formats: JPEG, PNG, WebP (max 2 MiB). High-resolution landscape banner."
                />
              </div>

              {/* Display Order & isPublished */}
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor="reunion-order"
                    style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
                  >
                    Display Order
                  </label>
                  <input
                    id="reunion-order"
                    type="number"
                    min={0}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.75rem",
                      borderRadius: "6px",
                      border: "1px solid var(--border, #cbd5e1)",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.25rem" }}>
                  <input
                    id="reunion-published"
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <label htmlFor="reunion-published" style={{ fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                    Publish Announcement
                  </label>
                </div>
              </div>

              {/* Form buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={isPending}
                  style={{
                    padding: "0.625rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid var(--border, #e2e8f0)",
                    background: "transparent",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: isPending ? "not-allowed" : "pointer",
                    color: "inherit",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.625rem 1.25rem",
                    borderRadius: "6px",
                    border: "none",
                    background: "var(--primary, #0284c7)",
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: isPending ? "not-allowed" : "pointer",
                  }}
                >
                  {isPending && <Loader2 size={16} className="animate-spin" />}
                  {editingReunion ? "Save Changes" : "Create Reunion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              background: "var(--card, #ffffff)",
              borderRadius: "10px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              border: "1px solid var(--border, #e2e8f0)",
              width: "100%",
              maxWidth: "420px",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#dc2626" }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
                Delete Alumni Reunion?
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--muted-foreground, #64748b)", lineHeight: "1.5" }}>
              This will permanently delete the alumni reunion announcement and any associated hero image from the server.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isPending}
                style={{
                  padding: "0.5rem 0.875rem",
                  borderRadius: "6px",
                  border: "1px solid var(--border, #e2e8f0)",
                  background: "transparent",
                  fontSize: "0.875rem",
                  cursor: isPending ? "not-allowed" : "pointer",
                  color: "inherit",
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
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  border: "none",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
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
