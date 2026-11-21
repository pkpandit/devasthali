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
  BookOpen,
} from "lucide-react";
import {
  createAcademicAssessmentRuleAction,
  updateAcademicAssessmentRuleAction,
  deleteAcademicAssessmentRuleAction,
  reorderAcademicAssessmentRulesAction,
  toggleAcademicAssessmentRuleStatusAction,
} from "@/lib/server/academic-actions";

export interface SerializedAcademicAssessmentRule {
  id: string;
  ruleText: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicAssessmentRulesManagerProps {
  rules: SerializedAcademicAssessmentRule[];
}

export function AcademicAssessmentRulesManager({ rules }: AcademicAssessmentRulesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SerializedAcademicAssessmentRule | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [ruleText, setRuleText] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const openCreateDialog = () => {
    setEditingRule(null);
    setRuleText("");
    setDisplayOrder(rules.length);
    setIsPublished(true);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (rule: SerializedAcademicAssessmentRule) => {
    setEditingRule(rule);
    setRuleText(rule.ruleText);
    setDisplayOrder(rule.displayOrder);
    setIsPublished(rule.isPublished);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingRule(null);
    setFormErrors({});
  };

  const handleSave = () => {
    setFeedback(null);
    setFormErrors({});

    startTransition(async () => {
      const payload = {
        ruleText,
        displayOrder,
        isPublished,
      };

      let result;
      if (editingRule) {
        result = await updateAcademicAssessmentRuleAction({
          id: editingRule.id,
          ...payload,
        });
      } else {
        result = await createAcademicAssessmentRuleAction(payload);
      }

      if (result.success) {
        setFeedback({
          type: "success",
          message: editingRule ? "Assessment rule updated successfully." : "Assessment rule created successfully.",
        });
        closeDialog();
        router.refresh();
      } else {
        if (result.fieldErrors) {
          setFormErrors(result.fieldErrors);
        }
        setFeedback({
          type: "error",
          message: result.error || "Failed to save assessment rule.",
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await deleteAcademicAssessmentRuleAction(id);
      if (result.success) {
        setFeedback({ type: "success", message: "Assessment rule deleted successfully." });
        setDeleteConfirmId(null);
        router.refresh();
      } else {
        setFeedback({ type: "error", message: result.error || "Failed to delete assessment rule." });
      }
    });
  };

  const handleToggleStatus = (rule: SerializedAcademicAssessmentRule) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await toggleAcademicAssessmentRuleStatusAction({ id: rule.id });
      if (result.success) {
        setFeedback({
          type: "success",
          message: `Assessment rule ${!rule.isPublished ? "published" : "set to draft"}.`,
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: result.error || "Failed to toggle status." });
      }
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rules.length) return;

    const newRules = [...rules];
    const temp = newRules[index];
    newRules[index] = newRules[targetIndex];
    newRules[targetIndex] = temp;

    const orderedIds = newRules.map((r) => r.id);

    setFeedback(null);
    startTransition(async () => {
      const result = await reorderAcademicAssessmentRulesAction(orderedIds);
      if (result.success) {
        setFeedback({ type: "success", message: "Assessment rules reordered." });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: result.error || "Failed to reorder rules." });
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Top action bar */}
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
            Academic Assessment Rules
          </h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "var(--muted-foreground, #64748b)" }}>
            Manage the sequential evaluation policies, terminal examination weightage, and promotion standards.
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
            padding: "0.625rem 1.125rem",
            backgroundColor: "var(--primary, #0284c7)",
            color: "#ffffff",
            borderRadius: "0.375rem",
            border: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.7 : 1,
            transition: "all 0.2s ease",
          }}
        >
          <Plus size={16} />
          Add Assessment Rule
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          role="alert"
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

