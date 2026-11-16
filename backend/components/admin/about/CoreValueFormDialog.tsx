"use client";

import { useState, useTransition } from "react";
import { Loader2, X, Compass } from "lucide-react";
import {
  createInstitutionalCoreValueAction,
  updateInstitutionalCoreValueAction,
} from "@/lib/server/about-leadership-actions";

export interface SerializedInstitutionalCoreValue {
  id: string;
  title: string;
  description: string;
  iconName: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CoreValueFormDialogProps {
  isOpen: boolean;
  coreValue: SerializedInstitutionalCoreValue | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CoreValueFormDialog({
  isOpen,
  coreValue,
  onClose,
  onSuccess,
}: CoreValueFormDialogProps) {
  if (!isOpen) return null;

  return (
    <CoreValueFormInner
      key={coreValue?.id || "new-core-value"}
      coreValue={coreValue}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

function CoreValueFormInner({
  coreValue,
  onClose,
  onSuccess,
}: {
  coreValue: SerializedInstitutionalCoreValue | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: coreValue?.title || "",
    description: coreValue?.description || "",
    iconName: coreValue?.iconName || "Compass",
    displayOrder: coreValue?.displayOrder ?? 0,
    isPublished: coreValue?.isPublished ?? true,
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value, 10) || 0
          : value,
    }));

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
      let res;
      if (coreValue) {
        res = await updateInstitutionalCoreValueAction(null, {
          id: coreValue.id,
          ...formData,
        });
      } else {
        res = await createInstitutionalCoreValueAction(null, formData);
      }

      if (!res.success) {
        setServerError(res.error || "Failed to save core value");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      } else {
        onSuccess();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="core-value-dialog-title"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#B91C1C] flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 id="core-value-dialog-title" className="text-lg font-heading font-bold text-gray-900">
                {coreValue ? "Edit Core Value" : "Add Core Value"}
              </h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                Core values represent the founding pillars and principles of the institution.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Title / Value Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Holistic Development, Academic Excellence"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              required
            />
            {fieldErrors.title && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. Nurturing every student intellectually, socially, emotionally, and physically..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              required
            />
            {fieldErrors.description && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Icon Name (Lucide)
              </label>
              <input
                type="text"
                name="iconName"
                value={formData.iconName}
                onChange={handleChange}
                placeholder="e.g. Compass, Heart, Shield, Award"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              />
              {fieldErrors.iconName && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.iconName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                min={0}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              />
              {fieldErrors.displayOrder && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.displayOrder}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPublishedCoreValue"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="w-4 h-4 rounded text-[#B91C1C] focus:ring-[#B91C1C] border-gray-300 cursor-pointer"
            />
            <label htmlFor="isPublishedCoreValue" className="text-sm font-medium text-gray-700 cursor-pointer">
              Publish on Vision & Mission page
            </label>
          </div>

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
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl text-sm font-heading font-bold bg-[#B91C1C] text-white hover:bg-[#991b1b] transition-colors disabled:opacity-50 inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{coreValue ? "Save Changes" : "Create Core Value"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
