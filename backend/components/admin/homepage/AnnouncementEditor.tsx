"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Megaphone,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Key,
  ImageIcon,
  Link as LinkIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { updateHomepageAnnouncementAction } from "@/lib/server/homepage-announcement-faq-actions";
import {
  isValidAnnouncementImageUrl,
  isValidAnnouncementCtaUrl,
} from "@/lib/validation/homepage-announcement-faq";

export interface SerializedHomepageAnnouncement {
  id: string;
  enabled: boolean;
  title: string;
  badge?: string | null;
  subtitle?: string | null;
  imageUrl: string;
  imageAlt: string;
  linkHref: string;
  linkLabel: string;
  delayMs: number;
  dismissalKey: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AnnouncementEditorProps {
  initialAnnouncement: SerializedHomepageAnnouncement | null;
}

export function AnnouncementEditor({
  initialAnnouncement,
}: AnnouncementEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [enabled, setEnabled] = useState(initialAnnouncement?.enabled ?? false);
  const [title, setTitle] = useState(
    initialAnnouncement?.title ?? "Alumni Meet 2026"
  );
  const [badge, setBadge] = useState(
    initialAnnouncement?.badge ?? "Special Event"
  );
  const [subtitle, setSubtitle] = useState(
    initialAnnouncement?.subtitle ?? "Reconnect, Relive, Rejoice"
  );
  const [imageUrl, setImageUrl] = useState(
    initialAnnouncement?.imageUrl ??
      "/images/announcements/alumni-meet-2026.webp"
  );
  const [imageAlt, setImageAlt] = useState(
    initialAnnouncement?.imageAlt ??
      "Devasthaly Vidyapeeth Alumni Meet 2026 Official Poster - Reconnect, Relive, Rejoice"
  );
  const [linkHref, setLinkHref] = useState(
    initialAnnouncement?.linkHref ?? "/alumni"
  );
  const [linkLabel, setLinkLabel] = useState(
    initialAnnouncement?.linkLabel ?? "Join the Meet"
  );
  const [delayMs, setDelayMs] = useState(
    initialAnnouncement?.delayMs ?? 3000
  );
  const [dismissalKey, setDismissalKey] = useState(
    initialAnnouncement?.dismissalKey ??
      "dvp_announcement_dismissed_alumni_meet_2026"
  );

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side quick security validation
    if (!isValidAnnouncementImageUrl(imageUrl)) {
      setError(
        "Invalid image URL. Must be an approved static announcement asset path (e.g. /images/announcements/*.webp, *.jpg, *.png)."
      );
      return;
    }

    if (!isValidAnnouncementCtaUrl(linkHref)) {
      setError(
        "Invalid link target. Must be an approved internal path (/alumni, /admissions, /contact, /notices, /facilities)."
      );
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateHomepageAnnouncementAction({
          enabled,
          title: title.trim(),
          badge: badge.trim() || null,
          subtitle: subtitle.trim() || null,
          imageUrl: imageUrl.trim(),
          imageAlt: imageAlt.trim(),
          linkHref: linkHref.trim(),
          linkLabel: linkLabel.trim(),
          delayMs: Number(delayMs),
          dismissalKey: dismissalKey.trim(),
        });

        if (res.success) {
          setSuccess("Homepage announcement modal updated successfully.");
          router.refresh();
        } else {
          setError(res.error || "Failed to update announcement modal.");
        }
      } catch (err) {
        console.error("Announcement update error:", err);
        setError("An unexpected error occurred while saving.");
      }
    });
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 shadow-xs">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Homepage Announcement Modal
                </h2>
                <p className="text-xs text-gray-500">
                  Manage the promotional pop-up banner, poster image, target URL, and session dismissal rules.
                </p>
              </div>
            </div>

            {/* Enable/Disable Toggle Pill */}
            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
              <label
                htmlFor="announcement-enabled-switch"
                className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700"
              >
                {enabled ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Eye className="w-3.5 h-3.5" />
                    Active (Visible on Homepage)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                    <EyeOff className="w-3.5 h-3.5" />
                    Disabled (Hidden)
                  </span>
                )}
                <input
                  id="announcement-enabled-switch"
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`relative inline-block w-11 h-6 transition-colors duration-200 ease-in-out rounded-full ${
                    enabled ? "bg-[#B91C1C]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block w-5 h-5 transition-transform duration-200 ease-in-out transform bg-white rounded-full shadow-sm mt-0.5 ml-0.5 ${
                      enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
              </label>
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label
                htmlFor="announcement-title"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
              >
                Announcement Title <span className="text-red-500">*</span>
              </label>
              <input
                id="announcement-title"
                type="text"
                required
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Alumni Meet 2026"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C] text-sm text-gray-800"
              />
              <p className="mt-1 text-[11px] text-gray-400">Max 150 characters</p>
            </div>

            {/* Badge */}
            <div>
              <label
                htmlFor="announcement-badge"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
              >
                Pill Badge Text (Optional)
              </label>
              <input
                id="announcement-badge"
                type="text"
                maxLength={50}
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Special Event"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C] text-sm text-gray-800"
              />
              <p className="mt-1 text-[11px] text-gray-400">Max 50 characters</p>
            </div>

            {/* Subtitle */}
            <div className="md:col-span-2">
              <label
                htmlFor="announcement-subtitle"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
              >
                Subtitle / Tagline (Optional)
              </label>
              <input
                id="announcement-subtitle"
                type="text"
                maxLength={200}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Reconnect, Relive, Rejoice"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C] text-sm text-gray-800"
              />
              <p className="mt-1 text-[11px] text-gray-400">Max 200 characters</p>
            </div>

            {/* Image URL */}
            <div>
              <label
                htmlFor="announcement-image-url"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Static Image Path <span className="text-red-500">*</span>
              </label>
              <input
                id="announcement-image-url"
                type="text"
                required
                maxLength={500}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/images/announcements/alumni-meet-2026.webp"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C] text-sm text-gray-800 font-mono"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Approved path pattern: /images/announcements/*.webp|jpg|png
              </p>
            </div>

            {/* Image Alt */}
            <div>
              <label
                htmlFor="announcement-image-alt"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
              >
                Image Accessible Alt Text <span className="text-red-500">*</span>
              </label>
              <input
                id="announcement-image-alt"
                type="text"
                required
                maxLength={255}
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Devasthaly Vidyapeeth Alumni Meet 2026 Official Poster"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C] text-sm text-gray-800"
              />
              <p className="mt-1 text-[11px] text-gray-400">Max 255 characters</p>
            </div>

            {/* Link Target */}
            <div>
              <label
                htmlFor="announcement-link-href"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                Action Button Target URL <span className="text-red-500">*</span>
              </label>
              <input
                id="announcement-link-href"
                type="text"
                required
                maxLength={255}
                value={linkHref}
                onChange={(e) => setLinkHref(e.target.value)}
                placeholder="/alumni"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C] text-sm text-gray-800 font-mono"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Allowed routes: /alumni, /admissions, /contact, /notices, /facilities
              </p>
            </div>

            {/* Link Label */}
            <div>
              <label
                htmlFor="announcement-link-label"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
              >
                Action Button Label <span className="text-red-500">*</span>
              </label>
              <input
                id="announcement-link-label"
                type="text"
                required
                maxLength={100}
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="Join the Meet"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C] text-sm text-gray-800"
              />
              <p className="mt-1 text-[11px] text-gray-400">Max 100 characters</p>
            </div>

            {/* Delay MS */}
            <div>
              <label
                htmlFor="announcement-delay-ms"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                Popup Delay (Milliseconds) <span className="text-red-500">*</span>
              </label>
              <input
                id="announcement-delay-ms"
                type="number"
                required
                min={0}
                max={30000}
                step={500}
                value={delayMs}
                onChange={(e) => setDelayMs(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C] text-sm text-gray-800"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Delay before displaying modal (0 – 30,000ms, e.g. 3000 = 3 seconds)
              </p>
            </div>

            {/* Dismissal Key */}
            <div>
              <label
                htmlFor="announcement-dismissal-key"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                Session Dismissal Key <span className="text-red-500">*</span>
              </label>
              <input
                id="announcement-dismissal-key"
                type="text"
                required
                maxLength={100}
                value={dismissalKey}
                onChange={(e) => setDismissalKey(e.target.value)}
                placeholder="dvp_announcement_dismissed_alumni_meet_2026"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C] text-sm text-gray-800 font-mono"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Updating this key resets dismissal for previously dismissed visitors.
              </p>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Changes reflect immediately on the public homepage upon cache revalidation.
            </span>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#B91C1C] text-white font-medium hover:bg-[#991b1b] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Announcement Settings
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Live Preview Card */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 sm:p-8">
        <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-600" />
          Modal Preview ({enabled ? "Active" : "Disabled"})
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          This preview reflects the current configured modal layout, poster asset, and CTA styling.
        </p>

        <div className="max-w-md mx-auto bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
          <div className="relative aspect-3/4 max-h-[380px] w-full bg-gray-900">
            {imageUrl && isValidAnnouncementImageUrl(imageUrl) ? (
              <Image
                src={imageUrl}
                alt={imageAlt || "Announcement"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                Static Image: {imageUrl}
              </div>
            )}
            {badge && (
              <div className="absolute top-3 left-3 bg-[#B91C1C] text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                {badge}
              </div>
            )}
          </div>
          <div className="p-5">
            <h4 className="text-lg font-bold text-gray-900">{title || "Untitled Announcement"}</h4>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            <div className="mt-4 flex gap-2">
              <span className="flex-1 text-center py-2 px-4 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold">
                {linkLabel || "Action"}
              </span>
              <span className="py-2 px-4 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold">
                Close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