      {/* Rules Table / Empty State */}
      {rules.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1.5rem",
            backgroundColor: "var(--card, #ffffff)",
            borderRadius: "0.5rem",
            border: "1px dashed var(--border, #e2e8f0)",
          }}
        >
          <BookOpen
            size={40}
            style={{ margin: "0 auto 1rem auto", color: "var(--muted-foreground, #94a3b8)", opacity: 0.8 }}
          />
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--foreground, #0f172a)", margin: "0 0 0.5rem 0" }}>
            No assessment rules configured
          </h3>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--muted-foreground, #64748b)",
              margin: "0 0 1.25rem 0",
              maxWidth: "400px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Create assessment criteria and promotion policies to display on the academic system page.
          </p>
          <button
            type="button"
            onClick={openCreateDialog}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "var(--primary, #0284c7)",
              color: "#ffffff",
              borderRadius: "0.375rem",
              border: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            <Plus size={16} />
            Create First Rule
          </button>
        </div>
      ) : (
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "var(--muted, #f8fafc)",
                    borderBottom: "1px solid var(--border, #e2e8f0)",
                    color: "var(--muted-foreground, #475569)",
                    fontWeight: 600,
                  }}
                >
                  <th style={{ padding: "0.75rem 1rem", width: "4rem", textAlign: "center" }}>Order</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Assessment Rule / Policy</th>
                  <th style={{ padding: "0.75rem 1rem", width: "7rem" }}>Status</th>
                  <th style={{ padding: "0.75rem 1rem", width: "10rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, idx) => (
                  <tr
                    key={rule.id}
                    style={{
                      borderBottom: idx === rules.length - 1 ? "none" : "1px solid var(--border, #f1f5f9)",
                      backgroundColor: idx % 2 === 0 ? "transparent" : "var(--muted-row, #fafafa)",
                    }}
                  >
                    <td style={{ padding: "0.875rem 1rem", textAlign: "center", verticalAlign: "top" }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: "1.75rem",
                          height: "1.75rem",
                          lineHeight: "1.75rem",
                          textAlign: "center",
                          borderRadius: "9999px",
                          backgroundColor: "#f1f5f9",
                          color: "#334155",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                        }}
                      >
                        {rule.displayOrder + 1}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", verticalAlign: "top" }}>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--foreground, #1e293b)",
                          lineHeight: "1.5",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {rule.ruleText}
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", verticalAlign: "top" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(rule)}
                        disabled={isPending}
                        title={`Click to ${rule.isPublished ? "unpublish" : "publish"}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          padding: "0.25rem 0.625rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          border: "none",
                          cursor: isPending ? "not-allowed" : "pointer",
                          backgroundColor: rule.isPublished ? "#dcfce7" : "#f1f5f9",
                          color: rule.isPublished ? "#15803d" : "#64748b",
                        }}
                      >
                        <span
                          style={{
                            width: "0.5rem",
                            height: "0.5rem",
                            borderRadius: "9999px",
                            backgroundColor: rule.isPublished ? "#22c55e" : "#94a3b8",
                          }}
                        />
                        {rule.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", textAlign: "right", verticalAlign: "top" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "up")}
                          disabled={isPending || idx === 0}
                          title="Move Up"
                          style={{
                            padding: "0.375rem",
                            borderRadius: "0.25rem",
                            border: "1px solid var(--border, #cbd5e1)",
                            background: "transparent",
                            cursor: idx === 0 || isPending ? "not-allowed" : "pointer",
                            opacity: idx === 0 ? 0.3 : 1,
                            color: "#475569",
                          }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "down")}
                          disabled={isPending || idx === rules.length - 1}
                          title="Move Down"
                          style={{
                            padding: "0.375rem",
                            borderRadius: "0.25rem",
                            border: "1px solid var(--border, #cbd5e1)",
                            background: "transparent",
                            cursor: idx === rules.length - 1 || isPending ? "not-allowed" : "pointer",
                            opacity: idx === rules.length - 1 ? 0.3 : 1,
                            color: "#475569",
                          }}
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditDialog(rule)}
                          disabled={isPending}
                          title="Edit"
                          style={{
                            padding: "0.375rem",
                            borderRadius: "0.25rem",
                            border: "1px solid var(--border, #cbd5e1)",
                            background: "transparent",
                            cursor: isPending ? "not-allowed" : "pointer",
                            color: "#0284c7",
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(rule.id)}
                          disabled={isPending}
                          title="Delete"
                          style={{
                            padding: "0.375rem",
                            borderRadius: "0.25rem",
                            border: "1px solid #fecaca",
                            background: "transparent",
                            cursor: isPending ? "not-allowed" : "pointer",
                            color: "#dc2626",
                          }}
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
        </div>
      )}

      {/* Create / Edit Dialog Modal */}
      {isDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--card, #ffffff)",
              borderRadius: "0.5rem",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border, #e2e8f0)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "var(--foreground, #0f172a)" }}>
                {editingRule ? "Edit Assessment Rule" : "Add Assessment Rule"}
              </h3>
              <button
                type="button"
                onClick={closeDialog}
                disabled={isPending}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.25rem",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div
              style={{
                padding: "1.5rem",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {/* Rule Text */}
              <div>
                <label
                  htmlFor="ruleText"
                  style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
                >
                  Assessment Rule / Regulation Text <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  id="ruleText"
                  value={ruleText}
                  onChange={(e) => setRuleText(e.target.value)}
                  placeholder="e.g. Terminal examinations contribute 50% towards the cumulative annual evaluation."
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "0.375rem",
                    border: formErrors.ruleText ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
                    fontSize: "0.875rem",
                    lineHeight: "1.4",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    color: "#64748b",
                    marginTop: "0.25rem",
                  }}
                >
                  <span>Min 5, max 1000 characters. Plain text only.</span>
                  <span>{ruleText.length} / 1000</span>
                </div>
                {formErrors.ruleText && (
                  <p style={{ color: "#dc2626", fontSize: "0.75rem", margin: "0.25rem 0 0 0" }}>
                    {formErrors.ruleText.join(", ")}
                  </p>
                )}
              </div>

              {/* Display Order & Published */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <div>
                  <label
                    htmlFor="displayOrder"
                    style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
                  >
                    Display Sequence
                  </label>
                  <input
                    id="displayOrder"
                    type="number"
                    min={0}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                    style={{
                      width: "100%",
                      padding: "0.625rem 0.75rem",
                      borderRadius: "0.375rem",
                      border: "1px solid var(--border, #cbd5e1)",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ paddingTop: "1.25rem" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      style={{ width: "1rem", height: "1rem", cursor: "pointer" }}
                    />
                    Published on Academic System page
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid var(--border, #e2e8f0)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                backgroundColor: "var(--muted, #f8fafc)",
              }}
            >
              <button
                type="button"
                onClick={closeDialog}
                disabled={isPending}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "1px solid var(--border, #cbd5e1)",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  cursor: isPending ? "not-allowed" : "pointer",
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
                  gap: "0.5rem",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  backgroundColor: "var(--primary, #0284c7)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                {editingRule ? "Update Rule" : "Create Rule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "0.5rem",
              maxWidth: "420px",
              width: "100%",
              padding: "1.5rem",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.125rem", fontWeight: 700, color: "#991b1b" }}>
              Delete Assessment Rule?
            </h3>
            <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.875rem", color: "#475569", lineHeight: "1.5" }}>
              Are you sure you want to delete this assessment rule? This rule will no longer appear on the public
              academic system page.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isPending}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  fontSize: "0.875rem",
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
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.875rem",
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
