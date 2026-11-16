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
    <div className="admin-workspace">
      {/* Notifications */}
      {successBanner && (
        <div className="admin-banner--success" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>Vision &amp; Mission settings have been successfully saved and published.</span>
        </div>
      )}

      {/* 1. Header & Vision/Mission Statements */}
      <form onSubmit={handleSettingSubmit} className="admin-section-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-workspace-toolbar__title">Vision &amp; Mission Statements</h2>
            <p className="admin-workspace-toolbar__count">Control the header intro and the twin statements of institutional purpose.</p>
          </div>
          <div className="admin-card-actions">
            <a
              href="/vision-mission"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-button admin-button--secondary"
              style={{ minHeight: "36px", padding: "6px 12px", fontSize: "0.8125rem" }}
            >
              <span>View Public /vision-mission</span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </div>

        {serverError && (
          <div className="admin-banner--error" role="alert">
            {serverError}
          </div>
        )}

        <div className="admin-form-grid-2">
          <div className="admin-field">
            <label htmlFor="vm-breadcrumb" className="admin-label">
              Breadcrumb Text *
            </label>
            <input
              id="vm-breadcrumb"
              type="text"
              name="breadcrumb"
              value={formData.breadcrumb}
              onChange={handleSettingChange}
              className="admin-input"
              required
            />
            {fieldErrors.breadcrumb && (
              <p className="admin-field-error">{fieldErrors.breadcrumb}</p>
            )}
          </div>

          <div className="admin-field">
            <label htmlFor="vm-heading" className="admin-label">
              Page Heading *
            </label>
            <input
              id="vm-heading"
              type="text"
              name="heading"
              value={formData.heading}
              onChange={handleSettingChange}
              placeholder="e.g. Vision & Mission"
              className="admin-input"
              required
            />
            {fieldErrors.heading && (
              <p className="admin-field-error">{fieldErrors.heading}</p>
            )}
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="vm-subheading" className="admin-label">
            Subheading *
          </label>
          <textarea
            id="vm-subheading"
            name="subheading"
            value={formData.subheading}
            onChange={handleSettingChange}
            rows={2}
            className="admin-textarea"
            required
          />
          {fieldErrors.subheading && (
            <p className="admin-field-error">{fieldErrors.subheading}</p>
          )}
        </div>

        {/* Vision Statement Box */}
        <div style={{ padding: "18px", borderRadius: "10px", background: "#fffbeb", border: "1px solid #fde68a", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Compass size={18} style={{ color: "#b45309" }} />
            <h3 style={{ margin: 0, fontSize: "0.875rem", fontFamily: "var(--heading-font)", fontWeight: 700, color: "#111827" }}>
              Vision Statement
            </h3>
          </div>
          <div className="admin-form-grid-2">
            <div className="admin-field">
              <label htmlFor="vm-visionTitle" className="admin-label">
                Vision Title *
              </label>
              <input
                id="vm-visionTitle"
                type="text"
                name="visionTitle"
                value={formData.visionTitle}
                onChange={handleSettingChange}
                className="admin-input"
                required
              />
            </div>
            <div className="admin-field">
              <label htmlFor="vm-visionIcon" className="admin-label">
                Vision Icon Name
              </label>
              <input
                id="vm-visionIcon"
                type="text"
                name="visionIcon"
                value={formData.visionIcon}
                onChange={handleSettingChange}
                placeholder="Compass"
                className="admin-input"
              />
            </div>
          </div>
          <div className="admin-field">
            <label htmlFor="vm-visionBody" className="admin-label">
              Vision Statement Text *
            </label>
            <textarea
              id="vm-visionBody"
              name="visionBody"
              value={formData.visionBody}
              onChange={handleSettingChange}
              rows={4}
              className="admin-textarea"
              required
            />
          </div>
        </div>

        {/* Mission Statement Box */}
        <div style={{ padding: "18px", borderRadius: "10px", background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Target size={18} style={{ color: "#1d4ed8" }} />
            <h3 style={{ margin: 0, fontSize: "0.875rem", fontFamily: "var(--heading-font)", fontWeight: 700, color: "#111827" }}>
              Mission Statement
            </h3>
          </div>
          <div className="admin-form-grid-2">
            <div className="admin-field">
              <label htmlFor="vm-missionTitle" className="admin-label">
                Mission Title *
              </label>
              <input
                id="vm-missionTitle"
                type="text"
                name="missionTitle"
                value={formData.missionTitle}
                onChange={handleSettingChange}
                className="admin-input"
                required
              />
            </div>
            <div className="admin-field">
              <label htmlFor="vm-missionIcon" className="admin-label">
                Mission Icon Name
              </label>
              <input
                id="vm-missionIcon"
                type="text"
                name="missionIcon"
                value={formData.missionIcon}
                onChange={handleSettingChange}
                placeholder="Target"
                className="admin-input"
              />
            </div>
          </div>
          <div className="admin-field">
            <label htmlFor="vm-missionBody" className="admin-label">
              Mission Statement Text *
            </label>
            <textarea
              id="vm-missionBody"
              name="missionBody"
              value={formData.missionBody}
              onChange={handleSettingChange}
              rows={4}
              className="admin-textarea"
              required
            />
          </div>
        </div>

        <div className="admin-form-row">
          <label className="admin-checkbox-row">
            <input
              type="checkbox"
              id="isPublishedVMSetting"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleSettingChange}
              className="admin-toggle"
            />
            <span>Publish Vision &amp; Mission Header and Statements</span>
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="admin-button admin-button--primary"
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>Save Vision &amp; Mission</span>
          </button>
        </div>
      </form>

      {/* 2. Institutional Core Values */}
      <div className="admin-section-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-workspace-toolbar__title">
              Institutional Core Values &amp; Principles ({coreValues.length})
            </h2>
            <p className="admin-workspace-toolbar__count">
              Core philosophical pillars shown on the Vision &amp; Mission page.
            </p>
          </div>
          <div className="admin-card-actions">
            <button
              type="button"
              onClick={() => {
                setEditingCoreValue(null);
                setIsCoreValueDialogOpen(true);
              }}
              className="admin-button admin-button--primary"
            >
              <Plus size={16} />
              <span>Add Core Value</span>
            </button>
          </div>
        </div>

        {coreValues.length === 0 ? (
          <div className="admin-empty-state">
            No core values created yet. Click &quot;Add Core Value&quot; to add one.
          </div>
        ) : (
          <div className="admin-record-list">
            {coreValues.map((val, idx) => (
              <div key={val.id} className="admin-record-item">
                <div className="admin-record-item__info">
                  <span style={{ fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 700, color: "#9ca3af", width: "24px" }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111827" }}>
                        {val.title}
                      </span>
                      {!val.isPublished && (
                        <span className="admin-pill admin-pill--draft">Draft</span>
                      )}
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#6b7280" }}>
                      {val.description}
                    </p>
                  </div>
                </div>

                <div className="admin-record-item__actions">
                  <button
                    type="button"
                    onClick={() => handleMoveCoreValue(idx, "UP")}
                    disabled={idx === 0 || isPending}
                    className="admin-icon-button"
                    aria-label={`Move core value ${val.title} up`}
                    title="Move Up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveCoreValue(idx, "DOWN")}
                    disabled={idx === coreValues.length - 1 || isPending}
                    className="admin-icon-button"
                    aria-label={`Move core value ${val.title} down`}
                    title="Move Down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleCoreValueStatus(val.id, val.isPublished)}
                    disabled={isPending}
                    className="admin-icon-button"
                    aria-label={val.isPublished ? `Unpublish core value ${val.title}` : `Publish core value ${val.title}`}
                    title={val.isPublished ? "Unpublish" : "Publish"}
                  >
                    {val.isPublished ? (
                      <Eye size={16} style={{ color: "#059669" }} />
                    ) : (
                      <EyeOff size={16} style={{ color: "#9ca3af" }} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCoreValue(val);
                      setIsCoreValueDialogOpen(true);
                    }}
                    className="admin-icon-button"
                    aria-label={`Edit core value ${val.title}`}
                    title="Edit Core Value"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({
                        id: val.id,
                        title: val.title,
                      })
                    }
                    className="admin-icon-button"
                    style={{ color: "#dc2626" }}
                    aria-label={`Delete core value ${val.title}`}
                    title="Delete Core Value"
                  >
                    <Trash2 size={16} />
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
