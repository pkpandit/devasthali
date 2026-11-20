"use client";

import { useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  deleteFacilityCategoryAction,
  deleteFacilityItemAction,
} from "@/lib/server/facility-actions";

export interface DeleteFacilityTarget {
  type: "category" | "item";
  id: string;
  title: string;
  itemCount?: number;
}

interface DeleteFacilityDialogProps {
  isOpen: boolean;
  target: DeleteFacilityTarget | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteFacilityDialog({
  isOpen,
  target,
  onClose,
  onSuccess,
}: DeleteFacilityDialogProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !target) return null;

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const res =
          target.type === "category"
            ? await deleteFacilityCategoryAction({ id: target.id })
            : await deleteFacilityItemAction({ id: target.id });

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          alert(res.error || "Failed to delete facility item.");
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
        aria-labelledby="delete-facility-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-dialog-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={20} color="#dc2626" aria-hidden="true" />
            <h2 id="delete-facility-dialog-title" style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#111827" }}>
              Delete Facility {target.type === "category" ? "Category" : "Item"}
            </h2>
          </div>
        </div>

        <div className="admin-dialog-body" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151", lineHeight: 1.6 }}>
            Are you sure you want to permanently delete <strong>&ldquo;{target.title}&rdquo;</strong>?
          </p>
          {target.type === "category" && (
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "#b91c1c", fontWeight: 600 }}>
              Warning: Deleting this category will permanently cascade delete all {target.itemCount !== undefined ? target.itemCount : ""} facility items contained within it and safely remove their unreferenced managed images.
            </p>
          )}
          <p style={{ margin: 0, fontSize: "0.8125rem", color: "#6b7280" }}>
            This action cannot be undone. An audit log record will be permanently retained.
          </p>
        </div>

        <div className="admin-dialog-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
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
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Permanently</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
