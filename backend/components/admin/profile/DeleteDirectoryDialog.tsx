"use client";

import { useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { deleteCampusDirectoryEntryAction } from "@/lib/server/profile-actions";
import type { SerializedDirectoryEntry } from "./DirectoryFormDialog";

interface DeleteDirectoryDialogProps {
  isOpen: boolean;
  entry: SerializedDirectoryEntry | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteDirectoryDialog({
  isOpen,
  entry,
  onClose,
  onSuccess,
}: DeleteDirectoryDialogProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !entry) return null;

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const res = await deleteCampusDirectoryEntryAction(null, { id: entry.id });
        if (res.success) {
          onSuccess();
          onClose();
        } else {
          alert(res.error || "Failed to delete directory contact.");
        }
      } catch (err) {
        console.error("Delete directory error:", err);
        alert("Unexpected error deleting directory contact.");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-200 overflow-hidden p-6 space-y-4">
        <div className="flex items-center gap-3 text-red-600">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 id="delete-dialog-title" className="text-lg font-bold font-heading text-gray-900">
              Delete Directory Contact
            </h3>
            <p className="text-xs text-gray-500">This action cannot be undone.</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl text-sm border border-gray-200/60 space-y-1">
          <p className="font-semibold text-gray-900">{entry.roleTitle}</p>
          {entry.contactName && <p className="text-gray-700">{entry.contactName}</p>}
          {entry.department && <p className="text-xs text-gray-500">{entry.department}</p>}
          <p className="text-xs font-mono text-gray-600 mt-1">{entry.phoneNumber}</p>
        </div>

        <p className="text-sm text-gray-600">
          Are you sure you want to delete this contact from the official campus directory?
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Confirm Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
