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
      <form onSubmit={handleSettingSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
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
          <div className="topper-dialog-error-banner" role="alert">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="topper-field">
            <label htmlFor="vm-breadcrumb" className="topper-label">
              Breadcrumb Text <span className="text-red-500">*</span>
            </label>
            <input
              id="vm-breadcrumb"
              type="text"
              name="breadcrumb"
              value={formData.breadcrumb}
              onChange={handleSettingChange}
              className={`topper-input ${fieldErrors.breadcrumb ? "topper-input--error" : ""}`}
              required
            />
            {fieldErrors.breadcrumb && (
              <p className="topper-field-error">{fieldErrors.breadcrumb}</p>
            )}
          </div>

          <div className="topper-field">
            <label htmlFor="vm-heading" className="topper-label">
              Page Heading <span className="text-red-500">*</span>
            </label>
            <input
              id="vm-heading"
              type="text"
              name="heading"
              value={formData.heading}
              onChange={handleSettingChange}
              placeholder="e.g. Vision & Mission"
              className={`topper-input ${fieldErrors.heading ? "topper-input--error" : ""}`}
              required
            />
            {fieldErrors.heading && (
              <p className="topper-field-error">{fieldErrors.heading}</p>
            )}
          </div>
        </div>

        <div className="topper-field">
          <label htmlFor="vm-subheading" className="topper-label">
            Subheading <span className="text-red-500">*</span>
          </label>
          <textarea
            id="vm-subheading"
            name="subheading"
            value={formData.subheading}
            onChange={handleSettingChange}
            rows={2}
            className={`topper-input ${fieldErrors.subheading ? "topper-input--error" : ""}`}
            required
          />
          {fieldErrors.subheading && (
            <p className="topper-field-error">{fieldErrors.subheading}</p>
          )}
        </div>

        {/* Vision Statement Box */}
        <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-700" />
            <h3 className="text-sm font-heading font-bold text-gray-900">
              Vision Statement
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 topper-field">
              <label htmlFor="vm-visionTitle" className="topper-label">
                Vision Title <span className="text-red-500">*</span>
              </label>
              <input
                id="vm-visionTitle"
                type="text"
                name="visionTitle"
                value={formData.visionTitle}
                onChange={handleSettingChange}
                className="topper-input"
                required
              />
            </div>
            <div className="topper-field">
              <label htmlFor="vm-visionIcon" className="topper-label">
                Vision Icon Name
              </label>
              <input
                id="vm-visionIcon"
                type="text"
                name="visionIcon"
                value={formData.visionIcon}
                onChange={handleSettingChange}
                placeholder="Compass"
                className="topper-input"
              />
            </div>
          </div>
          <div className="topper-field">
            <label htmlFor="vm-visionBody" className="topper-label">
              Vision Statement Text <span className="text-red-500">*</span>
            </label>
            <textarea
              id="vm-visionBody"
              name="visionBody"
              value={formData.visionBody}
              onChange={handleSettingChange}
              rows={4}
              className="topper-input"
              required
            />
          </div>
        </div>

        {/* Mission Statement Box */}
        <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/60 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-700" />
            <h3 className="text-sm font-heading font-bold text-gray-900">
              Mission Statement
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 topper-field">
              <label htmlFor="vm-missionTitle" className="topper-label">
                Mission Title <span className="text-red-500">*</span>
              </label>
              <input
                id="vm-missionTitle"
                type="text"
                name="missionTitle"
                value={formData.missionTitle}
                onChange={handleSettingChange}
                className="topper-input"
                required
              />
            </div>
            <div className="topper-field">
              <label htmlFor="vm-missionIcon" className="topper-label">
                Mission Icon Name
              </label>
              <input
                id="vm-missionIcon"
                type="text"
                name="missionIcon"
                value={formData.missionIcon}
                onChange={handleSettingChange}
                placeholder="Target"
                className="topper-input"
              />
            </div>
          </div>
          <div className="topper-field">
            <label htmlFor="vm-missionBody" className="topper-label">
              Mission Statement Text <span className="text-red-500">*</span>
            </label>
            <textarea
              id="vm-missionBody"
              name="missionBody"
              value={formData.missionBody}
              onChange={handleSettingChange}
              rows={4}
              className="topper-input"
              required
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <label className="topper-checkbox-wrapper min-h-[44px]">
            <input
              type="checkbox"
              id="isPublishedVMSetting"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleSettingChange}
              className="topper-checkbox"
            />
            <span className="topper-checkbox-label">
              Publish Vision & Mission Header and Statements
            </span>
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="topper-button topper-button--primary min-h-[44px] px-5 gap-2"
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
      <div className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
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
            className="topper-button topper-button--primary min-h-[44px] px-4 gap-1.5"
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
                className="py-3 flex flex-wrap sm:flex-nowrap items-start justify-between gap-4 hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
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

                <div className="topper-card-actions shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => handleMoveCoreValue(idx, "UP")}
                    disabled={idx === 0 || isPending}
                    className="topper-icon-button"
                    aria-label={`Move core value ${val.title} up`}
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveCoreValue(idx, "DOWN")}
                    disabled={idx === coreValues.length - 1 || isPending}
                    className="topper-icon-button"
                    aria-label={`Move core value ${val.title} down`}
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleCoreValueStatus(val.id, val.isPublished)}
                    disabled={isPending}
                    className="topper-icon-button"
                    aria-label={val.isPublished ? `Unpublish core value ${val.title}` : `Publish core value ${val.title}`}
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
                    className="topper-icon-button"
                    aria-label={`Edit core value ${val.title}`}
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
                    className="topper-icon-button topper-icon-button--danger"
                    aria-label={`Delete core value ${val.title}`}
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
