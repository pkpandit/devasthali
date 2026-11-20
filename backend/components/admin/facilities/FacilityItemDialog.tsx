"use client";

import { useState, useTransition, useId } from "react";
import {
  X,
  Loader2,
  Building,
  Edit3,
  MonitorPlay,
  FlaskConical,
  Cpu,
  Home,
  Trophy,
  Bus,
  BookOpen,
  HeartPulse,
  Sparkles,
  Shield,
} from "lucide-react";
import {
  createFacilityItemAction,
  updateFacilityItemAction,
} from "@/lib/server/facility-actions";
import { AdminImageUploadField } from "@/components/admin/ui/AdminImageUploadField";
import type { SerializedFacilityCategory } from "./FacilityCategoryDialog";
import { ALLOWED_FACILITY_ICONS } from "@/lib/validation/facilities";

export interface SerializedFacilityItem {
  id: string;
  categoryId: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  imageStorageKey: string | null;
  imageAlt: string;
  iconName: string | null;
  highlights: string[];
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FacilityItemDialogProps {
  isOpen: boolean;
  categories: SerializedFacilityCategory[];
  defaultCategoryId?: string;
  item: SerializedFacilityItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

function renderFacilityIcon(iconName: string | null | undefined, size = 18) {
  switch (iconName) {
    case "MonitorPlay":
      return <MonitorPlay size={size} />;
    case "FlaskConical":
      return <FlaskConical size={size} />;
    case "Cpu":
      return <Cpu size={size} />;
    case "Home":
      return <Home size={size} />;
    case "Trophy":
      return <Trophy size={size} />;
    case "Bus":
      return <Bus size={size} />;
    case "BookOpen":
      return <BookOpen size={size} />;
    case "HeartPulse":
      return <HeartPulse size={size} />;
    case "Sparkles":
      return <Sparkles size={size} />;
    case "Shield":
      return <Shield size={size} />;
    default:
      return <BookOpen size={size} />;
  }
}

function FacilityItemFormInner({
  categories,
  defaultCategoryId,
  item,
  onClose,
  onSuccess,
}: {
  categories: SerializedFacilityCategory[];
  defaultCategoryId?: string;
  item: SerializedFacilityItem | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const [categoryId, setCategoryId] = useState<string>(
    item?.categoryId || defaultCategoryId || categories[0]?.id || ""
  );
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState<boolean>(false);
  const [imageAlt, setImageAlt] = useState<string>(item?.imageAlt || "");
  const [iconName, setIconName] = useState<string>(item?.iconName || "BookOpen");
  const [highlightsText, setHighlightsText] = useState<string>(
    (item?.highlights || []).join("\n")
  );
  const [displayOrder, setDisplayOrder] = useState<number>(item?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(item?.isPublished ?? true);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const categorySelectId = useId();
  const titleId = useId();
  const descId = useId();
  const iconSelectId = useId();
  const highlightsId = useId();
  const orderId = useId();
  const publishedId = useId();

  const isEdit = Boolean(item);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }
    if (!title.trim()) {
      setError("Facility title is required.");
      return;
    }
    if (!description.trim()) {
      setError("Facility description is required.");
      return;
    }
    if (!imageAlt.trim() || imageAlt.trim().length < 3) {
      setError("Meaningful image alt text (at least 3 characters) is required.");
      return;
    }

    const parsedHighlights = highlightsText
      .split("\n")
      .map((h) => h.trim())
      .filter(Boolean);

    if (parsedHighlights.length > 10) {
      setError("Maximum 10 highlights allowed.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        if (isEdit) {
          formData.append("id", item!.id);
        }
        formData.append("categoryId", categoryId);
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        formData.append("imageAlt", imageAlt.trim());
        formData.append("iconName", iconName);
        formData.append("highlights", JSON.stringify(parsedHighlights));
        formData.append("displayOrder", String(displayOrder));
        formData.append("isPublished", String(isPublished));

        if (selectedFile) {
          formData.append("image", selectedFile);
        } else if (isImageRemoved) {
          formData.append("removeImage", "true");
        } else if (item?.imageUrl) {
          formData.append("imageUrl", item.imageUrl);
          if (item.imageStorageKey) {
            formData.append("imageStorageKey", item.imageStorageKey);
          }
        }

        const res = isEdit
          ? await updateFacilityItemAction(formData)
          : await createFacilityItemAction(formData);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Failed to save facility item.");
          if (res.fieldErrors) {
            setFieldErrors(res.fieldErrors);
          }
        }
      } catch (err) {
        console.error("Save facility item error:", err);
        setError("An unexpected error occurred while saving.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-dialog-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isEdit ? <Edit3 size={18} color="#0284c7" /> : <Building size={18} color="#0284c7" />}
          <h2 id="facility-item-dialog-title" style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#111827" }}>
            {isEdit ? "Edit Facility Item" : "New Facility Item"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="admin-dialog-close"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      </div>

      <div className="admin-dialog-body" style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "70vh", overflowY: "auto", paddingRight: "4px" }}>
        {error && (
          <div className="admin-error-banner" role="alert">
            {error}
          </div>
        )}

        {/* Category & Title */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
          <div className="admin-field">
            <label htmlFor={categorySelectId} className="admin-label">
              Category <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <select
              id={categorySelectId}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="admin-select"
              required
              disabled={isPending}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId && (
              <p className="admin-field-error">{fieldErrors.categoryId[0]}</p>
            )}
          </div>

          <div className="admin-field">
            <label htmlFor={titleId} className="admin-label">
              Facility Title <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              id={titleId}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Interactive Smart Classrooms, Robotics Lab"
              className="admin-input"
              required
              maxLength={200}
              disabled={isPending}
            />
            {fieldErrors.title && (
              <p className="admin-field-error">{fieldErrors.title[0]}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="admin-field">
          <label htmlFor={descId} className="admin-label">
            Description <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <textarea
            id={descId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of features, equipment, student capacity, or amenities..."
            className="admin-textarea"
            rows={3}
            maxLength={5000}
            required
            disabled={isPending}
          />
          {fieldErrors.description && (
            <p className="admin-field-error">{fieldErrors.description[0]}</p>
          )}
        </div>

        {/* Icon & Highlights */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
          <div className="admin-field">
            <label htmlFor={iconSelectId} className="admin-label">
              Facility Icon
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "38px",
                  height: "38px",
                  borderRadius: "8px",
                  backgroundColor: "#f0fdf4",
                  color: "#166534",
                  border: "1px solid #bbf7d0",
                  flexShrink: 0,
                }}
              >
                {renderFacilityIcon(iconName, 20)}
              </div>
              <select
                id={iconSelectId}
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="admin-select"
                disabled={isPending}
              >
                {ALLOWED_FACILITY_ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
            {fieldErrors.iconName && (
              <p className="admin-field-error">{fieldErrors.iconName[0]}</p>
            )}
          </div>

          <div className="admin-field">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label htmlFor={highlightsId} className="admin-label">
                Highlights (Max 10, one per line)
              </label>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                {highlightsText.split("\n").filter((s) => s.trim()).length}/10
              </span>
            </div>
            <textarea
              id={highlightsId}
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              placeholder="Interactive Touch Panels&#10;NCERT 3D Digital Content&#10;Ergonomic Seating"
              className="admin-textarea"
              rows={3}
              disabled={isPending}
            />
            {fieldErrors.highlights && (
              <p className="admin-field-error">{fieldErrors.highlights[0]}</p>
            )}
          </div>
        </div>

        {/* Facility Image Upload */}
        <div className="admin-field" style={{ backgroundColor: "#f9fafb", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
          <AdminImageUploadField
            label="Facility Photograph"
            currentImageUrl={isImageRemoved ? null : item?.imageUrl || null}
            selectedFile={selectedFile}
            isRemoved={isImageRemoved}
            onFileSelect={(file) => {
              setSelectedFile(file);
              setIsImageRemoved(false);
            }}
            onRemove={() => {
              setSelectedFile(null);
              setIsImageRemoved(true);
            }}
            disabled={isPending}
            variant="landscape"
            helperText="Upload a high-resolution landscape photo. The image is processed, EXIF stripped, and converted to WebP."
            error={fieldErrors.imageUrl || fieldErrors.imageStorageKey}
            altText={imageAlt}
            onAltChange={setImageAlt}
            altLabel="Image Alt Text"
            altPlaceholder="e.g. Students working on robotics kits in the automation laboratory"
            altRequired={true}
            altError={fieldErrors.imageAlt}
          />
        </div>

        {/* Display Order & Status */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div className="admin-field">
            <label htmlFor={orderId} className="admin-label">
              Display Order
            </label>
            <input
              id={orderId}
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
              className="admin-input"
              disabled={isPending}
            />
            {fieldErrors.displayOrder && (
              <p className="admin-field-error">{fieldErrors.displayOrder[0]}</p>
            )}
          </div>

          <div className="admin-field" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "8px" }}>
            <label
              htmlFor={publishedId}
              style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}
            >
              <input
                id={publishedId}
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                disabled={isPending}
                style={{ width: "16px", height: "16px", accentColor: "#0284c7" }}
              />
              <span>Published (Visible publicly)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="admin-dialog-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="admin-button admin-button--secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="admin-button admin-button--primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{isEdit ? "Update Facility" : "Create Facility"}</span>
          )}
        </button>
      </div>
    </form>
  );
}

export function FacilityItemDialog({
  isOpen,
  categories,
  defaultCategoryId,
  item,
  onClose,
  onSuccess,
}: FacilityItemDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="admin-dialog-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="admin-dialog-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="facility-item-dialog-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "680px" }}
      >
        <FacilityItemFormInner
          key={item?.id || `new-item-${defaultCategoryId || "none"}`}
          categories={categories}
          defaultCategoryId={defaultCategoryId}
          item={item}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
