"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Save,
  Loader2,
  CheckCircle2,
  Users,
  ExternalLink,
  Quote,
  Award,
} from "lucide-react";
import { updateLeadershipMemberAction } from "@/lib/server/about-leadership-actions";

export interface SerializedLeadershipMember {
  id: string;
  role: "FOUNDER" | "PATRON" | "PRESIDENT" | "MANAGER" | "PRINCIPAL";
  slug: string;
  pageTitle: string;
  breadcrumb: string;
  badgeText: string;
  name: string;
  designation: string;
  termOrAffiliation: string | null;
  location: string | null;
  shortIntro: string;
  quote: string | null;
  messageBody: string;
  imageUrl: string | null;
  imageStorageKey: string | null;
  imageAlt: string | null;
  signatureImageUrl: string | null;
  signatureStorageKey: string | null;
  signatureAlt: string | null;
  bio: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LeadershipEditorProps {
  members: SerializedLeadershipMember[];
}

const ROLE_LABELS: Record<string, string> = {
  FOUNDER: "Founder's Message",
  PATRON: "Patron's Message",
  PRESIDENT: "President's Message",
  MANAGER: "Manager's Message",
  PRINCIPAL: "Principal's Message",
};

export function LeadershipEditor({ members }: LeadershipEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeRole, setActiveRole] = useState<
    "FOUNDER" | "PATRON" | "PRESIDENT" | "MANAGER" | "PRINCIPAL"
  >("FOUNDER");

  const currentMember = members.find((m) => m.role === activeRole) || members[0];

