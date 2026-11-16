"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  CheckCircle2,
  Award,
  BookOpen,
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
      const res = await updateAboutPageSettingAction(null, formData);

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
    <div className="space-y-10">
      {/* Notifications */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">
            About School settings have been successfully saved and published.
          </p>
        </div>
      )}

      {/* 1. Header & Showcase Settings */}
      <form onSubmit={handleSettingSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-heading font-bold text-gray-900">
              Page Header & Showcase Settings
            </h2>
            <p className="text-xs text-gray-500 font-sans mt-0.5">
              Control the top banner title, subheading, and campus showcase image.
            </p>
          </div>
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#B91C1C] hover:underline inline-flex items-center gap-1"
          >
            <span>View Public /about</span>
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
            <label htmlFor="about-breadcrumb" className="topper-label">
              Breadcrumb Text <span className="text-red-500">*</span>
            </label>
            <input
              id="about-breadcrumb"
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
            <label htmlFor="about-heading" className="topper-label">
              Page Heading <span className="text-red-500">*</span>
            </label>
            <input
              id="about-heading"
              type="text"
              name="heading"
              value={formData.heading}
              onChange={handleSettingChange}
              placeholder="e.g. About Devasthaly Vidyapeeth"
              className={`topper-input ${fieldErrors.heading ? "topper-input--error" : ""}`}
              required
            />
            {fieldErrors.heading && (
              <p className="topper-field-error">{fieldErrors.heading}</p>
            )}
          </div>
        </div>

        <div className="topper-field">
          <label htmlFor="about-subheading" className="topper-label">
            Subheading <span className="text-red-500">*</span>
          </label>
          <textarea
            id="about-subheading"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="topper-field">
            <label htmlFor="about-showcaseBadge" className="topper-label">
              Showcase Badge (Optional)
            </label>
            <input
              id="about-showcaseBadge"
              type="text"
              name="showcaseBadge"
              value={formData.showcaseBadge}
              onChange={handleSettingChange}
              placeholder="e.g. Established 1988"
              className="topper-input"
            />
          </div>

          <div className="topper-field">
            <label htmlFor="about-showcaseImageUrl" className="topper-label">
              Showcase Image URL
            </label>
            <input
              id="about-showcaseImageUrl"
              type="text"
              name="showcaseImageUrl"
              value={formData.showcaseImageUrl}
              onChange={handleSettingChange}
              placeholder="e.g. /images/about/showcase.jpg"
              className="topper-input"
            />
          </div>

          <div className="topper-field">
            <label htmlFor="about-showcaseImageAlt" className="topper-label">
              Showcase Image Alt
            </label>
            <input
              id="about-showcaseImageAlt"
              type="text"
              name="showcaseImageAlt"
              value={formData.showcaseImageAlt}
              onChange={handleSettingChange}
              placeholder="e.g. School main building"
              className="topper-input"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <label className="topper-checkbox-wrapper min-h-[44px]">
            <input
              type="checkbox"
              id="isPublishedAboutSetting"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleSettingChange}
              className="topper-checkbox"
            />
            <span className="topper-checkbox-label">
              Publish Page Header
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
            <span>Save Header Settings</span>
          </button>
        </div>
      </form>

      {/* 2. Credentials Cards Section */}
      <div className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-gray-900">
                Institutional Credential Cards ({credentials.length})
              </h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                Highlighting affiliation, heritage, campus size, and founder vision.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingCred(null);
              setIsCredDialogOpen(true);
            }}
            className="topper-button topper-button--primary min-h-[44px] px-4 gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Credential</span>
          </button>
        </div>

        {credentials.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
            No credential cards created yet. Click &quot;Add Credential&quot; to add one.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {credentials.map((cred, idx) => (
              <div
                key={cred.id}
                className="py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-gray-400 w-6">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {cred.category}
                      </span>
                      {!cred.isPublished && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-heading font-bold text-gray-900 truncate">
                      {cred.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {cred.subtext}
                    </p>
                  </div>
                </div>

                <div className="topper-card-actions shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveCred(idx, "UP")}
                    disabled={idx === 0 || isPending}
                    className="topper-icon-button"
                    aria-label={`Move credential ${cred.title} up`}
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveCred(idx, "DOWN")}
                    disabled={idx === credentials.length - 1 || isPending}
                    className="topper-icon-button"
                    aria-label={`Move credential ${cred.title} down`}
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleCredStatus(cred.id, cred.isPublished)}
                    disabled={isPending}
                    className="topper-icon-button"
                    aria-label={cred.isPublished ? `Unpublish credential ${cred.title}` : `Publish credential ${cred.title}`}
                    title={cred.isPublished ? "Unpublish" : "Publish"}
                  >
                    {cred.isPublished ? (
                      <Eye className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCred(cred);
                      setIsCredDialogOpen(true);
                    }}
                    className="topper-icon-button"
                    aria-label={`Edit credential ${cred.title}`}
                    title="Edit Credential"
                  >
                    <Pencil className="w-4 h-4" />
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
                    className="topper-icon-button topper-icon-button--danger"
                    aria-label={`Delete credential ${cred.title}`}
                    title="Delete Credential"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Narrative Sections */}
      <div className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-gray-900">
                School Narrative & Story Sections ({narrativeSections.length})
              </h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                Editorial paragraphs explaining the school’s heritage, mission, and growth.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingNarrative(null);
              setIsNarrativeDialogOpen(true);
            }}
            className="topper-button topper-button--primary min-h-[44px] px-4 gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </div>

        {narrativeSections.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
            No narrative sections created yet. Click &quot;Add Section&quot; to create one.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {narrativeSections.map((sec, idx) => (
              <div
                key={sec.id}
                className="py-4 flex flex-wrap sm:flex-nowrap items-start justify-between gap-4 hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-gray-400 w-6 pt-1">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-heading font-bold text-gray-900">
                        {sec.heading || `Paragraph ${idx + 1}`}
                      </span>
                      {!sec.isPublished && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 font-sans">
                      {sec.body}
                    </p>
                  </div>
                </div>

                <div className="topper-card-actions shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => handleMoveNarrative(idx, "UP")}
                    disabled={idx === 0 || isPending}
                    className="topper-icon-button"
                    aria-label={`Move narrative section ${sec.heading || idx + 1} up`}
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveNarrative(idx, "DOWN")}
                    disabled={idx === narrativeSections.length - 1 || isPending}
                    className="topper-icon-button"
                    aria-label={`Move narrative section ${sec.heading || idx + 1} down`}
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleNarrativeStatus(sec.id, sec.isPublished)}
                    disabled={isPending}
                    className="topper-icon-button"
                    aria-label={sec.isPublished ? `Unpublish section ${sec.heading || idx + 1}` : `Publish section ${sec.heading || idx + 1}`}
                    title={sec.isPublished ? "Unpublish" : "Publish"}
                  >
                    {sec.isPublished ? (
                      <Eye className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNarrative(sec);
                      setIsNarrativeDialogOpen(true);
                    }}
                    className="topper-icon-button"
                    aria-label={`Edit section ${sec.heading || idx + 1}`}
                    title="Edit Section"
                  >
                    <Pencil className="w-4 h-4" />
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
                    className="topper-icon-button topper-icon-button--danger"
                    aria-label={`Delete section ${sec.heading || idx + 1}`}
                    title="Delete Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Dialogs */}
      <CredentialFormDialog
        isOpen={isCredDialogOpen}
        credential={editingCred}
        onClose={() => setIsCredDialogOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <NarrativeSectionFormDialog
        isOpen={isNarrativeDialogOpen}
        section={editingNarrative}
        onClose={() => setIsNarrativeDialogOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete ${deleteTarget?.type === "CREDENTIAL" ? "Credential" : "Narrative Section"}`}
        itemDescription={deleteTarget?.title || ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
