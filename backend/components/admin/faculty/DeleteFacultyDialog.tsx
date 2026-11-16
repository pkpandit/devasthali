"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteFacultyDialogProps {
  isOpen: boolean;
  title: string;
  itemDescription: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteFacultyDialog({
  isOpen,
  title,
  itemDescription,
  onClose,
  onConfirm,
}: DeleteFacultyDialogProps) {
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
      <DeleteFacultyDialogInner
        title={title}
        itemDescription={itemDescription}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </div>
  );
}

function DeleteFacultyDialogInner({
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
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="topper-delete-icon-wrapper" aria-hidden="true">
        <AlertTriangle size={24} style={{ color: "#dc2626" }} />
      </div>

      <div className="topper-dialog-header">
        <h2 id="delete-dialog-title" className="topper-dialog-title" style={{ color: "#7f1d1d" }}>
          {title}
        </h2>
        <p id="delete-dialog-desc" className="topper-dialog-description">
          Are you sure you want to permanently delete {itemDescription}? This action removes the educator from public listings and cannot be undone.
        </p>
      </div>

      {error && (
        <div className="admin-banner--warning" role="alert">
          {error}
        </div>
      )}

      <div className="topper-dialog-actions">
        <button
          ref={cancelButtonRef}
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="admin-button admin-button--secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className="admin-button admin-button--danger"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Deleting...</span>
            </>
          ) : (
            <span>Delete Member</span>
          )}
        </button>
      </div>
    </div>
  );
}
