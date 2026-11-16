"use client";

import { useState, useTransition } from "react";
import { Loader2, X, BookOpen } from "lucide-react";
import {
  createAboutNarrativeSectionAction,
  updateAboutNarrativeSectionAction,
} from "@/lib/server/about-leadership-actions";

export interface SerializedAboutNarrativeSection {
  id: string;
  heading: string | null;
  body: string;
  imageUrl: string | null;
  imageStorageKey: string | null;
  imageAlt: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NarrativeSectionFormDialogProps {
  isOpen: boolean;
  section: SerializedAboutNarrativeSection | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function NarrativeSectionFormDialog({
  isOpen,
  section,
  onClose,
  onSuccess,
}: NarrativeSectionFormDialogProps) {
  if (!isOpen) return null;

  return (
    <NarrativeSectionFormInner
      key={section?.id || "new-narrative"}
      section={section}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

function NarrativeSectionFormInner({
  section,
  onClose,
  onSuccess,
}: {
  section: SerializedAboutNarrativeSection | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    heading: section?.heading || "",
    body: section?.body || "",
    imageUrl: section?.imageUrl || "",
    imageAlt: section?.imageAlt || "",
    displayOrder: section?.displayOrder ?? 0,
    isPublished: section?.isPublished ?? true,
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
      if (section) {
        res = await updateAboutNarrativeSectionAction(null, {
          id: section.id,
          ...formData,
        });
      } else {
        res = await createAboutNarrativeSectionAction(null, formData);
      }

      if (!res.success) {
        setServerError(res.error || "Failed to save narrative section");
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
        aria-labelledby="narrative-dialog-title"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-[#B91C1C] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="narrative-dialog-title" className="text-lg font-heading font-bold text-gray-900">
                {section ? "Edit Narrative Section" : "Add Narrative Section"}
              </h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                Narrative sections form the story and paragraphs of the About School page.
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Section Heading (Optional)
            </label>
            <input
              type="text"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              placeholder="e.g. Founding Legacy & Mission"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
            />
            {fieldErrors.heading && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.heading}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Narrative Body <span className="text-red-500">*</span>
            </label>
            <textarea
              name="body"
              value={formData.body}
              onChange={handleChange}
              rows={6}
              placeholder="Write the full narrative or paragraph text here..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              required
            />
            {fieldErrors.body && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.body}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Illustration / Photo URL (Optional)
              </label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="e.g. /images/about/campus.jpg"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              />
              {fieldErrors.imageUrl && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.imageUrl}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Image Alt Text
              </label>
              <input
                type="text"
                name="imageAlt"
                value={formData.imageAlt}
                onChange={handleChange}
                placeholder="e.g. Campus grounds and buildings"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              />
              {fieldErrors.imageAlt && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.imageAlt}</p>
              )}
            </div>
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

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPublishedNarrative"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="w-4 h-4 rounded text-[#B91C1C] focus:ring-[#B91C1C] border-gray-300 cursor-pointer"
            />
            <label htmlFor="isPublishedNarrative" className="text-sm font-medium text-gray-700 cursor-pointer">
              Publish on public About page
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
              <span>{section ? "Save Changes" : "Create Section"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
