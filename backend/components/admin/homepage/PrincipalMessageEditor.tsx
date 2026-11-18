"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle2, AlertCircle, Quote, ArrowRight } from "lucide-react";
import { updateHomepagePrincipalMessageAction } from "@/lib/server/homepage-actions";
import { AdminImageUploadField } from "@/components/admin/ui/AdminImageUploadField";

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
  initialPrincipal?: SerializedHomepagePrincipalMessage | null;
  initialMessage?: SerializedHomepagePrincipalMessage | null;
}

export function PrincipalMessageEditor({
  initialPrincipal,
  initialMessage,
}: PrincipalMessageEditorProps) {
  const message = initialPrincipal ?? initialMessage ?? null;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    heading: message?.heading || "",
    principalName: message?.principalName || "",
    principalDesignation: message?.principalDesignation || "",
    quote: message?.quote || "",
    excerpt: message?.excerpt || "",
    imageUrl: message?.imageUrl || "",
    ctaLabel: message?.ctaLabel || "",
    ctaHref: message?.ctaHref || "",
    isPublished: message?.isPublished ?? true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);

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
      const payload = new FormData();
      payload.append("heading", formData.heading.trim());
      payload.append("principalName", formData.principalName.trim());
      payload.append("principalDesignation", formData.principalDesignation.trim());
      payload.append("quote", formData.quote.trim());
      payload.append("excerpt", formData.excerpt.trim());
      if (formData.ctaLabel.trim()) {
        payload.append("ctaLabel", formData.ctaLabel.trim());
      }
      if (formData.ctaHref.trim()) {
        payload.append("ctaHref", formData.ctaHref.trim());
      }
      payload.append("isPublished", String(formData.isPublished));

      if (selectedFile) {
        payload.append("photoFile", selectedFile);
      } else if (isPhotoRemoved) {
        payload.append("removePhoto", "true");
      } else if (formData.imageUrl) {
        payload.append("imageUrl", formData.imageUrl);
      }

      const res = await updateHomepagePrincipalMessageAction(null, payload);

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

        {/* Section Heading */}
        <div className="admin-field">
          <label htmlFor="heading" className="admin-label">
            Section Header Title *
          </label>
          <input
            id="heading"
            type="text"
            name="heading"
            value={formData.heading}
            onChange={handleChange}
            placeholder="e.g. From the Principal's Desk"
            maxLength={120}
            className="admin-input"
            required
          />
          {fieldErrors.heading && (
            <p className="admin-field-error">{fieldErrors.heading}</p>
          )}
        </div>

        {/* Principal Name & Designation */}
        <div className="admin-form-grid-2">
          <div className="admin-field">
            <label htmlFor="principalName" className="admin-label">
              Principal&apos;s Full Name *
            </label>
            <input
              id="principalName"
              type="text"
              name="principalName"
              value={formData.principalName}
              onChange={handleChange}
              placeholder="e.g. Dr. K. N. Pandey"
              maxLength={120}
              className="admin-input"
              required
            />
            {fieldErrors.principalName && (
              <p className="admin-field-error">{fieldErrors.principalName}</p>
            )}
          </div>

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

        {/* Standardized Portrait Image Upload */}
        <div style={{ marginTop: "16px" }}>
          <AdminImageUploadField
            label="Principal Portrait Photo"
            variant="circular"
            currentImageUrl={formData.imageUrl}
            selectedFile={selectedFile}
            isRemoved={isPhotoRemoved}
            onFileSelect={(file) => {
              setSelectedFile(file);
              setIsPhotoRemoved(false);
            }}
            onRemove={() => {
              setSelectedFile(null);
              setIsPhotoRemoved(true);
            }}
            error={fieldErrors.photoFile || fieldErrors.imageUrl}
            disabled={isPending}
            isPending={isPending}
            helperText="Supported formats: JPEG, PNG, WebP (max 2 MiB). High-resolution portrait is automatically formatted and converted to WebP."
          />
        </div>

        {/* CTA Controls */}
        <div className="admin-form-grid-2" style={{ marginTop: "16px" }}>
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
                <span>Saving Message...</span>
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

      {/* Presentation Preview */}
      <div className="admin-section-card" style={{ marginTop: "24px" }}>
        <div className="admin-card-header">
          <div>
            <h3 className="admin-workspace-toolbar__title" style={{ fontSize: "1rem" }}>
              Message Card Presentation Preview
            </h3>
            <p className="admin-workspace-toolbar__count">
              Synthesized visual arrangement matching public layout styling.
            </p>
          </div>
          <span className="admin-badge admin-badge--success">Public Layout</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "24px",
            alignItems: "center",
            padding: "24px",
            borderRadius: "12px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Avatar Preview */}
          <div
            style={{
              position: "relative",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #b91c1c",
              background: "#f1f5f9",
              flexShrink: 0,
            }}
          >
            {formData.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.imageUrl}
                alt={formData.principalName || "Principal preview"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontSize: "10px",
                  textAlign: "center",
                }}
              >
                No Photo
              </div>
            )}
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
                color: "#b91c1c",
              }}
            >
              <Quote size={20} />
              <span style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase" }}>
                {formData.heading || "From the Principal's Desk"}
              </span>
            </div>

            <p
              style={{
                fontStyle: "italic",
                color: "#1e293b",
                fontSize: "1rem",
                lineHeight: 1.5,
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              &ldquo;{formData.quote || "Featured quote..."}&rdquo;
            </p>

            <p
              style={{
                color: "#475569",
                fontSize: "0.875rem",
                lineHeight: 1.6,
                marginBottom: "12px",
              }}
            >
              {formData.excerpt || "Excerpt narrative preview text..."}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9375rem" }}>
                  {formData.principalName || "Principal Name"}
                </div>
                <div style={{ color: "#64748b", fontSize: "0.8125rem" }}>
                  {formData.principalDesignation || "Designation"}
                </div>
              </div>

              {formData.ctaLabel && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#b91c1c",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  <span>{formData.ctaLabel}</span>
                  <ArrowRight size={14} />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
