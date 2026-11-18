"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  CheckCircle2,
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
  updateAboutPageSettingAction,
  deleteAboutCredentialAction,
  toggleAboutCredentialStatusAction,
  reorderAboutCredentialsAction,
  deleteAboutNarrativeSectionAction,
  toggleAboutNarrativeSectionStatusAction,
  reorderAboutNarrativeSectionsAction,
} from "@/lib/server/about-leadership-actions";
import { AdminImageUploadField } from "@/components/admin/ui/AdminImageUploadField";
import {
  CredentialFormDialog,
  type SerializedAboutCredential,
} from "./CredentialFormDialog";
import {
  NarrativeSectionFormDialog,
  type SerializedAboutNarrativeSection,
} from "./NarrativeSectionFormDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

export interface SerializedAboutPageSetting {
  id: string;
  breadcrumb: string;
  heading: string;
  subheading: string;
  showcaseImageUrl: string | null;
  showcaseImageStorageKey: string | null;
  showcaseImageAlt: string | null;
  showcaseBadge: string | null;
  isPublished: boolean;
  updatedAt: string;
}

interface AboutPageEditorProps {
  initialSetting: SerializedAboutPageSetting | null;
  credentials: SerializedAboutCredential[];
  narrativeSections: SerializedAboutNarrativeSection[];
}

