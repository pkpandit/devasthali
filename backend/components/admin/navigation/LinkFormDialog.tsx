"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save } from "lucide-react";
import {
  createNavigationLinkAction,
  updateNavigationLinkAction,
} from "@/lib/server/navigation-actions";
import { validateNavigationUrl } from "@/lib/validation/navigation";

export interface SerializedNavigationLink {
  id: string;
  columnId: string;
  label: string;
  href: string;
  badge: string | null;
  displayOrder: number;
  isPublished: boolean;
  openInNewTab: boolean;
}

interface LinkFormDialogProps {
  isOpen: boolean;
  columnId: string;
  initialLink?: SerializedNavigationLink | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function LinkFormDialog({
  isOpen,
  columnId,
  initialLink,
  onClose,
  onSuccess,
}: LinkFormDialogProps) {
  if (!isOpen) return null;

  return (
    <LinkFormInner
      key={initialLink?.id || "new-link"}
      columnId={columnId}
      initialLink={initialLink}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

function LinkFormInner({
  columnId,
  initialLink,
  onClose,
  onSuccess,
}: {
  columnId: string;
  initialLink?: SerializedNavigationLink | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = Boolean(initialLink);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    label: initialLink?.label || "",
    href: initialLink?.href || "/",
    badge: initialLink?.badge || "",
    displayOrder: initialLink ? String(initialLink.displayOrder) : "0",
    isPublished: initialLink ? initialLink.isPublished : true,
    openInNewTab: initialLink ? initialLink.openInNewTab : false,
  });

  const [clientUrlWarning, setClientUrlWarning] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleUrlBlur = (url: string) => {
    const res = validateNavigationUrl(url);
    if (!res.valid) {
      setClientUrlWarning(res.error || "Invalid URL syntax");
    } else {
      setClientUrlWarning(null);
    }
  };

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

    if (name === "href") {
      handleUrlBlur(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const payload = {
          columnId,
          label: formData.label.trim(),
          href: formData.href.trim(),
          badge: formData.badge.trim() || null,
          displayOrder: Number(formData.displayOrder) || 0,
          isPublished: formData.isPublished,
          openInNewTab: formData.openInNewTab,
        };

        const res = isEdit && initialLink
          ? await updateNavigationLinkAction(null, { ...payload, id: initialLink.id })
          : await createNavigationLinkAction(null, payload);

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
      aria-labelledby="link-dialog-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full max-h-[90vh] overflow-y-auto p-6 text-gray-900">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 id="link-dialog-title" className="text-lg font-bold">
              {isEdit ? "Edit Dropdown Link" : "Add Dropdown Link"}
            </h3>
            <p className="text-xs text-gray-500">Destination link inside column</p>
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
              Link Title *
            </label>
            <input
              type="text"
              name="label"
              value={formData.label}
              onChange={handleChange}
              placeholder="e.g. Vision and Mission"
              required
              maxLength={120}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C1C] ${
                fieldErrors.label ? "border-red-400" : "border-gray-200"
              }`}
            />
            {fieldErrors.label && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.label}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Destination URL (href) *
            </label>
            <input
              type="text"
              name="href"
              value={formData.href}
              onChange={handleChange}
              placeholder="/vision-mission or /facilities#hostel"
              required
              maxLength={500}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C1C] ${
                fieldErrors.href || clientUrlWarning ? "border-red-400" : "border-gray-200"
              }`}
            />
            {clientUrlWarning && (
              <p className="mt-1 text-xs text-amber-600">{clientUrlWarning}</p>
            )}
            {fieldErrors.href && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.href}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Badge Tag (Optional)
              </label>
              <input
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                placeholder="e.g. 100% Pass"
                maxLength={50}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C1C]"
              />
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
          </div>

          <div className="pt-2 space-y-2 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="rounded border-gray-300 text-[#B91C1C] focus:ring-[#B91C1C] w-4 h-4"
              />
              <span>Published (Visible on site)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="openInNewTab"
                checked={formData.openInNewTab}
                onChange={handleChange}
                className="rounded border-gray-300 text-[#B91C1C] focus:ring-[#B91C1C] w-4 h-4"
              />
              <span>Open in new tab</span>
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
                  <span>{isEdit ? "Update Link" : "Create Link"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
