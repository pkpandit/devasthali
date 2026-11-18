"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AdminImageUploadField } from "@/components/admin/ui/AdminImageUploadField";
import {
  Save,
  Loader2,
  CheckCircle2,
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

  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
  const [selectedSignatureFile, setSelectedSignatureFile] = useState<File | null>(null);
  const [isSignatureRemoved, setIsSignatureRemoved] = useState(false);

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
        isPublished: m.isPublished ?? true,
      });
    }
    setSelectedPhotoFile(null);
    setIsPhotoRemoved(false);
    setSelectedSignatureFile(null);
    setIsSignatureRemoved(false);
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
      const payload = new FormData();
      payload.append("id", String(formData.id));
      payload.append("role", String(formData.role));
      payload.append("pageTitle", String(formData.pageTitle || "").trim());
      payload.append("breadcrumb", String(formData.breadcrumb || "").trim());
      payload.append("badgeText", String(formData.badgeText || "").trim());
      payload.append("name", String(formData.name || "").trim());
      payload.append("designation", String(formData.designation || "").trim());
      if (formData.termOrAffiliation) {
        payload.append("termOrAffiliation", String(formData.termOrAffiliation).trim());
      }
      if (formData.location) {
        payload.append("location", String(formData.location).trim());
      }
      payload.append("shortIntro", String(formData.shortIntro || "").trim());
      if (formData.quote) {
        payload.append("quote", String(formData.quote).trim());
      }
      payload.append("messageBody", String(formData.messageBody || "").trim());
      if (formData.imageAlt) {
        payload.append("imageAlt", String(formData.imageAlt).trim());
      }
      if (formData.signatureAlt) {
        payload.append("signatureAlt", String(formData.signatureAlt).trim());
      }
      if (formData.bio) {
        payload.append("bio", String(formData.bio).trim());
      }
      if (formData.ctaLabel) {
        payload.append("ctaLabel", String(formData.ctaLabel).trim());
      }
      if (formData.ctaHref) {
        payload.append("ctaHref", String(formData.ctaHref).trim());
      }
      payload.append("isPublished", String(formData.isPublished));

      if (selectedPhotoFile) {
        payload.append("photoFile", selectedPhotoFile);
      } else if (isPhotoRemoved) {
        payload.append("removePhoto", "true");
      } else if (formData.imageUrl) {
        payload.append("imageUrl", String(formData.imageUrl));
      }

      if (selectedSignatureFile) {
        payload.append("signatureFile", selectedSignatureFile);
      } else if (isSignatureRemoved) {
        payload.append("removeSignature", "true");
      } else if (formData.signatureImageUrl) {
        payload.append("signatureImageUrl", String(formData.signatureImageUrl));
      }

      const res = await updateLeadershipMemberAction(null, payload);

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
      <div className="admin-empty-state">
        No leadership records available. Please run the database seed.
      </div>
    );
  }

  return (
    <div className="admin-workspace">
      {/* Role Switcher Tabs */}
      <div
        role="tablist"
        aria-label="Leadership Roles"
        className="admin-tabs"
      >
        {(["FOUNDER", "PATRON", "PRESIDENT", "MANAGER", "PRINCIPAL"] as const).map(
          (role) => {
            const m = members.find((item) => item.role === role);
            const isSelected = activeRole === role;
            return (
              <button
                key={role}
                role="tab"
                id={`tab-${role.toLowerCase()}`}
                aria-selected={isSelected}
                aria-controls={`tabpanel-${role.toLowerCase()}`}
                tabIndex={isSelected ? 0 : -1}
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={`admin-tab ${isSelected ? "admin-tab--active" : ""}`}
              >
                <span>{ROLE_LABELS[role]}</span>
                {m && !m.isPublished && (
                  <span className="admin-pill admin-pill--draft" style={{ marginLeft: "4px" }}>
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
        <div className="admin-banner--success" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{ROLE_LABELS[activeRole]} has been successfully updated and saved.</span>
        </div>
      )}

      <div
        role="tabpanel"
        id={`tabpanel-${activeRole.toLowerCase()}`}
        aria-labelledby={`tab-${activeRole.toLowerCase()}`}
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="admin-section-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-workspace-toolbar__title">
                Edit {ROLE_LABELS[activeRole]}
              </h2>
              <p className="admin-workspace-toolbar__count">
                Canonical URL: <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px" }}>/{currentMember.slug}</code> (Fixed slug)
              </p>
            </div>
            <div className="admin-card-actions">
              <a
                href={`/${currentMember.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-button admin-button--secondary"
                style={{ minHeight: "36px", padding: "6px 12px", fontSize: "0.8125rem" }}
              >
                <span>View Public Page</span>
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </div>

          {serverError && (
            <div className="admin-banner--error" role="alert">
              {serverError}
            </div>
          )}

          <div className="admin-form-grid-2">
            <div className="admin-field">
              <label htmlFor="lead-name" className="admin-label">
                Leader Name *
              </label>
              <input
                id="lead-name"
                type="text"
                name="name"
                value={String(formData.name || "")}
                onChange={handleChange}
                placeholder="e.g. Chandra Shekhar"
                className="admin-input"
                required
              />
              {fieldErrors.name && (
                <p className="admin-field-error">{fieldErrors.name}</p>
              )}
            </div>

            <div className="admin-field">
              <label htmlFor="lead-designation" className="admin-label">
                Designation / Title *
              </label>
              <input
                id="lead-designation"
                type="text"
                name="designation"
                value={String(formData.designation || "")}
                onChange={handleChange}
                placeholder="e.g. Founder & Former Prime Minister"
                className="admin-input"
                required
              />
              {fieldErrors.designation && (
                <p className="admin-field-error">{fieldErrors.designation}</p>
              )}
            </div>
          </div>

          <div className="admin-form-grid-3">
            <div className="admin-field">
              <label htmlFor="lead-badgeText" className="admin-label">
                Badge / Tagline *
              </label>
              <input
                id="lead-badgeText"
                type="text"
                name="badgeText"
                value={String(formData.badgeText || "")}
                onChange={handleChange}
                placeholder="e.g. Visionary Leadership"
                className="admin-input"
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="lead-termOrAffiliation" className="admin-label">
                Affiliation / Role
              </label>
              <input
                id="lead-termOrAffiliation"
                type="text"
                name="termOrAffiliation"
                value={String(formData.termOrAffiliation || "")}
                onChange={handleChange}
                placeholder="e.g. Founder Patron"
                className="admin-input"
              />
            </div>

            <div className="admin-field">
              <label htmlFor="lead-location" className="admin-label">
                Location
              </label>
              <input
                id="lead-location"
                type="text"
                name="location"
                value={String(formData.location || "")}
                onChange={handleChange}
                placeholder="e.g. Ballia, Uttar Pradesh"
                className="admin-input"
              />
            </div>
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-field">
              <label htmlFor="lead-pageTitle" className="admin-label">
                Page Title Tag *
              </label>
              <input
                id="lead-pageTitle"
                type="text"
                name="pageTitle"
                value={String(formData.pageTitle || "")}
                onChange={handleChange}
                className="admin-input"
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="lead-breadcrumb" className="admin-label">
                Breadcrumb Text *
              </label>
              <input
                id="lead-breadcrumb"
                type="text"
                name="breadcrumb"
                value={String(formData.breadcrumb || "")}
                onChange={handleChange}
                className="admin-input"
                required
              />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="lead-shortIntro" className="admin-label">
              Short Introductory Excerpt *
            </label>
            <textarea
              id="lead-shortIntro"
              name="shortIntro"
              value={String(formData.shortIntro || "")}
              onChange={handleChange}
              rows={2}
              className="admin-textarea"
              required
            />
          </div>

          <div className="admin-field">
            <label htmlFor="lead-quote" className="admin-label">
              Inspirational Quote / Highlight
            </label>
            <textarea
              id="lead-quote"
              name="quote"
              value={String(formData.quote || "")}
              onChange={handleChange}
              rows={2}
              className="admin-textarea"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="lead-messageBody" className="admin-label">
              Full Official Message * (Use blank lines between paragraphs)
            </label>
            <textarea
              id="lead-messageBody"
              name="messageBody"
              value={String(formData.messageBody || "")}
              onChange={handleChange}
              rows={8}
              className="admin-textarea"
              required
            />
          </div>

          <div className="admin-field">
            <label htmlFor="lead-bio" className="admin-label">
              Biography / Historical Note
            </label>
            <textarea
              id="lead-bio"
              name="bio"
              value={String(formData.bio || "")}
              onChange={handleChange}
              rows={3}
              className="admin-textarea"
            />
          </div>

          <div className="admin-field">
            <AdminImageUploadField
              label="Leader Portrait"
              variant="circular"
              currentImageUrl={formData.imageUrl ? String(formData.imageUrl) : null}
              selectedFile={selectedPhotoFile}
              isRemoved={isPhotoRemoved}
              onFileSelect={(file) => {
                setSelectedPhotoFile(file);
                setIsPhotoRemoved(false);
              }}
              onRemove={() => {
                setSelectedPhotoFile(null);
                setIsPhotoRemoved(true);
              }}
              altText={formData.imageAlt ? String(formData.imageAlt) : ""}
              onAltChange={(alt: string) =>
                setFormData((prev) => ({ ...prev, imageAlt: alt }))
              }
              altLabel="Portrait Alt Description"
              altError={fieldErrors.imageAlt}
              error={fieldErrors.photoFile || fieldErrors.imageFile || fieldErrors.imageUrl}
              disabled={isPending}
              isPending={isPending}
              helperText="Supported formats: JPEG, PNG, WebP (max 2 MiB). High-resolution portrait is automatically formatted and converted to WebP."
            />
          </div>

          <div className="admin-field">
            <AdminImageUploadField
              label="Official Signature"
              variant="signature"
              currentImageUrl={
                formData.signatureImageUrl
                  ? String(formData.signatureImageUrl)
                  : null
              }
              selectedFile={selectedSignatureFile}
              isRemoved={isSignatureRemoved}
              onFileSelect={(file) => {
                setSelectedSignatureFile(file);
                setIsSignatureRemoved(false);
              }}
              onRemove={() => {
                setSelectedSignatureFile(null);
                setIsSignatureRemoved(true);
              }}
              altText={formData.signatureAlt ? String(formData.signatureAlt) : ""}
              onAltChange={(alt: string) =>
                setFormData((prev) => ({ ...prev, signatureAlt: alt }))
              }
              altLabel="Signature Alt Description"
              altError={fieldErrors.signatureAlt}
              error={fieldErrors.signatureFile || fieldErrors.signatureImageUrl}
              disabled={isPending}
              isPending={isPending}
              helperText="Supported formats: JPEG, PNG, WebP (max 2 MiB). Preserves transparency."
            />
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-field">
              <label htmlFor="lead-ctaLabel" className="admin-label">
                CTA Button Label (Optional)
              </label>
              <input
                id="lead-ctaLabel"
                type="text"
                name="ctaLabel"
                value={String(formData.ctaLabel || "")}
                onChange={handleChange}
                placeholder="e.g. Explore Academic System"
                className="admin-input"
              />
            </div>

            <div className="admin-field">
              <label htmlFor="lead-ctaHref" className="admin-label">
                CTA Destination URL (Optional)
              </label>
              <input
                id="lead-ctaHref"
                type="text"
                name="ctaHref"
                value={String(formData.ctaHref || "")}
                onChange={handleChange}
                placeholder="e.g. /academics"
                className="admin-input"
              />
            </div>
          </div>

          <div className="admin-form-row">
            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                id="isPublishedLeadership"
                name="isPublished"
                checked={Boolean(formData.isPublished)}
                onChange={handleChange}
                className="admin-toggle"
              />
              <span>
                Publish on public website (Unpublishing returns 404 to public visitors)
              </span>
            </label>

            <button
              type="submit"
              disabled={isPending}
              className="admin-button admin-button--primary"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>Save {ROLE_LABELS[activeRole]}</span>
            </button>
          </div>
        </form>

        {/* Live Preview Card Column */}
        <div className="admin-section-card" style={{ position: "sticky", top: "24px" }}>
          <div className="admin-card-header">
            <div>
              <h3 style={{ margin: 0, fontSize: "0.875rem", fontFamily: "var(--heading-font)", fontWeight: 700, color: "#111827" }}>
                Profile Preview
              </h3>
            </div>
            <div>
              <span className={`admin-pill ${formData.isPublished ? "admin-pill--published" : "admin-pill--draft"}`}>
                {formData.isPublished ? "Live" : "Draft (404)"}
              </span>
            </div>
          </div>

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", paddingTop: "8px" }}>
            <div style={{ width: "112px", height: "112px", borderRadius: "50%", overflow: "hidden", border: "2px solid #fee2e2", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              {formData.imageUrl ? (
                <Image
                  src={String(formData.imageUrl)}
                  alt={String(formData.imageAlt || formData.name)}
                  fill
                  unoptimized
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <Award size={40} style={{ color: "#d1d5db" }} />
              )}
            </div>

            <div>
              <span style={{ display: "inline-block", padding: "2px 10px", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: "#fef2f2", color: "#b91c1c", borderRadius: "9999px", marginBottom: "4px" }}>
                {String(formData.badgeText || "Leadership")}
              </span>
              <h4 style={{ margin: 0, fontSize: "1rem", fontFamily: "var(--heading-font)", fontWeight: 700, color: "#111827" }}>
                {String(formData.name || "Leader Name")}
              </h4>
              <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#4b5563", fontWeight: 500 }}>
                {String(formData.designation || "Designation")}
              </p>
              {formData.termOrAffiliation ? (
                <p style={{ margin: "2px 0 0", fontSize: "0.6875rem", color: "#9ca3af" }}>
                  {String(formData.termOrAffiliation)}
                </p>
              ) : null}
            </div>

            {formData.quote ? (
              <div style={{ padding: "12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", textAlign: "left", width: "100%", boxSizing: "border-box" }}>
                <Quote size={14} style={{ color: "#d97706", marginBottom: "4px" }} />
                <p style={{ margin: 0, fontSize: "0.75rem", fontStyle: "italic", color: "#374151" }}>
                  &quot;{String(formData.quote)}&quot;
                </p>
              </div>
            ) : null}

            {formData.signatureImageUrl ? (
              <div style={{ width: "100%", paddingTop: "8px", borderTop: "1px solid #f3f4f6" }}>
                <p style={{ margin: "0 0 4px", fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 700, color: "#9ca3af", letterSpacing: "0.05em" }}>
                  Signature Preview
                </p>
                <div style={{ position: "relative", height: "64px", width: "180px", margin: "0 auto" }}>
                  <Image
                    src={String(formData.signatureImageUrl)}
                    alt={String(formData.signatureAlt || "Official Signature")}
                    fill
                    unoptimized
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
