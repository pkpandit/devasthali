"use client";

import { useTransition, useState } from "react";
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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const typeName =
    targetType === "ITEM"
      ? "navigation item"
      : targetType === "COLUMN"
      ? "dropdown column"
      : "link";

  const handleConfirm = () => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-nav-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6 text-gray-900">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 id="delete-nav-title" className="text-lg font-bold">
              Delete {typeName.charAt(0).toUpperCase() + typeName.slice(1)}?
            </h3>
            <p className="text-xs text-gray-500">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          Are you sure you want to remove{" "}
          <strong className="text-gray-900 font-semibold">&ldquo;{targetLabel}&rdquo;</strong> from
          the navigation menu?
        </p>

        {targetType === "ITEM" && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 mb-4 leading-relaxed">
            <strong>Important:</strong> Deleting this item will also remove all child columns and links inside it. Destination pages, documents, and content are unaffected.
          </div>
        )}

        {targetType === "COLUMN" && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 mb-4 leading-relaxed">
            <strong>Important:</strong> Deleting this column will also remove all links inside it.
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
