"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle2, AlertCircle, Sparkles, ExternalLink } from "lucide-react";
import { updateHomepageHeroAction } from "@/lib/server/homepage-actions";
import { AdminImageUploadField } from "@/components/admin/ui/AdminImageUploadField";

export interface SerializedHomepageHero {
  id: string;
  badgeText: string | null;
  heading: string;
  highlightText: string | null;
  subheading: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  backgroundImageUrl: string | null;
  backgroundImageStorageKey: string | null;
  isPublished: boolean;
  updatedAt: string;
}

interface HeroSectionEditorProps {
  initialHero: SerializedHomepageHero | null;
}

export function HeroSectionEditor({ initialHero }: HeroSectionEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    badgeText: initialHero?.badgeText || "",
    heading: initialHero?.heading || "",
    highlightText: initialHero?.highlightText || "",
    subheading: initialHero?.subheading || "",
    primaryCtaLabel: initialHero?.primaryCtaLabel || "",
    primaryCtaHref: initialHero?.primaryCtaHref || "",
    secondaryCtaLabel: initialHero?.secondaryCtaLabel || "",
    secondaryCtaHref: initialHero?.secondaryCtaHref || "",
    backgroundImageUrl: initialHero?.backgroundImageUrl || "",
    isPublished: initialHero?.isPublished ?? true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);

  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successBanner, setSuccessBanner] = useState(false);

  const handleChange = (
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});
    setSuccessBanner(false);

    startTransition(async () => {
      const payload = new FormData();
      payload.append("badgeText", formData.badgeText.trim());
      payload.append("heading", formData.heading.trim());
      payload.append("highlightText", formData.highlightText.trim());
      payload.append("subheading", formData.subheading.trim());
      payload.append("primaryCtaLabel", formData.primaryCtaLabel.trim());
      payload.append("primaryCtaHref", formData.primaryCtaHref.trim());
      if (formData.secondaryCtaLabel.trim()) {
        payload.append("secondaryCtaLabel", formData.secondaryCtaLabel.trim());
      }
      if (formData.secondaryCtaHref.trim()) {
        payload.append("secondaryCtaHref", formData.secondaryCtaHref.trim());
      }
      payload.append("isPublished", String(formData.isPublished));

      if (selectedFile) {
        payload.append("backgroundImageFile", selectedFile);
      } else if (isImageRemoved) {
        payload.append("removeBackgroundImage", "true");
      } else if (formData.backgroundImageUrl) {
        payload.append("backgroundImageUrl", formData.backgroundImageUrl);
      }

      const res = await updateHomepageHeroAction(null, payload);

      if (!res.success) {
        setServerError(res.error || "Failed to update hero section");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      } else {
        setSuccessBanner(true);
        router.refresh();
      }
    });
  };

  return (
    <div className="admin-workspace">
      {/* Notifications */}
      {successBanner && (
        <div className="admin-banner--success" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>Homepage Hero section has been successfully saved and published.</span>
        </div>
      )}

      {serverError && (
        <div className="admin-banner--error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-section-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-workspace-toolbar__title">
              Hero Banner Content
            </h2>
            <p className="admin-workspace-toolbar__count">
              Topmost visual focal point for admissions and school introduction.
            </p>
          </div>
          <div className="admin-card-actions">
            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="admin-toggle"
              />
              <span>Section Published</span>
            </label>
          </div>
        </div>

        <div className="admin-form-grid-2">
          {/* Eyebrow Badge */}
          <div className="admin-field">
            <label htmlFor="badgeText" className="admin-label">
              Eyebrow Badge Text
            </label>
            <input
              id="badgeText"
              type="text"
              name="badgeText"
              value={formData.badgeText}
              onChange={handleChange}
              placeholder="e.g. Admissions Open 2026–27"
              maxLength={80}
              className="admin-input"
            />
            {fieldErrors.badgeText && (
              <p className="admin-field-error">{fieldErrors.badgeText}</p>
            )}
            <p className="admin-field-note">
              Small pill badge displayed above the main heading.
            </p>
          </div>

          {/* Highlight Keyphrase */}
          <div className="admin-field">
            <label htmlFor="highlightText" className="admin-label">
              Accent Highlight Keyphrase
            </label>
            <input
              id="highlightText"
              type="text"
              name="highlightText"
              value={formData.highlightText}
              onChange={handleChange}
              placeholder="e.g. Nurturing Future Leaders"
              maxLength={80}
              className="admin-input"
            />
            {fieldErrors.highlightText && (
              <p className="admin-field-error">{fieldErrors.highlightText}</p>
            )}
            <p className="admin-field-note">
              Golden gradient text emphasis inside the hero headline.
            </p>
          </div>
        </div>

        {/* Main Heading */}
        <div className="admin-field">
          <label htmlFor="heading" className="admin-label">
            Main Hero Heading *
          </label>
          <input
            id="heading"
            type="text"
            name="heading"
            value={formData.heading}
            onChange={handleChange}
            placeholder="e.g. Welcome to Devasthaly Vidyapeeth"
            maxLength={180}
            className="admin-input"
            required
          />
          {fieldErrors.heading && (
            <p className="admin-field-error">{fieldErrors.heading}</p>
          )}
        </div>

        {/* Subheading Narrative */}
        <div className="admin-field">
          <label htmlFor="subheading" className="admin-label">
            Hero Subheading Narrative *
          </label>
          <textarea
            id="subheading"
            name="subheading"
            value={formData.subheading}
            onChange={handleChange}
            rows={3}
            placeholder="Inspiring lead paragraph outlining school philosophy and values..."
            maxLength={1000}
            className="admin-textarea"
            required
          />
          {fieldErrors.subheading && (
            <p className="admin-field-error">{fieldErrors.subheading}</p>
          )}
        </div>

        {/* Primary CTA */}
        <div className="admin-form-grid-2">
          <div className="admin-field">
            <label htmlFor="primaryCtaLabel" className="admin-label">
              Primary CTA Button Label *
            </label>
            <input
              id="primaryCtaLabel"
              type="text"
              name="primaryCtaLabel"
              value={formData.primaryCtaLabel}
              onChange={handleChange}
              placeholder="e.g. Apply for Admission 2026–27"
              maxLength={50}
              className="admin-input"
              required
            />
            {fieldErrors.primaryCtaLabel && (
              <p className="admin-field-error">{fieldErrors.primaryCtaLabel}</p>
            )}
          </div>

          <div className="admin-field">
            <label htmlFor="primaryCtaHref" className="admin-label">
              Primary CTA Destination URL *
            </label>
            <input
              id="primaryCtaHref"
              type="text"
              name="primaryCtaHref"
              value={formData.primaryCtaHref}
              onChange={handleChange}
              placeholder="e.g. /admissions"
              maxLength={500}
              className="admin-input"
              required
            />
            {fieldErrors.primaryCtaHref && (
              <p className="admin-field-error">{fieldErrors.primaryCtaHref}</p>
            )}
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="admin-form-grid-2">
          <div className="admin-field">
            <label htmlFor="secondaryCtaLabel" className="admin-label">
              Secondary CTA Button Label (Optional)
            </label>
            <input
              id="secondaryCtaLabel"
              type="text"
              name="secondaryCtaLabel"
              value={formData.secondaryCtaLabel}
              onChange={handleChange}
              placeholder="e.g. Schedule a Guided Campus Tour"
              maxLength={60}
              className="admin-input"
            />
            {fieldErrors.secondaryCtaLabel && (
              <p className="admin-field-error">{fieldErrors.secondaryCtaLabel}</p>
            )}
          </div>

          <div className="admin-field">
            <label htmlFor="secondaryCtaHref" className="admin-label">
              Secondary CTA Destination URL (Optional)
            </label>
            <input
              id="secondaryCtaHref"
              type="text"
              name="secondaryCtaHref"
              value={formData.secondaryCtaHref}
              onChange={handleChange}
              placeholder="e.g. /contact"
              maxLength={500}
              className="admin-input"
            />
            {fieldErrors.secondaryCtaHref && (
              <p className="admin-field-error">{fieldErrors.secondaryCtaHref}</p>
            )}
          </div>
        </div>

        {/* Standardized Background Image Upload */}
        <div style={{ marginTop: "16px" }}>
          <AdminImageUploadField
            label="Hero Background Showcase Image"
            variant="landscape"
            currentImageUrl={formData.backgroundImageUrl}
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
            error={fieldErrors.backgroundImageFile || fieldErrors.backgroundImageUrl}
            disabled={isPending}
            isPending={isPending}
            helperText="Supported formats: JPEG, PNG, WebP (max 2 MiB). Recommended high-resolution landscape banner (1920x1080)."
          />
        </div>

        {/* Action Controls */}
        <div className="admin-form-row" style={{ justifyContent: "flex-end", paddingTop: "8px" }}>
          <button
            type="submit"
            disabled={isPending}
            className="admin-button admin-button--primary"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Hero Section...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preview Card */}
      <div className="admin-section-card" style={{ marginTop: "24px" }}>
        <div className="admin-card-header">
          <div>
            <h3 className="admin-workspace-toolbar__title" style={{ fontSize: "1rem" }}>
              Live Hero Banner Presentation Preview
            </h3>
            <p className="admin-workspace-toolbar__count">
              Synthesized visual arrangement matching public layout styling.
            </p>
          </div>
          <span className="admin-badge admin-badge--success">Public Layout</span>
        </div>

        <div
          style={{
            position: "relative",
            padding: "48px 32px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
            color: "#ffffff",
            overflow: "hidden",
          }}
        >
          {formData.badgeText && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "9999px",
                background: "rgba(217, 119, 6, 0.2)",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                color: "#fbbf24",
                fontSize: "0.75rem",
                fontWeight: 600,
                marginBottom: "16px",
              }}
            >
              <Sparkles size={12} />
              <span>{formData.badgeText}</span>
            </div>
          )}

          <h1
            style={{
              fontFamily: "var(--heading-font, serif)",
              fontSize: "2rem",
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: "12px",
              maxWidth: "800px",
            }}
          >
            {formData.heading || "Hero Heading Preview"}
            {formData.highlightText && (
              <span
                style={{
                  display: "block",
                  color: "#f59e0b",
                  fontSize: "1.75rem",
                  marginTop: "4px",
                }}
              >
                {formData.highlightText}
              </span>
            )}
          </h1>

          <p
            style={{
              color: "#cbd5e1",
              fontSize: "0.9375rem",
              lineHeight: 1.6,
              maxWidth: "650px",
              marginBottom: "24px",
            }}
          >
            {formData.subheading || "Hero narrative subheading preview..."}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {formData.primaryCtaLabel && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "#b91c1c",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                <span>{formData.primaryCtaLabel}</span>
                <ExternalLink size={14} />
              </span>
            )}
            {formData.secondaryCtaLabel && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                <span>{formData.secondaryCtaLabel}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
