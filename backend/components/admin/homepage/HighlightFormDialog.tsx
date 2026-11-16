"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save, AlertCircle } from "lucide-react";
import {
  createHomepageHighlightAction,
  updateHomepageHighlightAction,
} from "@/lib/server/homepage-actions";

export interface SerializedHighlight {
  id: string;
  title: string;
  description: string;
  badge: string | null;
  iconName: string | null;
  imageUrl: string | null;
  imageStorageKey: string | null;
  ctaLabel: string;
  ctaHref: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HighlightFormDialogProps {
  isOpen: boolean;
  highlight: SerializedHighlight | null; // null for Create mode
  onClose: () => void;
  onSuccess: () => void;
}

export function HighlightFormDialog({
  isOpen,
  highlight,
  onClose,
  onSuccess,
}: HighlightFormDialogProps) {
  if (!isOpen) return null;

  return (
    <HighlightFormInner
      key={highlight?.id || "new-highlight"}
      highlight={highlight}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

function HighlightFormInner({
  highlight,
  onClose,
  onSuccess,
}: {
  highlight: SerializedHighlight | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: highlight?.title || "",
    description: highlight?.description || "",
    badge: highlight?.badge || "",
    iconName: highlight?.iconName || "",
    imageUrl: highlight?.imageUrl || "",
    ctaLabel: highlight?.ctaLabel || "Open",
    ctaHref: highlight?.ctaHref || "",
    isPublished: highlight ? highlight.isPublished : true,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setServerError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    startTransition(async () => {
      let res;
      if (highlight) {
        res = await updateHomepageHighlightAction(null, {
          id: highlight.id,
          ...formData,
        });
      } else {
        res = await createHomepageHighlightAction(null, formData);
      }

      if (!res.success) {
        setServerError(res.error || "Failed to save highlight");
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
        aria-labelledby="hl-dialog-title"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 id="hl-dialog-title" className="text-lg font-heading font-bold text-gray-900">
            {highlight ? "Edit Promotional Highlight" : "Add Promotional Highlight"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {serverError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Highlight Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Download School Prospectus"
              maxLength={120}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
            />
            {fieldErrors.title && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description / Sub-Hint <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Admissions PDF Brochure"
              maxLength={255}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
            />
            {fieldErrors.description && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Pill Badge
              </label>
              <input
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                placeholder="e.g. PDF, Fees, Routes, CBSE"
                maxLength={40}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
              />
              {fieldErrors.badge && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.badge}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lucide Icon Name
              </label>
              <input
                type="text"
                name="iconName"
                value={formData.iconName}
                onChange={handleChange}
                placeholder="e.g. Download, FileText, Bus, Award, Calendar"
                maxLength={60}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
              />
              {fieldErrors.iconName && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.iconName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTA Button Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ctaLabel"
                required
                value={formData.ctaLabel}
                onChange={handleChange}
                placeholder="e.g. Download, View Details"
                maxLength={60}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
              />
              {fieldErrors.ctaLabel && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.ctaLabel}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ctaHref"
                required
                value={formData.ctaHref}
                onChange={handleChange}
                placeholder="e.g. /school-prospectus"
                maxLength={500}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
              />
              {fieldErrors.ctaHref && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.ctaHref}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photographic Background Image URL
            </label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="e.g. /images/admissions/prospectus-brochure.jpg"
              maxLength={500}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
            />
            {fieldErrors.imageUrl && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.imageUrl}</p>
            )}
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="w-4 h-4 text-[#B91C1C] rounded border-gray-300 focus:ring-[#B91C1C]"
              />
              <span className="text-sm font-medium text-gray-700">Published on Public Homepage</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100">
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
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{highlight ? "Update Highlight" : "Create Highlight"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
