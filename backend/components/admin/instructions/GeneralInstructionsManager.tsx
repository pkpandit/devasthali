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
  ShieldAlert,
  ShieldCheck,
  Filter,
} from "lucide-react";
import {
  createGeneralInstructionAction,
  updateGeneralInstructionAction,
  deleteGeneralInstructionAction,
  reorderGeneralInstructionsAction,
  toggleGeneralInstructionStatusAction,
} from "@/lib/server/instruction-actions";
import {
  ALLOWED_INSTRUCTION_CATEGORIES,
  type AllowedInstructionCategory,
} from "@/lib/validation/instructions";

export interface SerializedGeneralInstruction {
  id: string;
  slug: string;
  ruleText: string;
  category: string;
  isCritical: boolean;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GeneralInstructionsManagerProps {
  instructions: SerializedGeneralInstruction[];
}

export function GeneralInstructionsManager({ instructions }: GeneralInstructionsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filter state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");

  // Dialog & confirm states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstruction, setEditingInstruction] = useState<SerializedGeneralInstruction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [ruleText, setRuleText] = useState("");
  const [category, setCategory] = useState<AllowedInstructionCategory>("General Discipline");
  const [isCritical, setIsCritical] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const filteredInstructions =
    selectedCategoryFilter === "ALL"
      ? instructions
      : instructions.filter((inst) => inst.category === selectedCategoryFilter);

  const openCreateDialog = () => {
    setEditingInstruction(null);
    setRuleText("");
    setCategory("General Discipline");
    setIsCritical(false);
    setDisplayOrder(instructions.length + 1);
    setIsPublished(true);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (inst: SerializedGeneralInstruction) => {
    setEditingInstruction(inst);
    setRuleText(inst.ruleText);
    setCategory(
      ALLOWED_INSTRUCTION_CATEGORIES.includes(inst.category as AllowedInstructionCategory)
        ? (inst.category as AllowedInstructionCategory)
        : "General Discipline"
    );
    setIsCritical(inst.isCritical);
    setDisplayOrder(inst.displayOrder);
    setIsPublished(inst.isPublished);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingInstruction(null);
    setFormErrors({});
  };

  const handleSave = () => {
    setFormErrors({});
    setFeedback(null);

    startTransition(async () => {
      let result;
      if (editingInstruction) {
        result = await updateGeneralInstructionAction({
          id: editingInstruction.id,
          ruleText,
          category,
          isCritical,
          displayOrder,
          isPublished,
        });
      } else {
        result = await createGeneralInstructionAction({
          ruleText,
          category,
          isCritical,
          displayOrder,
          isPublished,
        });
      }

      if (result.success) {
        setFeedback({
          type: "success",
          message: editingInstruction
            ? "Instruction rule updated successfully."
            : "New instruction rule created successfully.",
        });
        closeDialog();
        router.refresh();
      } else {
        if (result.fieldErrors) {
          setFormErrors(result.fieldErrors);
        }
        setFeedback({
          type: "error",
          message: result.error || "Failed to save instruction rule.",
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await deleteGeneralInstructionAction({ id });
      if (result.success) {
        setFeedback({
          type: "success",
          message: "Instruction rule deleted successfully.",
        });
        setDeleteConfirmId(null);
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to delete instruction rule.",
        });
      }
    });
  };

  const handleToggleStatus = (id: string, currentPublished: boolean) => {
    setFeedback(null);
    startTransition(async () => {
      const result = await toggleGeneralInstructionStatusAction({
        id,
        isPublished: !currentPublished,
      });

      if (result.success) {
        setFeedback({
          type: "success",
          message: `Instruction rule ${!currentPublished ? "published" : "hidden as draft"}.`,
        });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to update instruction status.",
        });
      }
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= instructions.length) return;

    const reordered = [...instructions];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const items = reordered.map((inst, idx) => ({
      id: inst.id,
      displayOrder: idx + 1,
    }));

    setFeedback(null);
    startTransition(async () => {
      const result = await reorderGeneralInstructionsAction({ items });
      if (result.success) {
        setFeedback({
          type: "success",
          message: "Instruction rules display order updated.",
        });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to reorder instruction rules.",
        });
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Action Bar */}
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
            Code of Conduct & Guidelines Rules
          </h2>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "var(--muted-foreground, #64748b)" }}>
            Total rules: {instructions.length} ({instructions.filter((i) => i.isPublished).length} published,{" "}
            {instructions.filter((i) => i.isCritical).length} critical)
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Category Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            <Filter size={15} style={{ color: "var(--muted-foreground, #64748b)" }} />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              style={{
                padding: "0.45rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid var(--border, #e2e8f0)",
                fontSize: "0.8125rem",
                background: "var(--card, #ffffff)",
                color: "var(--foreground, #0f172a)",
              }}
            >
              <option value="ALL">All Categories ({instructions.length})</option>
              {ALLOWED_INSTRUCTION_CATEGORIES.map((cat) => {
                const count = instructions.filter((i) => i.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Add Rule Button */}
          <button
            type="button"
            onClick={openCreateDialog}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              borderRadius: "6px",
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <Plus size={16} />
            <span>Add Rule</span>
          </button>
        </div>
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

      {/* Table Container */}
      <div
        style={{
          border: "1px solid var(--border, #e2e8f0)",
          borderRadius: "8px",
          background: "var(--card, #ffffff)",
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--border, #e2e8f0)",
                background: "var(--muted, #f8fafc)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--muted-foreground, #64748b)",
              }}
            >
              <th style={{ padding: "0.75rem 1rem", width: "70px" }}>Order</th>
              <th style={{ padding: "0.75rem 1rem", width: "45px" }}>#</th>
              <th style={{ padding: "0.75rem 1rem" }}>Rule Text</th>
              <th style={{ padding: "0.75rem 1rem", width: "190px" }}>Category</th>
              <th style={{ padding: "0.75rem 1rem", width: "110px", textAlign: "center" }}>Critical</th>
              <th style={{ padding: "0.75rem 1rem", width: "100px", textAlign: "center" }}>Status</th>
              <th style={{ padding: "0.75rem 1rem", width: "140px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstructions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "3rem 1rem",
                    textAlign: "center",
                    color: "var(--muted-foreground, #64748b)",
                  }}
                >
                  No instruction rules found for the selected category.
                </td>
              </tr>
            ) : (
              filteredInstructions.map((inst) => {
                const globalIndex = instructions.findIndex((i) => i.id === inst.id);
                return (
                  <tr
                    key={inst.id}
                    style={{
                      borderBottom: "1px solid var(--border, #e2e8f0)",
                      background: inst.isCritical ? "rgba(254, 242, 242, 0.4)" : "transparent",
                    }}
                  >
                    {/* Reorder Buttons */}
                    <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        <button
                          type="button"
                          disabled={isPending || globalIndex === 0}
                          onClick={() => handleMove(globalIndex, "up")}
                          aria-label={`Move rule ${globalIndex + 1} up`}
                          style={{
                            padding: "0.25rem",
                            borderRadius: "4px",
                            border: "1px solid var(--border, #e2e8f0)",
                            background: "transparent",
                            cursor: isPending || globalIndex === 0 ? "not-allowed" : "pointer",
                            opacity: globalIndex === 0 ? 0.3 : 1,
                          }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={isPending || globalIndex === instructions.length - 1}
                          onClick={() => handleMove(globalIndex, "down")}
                          aria-label={`Move rule ${globalIndex + 1} down`}
                          style={{
                            padding: "0.25rem",
                            borderRadius: "4px",
                            border: "1px solid var(--border, #e2e8f0)",
                            background: "transparent",
                            cursor:
                              isPending || globalIndex === instructions.length - 1
                                ? "not-allowed"
                                : "pointer",
                            opacity: globalIndex === instructions.length - 1 ? 0.3 : 1,
                          }}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Rule Number */}
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        fontWeight: 700,
                        color: "var(--muted-foreground, #64748b)",
                      }}
                    >
                      {globalIndex + 1}
                    </td>

                    {/* Rule Text */}
                    <td style={{ padding: "0.75rem 1rem", maxWidth: "460px" }}>
                      <div
                        style={{
                          fontWeight: 500,
                          color: "var(--foreground, #0f172a)",
                          lineHeight: "1.45",
                          wordBreak: "break-word",
                        }}
                      >
                        {inst.ruleText}
                      </div>
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--muted-foreground, #94a3b8)",
                          marginTop: "0.25rem",
                        }}
                      >
                        Slug: {inst.slug}
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          border: "1px solid #bfdbfe",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {inst.category}
                      </span>
                    </td>

                    {/* Critical Flag */}
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                      {inst.isCritical ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "9999px",
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            background: "#fef2f2",
                            color: "#dc2626",
                            border: "1px solid #fecaca",
                          }}
                        >
                          <ShieldAlert size={12} />
                          CRITICAL
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "9999px",
                            fontSize: "0.6875rem",
                            fontWeight: 500,
                            background: "#f8fafc",
                            color: "#64748b",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <ShieldCheck size={12} />
                          Standard
                        </span>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleToggleStatus(inst.id, inst.isPublished)}
                        aria-label={inst.isPublished ? "Hide as draft" : "Publish rule"}
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.625rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: isPending ? "not-allowed" : "pointer",
                          border: "none",
                          background: inst.isPublished ? "#dcfce7" : "#f1f5f9",
                          color: inst.isPublished ? "#15803d" : "#64748b",
                        }}
                      >
                        {inst.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "inline-flex", gap: "0.375rem" }}>
                        <button
                          type="button"
                          onClick={() => openEditDialog(inst)}
                          aria-label={`Edit rule ${globalIndex + 1}`}
                          style={{
                            padding: "0.375rem",
                            borderRadius: "4px",
                            border: "1px solid var(--border, #e2e8f0)",
                            background: "transparent",
                            cursor: "pointer",
                            color: "var(--foreground, #0f172a)",
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(inst.id)}
                          aria-label={`Delete rule ${globalIndex + 1}`}
                          style={{
                            padding: "0.375rem",
                            borderRadius: "4px",
                            border: "1px solid #fecaca",
                            background: "#fef2f2",
                            cursor: "pointer",
                            color: "#dc2626",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Dialog Modal */}
      {isDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="instruction-dialog-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0, 0, 0, 0.5)",
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
              borderRadius: "8px",
              width: "100%",
              maxWidth: "600px",
              border: "1px solid var(--border, #e2e8f0)",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
              maxHeight: "90vh",
              overflowY: "auto",
              boxSizing: "border-box",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3
                  id="instruction-dialog-title"
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    margin: 0,
                    color: "var(--foreground, #0f172a)",
                  }}
                >
                  {editingInstruction ? "Edit Code of Conduct Rule" : "Add Code of Conduct Rule"}
                </h3>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8125rem", color: "var(--muted-foreground, #64748b)" }}>
                  Institutional student and guardian guideline statement.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                aria-label="Close dialog"
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  color: "var(--muted-foreground, #64748b)",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Rule Text */}
            <div>
              <label
                htmlFor="dialog-ruleText"
                style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
              >
                Rule Statement / Policy Text <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                id="dialog-ruleText"
                value={ruleText}
                onChange={(e) => setRuleText(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Enter the official school instruction or rule statement..."
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid var(--border, #e2e8f0)",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  color: "var(--muted-foreground, #64748b)",
                  marginTop: "0.25rem",
                }}
              >
                <span>Min 3, Max 1000 characters</span>
                <span>{ruleText.length} / 1000</span>
              </div>
              {formErrors.ruleText && (
                <p style={{ color: "#dc2626", fontSize: "0.75rem", margin: "0.25rem 0 0 0" }}>
                  {formErrors.ruleText.join(", ")}
                </p>
              )}
            </div>

            {/* Category Dropdown */}
            <div>
              <label
                htmlFor="dialog-category"
                style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
              >
                Category <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                id="dialog-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as AllowedInstructionCategory)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: "1px solid var(--border, #e2e8f0)",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                  background: "var(--card, #ffffff)",
                }}
              >
                {ALLOWED_INSTRUCTION_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <p style={{ color: "#dc2626", fontSize: "0.75rem", margin: "0.25rem 0 0 0" }}>
                  {formErrors.category.join(", ")}
                </p>
              )}
            </div>

            {/* Critical Flag Checkbox */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "0.75rem",
                borderRadius: "6px",
                background: isCritical ? "#fef2f2" : "#f8fafc",
                border: `1px solid ${isCritical ? "#fecaca" : "#e2e8f0"}`,
              }}
            >
              <input
                id="dialog-isCritical"
                type="checkbox"
                checked={isCritical}
                onChange={(e) => setIsCritical(e.target.checked)}
                style={{ marginTop: "0.25rem", cursor: "pointer" }}
              />
              <label htmlFor="dialog-isCritical" style={{ cursor: "pointer", fontSize: "0.8125rem" }}>
                <span style={{ fontWeight: 600, color: isCritical ? "#dc2626" : "var(--foreground, #0f172a)" }}>
                  Mark as Critical / Mandatory Rule
                </span>
                <span
                  style={{
                    display: "block",
                    color: "var(--muted-foreground, #64748b)",
                    fontSize: "0.75rem",
                    marginTop: "0.125rem",
                  }}
                >
                  Critical rules are visually highlighted with warning badges and priority emphasis on public pages.
                </span>
              </label>
            </div>

            {/* Published Status Checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                id="dialog-isPublished"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              <label
                htmlFor="dialog-isPublished"
                style={{ cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500 }}
              >
                Published (visible on public General Instructions page)
              </label>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                marginTop: "0.5rem",
                borderTop: "1px solid var(--border, #e2e8f0)",
                paddingTop: "1rem",
              }}
            >
              <button
                type="button"
                onClick={closeDialog}
                disabled={isPending}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  border: "1px solid var(--border, #e2e8f0)",
                  background: "transparent",
                  fontSize: "0.875rem",
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
                  gap: "0.5rem",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "6px",
                  border: "none",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                <span>{editingInstruction ? "Update Rule" : "Create Rule"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-desc"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0, 0, 0, 0.5)",
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
              borderRadius: "8px",
              width: "100%",
              maxWidth: "440px",
              border: "1px solid var(--border, #e2e8f0)",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#dc2626" }}>
              <AlertTriangle size={24} />
              <h3 id="delete-dialog-title" style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                Delete Instruction Rule?
              </h3>
            </div>
            <p
              id="delete-dialog-desc"
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "var(--muted-foreground, #64748b)",
                lineHeight: "1.5",
              }}
            >
              Are you sure you want to permanently delete this instruction rule? This action cannot be undone and will
              be recorded in the audit log.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isPending}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  border: "1px solid var(--border, #e2e8f0)",
                  background: "transparent",
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
                  padding: "0.5rem 1.25rem",
                  borderRadius: "6px",
                  border: "none",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                <span>Delete Rule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
