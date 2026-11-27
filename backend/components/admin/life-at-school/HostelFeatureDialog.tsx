"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import {
  createHostelFeatureAction,
  updateHostelFeatureAction,
} from "@/lib/server/transport-hostel-actions";

export interface SerializedHostelFeature {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface HostelFeatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: SerializedHostelFeature | null;
}

export function HostelFeatureDialog({
  isOpen,
  onClose,
  feature,
}: HostelFeatureDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditing = !!feature;
  const [title, setTitle] = useState(feature?.title ?? "");
  const [description, setDescription] = useState(feature?.description ?? "");
  const [displayOrder, setDisplayOrder] = useState(feature?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState(feature?.isPublished ?? true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Feature title is required.");
      return;
    }

    if (!description.trim()) {
      setError("Feature description is required.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing && feature) {
          const res = await updateHostelFeatureAction({
            id: feature.id,
            title: title.trim(),
            description: description.trim(),
            displayOrder: Number(displayOrder),
            isPublished,
          });

          if (res.success) {
            router.refresh();
            onClose();
          } else {
            setError(res.error || "Failed to update feature.");
          }
        } else {
          const res = await createHostelFeatureAction({
            title: title.trim(),
            description: description.trim(),
            displayOrder: Number(displayOrder),
            isPublished,
          });

          if (res.success) {
            router.refresh();
            onClose();
          } else {
            setError(res.error || "Failed to create feature.");
          }
        }
      } catch (err) {
        console.error("Save feature error:", err);
        setError("An unexpected error occurred.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hostel-feature-dialog-title"
      >
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 id="hostel-feature-dialog-title" className="text-lg font-bold text-gray-900">
            {isEditing ? "Edit Boarding Feature" : "Add Boarding Feature"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Feature Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pure Vegetarian Dining"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Feature Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the nutritional, academic, or healthcare aspects of this boarding feature..."
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
            />
            <p className="mt-1 text-xs text-gray-500">Max 2,000 characters.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="relative flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-gray-300 text-[#B91C1C] focus:ring-[#B91C1C] w-4 h-4"
                />
                <span>Published (Visible publicly)</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#B91C1C] px-5 py-2 text-sm font-bold text-white shadow-xs hover:bg-[#991B1B] transition-colors disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Create Feature"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
