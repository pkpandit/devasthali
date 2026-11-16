"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle2, AlertCircle, Sparkles, ExternalLink } from "lucide-react";
import { updateHomepageHeroAction } from "@/lib/server/homepage-actions";

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
      const res = await updateHomepageHeroAction(null, formData);

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

          {/* Highlight Accent Text */}
          <div className="admin-field">
            <label htmlFor="highlightText" className="admin-label">
              Highlighted Accent Text (Gold Underline)
            </label>
            <input
              id="highlightText"
              type="text"
              name="highlightText"
              value={formData.highlightText}
              onChange={handleChange}
              placeholder="e.g. Since 1988"
              maxLength={80}
              className="admin-input"
            />
            {fieldErrors.highlightText && (
              <p className="admin-field-error">{fieldErrors.highlightText}</p>
            )}
            <p className="admin-field-note">
              Rendered with gold styling and red underline accent.
            </p>
          </div>
        </div>

        {/* Main Heading H1 */}
        <div className="admin-field">
          <label htmlFor="heading" className="admin-label">
            Main Display Heading H1 *
          </label>
          <input
            id="heading"
            type="text"
            name="heading"
            value={formData.heading}
            onChange={handleChange}
            placeholder="e.g. Nurturing Academic Rigour, Moral Character & Leadership"
            maxLength={180}
            className="admin-input"
            required
          />
          {fieldErrors.heading && (
            <p className="admin-field-error">{fieldErrors.heading}</p>
          )}
        </div>

        {/* Subheading */}
        <div className="admin-field">
          <label htmlFor="subheading" className="admin-label">
            Subheading &amp; Introduction *
          </label>
          <textarea
            id="subheading"
            name="subheading"
            value={formData.subheading}
            onChange={handleChange}
            rows={3}
            placeholder="Welcome to Devasthaly Vidyapeeth, a premier residential..."
            maxLength={600}
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
              placeholder="e.g. Apply for Admission"
              maxLength={60}
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

        {/* Background Image URL */}
        <div className="admin-field">
          <label htmlFor="backgroundImageUrl" className="admin-label">
            Background Showcase Image URL
          </label>
          <input
            id="backgroundImageUrl"
            type="text"
            name="backgroundImageUrl"
            value={formData.backgroundImageUrl}
            onChange={handleChange}
            placeholder="e.g. /images/about/campus-showcase.jpg"
            maxLength={500}
            className="admin-input"
          />
          {fieldErrors.backgroundImageUrl && (
            <p className="admin-field-error">{fieldErrors.backgroundImageUrl}</p>
          )}
          <p className="admin-field-note">
            Use a root-relative path (e.g. /images/...) or secure HTTPS image URL.
          </p>
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

      {/* Live Preview Card */}
      <div style={{ background: "#111827", color: "#ffffff", borderRadius: "14px", padding: "24px", border: "1px solid #1f2937", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Interactive Live Preview (Section 1: Hero Banner)
        </div>

        <div style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
          {formData.badgeText && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "9999px", background: "#b91c1c", color: "#ffffff", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", width: "fit-content" }}>
              <Sparkles size={14} style={{ color: "#f4cd13" }} />
              <span>{formData.badgeText}</span>
            </div>
          )}

          <h1 style={{ margin: 0, fontFamily: "var(--heading-font)", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.25, color: "#ffffff" }}>
            {formData.heading || "Hero Heading Preview"}{" "}
            {formData.highlightText && (
              <span style={{ color: "#f4cd13", textDecoration: "underline", textDecorationColor: "#b91c1c", textUnderlineOffset: "4px" }}>
                {formData.highlightText}
              </span>
            )}
          </h1>

          <p style={{ margin: 0, fontSize: "0.875rem", color: "#d1d5db", lineHeight: 1.6 }}>
            {formData.subheading || "Hero subheading preview description..."}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", paddingTop: "8px" }}>
            {formData.primaryCtaLabel && (
              <div style={{ padding: "8px 16px", borderRadius: "8px", background: "#b91c1c", color: "#ffffff", fontSize: "0.875rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span>{formData.primaryCtaLabel}</span>
                <ExternalLink size={14} />
              </div>
            )}
            {formData.secondaryCtaLabel && (
              <div style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "0.875rem", fontWeight: 700, border: "1px solid rgba(255,255,255,0.2)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <span>{formData.secondaryCtaLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
