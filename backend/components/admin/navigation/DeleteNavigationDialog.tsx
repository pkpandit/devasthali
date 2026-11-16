"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  deleteNavigationItemAction,
  deleteNavigationColumnAction,
  deleteNavigationLinkAction,
} from "@/lib/server/navigation-actions";

export type NavigationTargetType = "ITEM" | "COLUMN" | "LINK";

interface DeleteNavigationDialogProps {
  isOpen: boolean;
  targetType: NavigationTargetType;
  targetId: string;
  targetLabel: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteNavigationDialog({
  isOpen,
  targetType,
  targetId,
  targetLabel,
  onClose,
  onSuccess,
}: DeleteNavigationDialogProps) {
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
      <DeleteNavigationDialogInner
        targetType={targetType}
        targetId={targetId}
        targetLabel={targetLabel}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}

function DeleteNavigationDialogInner({
  targetType,
  targetId,
  targetLabel,
  onClose,
  onSuccess,
}: {
  targetType: NavigationTargetType;
  targetId: string;
  targetLabel: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  const typeName =
    targetType === "ITEM"
      ? "navigation item"
      : targetType === "COLUMN"
      ? "dropdown column"
      : "link";

  const handleConfirm = () => {
    if (isPending) return;
    setError(null);
    startTransition(async () => {
      try {
        let res;
        if (targetType === "ITEM") {
          res = await deleteNavigationItemAction(null, { id: targetId });
        } else if (targetType === "COLUMN") {
          res = await deleteNavigationColumnAction(null, { id: targetId });
        } else {
          res = await deleteNavigationLinkAction(null, { id: targetId });
        }

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || `Failed to delete ${typeName}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to delete ${typeName}`);
      }
    });
  };

  return (
    <div
      className="topper-dialog-container topper-dialog-container--danger"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-nav-title"
      aria-describedby="delete-nav-desc"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="topper-delete-icon-wrapper" aria-hidden="true">
        <AlertTriangle size={24} className="text-red-600" />
      </div>

      <div className="topper-dialog-header">
        <h2 id="delete-nav-title" className="topper-dialog-title text-red-900">
          Delete {typeName.charAt(0).toUpperCase() + typeName.slice(1)}?
        </h2>
      </div>

      {error && (
        <div className="topper-dialog-error-banner" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <div id="delete-nav-desc" className="topper-dialog-body space-y-3">
        <p className="text-sm text-slate-700">
          Are you sure you want to remove{" "}
          <strong className="text-slate-900 font-semibold">&ldquo;{targetLabel}&rdquo;</strong> from
          the navigation menu?
        </p>

        {targetType === "ITEM" && (
          <div className="topper-delete-warning-box text-xs text-amber-900 bg-amber-50 p-3 rounded border border-amber-200">
            <strong>Important:</strong> Deleting this item will also remove all child columns and links inside it. Destination pages, documents, and content are unaffected.
          </div>
        )}

        {targetType === "COLUMN" && (
          <div className="topper-delete-warning-box text-xs text-amber-900 bg-amber-50 p-3 rounded border border-amber-200">
            <strong>Important:</strong> Deleting this column will also remove all links inside it.
          </div>
        )}

        <div className="topper-delete-warning-box text-xs text-red-800 bg-red-50 p-3 rounded border border-red-200">
          <strong>Warning:</strong> This performs an irreversible hard delete from the database. This action cannot be undone.
        </div>
      </div>

      <div className="topper-dialog-actions mt-6">
        <button
          ref={cancelButtonRef}
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="topper-button topper-button--secondary min-h-[44px]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className="topper-button topper-button--danger min-h-[44px]"
          aria-busy={isPending}
        >
          {isPending && <Loader2 size={16} className="animate-spin mr-2" />}
          <span>{isPending ? "Deleting..." : "Permanently Delete"}</span>
        </button>
      </div>
    </div>
  );
}
