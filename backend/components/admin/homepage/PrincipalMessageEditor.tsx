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
                Principal&apos;s Message Excerpt
              </h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                Front-facing leadership quote and editorial message shown on the public homepage.
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Heading */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Heading <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="heading"
                required
                value={formData.heading}
                onChange={handleChange}
                placeholder="e.g. Principal’s Message"
                maxLength={120}
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

            {/* Principal Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Principal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="principalName"
                required
                value={formData.principalName}
                onChange={handleChange}
                placeholder="e.g. P. C. Shrivastava"
                maxLength={120}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                  fieldErrors.principalName
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
                }`}
              />
              {fieldErrors.principalName && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.principalName}</p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="principalDesignation"
                required
                value={formData.principalDesignation}
                onChange={handleChange}
                placeholder="e.g. Principal, Devasthaly Vidyapeeth"
                maxLength={120}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                  fieldErrors.principalDesignation
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
                }`}
              />
              {fieldErrors.principalDesignation && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.principalDesignation}</p>
              )}
            </div>
          </div>

          {/* Featured Highlight Quote */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Highlighted Quote (Callout Text) <span className="text-red-500">*</span>
            </label>
            <textarea
              name="quote"
              rows={2}
              required
              value={formData.quote}
              onChange={handleChange}
              placeholder="Devasthaly Vidyapeeth is an amalgamation of competent teachers, state-of-the-art infrastructure..."
              maxLength={500}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                fieldErrors.quote
                  ? "border-red-400 bg-red-50/50"
                  : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
              }`}
            />
            {fieldErrors.quote && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.quote}</p>
            )}
          </div>

          {/* Excerpt Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Editorial Excerpt Body <span className="text-red-500">*</span>
            </label>
            <textarea
              name="excerpt"
              rows={4}
              required
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Devasthaly Vidyapeeth aims at holistic growth and development of its students..."
              maxLength={2000}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                fieldErrors.excerpt
                  ? "border-red-400 bg-red-50/50"
                  : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
              }`}
            />
            {fieldErrors.excerpt && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.excerpt}</p>
            )}
          </div>

          {/* Portrait & CTA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portrait Image URL
              </label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="e.g. /images/leadership/principal_sir.webp"
                maxLength={500}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                  fieldErrors.imageUrl
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
                }`}
              />
              {fieldErrors.imageUrl && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.imageUrl}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTA Button Label
              </label>
              <input
                type="text"
                name="ctaLabel"
                value={formData.ctaLabel}
                onChange={handleChange}
                placeholder="e.g. Read Full Message"
                maxLength={60}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                  fieldErrors.ctaLabel
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
                }`}
              />
              {fieldErrors.ctaLabel && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.ctaLabel}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTA Destination URL
              </label>
              <input
                type="text"
                name="ctaHref"
                value={formData.ctaHref}
                onChange={handleChange}
                placeholder="e.g. /principals-message"
                maxLength={500}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                  fieldErrors.ctaHref
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-300 hover:border-gray-400 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]"
                }`}
              />
              {fieldErrors.ctaHref && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.ctaHref}</p>
              )}
            </div>
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
              {formData.imageUrl ? (
                <Image
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