export function AboutPageEditor({
  initialSetting,
  credentials,
  narrativeSections,
}: AboutPageEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Setting Form State
  const [formData, setFormData] = useState({
    breadcrumb: initialSetting?.breadcrumb || "About Us",
    heading: initialSetting?.heading || "",
    subheading: initialSetting?.subheading || "",
    showcaseImageUrl: initialSetting?.showcaseImageUrl || "",
    showcaseImageAlt: initialSetting?.showcaseImageAlt || "",
    showcaseBadge: initialSetting?.showcaseBadge || "",
    isPublished: initialSetting?.isPublished ?? true,
  });

  const [selectedShowcaseFile, setSelectedShowcaseFile] = useState<File | null>(null);
  const [isShowcaseRemoved, setIsShowcaseRemoved] = useState(false);

  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successBanner, setSuccessBanner] = useState(false);

  // Dialog States
  const [isCredDialogOpen, setIsCredDialogOpen] = useState(false);
  const [editingCred, setEditingCred] = useState<SerializedAboutCredential | null>(null);

  const [isNarrativeDialogOpen, setIsNarrativeDialogOpen] = useState(false);
  const [editingNarrative, setEditingNarrative] = useState<SerializedAboutNarrativeSection | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: "CREDENTIAL" | "NARRATIVE";
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
      const payload = new FormData();
      payload.append("breadcrumb", formData.breadcrumb.trim());
      payload.append("heading", formData.heading.trim());
      payload.append("subheading", formData.subheading.trim());
      if (formData.showcaseBadge.trim()) {
        payload.append("showcaseBadge", formData.showcaseBadge.trim());
      }
      if (formData.showcaseImageAlt.trim()) {
        payload.append("showcaseImageAlt", formData.showcaseImageAlt.trim());
      }
      payload.append("isPublished", String(formData.isPublished));

      if (selectedShowcaseFile) {
        payload.append("showcaseImageFile", selectedShowcaseFile);
      } else if (isShowcaseRemoved) {
        payload.append("removeShowcaseImage", "true");
      } else if (formData.showcaseImageUrl) {
        payload.append("showcaseImageUrl", formData.showcaseImageUrl);
      }

      const res = await updateAboutPageSettingAction(null, payload);

      if (!res.success) {
        setServerError(res.error || "Failed to update About School settings");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      } else {
        setSuccessBanner(true);
        router.refresh();
      }
    });
  };

  // Credential Actions
  const handleToggleCredStatus = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleAboutCredentialStatusAction(null, {
        id,
        isPublished: !currentStatus,
      });
      router.refresh();
    });
  };

  const handleMoveCred = (index: number, direction: "UP" | "DOWN") => {
    if (
      (direction === "UP" && index === 0) ||
      (direction === "DOWN" && index === credentials.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    const reordered = [...credentials];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const payload = reordered.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    startTransition(async () => {
      await reorderAboutCredentialsAction(null, { credentials: payload });
      router.refresh();
    });
  };

  // Narrative Actions
  const handleToggleNarrativeStatus = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleAboutNarrativeSectionStatusAction(null, {
        id,
        isPublished: !currentStatus,
      });
      router.refresh();
    });
  };

  const handleMoveNarrative = (index: number, direction: "UP" | "DOWN") => {
    if (
      (direction === "UP" && index === 0) ||
      (direction === "DOWN" && index === narrativeSections.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    const reordered = [...narrativeSections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const payload = reordered.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    startTransition(async () => {
      await reorderAboutNarrativeSectionsAction(null, { sections: payload });
      router.refresh();
    });
  };

  // Handle Deletion Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "CREDENTIAL") {
      await deleteAboutCredentialAction(null, { id: deleteTarget.id });
    } else {
      await deleteAboutNarrativeSectionAction(null, { id: deleteTarget.id });
    }
    router.refresh();
  };

  return (
    <div className="admin-workspace">
      {/* Notifications */}
      {successBanner && (
        <div className="admin-banner--success" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>About School settings have been successfully saved and published.</span>
        </div>
      )}

      {/* 1. Header & Showcase Settings */}
      <form onSubmit={handleSettingSubmit} className="admin-section-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-workspace-toolbar__title">Page Header &amp; Showcase Settings</h2>
            <p className="admin-workspace-toolbar__count">Control the top banner title, subheading, and campus showcase image.</p>
          </div>
          <div className="admin-card-actions">
            <a
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-button admin-button--secondary"
              style={{ minHeight: "36px", padding: "6px 12px", fontSize: "0.8125rem" }}
            >
              <span>View Public /about</span>
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
            <label htmlFor="about-breadcrumb" className="admin-label">
              Breadcrumb Text *
            </label>
            <input
              id="about-breadcrumb"
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
            <label htmlFor="about-heading" className="admin-label">
              Page Heading *
            </label>
            <input
              id="about-heading"
              type="text"
              name="heading"
              value={formData.heading}
              onChange={handleSettingChange}
              placeholder="e.g. About Devasthaly Vidyapeeth"
              className="admin-input"
              required
            />
            {fieldErrors.heading && (
              <p className="admin-field-error">{fieldErrors.heading}</p>
            )}
          </div>
        </div>

        <div className="admin-field">
          <label htmlFor="about-subheading" className="admin-label">
            Subheading *
          </label>
          <textarea
            id="about-subheading"
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

        <div className="admin-field">
          <label htmlFor="about-showcaseBadge" className="admin-label">
            Showcase Badge (Optional)
          </label>
          <input
            id="about-showcaseBadge"
            type="text"
            name="showcaseBadge"
            value={formData.showcaseBadge}
            onChange={handleSettingChange}
            placeholder="e.g. Estd. 1988"
            className="admin-input"
          />
        </div>

        <div className="admin-field">
          <AdminImageUploadField
            label="Showcase Campus Image"
            variant="landscape"
            currentImageUrl={formData.showcaseImageUrl}
            selectedFile={selectedShowcaseFile}
            isRemoved={isShowcaseRemoved}
            onFileSelect={(file) => {
              setSelectedShowcaseFile(file);
              setIsShowcaseRemoved(false);
            }}
            onRemove={() => {
              setSelectedShowcaseFile(null);
              setIsShowcaseRemoved(true);
            }}
            altText={formData.showcaseImageAlt}
            onAltChange={(alt: string) =>
              setFormData((prev) => ({ ...prev, showcaseImageAlt: alt }))
            }
            altLabel="Showcase Image Alt Text"
            altError={fieldErrors.showcaseImageAlt}
            error={fieldErrors.showcaseImageFile || fieldErrors.showcaseImageUrl}
            disabled={isPending}
            isPending={isPending}
            helperText="Supported formats: JPEG, PNG, WebP (max 2 MiB). High-resolution image is automatically formatted and converted to WebP."
          />
        </div>

        <div className="admin-form-row">
          <label className="admin-checkbox-row">
            <input
              type="checkbox"
              id="isPublishedAboutSetting"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleSettingChange}
              className="admin-toggle"
            />
            <span>Publish Page Header</span>
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
            <span>Save Header Settings</span>
          </button>
        </div>
      </form>

      {/* 2. Credentials Cards Section */}
      <div className="admin-section-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-workspace-toolbar__title">
              Institutional Credential Cards ({credentials.length})
            </h2>
            <p className="admin-workspace-toolbar__count">
              Highlighting affiliation, heritage, campus size, and founder vision.
            </p>
          </div>
          <div className="admin-card-actions">
            <button
              type="button"
              onClick={() => {
                setEditingCred(null);
                setIsCredDialogOpen(true);
              }}
              className="admin-button admin-button--primary"
            >
              <Plus size={16} />
              <span>Add Credential</span>
            </button>
          </div>
        </div>

        {credentials.length === 0 ? (
          <div className="admin-empty-state">
            No credential cards created yet. Click &quot;Add Credential&quot; to add one.
          </div>
        ) : (
          <div className="admin-record-list">
            {credentials.map((cred, idx) => (
              <div key={cred.id} className="admin-record-item">
                <div className="admin-record-item__info">
                  <span style={{ fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 700, color: "#9ca3af", width: "24px" }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {cred.category}
                      </span>
                      {!cred.isPublished && (
                        <span className="admin-pill admin-pill--draft">Draft</span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#111827" }}>
                      {cred.title}
                    </p>
                    {cred.subtext && (
                      <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#6b7280" }}>
                        {cred.subtext}
                      </p>
                    )}
                  </div>
                </div>

                <div className="admin-record-item__actions">
                  <button
                    type="button"
                    onClick={() => handleMoveCred(idx, "UP")}
                    disabled={idx === 0 || isPending}
                    className="admin-icon-button"
                    aria-label={`Move credential ${cred.title} up`}
                    title="Move Up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveCred(idx, "DOWN")}
                    disabled={idx === credentials.length - 1 || isPending}
                    className="admin-icon-button"
                    aria-label={`Move credential ${cred.title} down`}
                    title="Move Down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleCredStatus(cred.id, cred.isPublished)}
                    disabled={isPending}
                    className="admin-icon-button"
                    aria-label={cred.isPublished ? `Unpublish credential ${cred.title}` : `Publish credential ${cred.title}`}
                    title={cred.isPublished ? "Unpublish" : "Publish"}
                  >
                    {cred.isPublished ? (
                      <Eye size={16} style={{ color: "#059669" }} />
                    ) : (
                      <EyeOff size={16} style={{ color: "#9ca3af" }} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCred(cred);
                      setIsCredDialogOpen(true);
                    }}
                    className="admin-icon-button"
                    aria-label={`Edit credential ${cred.title}`}
                    title="Edit Credential"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({
                        type: "CREDENTIAL",
                        id: cred.id,
                        title: cred.title,
                      })
                    }
                    className="admin-icon-button"
                    style={{ color: "#dc2626" }}
                    aria-label={`Delete credential ${cred.title}`}
                    title="Delete Credential"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Narrative Sections */}
      <div className="admin-section-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-workspace-toolbar__title">
              School Narrative &amp; Story Sections ({narrativeSections.length})
            </h2>
            <p className="admin-workspace-toolbar__count">
              Editorial paragraphs explaining the school’s heritage, mission, and growth.
            </p>
          </div>
          <div className="admin-card-actions">
            <button
              type="button"
              onClick={() => {
                setEditingNarrative(null);
                setIsNarrativeDialogOpen(true);
              }}
              className="admin-button admin-button--primary"
            >
              <Plus size={16} />
              <span>Add Section</span>
            </button>
          </div>
        </div>

        {narrativeSections.length === 0 ? (
          <div className="admin-empty-state">
            No narrative sections created yet. Click &quot;Add Section&quot; to create one.
          </div>
        ) : (
          <div className="admin-record-list">
            {narrativeSections.map((sec, idx) => (
              <div key={sec.id} className="admin-record-item">
                <div className="admin-record-item__info">
                  <span style={{ fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 700, color: "#9ca3af", width: "24px" }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111827" }}>
                        {sec.heading || `Paragraph ${idx + 1}`}
                      </span>
                      {!sec.isPublished && (
                        <span className="admin-pill admin-pill--draft">Draft</span>
                      )}
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#4b5563", maxHeight: "2.5em", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {sec.body}
                    </p>
                  </div>
                </div>

                <div className="admin-record-item__actions">
                  <button
                    type="button"
                    onClick={() => handleMoveNarrative(idx, "UP")}
                    disabled={idx === 0 || isPending}
                    className="admin-icon-button"
                    aria-label={`Move narrative section ${sec.heading || idx + 1} up`}
                    title="Move Up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveNarrative(idx, "DOWN")}
                    disabled={idx === narrativeSections.length - 1 || isPending}
                    className="admin-icon-button"
                    aria-label={`Move narrative section ${sec.heading || idx + 1} down`}
                    title="Move Down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleNarrativeStatus(sec.id, sec.isPublished)}
                    disabled={isPending}
                    className="admin-icon-button"
                    aria-label={sec.isPublished ? `Unpublish section ${sec.heading || idx + 1}` : `Publish section ${sec.heading || idx + 1}`}
                    title={sec.isPublished ? "Unpublish" : "Publish"}
                  >
                    {sec.isPublished ? (
                      <Eye size={16} style={{ color: "#059669" }} />
                    ) : (
                      <EyeOff size={16} style={{ color: "#9ca3af" }} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNarrative(sec);
                      setIsNarrativeDialogOpen(true);
                    }}
                    className="admin-icon-button"
                    aria-label={`Edit narrative section ${sec.heading || idx + 1}`}
                    title="Edit Section"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({
                        type: "NARRATIVE",
                        id: sec.id,
                        title: sec.heading || `Paragraph ${idx + 1}`,
                      })
                    }
                    className="admin-icon-button"
                    style={{ color: "#dc2626" }}
                    aria-label={`Delete narrative section ${sec.heading || idx + 1}`}
                    title="Delete Section"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Credential Dialog */}
      <CredentialFormDialog
        isOpen={isCredDialogOpen}
        credential={editingCred}
        onClose={() => {
          setIsCredDialogOpen(false);
          setEditingCred(null);
        }}
        onSuccess={() => router.refresh()}
      />

      {/* Narrative Section Dialog */}
      <NarrativeSectionFormDialog
        isOpen={isNarrativeDialogOpen}
        section={editingNarrative}
        onClose={() => {
          setIsNarrativeDialogOpen(false);
          setEditingNarrative(null);
        }}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation Alert Dialog */}
      <DeleteConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.title || ""}
        itemDescription={deleteTarget?.title || ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
