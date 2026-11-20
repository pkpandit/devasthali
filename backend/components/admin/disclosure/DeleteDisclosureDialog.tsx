"use client";

import { useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  deleteDisclosureSectionAction,
  deleteDisclosureDocumentAction,
} from "@/lib/server/disclosure-actions";

export interface DeleteDisclosureTarget {
  type: "section" | "document";
  id: string;
  title: string;
}

interface DeleteDisclosureDialogProps {
  isOpen: boolean;
  target: DeleteDisclosureTarget | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteDisclosureDialog({
  isOpen,
  target,
  onClose,
  onSuccess,
}: DeleteDisclosureDialogProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !target) return null;

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const res =
          target.type === "section"
            ? await deleteDisclosureSectionAction({ id: target.id })
            : await deleteDisclosureDocumentAction({ id: target.id });

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          alert(res.error || "Failed to delete item.");
        }
      } catch (err) {
        console.error("Delete error:", err);
        alert("Unexpected error during deletion.");
      }
    });
  };

  return (
    <div
      className="admin-dialog-backdrop"
      onClick={onClose}
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        className="admin-dialog-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
          <div
            style={{
              padding: "10px",
              borderRadius: "12px",
              background: "#FEE2E2",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3
              id="delete-dialog-title"
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--foreground)",
                margin: "0 0 6px 0",
              }}
            >
              Confirm Deletion
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", margin: 0, lineHeight: 1.5 }}>
              Are you sure you want to delete {target.type === "section" ? "section" : "document"}{" "}
              <strong style={{ color: "var(--foreground)" }}>&quot;{target.title}&quot;</strong>?
              {target.type === "section" && (
                <span style={{ display: "block", marginTop: "8px", color: "#DC2626", fontWeight: 500 }}>
                  Warning: All compliance documents inside this section will also be deleted permanently.
                </span>
              )}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="admin-btn-secondary"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "#ffffff",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="admin-btn-danger"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#DC2626",
              color: "#ffffff",
              cursor: isPending ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
}
