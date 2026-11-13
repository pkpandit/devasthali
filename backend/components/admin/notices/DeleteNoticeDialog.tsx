"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { deleteNoticeAction } from "@/lib/server/notice-actions";
import type { SerializedNotice } from "./NoticeFormDialog";

interface DeleteNoticeDialogProps {
  isOpen: boolean;
  notice?: SerializedNotice | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface DeleteNoticeDialogInnerProps {
  notice: SerializedNotice;
  onClose: () => void;
  onSuccess: () => void;
}

function DeleteNoticeDialogInner({
  notice,
  onClose,
  onSuccess,
}: DeleteNoticeDialogInnerProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  const handleDelete = () => {
    if (isPending) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await deleteNoticeAction(null, { id: notice.id });
        if (res && res.success) {
          onSuccess();
          onClose();
        } else {
          setError(
            res?.error ||
              "Failed to delete the notice. The record was not removed."
          );
        }
      } catch (err) {
        console.error("[DeleteNoticeDialog] Deletion failed:", err);
        setError(
          "An unexpected communication or server error occurred. Please try again."
        );
      }
    });
  };

  return (
    <div
      className="topper-dialog-container topper-dialog-container--danger"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-notice-dialog-title"
      aria-describedby="delete-notice-dialog-desc"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="topper-delete-icon-wrapper" aria-hidden="true">
        <AlertTriangle size={24} className="text-red-600" />
      </div>

      <div className="topper-dialog-header">
        <h2 id="delete-notice-dialog-title" className="topper-dialog-title text-red-900">
          Permanently Delete Notice?
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

      <div id="delete-notice-dialog-desc" className="topper-dialog-body space-y-2">
        <p className="text-sm text-slate-700">
          Are you sure you want to delete the notice:{" "}
          <strong className="text-slate-900">{notice.title}</strong>?
        </p>
        <div className="topper-delete-warning-box text-xs text-red-800 bg-red-50 p-3 rounded border border-red-200">
          <strong>Warning:</strong> This permanently removes the notice and slug reference from the database. This action cannot be undone and will be logged in the security audit trail.
        </div>
      </div>

      <div className="topper-dialog-actions mt-4">
        <button
          ref={cancelButtonRef}
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="topper-button topper-button--secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="topper-button topper-button--danger"
        >
          {isPending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
          <span>Delete Permanently</span>
        </button>
      </div>
    </div>
  );
}

export function DeleteNoticeDialog({
  isOpen,
  notice,
  onClose,
  onSuccess,
}: DeleteNoticeDialogProps) {
  if (!isOpen || !notice) return null;

  return (
    <div className="topper-dialog-backdrop" onClick={onClose}>
      <DeleteNoticeDialogInner
        notice={notice}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
