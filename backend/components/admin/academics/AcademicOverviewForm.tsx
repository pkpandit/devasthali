"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Save } from "lucide-react";
import { AdminImageUploadField } from "@/components/admin/ui/AdminImageUploadField";
import { updateAcademicOverviewAction } from "@/lib/server/academic-actions";

export interface SerializedAcademicOverview {
  id: string;
  heroBadge: string | null;
  heroImage: string | null;
  heroImageAlt: string | null;
  heroImageStorageKey: string | null;
  competitiveBadge: string | null;
  competitiveTitle: string | null;
  competitiveDescription: string | null;
  competitiveCtaText: string | null;
  competitiveCtaHref: string | null;
  assessmentParentNotice: string | null;
  assessmentProspectusNotice: string | null;
  assessmentProspectusUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicOverviewFormProps {
  overview: SerializedAcademicOverview | null;
}

export function AcademicOverviewForm({ overview }: AcademicOverviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state
  const [heroBadge, setHeroBadge] = useState(overview?.heroBadge || "");
  const [heroImageAlt, setHeroImageAlt] = useState(overview?.heroImageAlt || "");
  const [selectedHeroFile, setSelectedHeroFile] = useState<File | null>(null);
  const [isHeroRemoved, setIsHeroRemoved] = useState(false);

  const [competitiveBadge, setCompetitiveBadge] = useState(overview?.competitiveBadge || "");
  const [competitiveTitle, setCompetitiveTitle] = useState(overview?.competitiveTitle || "");
  const [competitiveDescription, setCompetitiveDescription] = useState(overview?.competitiveDescription || "");
  const [competitiveCtaText, setCompetitiveCtaText] = useState(overview?.competitiveCtaText || "");
  const [competitiveCtaHref, setCompetitiveCtaHref] = useState(overview?.competitiveCtaHref || "");

  const [assessmentParentNotice, setAssessmentParentNotice] = useState(overview?.assessmentParentNotice || "");
  const [assessmentProspectusNotice, setAssessmentProspectusNotice] = useState(
    overview?.assessmentProspectusNotice || ""
  );
  const [assessmentProspectusUrl, setAssessmentProspectusUrl] = useState(overview?.assessmentProspectusUrl || "");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setFieldErrors({});

    startTransition(async () => {
      const formData = new FormData();
      formData.set("heroBadge", heroBadge);

      if (isHeroRemoved) {
        formData.set("removeHeroImage", "true");
      } else if (selectedHeroFile) {
        formData.set("heroImageFile", selectedHeroFile);
      } else if (overview?.heroImage) {
        formData.set("heroImage", overview.heroImage);
        if (overview.heroImageStorageKey) {
          formData.set("heroImageStorageKey", overview.heroImageStorageKey);
        }
      }

      formData.set("heroImageAlt", heroImageAlt);

      formData.set("competitiveBadge", competitiveBadge);
      formData.set("competitiveTitle", competitiveTitle);
      formData.set("competitiveDescription", competitiveDescription);
      formData.set("competitiveCtaText", competitiveCtaText);
      formData.set("competitiveCtaHref", competitiveCtaHref);

      formData.set("assessmentParentNotice", assessmentParentNotice);
      formData.set("assessmentProspectusNotice", assessmentProspectusNotice);
      formData.set("assessmentProspectusUrl", assessmentProspectusUrl);

      const result = await updateAcademicOverviewAction(formData);

      if (result.success) {
        setFeedback({
          type: "success",
          message: "Academic overview settings saved successfully.",
        });
        setSelectedHeroFile(null);
        setIsHeroRemoved(false);
        router.refresh();
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setFeedback({
          type: "error",
          message: result.error || "Failed to update academic overview.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Header */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--foreground, #0f172a)" }}>
          Academic Overview & System Notices
        </h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "var(--muted-foreground, #64748b)" }}>
          Configure shared academic hero imagery, competitive coaching highlights, and assessment advisory notices.
        </p>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.875rem 1rem",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            backgroundColor: feedback.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: feedback.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${feedback.type === "success" ? "#a7f3d0" : "#fecaca"}`,
          }}
        >
          {feedback.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              fontSize: "1rem",
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Section 1: Hero & Visual Branding */}
      <div
        style={{
          backgroundColor: "var(--card, #ffffff)",
          borderRadius: "0.5rem",
          border: "1px solid var(--border, #e2e8f0)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ borderBottom: "1px solid var(--border, #f1f5f9)", paddingBottom: "0.75rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0, color: "var(--foreground, #0f172a)" }}>
            Academic Hero Section
          </h3>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8125rem", color: "var(--muted-foreground, #64748b)" }}>
            Controls the badge and banner visual presented at the top of the /academics page.
          </p>
        </div>

        {/* Hero Badge */}
        <div>
          <label
            htmlFor="heroBadge"
            style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
          >
            Hero Badge Text
          </label>
          <input
            id="heroBadge"
            type="text"
            value={heroBadge}
            onChange={(e) => setHeroBadge(e.target.value)}
            placeholder="e.g. Comprehensive CBSE Curriculum"
            maxLength={100}
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "0.625rem 0.75rem",
              borderRadius: "0.375rem",
              border: fieldErrors.heroBadge ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
              fontSize: "0.875rem",
              boxSizing: "border-box",
            }}
          />
          {fieldErrors.heroBadge && (
            <p style={{ color: "#dc2626", fontSize: "0.75rem", margin: "0.25rem 0 0 0" }}>
              {fieldErrors.heroBadge.join(", ")}
            </p>
          )}
        </div>

        {/* Hero Image Field */}
        <div>
          <AdminImageUploadField
            label="Hero Showcase Image"
            variant="landscape"
            currentImageUrl={overview?.heroImage || null}
            selectedFile={selectedHeroFile}
            isRemoved={isHeroRemoved}
            onFileSelect={(file) => {
              setSelectedHeroFile(file);
              setIsHeroRemoved(false);
            }}
            onRemove={() => {
              setSelectedHeroFile(null);
              setIsHeroRemoved(true);
            }}
            altText={heroImageAlt}
            onAltChange={(alt: string) => setHeroImageAlt(alt)}
            altLabel="Hero Image Descriptive Alt Text"
            altError={fieldErrors.heroImageAlt?.[0]}
            error={fieldErrors.heroImage?.[0]}
            disabled={isPending}
            isPending={isPending}
            helperText="Supported formats: JPEG, PNG, WebP (max 2 MiB). High-resolution image is converted to WebP and served via /api/public/media/academics/."
          />
        </div>
      </div>

      {/* Section 2: Competitive Coaching & Career Guidance Cell */}
      <div
        style={{
          backgroundColor: "var(--card, #ffffff)",
          borderRadius: "0.5rem",
          border: "1px solid var(--border, #e2e8f0)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ borderBottom: "1px solid var(--border, #f1f5f9)", paddingBottom: "0.75rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0, color: "var(--foreground, #0f172a)" }}>
            Competitive Coaching & Career Guidance Block
          </h3>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8125rem", color: "var(--muted-foreground, #64748b)" }}>
            Highlights integrated competitive exam preparation (IIT-JEE, NEET, NDA, CUET) on the /academics page.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          <div>
            <label
              htmlFor="competitiveBadge"
              style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
            >
              Badge Label
            </label>
            <input
              id="competitiveBadge"
              type="text"
              value={competitiveBadge}
              onChange={(e) => setCompetitiveBadge(e.target.value)}
              placeholder="e.g. Competitive Edge"
              maxLength={80}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid var(--border, #cbd5e1)",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="competitiveTitle"
              style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
            >
              Heading Title
            </label>
            <input
              id="competitiveTitle"
              type="text"
              value={competitiveTitle}
              onChange={(e) => setCompetitiveTitle(e.target.value)}
              placeholder="e.g. Integrated Foundation & Competitive Coaching"
              maxLength={150}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid var(--border, #cbd5e1)",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="competitiveDescription"
            style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
          >
            Overview Description
          </label>
          <textarea
            id="competitiveDescription"
            value={competitiveDescription}
            onChange={(e) => setCompetitiveDescription(e.target.value)}
            placeholder="Describe coaching programs, weekend test series, doubt clearing sessions, etc."
            rows={4}
            maxLength={1000}
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              borderRadius: "0.375rem",
              border: "1px solid var(--border, #cbd5e1)",
              fontSize: "0.875rem",
              lineHeight: "1.4",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          <div>
            <label
              htmlFor="competitiveCtaText"
              style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
            >
              CTA Button Label
            </label>
            <input
              id="competitiveCtaText"
              type="text"
              value={competitiveCtaText}
              onChange={(e) => setCompetitiveCtaText(e.target.value)}
              placeholder="e.g. Inquire About Coaching"
              maxLength={60}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid var(--border, #cbd5e1)",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="competitiveCtaHref"
              style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
            >
              CTA Link Destination (Href)
            </label>
            <input
              id="competitiveCtaHref"
              type="text"
              value={competitiveCtaHref}
              onChange={(e) => setCompetitiveCtaHref(e.target.value)}
              placeholder="e.g. /admissions or /contact"
              maxLength={200}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid var(--border, #cbd5e1)",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Academic System Examination & Policy Notices */}
      <div
        style={{
          backgroundColor: "var(--card, #ffffff)",
          borderRadius: "0.5rem",
          border: "1px solid var(--border, #e2e8f0)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ borderBottom: "1px solid var(--border, #f1f5f9)", paddingBottom: "0.75rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0, color: "var(--foreground, #0f172a)" }}>
            Academic System Notices & Prospectus
          </h3>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8125rem", color: "var(--muted-foreground, #64748b)" }}>
            Notices displayed at the bottom of the /academic-system page for parents and prospective families.
          </p>
        </div>

        {/* Parent Advisory Notice */}
        <div>
          <label
            htmlFor="assessmentParentNotice"
            style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
          >
            Parent-Teacher Conference Advisory
          </label>
          <textarea
            id="assessmentParentNotice"
            value={assessmentParentNotice}
            onChange={(e) => setAssessmentParentNotice(e.target.value)}
            placeholder="e.g. Regular Parent-Teacher Meetings (PTMs) are held after every assessment cycle..."
            rows={3}
            maxLength={500}
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              borderRadius: "0.375rem",
              border: "1px solid var(--border, #cbd5e1)",
              fontSize: "0.875rem",
              lineHeight: "1.4",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Prospectus Bar Notice & URL */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          <div>
            <label
              htmlFor="assessmentProspectusNotice"
              style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
            >
              Prospectus Banner Notice
            </label>
            <input
              id="assessmentProspectusNotice"
              type="text"
              value={assessmentProspectusNotice}
              onChange={(e) => setAssessmentProspectusNotice(e.target.value)}
              placeholder="e.g. Looking for detailed syllabus distribution and evaluation schedules?"
              maxLength={300}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid var(--border, #cbd5e1)",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="assessmentProspectusUrl"
              style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
            >
              Prospectus Download / Link URL
            </label>
            <input
              id="assessmentProspectusUrl"
              type="text"
              value={assessmentProspectusUrl}
              onChange={(e) => setAssessmentProspectusUrl(e.target.value)}
              placeholder="e.g. /downloads or /admissions"
              maxLength={500}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid var(--border, #cbd5e1)",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.75rem",
            backgroundColor: "var(--primary, #0284c7)",
            color: "#ffffff",
            borderRadius: "0.375rem",
            border: "none",
            fontWeight: 600,
            fontSize: "0.9375rem",
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.7 : 1,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Academic Overview Settings
        </button>
      </div>
    </form>
  );
}
