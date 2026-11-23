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
  AlertTriangle,
  Mail,
} from "lucide-react";
import {
  createCareerOpportunityAction,
  updateCareerOpportunityAction,
  deleteCareerOpportunityAction,
  reorderCareerOpportunitiesAction,
  toggleCareerOpportunityStatusAction,
} from "@/lib/server/alumni-actions";

export interface SerializedCareerOpportunity {
  id: string;
  slug: string;
  badgeText: string;
  title: string;
  description: string;
  contactEmail: string;
  emailSubject: string | null;
  ctaText: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CareerOpportunitiesManagerProps {
  opportunities: SerializedCareerOpportunity[];
}

export function CareerOpportunitiesManager({ opportunities }: CareerOpportunitiesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Dialog & confirm states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<SerializedCareerOpportunity | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [badgeText, setBadgeText] = useState("Immediate Requirement");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [ctaText, setCtaText] = useState("Apply via Email");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const openCreateDialog = () => {
    setEditingOpportunity(null);
    setBadgeText("Immediate Requirement");
    setTitle("");
    setDescription("");
    setContactEmail("");
    setEmailSubject("");
    setCtaText("Apply via Email");
    setDisplayOrder(opportunities.length + 1);
    setIsPublished(true);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (opp: SerializedCareerOpportunity) => {
    setEditingOpportunity(opp);
    setBadgeText(opp.badgeText);
    setTitle(opp.title);
    setDescription(opp.description);
    setContactEmail(opp.contactEmail);
    setEmailSubject(opp.emailSubject || "");
    setCtaText(opp.ctaText);
    setDisplayOrder(opp.displayOrder);
    setIsPublished(opp.isPublished);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingOpportunity(null);
    setFormErrors({});
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setFormErrors({});

    const payload = {
      badgeText: badgeText.trim(),
      title: title.trim(),
      description: description.trim(),
      contactEmail: contactEmail.trim(),
      emailSubject: emailSubject.trim() || null,
      ctaText: ctaText.trim(),
      displayOrder,
      isPublished,
    };

    startTransition(async () => {
      let result;
      if (editingOpportunity) {
        result = await updateCareerOpportunityAction({
          id: editingOpportunity.id,
          ...payload,
        });
      } else {
        result = await createCareerOpportunityAction(payload);
      }

      if (result.success) {
        setFeedback({
          type: "success",
          message: editingOpportunity
            ? "Career opportunity updated successfully."
            : "Career opportunity created successfully.",
        });
        closeDialog();
        router.refresh();
      } else {
        if (result.fieldErrors) {
          setFormErrors(result.fieldErrors);
        }
        setFeedback({
          type: "error",
          message: result.error || "Failed to save career opportunity.",
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await deleteCareerOpportunityAction({ id });
      if (result.success) {
        setFeedback({
          type: "success",
          message: "Career opportunity deleted successfully.",
        });
        setDeleteConfirmId(null);
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to delete career opportunity.",
        });
      }
    });
  };

  const handleToggleStatus = (opp: SerializedCareerOpportunity) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await toggleCareerOpportunityStatusAction({
        id: opp.id,
        isPublished: !opp.isPublished,
      });

      if (result.success) {
        setFeedback({
          type: "success",
          message: `Career opportunity "${opp.title}" is now ${
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
    if (targetIndex < 0 || targetIndex >= opportunities.length) return;

    const reordered = [...opportunities];
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
      const result = await reorderCareerOpportunitiesAction(payload);
      if (result.success) {
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to reorder career opportunities.",
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
            Career & Faculty Opportunities
          </h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "var(--muted-foreground, #64748b)" }}>
            Publish recruitment notices, teaching positions, and administrative career openings.
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
          Add Career Notice
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
                <th style={{ padding: "0.75rem 1rem", width: "150px", fontWeight: 600, color: "var(--muted-foreground, #64748b)" }}>Badge</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "var(--muted-foreground, #64748b)" }}>Position Details</th>
                <th style={{ padding: "0.75rem 1rem", width: "180px", fontWeight: 600, color: "var(--muted-foreground, #64748b)" }}>Contact Email</th>
                <th style={{ padding: "0.75rem 1rem", width: "110px", fontWeight: 600, color: "var(--muted-foreground, #64748b)" }}>Status</th>
                <th style={{ padding: "0.75rem 1rem", width: "120px", fontWeight: 600, textAlign: "right", color: "var(--muted-foreground, #64748b)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "2.5rem 1rem", textAlign: "center", color: "var(--muted-foreground, #64748b)" }}>
                    No career opportunities found. Click &quot;Add Career Notice&quot; to publish an opening.
                  </td>
                </tr>
              ) : (
                opportunities.map((opp, index) => (
                  <tr
                    key={opp.id}
                    style={{
                      borderBottom: index < opportunities.length - 1 ? "1px solid var(--border, #e2e8f0)" : "none",
                      opacity: opp.isPublished ? 1 : 0.65,
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
                          disabled={isPending || index === opportunities.length - 1}
                          title="Move down"
                          style={{
                            padding: "4px",
                            borderRadius: "4px",
                            border: "1px solid var(--border, #e2e8f0)",
                            background: "transparent",
                            cursor: index === opportunities.length - 1 || isPending ? "not-allowed" : "pointer",
                            opacity: index === opportunities.length - 1 ? 0.3 : 1,
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

                    {/* Badge */}
                    <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          border: "1px solid #dbeafe",
                        }}
                      >
                        {opp.badgeText}
                      </span>
                    </td>

                    {/* Details */}
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ fontWeight: 600, color: "var(--foreground, #0f172a)", marginBottom: "0.25rem" }}>
                        {opp.title}
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
                        {opp.description}
                      </div>
                    </td>

                    {/* Contact Email */}
                    <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "var(--foreground, #334155)" }}>
                        <Mail size={14} style={{ color: "var(--primary, #0284c7)" }} />
                        <span>{opp.contactEmail}</span>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(opp)}
                        disabled={isPending}
                        style={{
                          padding: "0.25rem 0.625rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          border: "none",
                          cursor: isPending ? "not-allowed" : "pointer",
                          background: opp.isPublished ? "#dcfce7" : "#f1f5f9",
                          color: opp.isPublished ? "#15803d" : "#64748b",
                        }}
                      >
                        {opp.isPublished ? "Published" : "Hidden"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <button
                          type="button"
                          onClick={() => openEditDialog(opp)}
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
                          onClick={() => setDeleteConfirmId(opp.id)}
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
                {editingOpportunity ? "Edit Career Opportunity" : "Add Career Opportunity"}
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                {/* Badge Text */}
                <div>
                  <label
                    htmlFor="career-badge"
                    style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
                  >
                    Badge Label <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    id="career-badge"
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. Immediate Requirement"
                    maxLength={50}
                    required
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.75rem",
                      borderRadius: "6px",
                      border: formErrors.badgeText ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                  {formErrors.badgeText && (
                    <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      {formErrors.badgeText[0]}
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label
                    htmlFor="career-title"
                    style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
                  >
                    Role / Position Title <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    id="career-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior PGT Physics & Mathematics Faculty"
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
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="career-description"
                  style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
                >
                  Position Description & Qualifications <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  id="career-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the qualifications, experience requirements, responsibilities, or teaching expectations..."
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

              {/* Contact Email & Subject */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label
                    htmlFor="career-email"
                    style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
                  >
                    Contact Email <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    id="career-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="careers@devasthali.edu.in"
                    maxLength={150}
                    required
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.75rem",
                      borderRadius: "6px",
                      border: formErrors.contactEmail ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                  {formErrors.contactEmail && (
                    <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      {formErrors.contactEmail[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="career-subject"
                    style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
                  >
                    Email Pre-fill Subject (Optional)
                  </label>
                  <input
                    id="career-subject"
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Application for Faculty Position"
                    maxLength={200}
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.75rem",
                      borderRadius: "6px",
                      border: formErrors.emailSubject ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                  {formErrors.emailSubject && (
                    <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      {formErrors.emailSubject[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* CTA Button Text */}
              <div>
                <label
                  htmlFor="career-cta"
                  style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
                >
                  Button Call-to-Action Text <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  id="career-cta"
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="e.g. Apply via Email"
                  maxLength={50}
                  required
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "6px",
                    border: formErrors.ctaText ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
                    fontSize: "0.875rem",
                    boxSizing: "border-box",
                  }}
                />
                {formErrors.ctaText && (
                  <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {formErrors.ctaText[0]}
                  </p>
                )}
              </div>

              {/* Display Order & isPublished */}
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor="career-order"
                    style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
                  >
                    Display Order
                  </label>
                  <input
                    id="career-order"
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
                    id="career-published"
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <label htmlFor="career-published" style={{ fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
                    Publish Opportunity
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
                  {editingOpportunity ? "Save Changes" : "Create Opportunity"}
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
                Delete Career Opportunity?
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--muted-foreground, #64748b)", lineHeight: "1.5" }}>
              This will permanently delete this career notice from public display on the alumni portal.
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
