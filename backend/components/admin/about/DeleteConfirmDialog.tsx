"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  itemDescription: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmDialog({
  isOpen,
  title,
  itemDescription,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
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

  if (!isOpen) return null;

  return (
    <div className="topper-dialog-backdrop" onClick={onClose}>
      <DeleteConfirmDialogInner
        title={title}
        itemDescription={itemDescription}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </div>
  );
}

function DeleteConfirmDialogInner({
  title,
  itemDescription,
  onClose,
  onConfirm,
}: {
  title: string;
  itemDescription: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  const handleConfirm = () => {
    if (isPending) return;
    setError(null);

    startTransition(async () => {
      try {
        await onConfirm();
        onClose();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected communication error occurred. The record was not removed."
        );
      }
    });
  };

  return (
    <div
      className="topper-dialog-container topper-dialog-container--danger"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-dialog-title"
      aria-describedby="delete-confirm-dialog-desc"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="topper-delete-icon-wrapper" aria-hidden="true">
        <AlertTriangle size={24} className="text-red-600" />
      </div>

      <div className="topper-dialog-header">
        <h2 id="delete-confirm-dialog-title" className="topper-dialog-title text-red-900">
          {title}
        </h2>
      </div>

      {error && (
        <div className="topper-dialog-error-banner" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <div id="delete-confirm-dialog-desc" className="topper-dialog-body space-y-2">
        <p className="text-sm text-slate-700">
          Are you sure you want to delete <strong className="text-slate-900">&ldquo;{itemDescription}&rdquo;</strong>?
        </p>
        <div className="topper-delete-warning-box text-xs text-red-800 bg-red-50 p-3 rounded border border-red-200">
          <strong>Warning:</strong> This performs an irreversible hard delete from the
          database. This action cannot be undone.
        </div>
      </div>

      <div className="topper-dialog-actions mt-6">
        <button
          ref={cancelButtonRef}
          type="button"
          className="topper-button topper-button--secondary min-h-[44px]"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="button"
          className="topper-button topper-button--danger min-h-[44px]"
          onClick={handleConfirm}
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
