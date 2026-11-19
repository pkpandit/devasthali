"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import {
  createSchoolEvent,
  updateSchoolEvent,
} from "@/lib/server/events-actions";
import { AdminImageUploadField } from "@/components/admin/ui/AdminImageUploadField";

export interface SerializedSchoolEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  isoDate: string;
  time: string | null;
  location: string | null;
  category: string;
  linkHref: string | null;
  linkLabel: string | null;
  coverImageUrl: string | null;
  coverImageStorageKey: string | null;
  coverImageAlt: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EventFormDialogProps {
  isOpen: boolean;
  event: SerializedSchoolEvent | null;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_CATEGORIES = [
  "Academic Competition",
  "Sports & Athletics",
  "CBSE Examination",
  "National Celebration",
  "Cultural & Arts",
  "School Event",
];

export function EventFormDialog({
  isOpen,
  event,
  onClose,
  onSuccess,
}: EventFormDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="topper-dialog-backdrop" onClick={onClose}>
      <EventFormInner
        key={event?.id || "new-event"}
        event={event}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}

function EventFormInner({
  event,
  onClose,
  onSuccess,
}: {
  event: SerializedSchoolEvent | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    eventDate: event?.eventDate || "",
    isoDate: event?.isoDate || new Date().toISOString().split("T")[0],
    time: event?.time || "",
    location: event?.location || "",
    category: event?.category || "Academic Competition",
    linkHref: event?.linkHref || "",
    linkLabel: event?.linkLabel || "",
    coverImageUrl: event?.coverImageUrl || "",
    coverImageAlt: event?.coverImageAlt || "",
    displayOrder: event?.displayOrder || 0,
    isPublished: event ? event.isPublished : true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    startTransition(async () => {
      const payload = new FormData();
      if (event) {
        payload.append("id", event.id);
      }
      payload.append("title", formData.title.trim());
      payload.append("description", formData.description.trim());
      payload.append("eventDate", formData.eventDate.trim());
      payload.append("isoDate", formData.isoDate.trim());
      if (formData.time.trim()) {
        payload.append("time", formData.time.trim());
      }
      if (formData.location.trim()) {
        payload.append("location", formData.location.trim());
      }
      payload.append("category", formData.category.trim());
      if (formData.linkHref.trim()) {
        payload.append("linkHref", formData.linkHref.trim());
      }
      if (formData.linkLabel.trim()) {
        payload.append("linkLabel", formData.linkLabel.trim());
      }
      payload.append("coverImageAlt", formData.coverImageAlt.trim());
      payload.append("displayOrder", String(formData.displayOrder));
      payload.append("isPublished", String(formData.isPublished));

      if (selectedFile) {
        payload.append("coverImageFile", selectedFile);
      } else if (isPhotoRemoved) {
        payload.append("removeCoverImage", "true");
      } else if (formData.coverImageUrl) {
        payload.append("coverImageUrl", formData.coverImageUrl);
      }

      let result;
      if (event) {
        result = await updateSchoolEvent(payload);
      } else {
        result = await createSchoolEvent(payload);
      }

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        if (result.error) {
          setGeneralError(result.error);
        }
      }
    });
  };

  return (
    <div
      className="topper-dialog-container"
      style={{ maxWidth: "680px" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-dialog-title"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="topper-dialog-header">
        <div>
          <h2 id="event-dialog-title" className="topper-dialog-title">
            {event ? "Edit School Event" : "Create New School Event"}
          </h2>
          <p className="topper-dialog-subtitle">
            {event
              ? "Update event details, timing, venue, external link, or cover image."
              : "Add an upcoming academic or co-curricular event to the school schedule."}
          </p>
        </div>
        <button
          type="button"
          className="topper-dialog-close"
          onClick={onClose}
          aria-label="Close dialog"
          disabled={isPending}
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="topper-dialog-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {generalError && (
            <div
              className="admin-form-error"
              style={{
                marginBottom: "16px",
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                color: "#991b1b",
                fontSize: "13px",
              }}
            >
              {generalError}
            </div>
          )}

          {/* Title */}
          <div className="admin-form-group" style={{ marginBottom: "16px" }}>
            <label className="admin-form-label" htmlFor="event-title">
              Event Title <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              ref={titleInputRef}
              id="event-title"
              type="text"
              className="admin-form-input"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Inter-School English Debate Competition"
              maxLength={150}
              required
              disabled={isPending}
            />
            {errors.title && <span className="admin-form-field-error">{errors.title}</span>}
          </div>

          {/* Row: Event Date & ISO Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="event-date">
                Display Date <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                id="event-date"
                type="text"
                className="admin-form-input"
                value={formData.eventDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, eventDate: e.target.value }))}
                placeholder="e.g. 25 Nov 2025"
                maxLength={80}
                required
                disabled={isPending}
              />
              {errors.eventDate && <span className="admin-form-field-error">{errors.eventDate}</span>}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="event-iso-date">
                Calendar Date (YYYY-MM-DD) <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                id="event-iso-date"
                type="date"
                className="admin-form-input"
                value={formData.isoDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, isoDate: e.target.value }))}
                required
                disabled={isPending}
              />
              {errors.isoDate && <span className="admin-form-field-error">{errors.isoDate}</span>}
            </div>
          </div>

          {/* Row: Category & Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="event-category">
                Category
              </label>
              <input
                id="event-category"
                type="text"
                list="category-suggestions"
                className="admin-form-input"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="e.g. Academic Competition"
                maxLength={80}
                disabled={isPending}
              />
              <datalist id="category-suggestions">
                {COMMON_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {errors.category && <span className="admin-form-field-error">{errors.category}</span>}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="event-time">
                Time (Optional)
              </label>
              <input
                id="event-time"
                type="text"
                className="admin-form-input"
                value={formData.time}
                onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                placeholder="e.g. 9:30 AM – 1:30 PM"
                maxLength={80}
                disabled={isPending}
              />
              {errors.time && <span className="admin-form-field-error">{errors.time}</span>}
            </div>
          </div>

          {/* Location / Venue */}
          <div className="admin-form-group" style={{ marginBottom: "16px" }}>
            <label className="admin-form-label" htmlFor="event-location">
              Venue / Location (Optional)
            </label>
            <input
              id="event-location"
              type="text"
              className="admin-form-input"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="e.g. Auditorium Hall, Devasthaly Campus"
              maxLength={150}
              disabled={isPending}
            />
            {errors.location && <span className="admin-form-field-error">{errors.location}</span>}
          </div>

          {/* Description */}
          <div className="admin-form-group" style={{ marginBottom: "16px" }}>
            <label className="admin-form-label" htmlFor="event-description">
              Event Description <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <textarea
              id="event-description"
              rows={3}
              className="admin-form-textarea"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Comprehensive summary of the event, participants, and schedule..."
              maxLength={2000}
              required
              disabled={isPending}
            />
            {errors.description && <span className="admin-form-field-error">{errors.description}</span>}
          </div>

          {/* Row: Link Href & Link Label */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="event-link-href">
                Action / Circular URL (Optional)
              </label>
              <input
                id="event-link-href"
                type="text"
                className="admin-form-input"
                value={formData.linkHref}
                onChange={(e) => setFormData((prev) => ({ ...prev, linkHref: e.target.value }))}
                placeholder="e.g. /notices or https://..."
                maxLength={500}
                disabled={isPending}
              />
              {errors.linkHref && <span className="admin-form-field-error">{errors.linkHref}</span>}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="event-link-label">
                Link Button Label (Optional)
              </label>
              <input
                id="event-link-label"
                type="text"
                className="admin-form-input"
                value={formData.linkLabel}
                onChange={(e) => setFormData((prev) => ({ ...prev, linkLabel: e.target.value }))}
                placeholder="e.g. View Circular (PDF)"
                maxLength={80}
                disabled={isPending}
              />
              {errors.linkLabel && <span className="admin-form-field-error">{errors.linkLabel}</span>}
            </div>
          </div>

          {/* Cover Image Upload */}
          <div style={{ marginBottom: "20px" }}>
            <AdminImageUploadField
              label="Event Cover Image (Optional)"
              currentImageUrl={formData.coverImageUrl}
              selectedFile={selectedFile}
              isRemoved={isPhotoRemoved}
              onFileSelect={(file) => {
                setSelectedFile(file);
                setIsPhotoRemoved(false);
                if (file && errors.coverImageFile) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.coverImageFile;
                    delete next.coverImageUrl;
                    return next;
                  });
                }
              }}
              onRemove={() => {
                setSelectedFile(null);
                setIsPhotoRemoved(true);
                setFormData((prev) => ({ ...prev, coverImageUrl: "", coverImageAlt: "" }));
              }}
              disabled={isPending}
              isPending={isPending}
              variant="landscape"
              error={errors.coverImageFile || errors.coverImageUrl}
              altText={formData.coverImageAlt}
              onAltChange={(alt) => {
                setFormData((prev) => ({ ...prev, coverImageAlt: alt }));
                if (errors.coverImageAlt) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.coverImageAlt;
                    return next;
                  });
                }
              }}
              altLabel="Cover Image Alt Text"
              altPlaceholder="e.g. Annual sports meet torch lighting ceremony"
              altRequired={Boolean(selectedFile || (formData.coverImageUrl && !isPhotoRemoved))}
              altError={errors.coverImageAlt}
              helperText="Optional cover photograph. Supported: JPG, PNG, WebP (max 2 MiB)."
            />
          </div>

          {/* Row: Display Order & Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="event-order">
                Display Order
              </label>
              <input
                id="event-order"
                type="number"
                min="0"
                className="admin-form-input"
                value={formData.displayOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))}
                disabled={isPending}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="event-published">
                Publication Status
              </label>
              <select
                id="event-published"
                className="admin-form-select"
                value={formData.isPublished ? "true" : "false"}
                onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.value === "true" }))}
                disabled={isPending}
              >
                <option value="true">Published</option>
                <option value="false">Draft (Hidden)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="topper-dialog-footer">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={isPending}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving Event...
              </>
            ) : (
              <>
                <Sparkles size={15} />
                {event ? "Update Event" : "Create Event"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
