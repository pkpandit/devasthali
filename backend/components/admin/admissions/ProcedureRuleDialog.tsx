"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save, FileText, AlertCircle } from "lucide-react";
import {
  createAdmissionProcedureRuleAction,
  updateAdmissionProcedureRuleAction,
} from "@/lib/server/admissions-publication-actions";

export interface SerializedProcedureRule {
  id: string;
  ruleText: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProcedureRuleDialogProps {
  isOpen: boolean;
  rule: SerializedProcedureRule | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProcedureRuleDialog({
  isOpen,
  rule,
  onClose,
  onSuccess,
}: ProcedureRuleDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [ruleText, setRuleText] = useState(rule?.ruleText ?? "");
  const [displayOrder, setDisplayOrder] = useState<number>(rule?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(rule?.isPublished ?? true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        let res;
        if (rule) {
          res = await updateAdmissionProcedureRuleAction({
            id: rule.id,
            ruleText: ruleText.trim(),
            displayOrder: Number(displayOrder),
            isPublished,
          });
        } else {
          res = await createAdmissionProcedureRuleAction({
            ruleText: ruleText.trim(),
            displayOrder: Number(displayOrder),
            isPublished,
          });
        }

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Failed to save admission procedure rule.");
        }
      } catch (err) {
        console.error("Save procedure rule error:", err);
        setError("An unexpected error occurred while saving.");
      }
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 50,
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
          width: "100%",
          maxWidth: "560px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileText size={20} style={{ color: "#b91c1c" }} />
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#111827" }}>
              {rule ? "Edit Admission Procedure Rule" : "Add Admission Procedure Rule"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
              padding: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#991b1b",
                fontSize: "13px",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="rule-text-input"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
            >
              Rule Text / Guideline *
            </label>
            <textarea
              id="rule-text-input"
              rows={4}
              required
              placeholder="e.g. Before admission child’s name has to be registered in advance..."
              value={ruleText}
              onChange={(e) => setRuleText(e.target.value)}
              className="admin-input"
              style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label
                htmlFor="rule-order-input"
                style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
              >
                Display Order
              </label>
              <input
                id="rule-order-input"
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                className="admin-input"
                style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", paddingTop: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <span>Published on public site</span>
              </label>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="admin-button admin-button--secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="admin-button admin-button--primary"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} aria-hidden="true" />
                  <span>{rule ? "Update Rule" : "Create Rule"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
