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
    <div className="admin-workspace">
      {/* Notifications */}
      {successBanner && (
        <div className="admin-banner--success" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>Principal&apos;s Message excerpt section has been successfully saved.</span>
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
              Principal&apos;s Message Excerpt
            </h2>
            <p className="admin-workspace-toolbar__count">
              Front-facing leadership quote and editorial message. Managed in admin workspace; retained for public display when enabled.
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
          {/* Section Heading */}
          <div className="admin-field">
            <label htmlFor="heading" className="admin-label">
              Section Heading Title *
            </label>
            <input
              id="heading"
              type="text"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              placeholder="e.g. Principal’s Message"
              maxLength={120}
              className="admin-input"
              required
            />
            {fieldErrors.heading && (
              <p className="admin-field-error">{fieldErrors.heading}</p>
            )}
          </div>

          {/* Principal Name */}
          <div className="admin-field">
            <label htmlFor="principalName" className="admin-label">
              Principal Full Name *
            </label>
            <input
              id="principalName"
              type="text"
              name="principalName"
              value={formData.principalName}
              onChange={handleChange}
              placeholder="e.g. P. C. Shrivastava"
              maxLength={100}
              className="admin-input"
              required
            />
            {fieldErrors.principalName && (
              <p className="admin-field-error">{fieldErrors.principalName}</p>
            )}
          </div>
        </div>

        {/* Designation */}
        <div className="admin-field">
          <label htmlFor="principalDesignation" className="admin-label">
            Official Designation *
          </label>
          <input
            id="principalDesignation"
            type="text"
            name="principalDesignation"
            value={formData.principalDesignation}
            onChange={handleChange}
            placeholder="e.g. Principal, Devasthaly Vidyapeeth"
            maxLength={120}
            className="admin-input"
            required
          />
          {fieldErrors.principalDesignation && (
            <p className="admin-field-error">{fieldErrors.principalDesignation}</p>
          )}
        </div>

        {/* Featured Quote */}
        <div className="admin-field">
          <label htmlFor="quote" className="admin-label">
            Featured Highlight Quote *
          </label>
          <textarea
            id="quote"
            name="quote"
            value={formData.quote}
            onChange={handleChange}
            rows={2}
            placeholder="e.g. Education is not mere imparting of knowledge..."
            maxLength={400}
            className="admin-textarea"
            required
          />
          {fieldErrors.quote && (
            <p className="admin-field-error">{fieldErrors.quote}</p>
          )}
        </div>

        {/* Excerpt Body */}
        <div className="admin-field">
          <label htmlFor="excerpt" className="admin-label">
            Message Excerpt Body *
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={4}
            placeholder="Editorial excerpt text highlighting institutional leadership..."
            maxLength={1000}
            className="admin-textarea"
            required
          />
          {fieldErrors.excerpt && (
            <p className="admin-field-error">{fieldErrors.excerpt}</p>
          )}
        </div>

        <div className="admin-form-grid-3">
          <div className="admin-field">
            <label htmlFor="imageUrl" className="admin-label">
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
              className="admin-input"
            />
            {fieldErrors.imageUrl && (
              <p className="admin-field-error">{fieldErrors.imageUrl}</p>
            )}
          </div>

          <div className="admin-field">
            <label htmlFor="ctaLabel" className="admin-label">
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
              className="admin-input"
            />
            {fieldErrors.ctaLabel && (
              <p className="admin-field-error">{fieldErrors.ctaLabel}</p>
            )}
          </div>

          <div className="admin-field">
            <label htmlFor="ctaHref" className="admin-label">
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
              className="admin-input"
            />
            {fieldErrors.ctaHref && (
              <p className="admin-field-error">{fieldErrors.ctaHref}</p>
            )}
          </div>
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
                <span>Saving Principal&apos;s Message...</span>
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
      <div className="admin-section-card" style={{ background: "#f9fafb" }}>
        <div style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
          Live Section Preview: {formData.heading}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", alignItems: "center" }}>
          {/* Portrait Preview */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ position: "relative", width: "160px", height: "200px", borderRadius: "12px", overflow: "hidden", background: "#111827", border: "1px solid #e5e7eb" }}>
              {formData.imageUrl ? (
                <Image
                  src={formData.imageUrl}
                  alt={formData.principalName || "Principal"}
                  fill
                  sizes="160px"
                  style={{ objectFit: "cover", objectPosition: "top" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.75rem" }}>
                  No Portrait
                </div>
              )}
            </div>
            <h3 style={{ margin: "12px 0 2px", fontFamily: "var(--heading-font)", fontWeight: 700, color: "#111827", fontSize: "1rem" }}>
              {formData.principalName}
            </h3>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#b91c1c", fontWeight: 600 }}>
              {formData.principalDesignation}
            </p>
          </div>

          {/* Quote & Excerpt */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
            <div style={{ borderLeft: "4px solid #b91c1c", paddingLeft: "16px", paddingTop: "4px", paddingBottom: "4px" }}>
              <p style={{ margin: 0, fontFamily: "var(--heading-font)", fontWeight: 600, fontSize: "0.9375rem", color: "#111827", fontStyle: "italic" }}>
                &ldquo;{formData.quote || "Featured highlight quote..."}&rdquo;
              </p>
            </div>

            <p style={{ margin: 0, fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.6 }}>
              {formData.excerpt || "Excerpt message body..."}
            </p>

            {formData.ctaLabel && (
              <div style={{ paddingTop: "8px" }}>
                <span className="admin-button admin-button--primary" style={{ minHeight: "36px", padding: "6px 14px", fontSize: "0.75rem" }}>
                  <span>{formData.ctaLabel}</span>
                  <ExternalLink size={12} />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