  const [formData, setFormData] = useState<Record<string, unknown>>(() => ({
    id: currentMember?.id || "",
    role: currentMember?.role || "FOUNDER",
    pageTitle: currentMember?.pageTitle || "",
    breadcrumb: currentMember?.breadcrumb || "",
    badgeText: currentMember?.badgeText || "",
    name: currentMember?.name || "",
    designation: currentMember?.designation || "",
    termOrAffiliation: currentMember?.termOrAffiliation || "",
    location: currentMember?.location || "",
    shortIntro: currentMember?.shortIntro || "",
    quote: currentMember?.quote || "",
    messageBody: currentMember?.messageBody || "",
    imageUrl: currentMember?.imageUrl || "",
    imageAlt: currentMember?.imageAlt || "",
    signatureImageUrl: currentMember?.signatureImageUrl || "",
    signatureAlt: currentMember?.signatureAlt || "",
    bio: currentMember?.bio || "",
    ctaLabel: currentMember?.ctaLabel || "",
    ctaHref: currentMember?.ctaHref || "",
    isPublished: currentMember?.isPublished ?? true,
  }));

  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successBanner, setSuccessBanner] = useState(false);

  const handleRoleSelect = (
    role: "FOUNDER" | "PATRON" | "PRESIDENT" | "MANAGER" | "PRINCIPAL"
  ) => {
    setActiveRole(role);
    const m = members.find((item) => item.role === role);
    if (m) {
      setFormData({
        id: m.id,
        role: m.role,
        pageTitle: m.pageTitle,
        breadcrumb: m.breadcrumb,
        badgeText: m.badgeText,
        name: m.name,
        designation: m.designation,
        termOrAffiliation: m.termOrAffiliation || "",
        location: m.location || "",
        shortIntro: m.shortIntro,
        quote: m.quote || "",
        messageBody: m.messageBody,
        imageUrl: m.imageUrl || "",
        imageAlt: m.imageAlt || "",
        signatureImageUrl: m.signatureImageUrl || "",
        signatureAlt: m.signatureAlt || "",
        bio: m.bio || "",
        ctaLabel: m.ctaLabel || "",
        ctaHref: m.ctaHref || "",
        isPublished: m.isPublished,
      });
    }
    setServerError(null);
    setFieldErrors({});
    setSuccessBanner(false);
  };

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
      const res = await updateLeadershipMemberAction(null, formData);

      if (!res.success) {
        setServerError(res.error || "Failed to update leadership message");
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      } else {
        setSuccessBanner(true);
        router.refresh();
      }
    });
  };

  if (!currentMember) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
        No leadership records available. Please run the database seed.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Role Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        {(["FOUNDER", "PATRON", "PRESIDENT", "MANAGER", "PRINCIPAL"] as const).map(
          (role) => {
            const m = members.find((item) => item.role === role);
            const isSelected = activeRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={`px-4 py-2 text-xs font-heading font-bold rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#B91C1C] text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{ROLE_LABELS[role]}</span>
                {m && !m.isPublished && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 rounded-full">
                    Draft
                  </span>
                )}
              </button>
            );
          }
        )}
      </div>

      {/* Notifications */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">
            {ROLE_LABELS[activeRole]} has been successfully updated and saved.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column (2 spans) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-heading font-bold text-gray-900">
                Edit {ROLE_LABELS[activeRole]}
              </h2>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                Canonical URL: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">/{currentMember.slug}</code> (Slugs are permanent and cannot be modified)
              </p>
            </div>
            <a
              href={`/${currentMember.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#B91C1C] hover:underline inline-flex items-center gap-1"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Leader Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={String(formData.name || "")}
                onChange={handleChange}
                placeholder="e.g. Chandra Shekhar"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
                required
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Designation / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="designation"
                value={String(formData.designation || "")}
                onChange={handleChange}
                placeholder="e.g. Founder & Former Prime Minister"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
                required
              />
              {fieldErrors.designation && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.designation}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Badge / Tagline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="badgeText"
                value={String(formData.badgeText || "")}
                onChange={handleChange}
                placeholder="e.g. Visionary Leadership"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Affiliation / Role
              </label>
              <input
                type="text"
                name="termOrAffiliation"
                value={String(formData.termOrAffiliation || "")}
                onChange={handleChange}
                placeholder="e.g. Founder Patron"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={String(formData.location || "")}
                onChange={handleChange}
                placeholder="e.g. Ballia, Uttar Pradesh"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="pageTitle"
                value={String(formData.pageTitle || "")}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Breadcrumb Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="breadcrumb"
                value={String(formData.breadcrumb || "")}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Short Introduction / Lead <span className="text-red-500">*</span>
            </label>
            <textarea
              name="shortIntro"
              value={String(formData.shortIntro || "")}
              onChange={handleChange}
              rows={2}
              placeholder="Short introductory lead sentence appearing below the header..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Inspirational Quote / Highlight
            </label>
            <textarea
              name="quote"
              value={String(formData.quote || "")}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Education is the cornerstone of societal progress and personal dignity..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none font-serif italic"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Message Body (Paragraphs separated by blank lines) <span className="text-red-500">*</span>
            </label>
            <textarea
              name="messageBody"
              value={String(formData.messageBody || "")}
              onChange={handleChange}
              rows={8}
              placeholder="Full text of the leadership message..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none font-sans"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Biography / Historical Note (Optional)
            </label>
            <textarea
              name="bio"
              value={String(formData.bio || "")}
              onChange={handleChange}
              rows={3}
              placeholder="Background, achievements, and legacy..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none font-sans"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Portrait Photo URL
              </label>
              <input
                type="text"
                name="imageUrl"
                value={String(formData.imageUrl || "")}
                onChange={handleChange}
                placeholder="e.g. /images/leadership/chandra-shekhar.jpg"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Photo Alt Text
              </label>
              <input
                type="text"
                name="imageAlt"
                value={String(formData.imageAlt || "")}
                onChange={handleChange}
                placeholder="e.g. Portrait of Shri Chandra Shekhar"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Signature Image URL (Optional)
              </label>
              <input
                type="text"
                name="signatureImageUrl"
                value={String(formData.signatureImageUrl || "")}
                onChange={handleChange}
                placeholder="e.g. /images/leadership/signatures/founder.png"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Signature Alt Text
              </label>
              <input
                type="text"
                name="signatureAlt"
                value={String(formData.signatureAlt || "")}
                onChange={handleChange}
                placeholder="e.g. Official Signature"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                CTA Button Label (Optional)
              </label>
              <input
                type="text"
                name="ctaLabel"
                value={String(formData.ctaLabel || "")}
                onChange={handleChange}
                placeholder="e.g. Explore Academic System"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                CTA Destination URL (Optional)
              </label>
              <input
                type="text"
                name="ctaHref"
                value={String(formData.ctaHref || "")}
                onChange={handleChange}
                placeholder="e.g. /academics"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B91C1C] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublishedLeadership"
                name="isPublished"
                checked={Boolean(formData.isPublished)}
                onChange={handleChange}
                className="w-4 h-4 rounded text-[#B91C1C] focus:ring-[#B91C1C] border-gray-300 cursor-pointer"
              />
              <label htmlFor="isPublishedLeadership" className="text-sm font-medium text-gray-700 cursor-pointer">
                Publish on public website (Unpublishing returns 404 to public visitors)
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl text-sm font-heading font-bold bg-[#B91C1C] text-white hover:bg-[#991b1b] transition-colors disabled:opacity-50 inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save {ROLE_LABELS[activeRole]}</span>
            </button>
          </div>
        </form>

        {/* Live Preview Card Column (1 span) */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#B91C1C]" />
                <h3 className="text-sm font-heading font-bold text-gray-900">
                  Profile Preview
                </h3>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                formData.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                {formData.isPublished ? "Live" : "Draft (404)"}
              </span>
            </div>

            {/* Simulated Leader Profile Card */}
            <div className="text-center space-y-3 pt-2">
              <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-red-100 bg-gray-100 shadow-xs flex items-center justify-center">
                {formData.imageUrl ? (
                  <Image
                    src={String(formData.imageUrl)}
                    alt={String(formData.imageAlt || formData.name)}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <Award className="w-10 h-10 text-gray-300" />
                )}
              </div>

              <div>
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-[#B91C1C] rounded-full mb-1">
                  {String(formData.badgeText || "Leadership")}
                </span>
                <h4 className="text-base font-heading font-bold text-gray-900">
                  {String(formData.name || "Leader Name")}
                </h4>
                <p className="text-xs text-gray-600 font-medium mt-0.5">
                  {String(formData.designation || "Designation")}
                </p>
                {formData.termOrAffiliation ? (
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {String(formData.termOrAffiliation)}
                  </p>
                ) : null}
              </div>

              {formData.quote ? (
                <div className="p-3 bg-amber-50/70 border border-amber-200/50 rounded-xl text-left">
                  <Quote className="w-3.5 h-3.5 text-amber-600 mb-1" />
                  <p className="text-xs font-serif italic text-gray-700 line-clamp-3">
                    &quot;{String(formData.quote)}&quot;
                  </p>
                </div>
              ) : null}

              {formData.signatureImageUrl ? (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    Signature
                  </p>
                  <div className="relative h-10 w-32 mx-auto">
                    <Image
                      src={String(formData.signatureImageUrl)}
                      alt="Signature"
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
