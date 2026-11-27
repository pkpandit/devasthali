"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Sparkles,
  AlertCircle,
  Table as TableIcon,
} from "lucide-react";
import {
  ProcedureRuleDialog,
  type SerializedProcedureRule,
} from "./ProcedureRuleDialog";
import {
  EntranceSubjectDialog,
  type SerializedEntranceSubject,
} from "./EntranceSubjectDialog";
import {
  toggleAdmissionProcedureRuleStatusAction,
  deleteAdmissionProcedureRuleAction,
  reorderAdmissionProcedureRulesAction,
  toggleEntranceExamSubjectStatusAction,
  deleteEntranceExamSubjectAction,
  reorderEntranceExamSubjectsAction,
} from "@/lib/server/admissions-publication-actions";

interface ProcedureWorkspaceProps {
  rules: SerializedProcedureRule[];
  entranceSubjects: SerializedEntranceSubject[];
}

export function ProcedureWorkspace({
  rules,
  entranceSubjects,
}: ProcedureWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<SerializedProcedureRule | null>(null);

  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SerializedEntranceSubject | null>(null);

  // Delete confirm state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "rule" | "subject";
    id: string;
    label: string;
  } | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);

  const handleRefresh = () => {
    router.refresh();
  };

  // Rule Actions
  const handleToggleRule = (rule: SerializedProcedureRule) => {
    setActionError(null);
    startTransition(async () => {
      try {
        const res = await toggleAdmissionProcedureRuleStatusAction({
          id: rule.id,
          isPublished: !rule.isPublished,
        });
        if (res.success) {
          handleRefresh();
        } else {
          setActionError(res.error || "Failed to toggle rule status.");
        }
      } catch (err) {
        console.error("Toggle rule error:", err);
        setActionError("An unexpected error occurred.");
      }
    });
  };

  const handleMoveRule = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rules.length) return;

    const items = [...rules];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);

    const reordered = items.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    setActionError(null);
    startTransition(async () => {
      try {
        const res = await reorderAdmissionProcedureRulesAction({ items: reordered });
        if (res.success) {
          handleRefresh();
        } else {
          setActionError(res.error || "Failed to reorder rules.");
        }
      } catch (err) {
        console.error("Reorder rules error:", err);
        setActionError("An unexpected error occurred.");
      }
    });
  };

  // Subject Actions
  const handleToggleSubject = (subject: SerializedEntranceSubject) => {
    setActionError(null);
    startTransition(async () => {
      try {
        const res = await toggleEntranceExamSubjectStatusAction({
          id: subject.id,
          isPublished: !subject.isPublished,
        });
        if (res.success) {
          handleRefresh();
        } else {
          setActionError(res.error || "Failed to toggle subject status.");
        }
      } catch (err) {
        console.error("Toggle subject error:", err);
        setActionError("An unexpected error occurred.");
      }
    });
  };

  const handleMoveSubject = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= entranceSubjects.length) return;

    const items = [...entranceSubjects];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);

    const reordered = items.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    setActionError(null);
    startTransition(async () => {
      try {
        const res = await reorderEntranceExamSubjectsAction({ items: reordered });
        if (res.success) {
          handleRefresh();
        } else {
          setActionError(res.error || "Failed to reorder subjects.");
        }
      } catch (err) {
        console.error("Reorder subjects error:", err);
        setActionError("An unexpected error occurred.");
      }
    });
  };

  // Delete Action
  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    setActionError(null);

    startTransition(async () => {
      try {
        let res;
        if (deleteConfirm.type === "rule") {
          res = await deleteAdmissionProcedureRuleAction({ id: deleteConfirm.id });
        } else {
          res = await deleteEntranceExamSubjectAction({ id: deleteConfirm.id });
        }

        if (res.success) {
          setDeleteConfirm(null);
          handleRefresh();
        } else {
          setActionError(res.error || "Failed to delete record.");
        }
      } catch (err) {
        console.error("Delete error:", err);
        setActionError("An unexpected error occurred.");
      }
    });
  };

  const publishedRulesCount = rules.filter((r) => r.isPublished).length;
  const publishedSubjectsCount = entranceSubjects.filter((s) => s.isPublished).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", width: "100%" }}>
      {/* Overview Banner */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "9999px", backgroundColor: "#fef2f2", color: "#b91c1c", fontSize: "12px", fontWeight: 700, marginBottom: "8px" }}>
              <Sparkles size={14} />
              <span>Admissions / Guidelines &amp; Entrance</span>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 6px 0", color: "#111827" }}>
              Admission Procedure &amp; Entrance Examination Management
            </h2>
            <p style={{ fontSize: "14px", color: "#4b5563", margin: "0 0 12px 0", maxWidth: "680px" }}>
              Manage registration rules, demand draft instructions, transfer certificate guidelines, and the entrance examination subject schedule displayed on /admissions/procedure.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", fontSize: "13px", color: "#6b7280" }}>
              <span>
                Procedure Rules: <strong>{rules.length}</strong> ({publishedRulesCount} published)
              </span>
              <span>
                Entrance Subject Rows: <strong>{entranceSubjects.length}</strong> ({publishedSubjectsCount} published)
              </span>
            </div>
          </div>
        </div>
      </div>

      {actionError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#991b1b",
            fontSize: "14px",
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{actionError}</span>
        </div>
      )}

      {/* SECTION 1: Admission Procedure Rules */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#111827" }}>
              1. Registration &amp; Eligibility Rules ({rules.length})
            </h3>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              Rendered as checked guidelines under Section 1 on /admissions/procedure
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedRule(null);
              setIsRuleDialogOpen(true);
            }}
            className="admin-button admin-button--primary"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} />
            <span>Add Rule</span>
          </button>
        </div>

        {rules.length === 0 ? (
          <div style={{ padding: "36px 24px", textAlign: "center", color: "#6b7280" }}>
            <FileText size={36} style={{ margin: "0 auto 8px auto", color: "#9ca3af" }} />
            <p style={{ margin: 0 }}>No procedure rules configured. Click &quot;Add Rule&quot; to create one.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
              <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <tr>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151", width: "80px" }}>Order</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151" }}>Rule Text</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151", width: "110px" }}>Status</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151", textAlign: "right", width: "160px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, index) => (
                  <tr key={rule.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => handleMoveRule(index, "up")}
                          disabled={index === 0 || isPending}
                          title="Move up"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: index === 0 ? "not-allowed" : "pointer",
                            opacity: index === 0 ? 0.3 : 1,
                            padding: "2px",
                            color: "#4b5563",
                          }}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveRule(index, "down")}
                          disabled={index === rules.length - 1 || isPending}
                          title="Move down"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: index === rules.length - 1 ? "not-allowed" : "pointer",
                            opacity: index === rules.length - 1 ? 0.3 : 1,
                            padding: "2px",
                            color: "#4b5563",
                          }}
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#111827", lineHeight: 1.5 }}>
                      {rule.ruleText}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          fontSize: "12px",
                          fontWeight: 600,
                          backgroundColor: rule.isPublished ? "#dcfce7" : "#f3f4f6",
                          color: rule.isPublished ? "#166534" : "#4b5563",
                        }}
                      >
                        {rule.isPublished ? "Published" : "Hidden"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleRule(rule)}
                          disabled={isPending}
                          title={rule.isPublished ? "Hide from public view" : "Publish rule"}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            color: rule.isPublished ? "#16a34a" : "#9ca3af",
                          }}
                        >
                          {rule.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRule(rule);
                            setIsRuleDialogOpen(true);
                          }}
                          disabled={isPending}
                          title="Edit rule"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            color: "#2563eb",
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm({
                              type: "rule",
                              id: rule.id,
                              label: rule.ruleText.slice(0, 40) + "...",
                            })
                          }
                          disabled={isPending}
                          title="Delete rule"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            color: "#dc2626",
                          }}
                        >
                          <Trash2 size={16} />
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

      {/* SECTION 2: Entrance Exam Subjects Table */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#111827" }}>
              2. Subject For Entrance Examination ({entranceSubjects.length})
            </h3>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              Rendered in the two-column table on /admissions/procedure
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedSubject(null);
              setIsSubjectDialogOpen(true);
            }}
            className="admin-button admin-button--primary"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Plus size={16} />
            <span>Add Subject Row</span>
          </button>
        </div>

        {entranceSubjects.length === 0 ? (
          <div style={{ padding: "36px 24px", textAlign: "center", color: "#6b7280" }}>
            <TableIcon size={36} style={{ margin: "0 auto 8px auto", color: "#9ca3af" }} />
            <p style={{ margin: 0 }}>No entrance exam subjects configured. Click &quot;Add Subject Row&quot; to create one.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
              <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <tr>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151", width: "80px" }}>Order</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151", width: "240px" }}>Class / Group</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151" }}>Examination Subjects</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151", width: "110px" }}>Status</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151", textAlign: "right", width: "160px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entranceSubjects.map((sub, index) => (
                  <tr key={sub.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => handleMoveSubject(index, "up")}
                          disabled={index === 0 || isPending}
                          title="Move up"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: index === 0 ? "not-allowed" : "pointer",
                            opacity: index === 0 ? 0.3 : 1,
                            padding: "2px",
                            color: "#4b5563",
                          }}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSubject(index, "down")}
                          disabled={index === entranceSubjects.length - 1 || isPending}
                          title="Move down"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: index === entranceSubjects.length - 1 ? "not-allowed" : "pointer",
                            opacity: index === entranceSubjects.length - 1 ? 0.3 : 1,
                            padding: "2px",
                            color: "#4b5563",
                          }}
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#111827" }}>
                      {sub.classGrade}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#374151", fontWeight: 500 }}>
                      {sub.subjects}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          fontSize: "12px",
                          fontWeight: 600,
                          backgroundColor: sub.isPublished ? "#dcfce7" : "#f3f4f6",
                          color: sub.isPublished ? "#166534" : "#4b5563",
                        }}
                      >
                        {sub.isPublished ? "Published" : "Hidden"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleSubject(sub)}
                          disabled={isPending}
                          title={sub.isPublished ? "Hide from public view" : "Publish row"}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            color: sub.isPublished ? "#16a34a" : "#9ca3af",
                          }}
                        >
                          {sub.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSubject(sub);
                            setIsSubjectDialogOpen(true);
                          }}
                          disabled={isPending}
                          title="Edit row"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            color: "#2563eb",
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm({
                              type: "subject",
                              id: sub.id,
                              label: `${sub.classGrade}: ${sub.subjects}`,
                            })
                          }
                          disabled={isPending}
                          title="Delete row"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            color: "#dc2626",
                          }}
                        >
                          <Trash2 size={16} />
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px 0", color: "#111827" }}>
              Delete {deleteConfirm.type === "rule" ? "Procedure Rule" : "Subject Row"}?
            </h3>
            <p style={{ fontSize: "14px", color: "#4b5563", margin: "0 0 20px 0" }}>
              Are you sure you want to delete &quot;{deleteConfirm.label}&quot;? This item will no longer appear on the public website.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={isPending}
                className="admin-button admin-button--secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="admin-button admin-button--primary"
                style={{ backgroundColor: "#dc2626", borderColor: "#dc2626" }}
              >
                {isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rule Dialog */}
      <ProcedureRuleDialog
        isOpen={isRuleDialogOpen}
        rule={selectedRule}
        onClose={() => {
          setIsRuleDialogOpen(false);
          setSelectedRule(null);
        }}
        onSuccess={handleRefresh}
      />

      {/* Subject Dialog */}
      <EntranceSubjectDialog
        isOpen={isSubjectDialogOpen}
        subject={selectedSubject}
        onClose={() => {
          setIsSubjectDialogOpen(false);
          setSelectedSubject(null);
        }}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
