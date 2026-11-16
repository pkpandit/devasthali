"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  CheckCircle2,
  Compass,
  Target,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import {
  updateVisionMissionSettingAction,
  deleteInstitutionalCoreValueAction,
  toggleInstitutionalCoreValueStatusAction,
  reorderInstitutionalCoreValuesAction,
} from "@/lib/server/about-leadership-actions";
import {
  CoreValueFormDialog,
  type SerializedInstitutionalCoreValue,
} from "./CoreValueFormDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

export interface SerializedVisionMissionSetting {
  id: string;
  breadcrumb: string;
  heading: string;
  subheading: string;
  visionTitle: string;
  visionBody: string;
  visionIcon: string | null;
  missionTitle: string;
  missionBody: string;
  missionIcon: string | null;
  isPublished: boolean;
  updatedAt: string;
}

interface VisionMissionEditorProps {
  initialSetting: SerializedVisionMissionSetting | null;
  coreValues: SerializedInstitutionalCoreValue[];
}

export function VisionMissionEditor({
  initialSetting,
  coreValues,
}: VisionMissionEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Setting Form State
  const [formData, setFormData] = useState({
    breadcrumb: initialSetting?.breadcrumb || "Vision & Mission",
    heading: initialSetting?.heading || "",
    subheading: initialSetting?.subheading || "",
    visionTitle: initialSetting?.visionTitle || "Our Vision",
    visionBody: initialSetting?.visionBody || "",
    visionIcon: initialSetting?.visionIcon || "Compass",
    missionTitle: initialSetting?.missionTitle || "Our Mission",
    missionBody: initialSetting?.missionBody || "",
    missionIcon: initialSetting?.missionIcon || "Target",
    isPublished: initialSetting?.isPublished ?? true,
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successBanner, setSuccessBanner] = useState(false);

  // Dialog State
  const [isCoreValueDialogOpen, setIsCoreValueDialogOpen] = useState(false);
  const [editingCoreValue, setEditingCoreValue] = useState<SerializedInstitutionalCoreValue | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const handleSettingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

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
    setSuccessBanner(false);
  };

  const handleSettingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});
    setSuccessBanner(false);

    startTransition(async () => {
      const res = await updateVisionMissionSettingAction(null, formData);

      if (!res.success) {
        setServerError(res.error || "Failed to update Vision & Mission settings");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      } else {
        setSuccessBanner(true);
        router.refresh();
      }
    });
  };

  // Core Value Actions
  const handleToggleCoreValueStatus = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleInstitutionalCoreValueStatusAction(null, {
        id,
        isPublished: !currentStatus,
      });
      router.refresh();
    });
  };

  const handleMoveCoreValue = (index: number, direction: "UP" | "DOWN") => {
    if (
      (direction === "UP" && index === 0) ||
      (direction === "DOWN" && index === coreValues.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    const reordered = [...coreValues];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const payload = reordered.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    startTransition(async () => {
      await reorderInstitutionalCoreValuesAction(null, { values: payload });
      router.refresh();
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteInstitutionalCoreValueAction(null, { id: deleteTarget.id });
    router.refresh();
  };

  return (
    <div className="space-y-10">
      {/* Notifications */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">
            Vision & Mission settings have been successfully saved and published.
          </p>
        </div>
      )}

      {/* 1. Header & Vision/Mission Statements */}
      <form onSubmit={handleSettingSubmit} className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-heading font-bold text-gray-900">
              Vision & Mission Statements
            </h2>
            <p className="text-xs text-gray-500 font-sans mt-0.5">
              Control the header intro and the twin statements of institutional purpose.
            </p>
          </div>
          <a
            href="/vision-mission"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#B91C1C] hover:underline inline-flex items-center gap-1"
          >
            <span>View Public /vision-mission</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Breadcrumb Text <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="breadcrumb"
              value={formData.breadcrumb}
              onChange={handleSettingChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              required
            />
            {fieldErrors.breadcrumb && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.breadcrumb}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Page Heading <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="heading"
              value={formData.heading}
              onChange={handleSettingChange}
              placeholder="e.g. Vision & Mission"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              required
            />
            {fieldErrors.heading && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.heading}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
            Subheading <span className="text-red-500">*</span>
          </label>
          <textarea
            name="subheading"
            value={formData.subheading}
            onChange={handleSettingChange}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
            required
          />
          {fieldErrors.subheading && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.subheading}</p>
          )}
        </div>

        {/* Vision Statement Box */}
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-700" />
            <h3 className="text-sm font-heading font-bold text-gray-900">
              Vision Statement
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Vision Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="visionTitle"
                value={formData.visionTitle}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Vision Icon Name
              </label>
              <input
                type="text"
                name="visionIcon"
                value={formData.visionIcon}
                onChange={handleSettingChange}
                placeholder="Compass"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Vision Statement Text <span className="text-red-500">*</span>
            </label>
            <textarea
              name="visionBody"
              value={formData.visionBody}
              onChange={handleSettingChange}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none bg-white"
              required
            />
          </div>
        </div>

        {/* Mission Statement Box */}
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/60 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-700" />
            <h3 className="text-sm font-heading font-bold text-gray-900">
              Mission Statement
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Mission Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="missionTitle"
                value={formData.missionTitle}
                onChange={handleSettingChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Mission Icon Name
              </label>
              <input
                type="text"
                name="missionIcon"
                value={formData.missionIcon}
                onChange={handleSettingChange}
                placeholder="Target"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Mission Statement Text <span className="text-red-500">*</span>
            </label>
            <textarea
              name="missionBody"
              value={formData.missionBody}
              onChange={handleSettingChange}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none bg-white"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublishedVMSetting"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleSettingChange}
              className="w-4 h-4 rounded text-[#B91C1C] focus:ring-[#B91C1C] border-gray-300 cursor-pointer"
            />
            <label htmlFor="isPublishedVMSetting" className="text-sm font-medium text-gray-700 cursor-pointer">
              Publish Vision & Mission Header and Statements
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl text-sm font-heading font-bold bg-[#B91C1C] text-white hover:bg-[#991b1b] transition-colors disabled:opacity-50 inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Vision & Mission</span>
          </button>
        </div>
      </form>

      {/* 2. Institutional Core Values */}
      <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-gray-900">
                Institutional Core Values & Principles ({coreValues.length})
              </h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                Core philosophical pillars shown on the Vision & Mission page.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingCoreValue(null);
              setIsCoreValueDialogOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-heading font-bold bg-[#B91C1C] text-white hover:bg-[#991b1b] transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Core Value</span>
          </button>
        </div>

        {coreValues.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
            No core values created yet. Click &quot;Add Core Value&quot; to add one.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {coreValues.map((val, idx) => (
              <div
                key={val.id}
                className="py-3 flex items-start justify-between gap-4 hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-gray-400 w-6 pt-1">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-heading font-bold text-gray-900">
                        {val.title}
                      </span>
                      {!val.isPublished && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 font-sans">
                      {val.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => handleMoveCoreValue(idx, "UP")}
                    disabled={idx === 0 || isPending}
                    className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-100 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveCoreValue(idx, "DOWN")}
                    disabled={idx === coreValues.length - 1 || isPending}
                    className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded-lg hover:bg-gray-100 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleCoreValueStatus(val.id, val.isPublished)}
                    disabled={isPending}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
                    title={val.isPublished ? "Unpublish" : "Publish"}
                  >
                    {val.isPublished ? (
                      <Eye className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCoreValue(val);
                      setIsCoreValueDialogOpen(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer"
                    title="Edit Core Value"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({
                        id: val.id,
                        title: val.title,
                      })
                    }
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                    title="Delete Core Value"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <CoreValueFormDialog
        isOpen={isCoreValueDialogOpen}
        coreValue={editingCoreValue}
        onClose={() => setIsCoreValueDialogOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Institutional Core Value"
        itemDescription={deleteTarget?.title || ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
