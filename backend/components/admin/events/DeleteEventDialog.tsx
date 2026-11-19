"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteEventDialogProps {
  isOpen: boolean;
  eventTitle: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteEventDialog({
  isOpen,
  eventTitle,
  isPending = false,
  onConfirm,
  onClose,
}: DeleteEventDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  return (
    <div className="topper-dialog-backdrop" onClick={!isPending ? onClose : undefined}>
      <div
        className="topper-dialog-container"
        style={{ maxWidth: "480px" }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-event-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="topper-dialog-header" style={{ borderBottomColor: "var(--color-danger-border, #fecaca)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#dc2626",
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <h2 id="delete-event-dialog-title" className="topper-dialog-title" style={{ color: "#991b1b" }}>
              Delete School Event
            </h2>
          </div>
        </div>

        <div className="topper-dialog-body">
          <p style={{ color: "var(--color-text-secondary, #4b5563)", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
            Are you sure you want to delete &quot;<strong>{eventTitle}</strong>&quot;? This event will be permanently removed from the schedule.
          </p>
        </div>

        <div className="topper-dialog-footer">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-danger"
            onClick={onConfirm}
            disabled={isPending}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
