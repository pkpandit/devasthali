"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save } from "lucide-react";
import {
  createNavigationColumnAction,
  updateNavigationColumnAction,
} from "@/lib/server/navigation-actions";

export interface SerializedNavigationColumn {
  id: string;
  itemId: string;
  heading: string | null;
  displayOrder: number;
  isPublished: boolean;
}

interface ColumnFormDialogProps {
  isOpen: boolean;
  itemId: string;
  initialColumn?: SerializedNavigationColumn | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ColumnFormDialog({
  isOpen,
  itemId,
  initialColumn,
  onClose,
  onSuccess,
}: ColumnFormDialogProps) {
  if (!isOpen) return null;

  return (
    <ColumnFormInner
      key={initialColumn?.id || "new-column"}
      itemId={itemId}
      initialColumn={initialColumn}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

function ColumnFormInner({
  itemId,
  initialColumn,
  onClose,
  onSuccess,
}: {
  itemId: string;
  initialColumn?: SerializedNavigationColumn | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = Boolean(initialColumn);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    heading: initialColumn?.heading || "",
    displayOrder: initialColumn ? String(initialColumn.displayOrder) : "0",
    isPublished: initialColumn ? initialColumn.isPublished : true,
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const payload = {
          itemId,
          heading: formData.heading.trim() || null,
          displayOrder: Number(formData.displayOrder) || 0,
          isPublished: formData.isPublished,
        };

        const res = isEdit && initialColumn
          ? await updateNavigationColumnAction(null, { ...payload, id: initialColumn.id })
          : await createNavigationColumnAction(null, payload);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setServerError(res.error || "Operation failed");
          if (res.fieldErrors) {
            setFieldErrors(res.fieldErrors);
          }
        }
      } catch (err) {
        setServerError(err instanceof Error ? err.message : "Unexpected error");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="col-dialog-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6 text-gray-900">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 id="col-dialog-title" className="text-lg font-bold">
              {isEdit ? "Edit Dropdown Column" : "Add Dropdown Column"}
            </h3>
            <p className="text-xs text-gray-500">Structural container for grouping links</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {serverError && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Column Heading (Optional)
            </label>
            <input
              type="text"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              placeholder="e.g. Overview & Heritage"
              maxLength={120}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C1C] ${
                fieldErrors.heading ? "border-red-400" : "border-gray-200"
              }`}
            />
            {fieldErrors.heading && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.heading}</p>
            )}
            <p className="mt-1 text-[11px] text-gray-400">
              Leave blank for compact dropdowns without column headers.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Display Order
            </label>
            <input
              type="number"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
              min={0}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C1C]"
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="rounded border-gray-300 text-[#B91C1C] focus:ring-[#B91C1C] w-4 h-4"
              />
              <span>Published (Column visible in menu)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-xl shadow-xs transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? "Update Column" : "Create Column"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
