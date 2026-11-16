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
    <div className="space-y-8">
      {/* Notifications */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">
            Homepage Hero section has been successfully saved and published.
          </p>
        </div>
      )}

      {serverError && (
        <div className="topper-dialog-error-banner flex items-center gap-3" role="alert">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm font-medium">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-heading font-bold text-gray-900">
                Hero Banner Content
              </h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                Topmost visual focal point for admissions and school introduction.
              </p>
            </div>
            <label className="topper-checkbox-wrapper min-h-[44px]">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="topper-checkbox"
              />
              <span className="topper-checkbox-label">Section Published</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Eyebrow Badge */}
            <div className="topper-field">
              <label htmlFor="badgeText" className="topper-label">
                Eyebrow Badge Text
              </label>
              <input
                id="badgeText"
                type="text"
                name="badgeText"
                value={formData.badgeText}
                onChange={handleChange}
                placeholder="e.g. Admissions Open 2026–27 • LKG to Class XI"
                maxLength={120}
                className={`topper-input ${fieldErrors.badgeText ? "topper-input--error" : ""}`}
              />
              {fieldErrors.badgeText && (
                <p className="topper-field-error">{fieldErrors.badgeText}</p>
              )}
            </div>

            {/* Highlighted Accent Text */}
            <div className="topper-field">
              <label htmlFor="highlightText" className="topper-label">
                Highlighted Accent Text (Gold Underline)
              </label>
              <input
                id="highlightText"
                type="text"
                name="highlightText"
                value={formData.highlightText}
                onChange={handleChange}
                placeholder="e.g. Since 1988"
                maxLength={100}
                className={`topper-input ${fieldErrors.highlightText ? "topper-input--error" : ""}`}
              />
              {fieldErrors.highlightText && (
                <p className="topper-field-error">{fieldErrors.highlightText}</p>
              )}
            </div>
          </div>

          {/* Main Heading H1 */}
          <div className="topper-field">
            <label htmlFor="heading" className="topper-label">
              Main Display Heading H1 <span className="text-red-500">*</span>
            </label>
            <input
              id="heading"
              type="text"
              name="heading"
              required
              value={formData.heading}
              onChange={handleChange}
              placeholder="e.g. Nurturing Academic Rigour, Moral Character & Leadership"
              maxLength={255}
              className={`topper-input ${fieldErrors.heading ? "topper-input--error" : ""}`}
            />
            {fieldErrors.heading && (
              <p className="topper-field-error">{fieldErrors.heading}</p>
            )}
          </div>

          {/* Subheading */}
          <div className="topper-field">
            <label htmlFor="subheading" className="topper-label">
              Subheading & Introduction <span className="text-red-500">*</span>
            </label>
            <textarea
              id="subheading"
              name="subheading"
              rows={3}
              required
              value={formData.subheading}
              onChange={handleChange}
              placeholder="Welcome to Devasthaly Vidyapeeth, Chilkahar, Ballia..."
              maxLength={2000}
              className={`topper-input ${fieldErrors.subheading ? "topper-input--error" : ""}`}
            />
            {fieldErrors.subheading && (
              <p className="topper-field-error">{fieldErrors.subheading}</p>
            )}
          </div>

          {/* Primary CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
            <div className="topper-field">
              <label htmlFor="primaryCtaLabel" className="topper-label">
                Primary CTA Button Label <span className="text-red-500">*</span>
              </label>
              <input
                id="primaryCtaLabel"
                type="text"
                name="primaryCtaLabel"
                required
                value={formData.primaryCtaLabel}
                onChange={handleChange}
                placeholder="e.g. Apply 2026–27"
                maxLength={60}
                className={`topper-input ${fieldErrors.primaryCtaLabel ? "topper-input--error" : ""}`}
              />
              {fieldErrors.primaryCtaLabel && (
                <p className="topper-field-error">{fieldErrors.primaryCtaLabel}</p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="primaryCtaHref" className="topper-label">
                Primary CTA Destination URL <span className="text-red-500">*</span>
              </label>
              <input
                id="primaryCtaHref"
                type="text"
                name="primaryCtaHref"
                required
                value={formData.primaryCtaHref}
                onChange={handleChange}
                placeholder="e.g. /admissions"
                maxLength={500}
                className={`topper-input ${fieldErrors.primaryCtaHref ? "topper-input--error" : ""}`}
              />
              {fieldErrors.primaryCtaHref && (
                <p className="topper-field-error">{fieldErrors.primaryCtaHref}</p>
              )}
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="topper-field">
              <label htmlFor="secondaryCtaLabel" className="topper-label">
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
                className={`topper-input ${fieldErrors.secondaryCtaLabel ? "topper-input--error" : ""}`}
              />
              {fieldErrors.secondaryCtaLabel && (
                <p className="topper-field-error">{fieldErrors.secondaryCtaLabel}</p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="secondaryCtaHref" className="topper-label">
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
                className={`topper-input ${fieldErrors.secondaryCtaHref ? "topper-input--error" : ""}`}
              />
              {fieldErrors.secondaryCtaHref && (
                <p className="topper-field-error">{fieldErrors.secondaryCtaHref}</p>
              )}
            </div>
          </div>

          {/* Background Image URL */}
          <div className="topper-field pt-2 border-t border-gray-100">
            <label htmlFor="backgroundImageUrl" className="topper-label">
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
              className={`topper-input ${fieldErrors.backgroundImageUrl ? "topper-input--error" : ""}`}
            />
            {fieldErrors.backgroundImageUrl && (
              <p className="topper-field-error">{fieldErrors.backgroundImageUrl}</p>
            )}
            <p className="topper-field-note">
              Use a root-relative path (e.g. /images/...) or secure HTTPS image URL.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="topper-button topper-button--primary min-h-[44px] px-6 gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Hero Section...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Live Preview Card */}
      <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">
          Interactive Live Preview (Section 1: Hero Banner)
        </div>

        <div className="max-w-2xl space-y-4 text-left">
          {formData.badgeText && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B91C1C] text-white text-xs font-heading font-bold uppercase tracking-wider w-fit">
              <Sparkles className="w-3.5 h-3.5 text-[#F4CD13]" />
              <span>{formData.badgeText}</span>
            </div>
          )}

          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {formData.heading || "Hero Heading Preview"}{" "}
            {formData.highlightText && (
              <span className="text-[#F4CD13] underline decoration-[#B91C1C] decoration-2 underline-offset-4">
                {formData.highlightText}
              </span>
            )}
          </h1>

          <p className="text-sm text-gray-300 leading-relaxed font-sans">
            {formData.subheading || "Hero subheading preview description..."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {formData.primaryCtaLabel && (
              <div className="px-4 py-2 rounded-xl bg-[#B91C1C] text-white text-sm font-heading font-bold inline-flex items-center gap-1.5 shadow-sm">
                <span>{formData.primaryCtaLabel}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            )}
            {formData.secondaryCtaLabel && (
              <div className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-heading font-bold border border-white/20 inline-flex items-center gap-1.5 backdrop-blur-sm">
                <span>{formData.secondaryCtaLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
