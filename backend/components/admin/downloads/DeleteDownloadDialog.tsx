"use client";

import { useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  deleteDownloadCategoryAction,
  deleteDownloadDocumentAction,
} from "@/lib/server/download-actions";

export interface DeleteTarget {
  type: "category" | "document";
  id: string;
  title: string;
}

interface DeleteDownloadDialogProps {
  isOpen: boolean;
  target: DeleteTarget | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteDownloadDialog({
  isOpen,
  target,
  onClose,
  onSuccess,
}: DeleteDownloadDialogProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !target) return null;

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const res =
          target.type === "category"
            ? await deleteDownloadCategoryAction(null, { id: target.id })
            : await deleteDownloadDocumentAction(null, { id: target.id });

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
    >
      <div
        className="admin-dialog-container admin-dialog-container--danger"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dialog-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={20} color="#dc2626" aria-hidden="true" />
            <h2 id="delete-dialog-title" style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#111827" }}>
              Delete {target.type === "category" ? "Category" : "Document"}
            </h2>
          </div>
        </div>

        <div className="admin-dialog-body">
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151", lineHeight: 1.6 }}>
            Are you sure you want to permanently delete <strong>&ldquo;{target.title}&rdquo;</strong>?
          </p>
          {target.type === "category" && (
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "#b91c1c", fontWeight: 600 }}>
              Warning: Deleting this category will permanently cascade and remove all documents contained within it.
            </p>
          )}
          <p style={{ margin: 0, fontSize: "0.8125rem", color: "#6b7280" }}>
            This action cannot be undone. An audit log entry will be permanently recorded.
          </p>
        </div>

        <div className="admin-dialog-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="admin-button admin-button--secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="admin-button admin-button--danger"
          >
            {isPending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            <span>{isPending ? "Deleting..." : "Delete Permanently"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
