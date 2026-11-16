"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { updateHomepagePrincipalMessageAction } from "@/lib/server/homepage-actions";

export interface SerializedHomepagePrincipalMessage {
  id: string;
  heading: string;
  principalName: string;
  principalDesignation: string;
  quote: string;
  excerpt: string;
  imageUrl: string | null;
  imageStorageKey: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  isPublished: boolean;
  updatedAt: string;
}

interface PrincipalMessageEditorProps {
  initialPrincipal: SerializedHomepagePrincipalMessage | null;
}

export function PrincipalMessageEditor({ initialPrincipal }: PrincipalMessageEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    heading: initialPrincipal?.heading || "Principal’s Message",
    principalName: initialPrincipal?.principalName || "P. C. Shrivastava",
    principalDesignation:
      initialPrincipal?.principalDesignation || "Principal, Devasthaly Vidyapeeth",
    quote: initialPrincipal?.quote || "",
    excerpt: initialPrincipal?.excerpt || "",
    imageUrl: initialPrincipal?.imageUrl || "/images/leadership/principal_sir.webp",
    ctaLabel: initialPrincipal?.ctaLabel || "Read Full Message",
    ctaHref: initialPrincipal?.ctaHref || "/principals-message",
    isPublished: initialPrincipal?.isPublished ?? true,
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
      const res = await updateHomepagePrincipalMessageAction(null, formData);

      if (!res.success) {
        setServerError(res.error || "Failed to update Principal's message");
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
            Principal&apos;s Message excerpt section has been successfully saved.
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
                Principal&apos;s Message Excerpt
              </h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                Front-facing leadership quote and editorial message. Stored in database and managed here; retained for future approved public layout.
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Heading */}
            <div className="topper-field">
              <label htmlFor="heading" className="topper-label">
                Section Heading <span className="text-red-500">*</span>
              </label>
              <input
                id="heading"
                type="text"
                name="heading"
                required
                value={formData.heading}
                onChange={handleChange}
                placeholder="e.g. Principal’s Message"
                maxLength={120}
                className={`topper-input ${fieldErrors.heading ? "topper-input--error" : ""}`}
              />
              {fieldErrors.heading && (
                <p className="topper-field-error">{fieldErrors.heading}</p>
              )}
            </div>

            {/* Principal Name */}
            <div className="topper-field">
              <label htmlFor="principalName" className="topper-label">
                Principal Name <span className="text-red-500">*</span>
              </label>
              <input
                id="principalName"
                type="text"
                name="principalName"
                required
                value={formData.principalName}
                onChange={handleChange}
                placeholder="e.g. P. C. Shrivastava"
                maxLength={120}
                className={`topper-input ${fieldErrors.principalName ? "topper-input--error" : ""}`}
              />
              {fieldErrors.principalName && (
                <p className="topper-field-error">{fieldErrors.principalName}</p>
              )}
            </div>

            {/* Designation */}
            <div className="topper-field">
              <label htmlFor="principalDesignation" className="topper-label">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                id="principalDesignation"
                type="text"
                name="principalDesignation"
                required
                value={formData.principalDesignation}
                onChange={handleChange}
                placeholder="e.g. Principal, Devasthaly Vidyapeeth"
                maxLength={120}
                className={`topper-input ${fieldErrors.principalDesignation ? "topper-input--error" : ""}`}
              />
              {fieldErrors.principalDesignation && (
                <p className="topper-field-error">{fieldErrors.principalDesignation}</p>
              )}
            </div>
          </div>

          {/* Featured Highlight Quote */}
          <div className="topper-field">
            <label htmlFor="quote" className="topper-label">
              Highlighted Quote (Callout Text) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="quote"
              name="quote"
              rows={2}
              required
              value={formData.quote}
              onChange={handleChange}
              placeholder="Devasthaly Vidyapeeth is an amalgamation of competent teachers, state-of-the-art infrastructure..."
              maxLength={500}
              className={`topper-input ${fieldErrors.quote ? "topper-input--error" : ""}`}
            />
            {fieldErrors.quote && (
              <p className="topper-field-error">{fieldErrors.quote}</p>
            )}
          </div>

          {/* Excerpt Body */}
          <div className="topper-field">
            <label htmlFor="excerpt" className="topper-label">
              Editorial Excerpt Body <span className="text-red-500">*</span>
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={4}
              required
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Devasthaly Vidyapeeth aims at holistic growth and development of its students..."
              maxLength={2000}
              className={`topper-input ${fieldErrors.excerpt ? "topper-input--error" : ""}`}
            />
            {fieldErrors.excerpt && (
              <p className="topper-field-error">{fieldErrors.excerpt}</p>
            )}
          </div>

          {/* Portrait & CTA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 border-t border-gray-100">
            <div className="topper-field">
              <label htmlFor="imageUrl" className="topper-label">
                Portrait Image URL
              </label>
              <input
                id="imageUrl"
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="e.g. /images/leadership/principal_sir.webp"
                maxLength={500}
                className={`topper-input ${fieldErrors.imageUrl ? "topper-input--error" : ""}`}
              />
              {fieldErrors.imageUrl && (
                <p className="topper-field-error">{fieldErrors.imageUrl}</p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="ctaLabel" className="topper-label">
                CTA Button Label
              </label>
              <input
                id="ctaLabel"
                type="text"
                name="ctaLabel"
                value={formData.ctaLabel}
                onChange={handleChange}
                placeholder="e.g. Read Full Message"
                maxLength={60}
                className={`topper-input ${fieldErrors.ctaLabel ? "topper-input--error" : ""}`}
              />
              {fieldErrors.ctaLabel && (
                <p className="topper-field-error">{fieldErrors.ctaLabel}</p>
              )}
            </div>

            <div className="topper-field">
              <label htmlFor="ctaHref" className="topper-label">
                CTA Destination URL
              </label>
              <input
                id="ctaHref"
                type="text"
                name="ctaHref"
                value={formData.ctaHref}
                onChange={handleChange}
                placeholder="e.g. /principals-message"
                maxLength={500}
                className={`topper-input ${fieldErrors.ctaHref ? "topper-input--error" : ""}`}
              />
              {fieldErrors.ctaHref && (
                <p className="topper-field-error">{fieldErrors.ctaHref}</p>
              )}
            </div>
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
                <span>Saving Principal&apos;s Message...</span>
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
      <div className="bg-[#F9FAFB] rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md">
        <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-6">
          Live Section Preview: {formData.heading}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Portrait Preview */}
          <div className="md:col-span-4 flex flex-col items-center text-center">
            <div className="relative w-36 h-48 sm:w-44 sm:h-56 rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 shadow-sm">
              {formData.imageUrl ? (                <Image
                  src={formData.imageUrl}
                  alt={formData.principalName || "Principal"}
                  fill
                  sizes="176px"
                  className="object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-sans">
                  No Portrait
                </div>
              )}
            </div>
            <h3 className="font-heading font-bold text-gray-900 mt-3 text-base">
              {formData.principalName}
            </h3>
            <p className="text-xs text-[#B91C1C] font-semibold">
              {formData.principalDesignation}
            </p>
          </div>

          {/* Quote & Excerpt */}
          <div className="md:col-span-8 space-y-4 text-left">
            <div className="border-l-4 border-[#B91C1C] pl-4 py-1">
              <p className="font-heading font-semibold text-sm sm:text-base text-gray-900 italic">
                &ldquo;{formData.quote || "Featured highlight quote..."}&rdquo;
              </p>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed font-sans line-clamp-4">
              {formData.excerpt || "Excerpt message body..."}
            </p>

            {formData.ctaLabel && (
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-heading font-bold shadow-xs">
                  <span>{formData.ctaLabel}</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
