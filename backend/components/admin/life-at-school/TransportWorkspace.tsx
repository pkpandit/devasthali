"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bus,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { updateTransportSectionAction } from "@/lib/server/transport-hostel-actions";
import { isValidInternalCtaUrl } from "@/lib/validation/transport-hostel";

export interface SerializedTransportSection {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TransportWorkspaceProps {
  section: SerializedTransportSection | null;
}

export function TransportWorkspace({ section }: TransportWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [badge, setBadge] = useState(
    section?.badge ?? "Day-Scholar Transport Network"
  );
  const [title, setTitle] = useState(
    section?.title ?? "Safe, GPS-Tracked Transportation Fleet"
  );
  const [description, setDescription] = useState(
    section?.description ??
      "Our yellow school buses operate on strictly monitored routes connecting Chilkahar to Ballia City, Rasra Tehsil, Sikanderpur, Nagra, Bilthara Road, and adjacent rural educational nodes. Each bus is equipped with speed governors, CCTV cameras, first-aid kits, and trained female attendants for younger students."
  );
  const [ctaText, setCtaText] = useState(
    section?.ctaText ?? "Contact Transport Coordinator for Pick-up Node Details →"
  );
  const [ctaUrl, setCtaUrl] = useState(section?.ctaUrl ?? "/contact");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isValidInternalCtaUrl(ctaUrl)) {
      setError(
        "Invalid CTA URL. Must be an approved internal path (e.g. /contact, /admissions, /facilities)."
      );
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateTransportSectionAction({
          badge: badge.trim(),
          title: title.trim(),
          description: description.trim(),
          ctaText: ctaText.trim(),
          ctaUrl: ctaUrl.trim(),
        });

        if (res.success) {
          setSuccess("Safe transport fleet section updated successfully.");
          router.refresh();
        } else {
          setError(res.error || "Failed to update transport section.");
        }
      } catch (err) {
        console.error("Transport update error:", err);
        setError("An unexpected error occurred.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. TRANSPORT OVERVIEW FORM */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Safe Transport Fleet Settings</h2>
            <p className="text-xs text-gray-500">
              Manage the fleet overview headline, route narrative, and contact CTA displayed on the public Facilities page.
            </p>
          </div>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Badge / Tagline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Day-Scholar Transport Network"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Section Heading <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Safe, GPS-Tracked Transportation Fleet"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Route & Fleet Narrative Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              maxLength={3000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail bus coverage areas, safety features, speed governors, CCTV, and attendants..."
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
            />
            <p className="mt-1 text-xs text-gray-500">Max 3,000 characters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Call-to-Action Link Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="e.g. Contact Transport Coordinator for Pick-up Node Details →"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Call-to-Action Target URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={255}
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="e.g. /contact"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be an approved relative path (e.g. <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">/contact</code>).
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#B91C1C] px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-[#991B1B] transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Transport Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. PUBLIC CARD PREVIEW */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 shadow-xs">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
          Public Card Live Preview
        </h3>
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#B91C1C] text-sm font-bold uppercase tracking-wider">
            <Bus className="w-4 h-4 text-[#B91C1C]" />
            <span>{badge || "Day-Scholar Transport Network"}</span>
          </div>
          <h4 className="font-heading text-xl sm:text-2xl font-bold text-[#111827]">
            {title || "Safe, GPS-Tracked Transportation Fleet"}
          </h4>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-sans">
            {description || "Transport narrative text will appear here..."}
          </p>
          <div className="pt-2">
            <Link
              href={ctaUrl || "/contact"}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#B91C1C] hover:underline"
            >
              <span>{ctaText || "Contact Transport Coordinator →"}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
