"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save, AlertCircle } from "lucide-react";
import {
  createHomepageStatisticAction,
  updateHomepageStatisticAction,
} from "@/lib/server/homepage-actions";

export interface SerializedStatistic {
  id: string;
  label: string;
  numericValue: string;
  suffix: string | null;
  subtext: string | null;
  badge: string | null;
  iconName: string | null;
  imageUrl: string | null;
  imageStorageKey: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StatisticFormDialogProps {
  isOpen: boolean;
  statistic: SerializedStatistic | null; // null for Create mode
  onClose: () => void;
  onSuccess: () => void;
}

export function StatisticFormDialog({
  isOpen,
  statistic,
  onClose,
  onSuccess,
}: StatisticFormDialogProps) {
  if (!isOpen) return null;

  return (
    <StatisticFormInner
      key={statistic?.id || "new-stat"}
      statistic={statistic}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

function StatisticFormInner({
  statistic,
  onClose,
  onSuccess,
}: {
  statistic: SerializedStatistic | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    label: statistic?.label || "",
    numericValue: statistic?.numericValue || "",
    suffix: statistic?.suffix || "",
    subtext: statistic?.subtext || "",
    badge: statistic?.badge || "",
    iconName: statistic?.iconName || "",
    imageUrl: statistic?.imageUrl || "",
    isPublished: statistic ? statistic.isPublished : true,
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
      if (statistic) {
        res = await updateHomepageStatisticAction(null, {
          id: statistic.id,
          ...formData,
        });
      } else {
        res = await createHomepageStatisticAction(null, formData);
      }

      if (!res.success) {
        setServerError(res.error || "Failed to save statistic");
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
        aria-labelledby="stat-dialog-title"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 id="stat-dialog-title" className="text-lg font-heading font-bold text-gray-900">
            {statistic ? "Edit Trust Statistic" : "Add Trust Statistic"}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metric Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="label"
                required
                value={formData.label}
                onChange={handleChange}
                placeholder="e.g. Years of Heritage"
                maxLength={120}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
              />
              {fieldErrors.label && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.label}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numeric / Metric Value <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="numericValue"
                required
                value={formData.numericValue}
                onChange={handleChange}
                placeholder="e.g. 36+ or 100% or 1 : 25"
                maxLength={40}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
              />
              {fieldErrors.numericValue && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.numericValue}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supporting Subtext
              </label>
              <input
                type="text"
                name="subtext"
                value={formData.subtext}
                onChange={handleChange}
                placeholder="e.g. Established in 1988"
                maxLength={120}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
              />
              {fieldErrors.subtext && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.subtext}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Pill Badge
              </label>
              <input
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                placeholder="e.g. Legacy, Excellence"
                maxLength={40}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
              />
              {fieldErrors.badge && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.badge}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lucide Icon Name
              </label>
              <input
                type="text"
                name="iconName"
                value={formData.iconName}
                onChange={handleChange}
                placeholder="e.g. Award, Trophy, Building, Bus"
                maxLength={60}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
              />
              {fieldErrors.iconName && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.iconName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Optional Unit Suffix
              </label>
              <input
                type="text"
                name="suffix"
                value={formData.suffix}
                onChange={handleChange}
                placeholder="e.g. Years, %, Stops"
                maxLength={20}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
              />
              {fieldErrors.suffix && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.suffix}</p>
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
              placeholder="e.g. /images/about/campus-showcase.jpg"
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
                  <span>{statistic ? "Update Statistic" : "Create Statistic"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
