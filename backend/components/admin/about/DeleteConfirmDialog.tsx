"use client";

import { useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#B91C1C] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="delete-dialog-title" className="text-lg font-heading font-bold text-gray-900">
                {title}
              </h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                This action will remove the record from the database.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600 font-sans">
            Are you sure you want to delete <strong className="text-gray-900">&quot;{itemDescription}&quot;</strong>? This cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-sm font-heading font-bold bg-[#B91C1C] text-white hover:bg-[#991b1b] transition-colors disabled:opacity-50 inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Record</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
