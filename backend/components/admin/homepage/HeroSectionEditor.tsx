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
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm font-medium">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-heading font-bold text-gray-900">
                Hero Banner Content
              </h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                Topmost visual focal point for admissions and school introduction.
              </p>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="w-4 h-4 text-[#B91C1C] rounded border-gray-300 focus:ring-[#B91C1C]"
              />
              <span className="text-sm font-medium text-gray-700">Section Published</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Eyebrow Badge */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eyebrow Badge Text
              </label>
              <input
                type="text"
                name="badgeText"
                value={formData.badgeText}
                onChange={handleChange}
                placeholder="e.g. Admissions Open 2026–27 • LKG to Class XI"
                maxLength={120}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                  fieldErrors.badgeText
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
                }`}
              />
              {fieldErrors.badgeText && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.badgeText}</p>
              )}
            </div>

            {/* Highlighted Accent Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Highlighted Accent Text (Gold Underline)
              </label>
              <input
                type="text"
                name="highlightText"
                value={formData.highlightText}
                onChange={handleChange}
                placeholder="e.g. Since 1988"
                maxLength={100}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                  fieldErrors.highlightText
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
                }`}
              />
              {fieldErrors.highlightText && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.highlightText}</p>
              )}
            </div>
          </div>

          {/* Main Heading H1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Display Heading H1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="heading"
              required
              value={formData.heading}
              onChange={handleChange}
              placeholder="e.g. Nurturing Academic Rigour, Moral Character & Leadership"
              maxLength={255}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                fieldErrors.heading
                  ? "border-red-400 bg-red-50/50"
                  : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
              }`}
            />
            {fieldErrors.heading && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.heading}</p>
            )}
          </div>

          {/* Subheading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subheading & Introduction <span className="text-red-500">*</span>
            </label>
            <textarea
              name="subheading"
              rows={3}
              required
              value={formData.subheading}
              onChange={handleChange}
              placeholder="Welcome to Devasthaly Vidyapeeth, Chilkahar, Ballia..."
              maxLength={2000}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                fieldErrors.subheading
                  ? "border-red-400 bg-red-50/50"
                  : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
              }`}
            />
            {fieldErrors.subheading && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.subheading}</p>
            )}
          </div>

          {/* Primary CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary CTA Button Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="primaryCtaLabel"
                required
                value={formData.primaryCtaLabel}
                onChange={handleChange}
                placeholder="e.g. Apply 2026–27"
                maxLength={60}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                  fieldErrors.primaryCtaLabel
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
                }`}
              />
              {fieldErrors.primaryCtaLabel && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.primaryCtaLabel}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary CTA Destination URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="primaryCtaHref"
                required
                value={formData.primaryCtaHref}
                onChange={handleChange}
                placeholder="e.g. /admissions"
                maxLength={500}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                  fieldErrors.primaryCtaHref
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
                }`}
              />
              {fieldErrors.primaryCtaHref && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.primaryCtaHref}</p>
              )}
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary CTA Button Label (Optional)
              </label>
              <input
                type="text"
                name="secondaryCtaLabel"
                value={formData.secondaryCtaLabel}
                onChange={handleChange}
                placeholder="e.g. Schedule a Guided Campus Tour"
                maxLength={60}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                  fieldErrors.secondaryCtaLabel
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
                }`}
              />
              {fieldErrors.secondaryCtaLabel && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.secondaryCtaLabel}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary CTA Destination URL (Optional)
              </label>
              <input
                type="text"
                name="secondaryCtaHref"
                value={formData.secondaryCtaHref}
                onChange={handleChange}
                placeholder="e.g. /contact"
                maxLength={500}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                  fieldErrors.secondaryCtaHref
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
                }`}
              />
              {fieldErrors.secondaryCtaHref && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.secondaryCtaHref}</p>
              )}
            </div>
          </div>

          {/* Background Image URL */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Showcase Image URL
            </label>
            <input
              type="text"
              name="backgroundImageUrl"
              value={formData.backgroundImageUrl}
              onChange={handleChange}
              placeholder="e.g. /images/about/campus-showcase.jpg"
              maxLength={500}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                fieldErrors.backgroundImageUrl
                  ? "border-red-400 bg-red-50/50"
                  : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
              }`}
            />
            {fieldErrors.backgroundImageUrl && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.backgroundImageUrl}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Use a root-relative path (e.g. /images/...) or secure HTTPS image URL.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-[#B91C1C] text-white font-heading font-bold text-sm hover:bg-[#991b1b] focus:outline-2 focus:outline-offset-2 focus:outline-[#B91C1C] disabled:opacity-50 inline-flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
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
