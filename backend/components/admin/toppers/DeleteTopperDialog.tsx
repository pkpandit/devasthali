"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { deleteTopperAction } from "@/lib/server/topper-actions";
import type { SerializedTopper } from "./TopperFormDialog";

interface DeleteTopperDialogProps {
  isOpen: boolean;
  topper?: SerializedTopper | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface DeleteTopperDialogInnerProps {
  topper: SerializedTopper;
  onClose: () => void;
  onSuccess: () => void;
}

function DeleteTopperDialogInner({
  topper,
  onClose,
  onSuccess,
}: DeleteTopperDialogInnerProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Safe default action: Auto-focus Cancel button upon mount
  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  const handleDelete = () => {
    if (isPending) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await deleteTopperAction({ id: topper.id });
        if (res && res.success) {
          onSuccess();
          onClose();
        } else {
          setError(
            res?.error ||
              "Failed to delete the merit record. The record was not removed."
          );
        }
      } catch (err) {
        console.error("[DeleteTopperDialog] Deletion request failed:", err);
        setError(
          "An unexpected communication or server error occurred. The record was not removed. Please try again."
        );
      }
    });
  };

  return (
    <div
      className="topper-dialog-container topper-dialog-container--danger"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="topper-delete-icon-wrapper" aria-hidden="true">
        <AlertTriangle size={24} className="text-red-600" />
      </div>

      <div className="topper-dialog-header">
        <h2 id="delete-dialog-title" className="topper-dialog-title text-red-900">
          Permanently Delete Merit Record?
        </h2>
      </div>

      {error && (
        <div
          className="topper-dialog-error-banner"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      <div id="delete-dialog-desc" className="topper-dialog-body space-y-2">
        <p className="text-sm text-slate-700">
          Are you sure you want to delete the record for{" "}
          <strong className="text-slate-900">{topper.studentName}</strong> (Grade:{" "}
          {topper.grade}, Session: {topper.academicYear})?
        </p>
        <div className="topper-delete-warning-box text-xs text-red-800 bg-red-50 p-3 rounded border border-red-200">
          <strong>Warning:</strong> This performs an irreversible hard delete from the
          database. This action cannot be undone and will be recorded in the security audit
          log.
        </div>
      </div>

      <div className="topper-dialog-actions mt-6">
        <button
          ref={cancelButtonRef}
          type="button"
          className="topper-button topper-button--secondary"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="button"
          className="topper-button topper-button--danger"
          onClick={handleDelete}
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending && <Loader2 size={16} className="animate-spin mr-2" />}
          {isPending ? "Deleting..." : "Permanently Delete Record"}
        </button>
      </div>
    </div>
  );
}

export function DeleteTopperDialog({
  isOpen,
  topper,
  onClose,
  onSuccess,
}: DeleteTopperDialogProps) {
  // Handle Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !topper) return null;

  return (
    <div className="topper-dialog-backdrop" onClick={onClose}>
      <DeleteTopperDialogInner
        key={topper.id}
        topper={topper}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
