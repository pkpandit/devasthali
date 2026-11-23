"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Save } from "lucide-react";
import { AdminImageUploadField } from "@/components/admin/ui/AdminImageUploadField";
import { updateActivityOverviewAction } from "@/lib/server/activity-actions";

export interface SerializedActivityOverview {
  id: string;
  badgeText: string | null;
  title: string | null;
  subtitle: string | null;
  arenaSize: string | null;
  cardTitle: string | null;
  cardSubtitle: string | null;
  narrativeParagraph1: string | null;
  narrativeParagraph2: string | null;
  heroImage: string | null;
  heroImageAlt: string | null;
  heroImageStorageKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityOverviewFormProps {
  overview: SerializedActivityOverview | null;
}

export function ActivityOverviewForm({ overview }: ActivityOverviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state
  const [badgeText, setBadgeText] = useState(overview?.badgeText || "");
  const [title, setTitle] = useState(overview?.title || "");
  const [subtitle, setSubtitle] = useState(overview?.subtitle || "");
  const [arenaSize, setArenaSize] = useState(overview?.arenaSize || "");
  const [cardTitle, setCardTitle] = useState(overview?.cardTitle || "");
  const [cardSubtitle, setCardSubtitle] = useState(overview?.cardSubtitle || "");
  const [narrativeParagraph1, setNarrativeParagraph1] = useState(overview?.narrativeParagraph1 || "");
  const [narrativeParagraph2, setNarrativeParagraph2] = useState(overview?.narrativeParagraph2 || "");

  // Showcase Image state
  const [heroImageAlt, setHeroImageAlt] = useState(overview?.heroImageAlt || "");
  const [selectedHeroFile, setSelectedHeroFile] = useState<File | null>(null);
  const [isHeroRemoved, setIsHeroRemoved] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setFieldErrors({});

    startTransition(async () => {
      const formData = new FormData();
      formData.set("badgeText", badgeText);
      formData.set("title", title);
      formData.set("subtitle", subtitle);
      formData.set("arenaSize", arenaSize);
      formData.set("cardTitle", cardTitle);
      formData.set("cardSubtitle", cardSubtitle);
      formData.set("narrativeParagraph1", narrativeParagraph1);
      formData.set("narrativeParagraph2", narrativeParagraph2);

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

      const result = await updateActivityOverviewAction(formData);

      if (result.success) {
        setFeedback({
          type: "success",
          message: "Activity overview settings saved successfully.",
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
          message: result.error || "Failed to update activity overview.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Header */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--foreground, #0f172a)" }}>
          Activity Complex & Overview Narrative
        </h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "var(--muted-foreground, #64748b)" }}>
          Configure the co-curricular introductory banner, dedicated activity complex dimensions, narrative descriptions, and showcase visual.
        </p>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
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

      {/* Section 1: Page Header Banner */}
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
            Page Header & Banner
          </h3>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8125rem", color: "var(--muted-foreground, #64748b)" }}>
            Controls the main title, breadcrumb badge, and subtitle at the top of /co-curricular-activities.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {/* Badge */}
          <div>
            <label
              htmlFor="badgeText"
              style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
            >
              Breadcrumb Badge Text
            </label>
            <input
              id="badgeText"
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="e.g. Life at School / Activities"
              maxLength={100}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.375rem",
                border: fieldErrors.badgeText ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Arena Size Badge */}
          <div>
            <label
              htmlFor="arenaSize"
              style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
            >
              Activity Arena Dimensions / Highlight
            </label>
            <input
              id="arenaSize"
              type="text"
              value={arenaSize}
              onChange={(e) => setArenaSize(e.target.value)}
              placeholder="e.g. 22,000 sq ft"
              maxLength={60}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.375rem",
                border: fieldErrors.arenaSize ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Main Title */}
        <div>
          <label
            htmlFor="title"
            style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
          >
            Page Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Co-Curricular Activities"
            maxLength={150}
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              borderRadius: "0.375rem",
              border: fieldErrors.title ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
              fontSize: "0.875rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Subtitle */}
        <div>
          <label
            htmlFor="subtitle"
            style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
          >
            Banner Subtitle
          </label>
          <textarea
            id="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. Enhancing personality, talent, and all-round development..."
            rows={2}
            maxLength={300}
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              borderRadius: "0.375rem",
              border: fieldErrors.subtitle ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
              fontSize: "0.875rem",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Section 2: Narrative Card & Showcase Visual */}
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
            Card Header & Narrative Paragraphs
          </h3>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8125rem", color: "var(--muted-foreground, #64748b)" }}>
            The narrative card describes the philosophy and infrastructure of the co-curricular ecosystem.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {/* Card Title */}
          <div>
            <label
              htmlFor="cardTitle"
              style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
            >
              Card Heading
            </label>
            <input
              id="cardTitle"
              type="text"
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              placeholder="e.g. Holistic Personality Enrichment"
              maxLength={150}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.375rem",
                border: fieldErrors.cardTitle ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Card Subtitle */}
          <div>
            <label
              htmlFor="cardSubtitle"
              style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
            >
              Card Subheading / Location
            </label>
            <input
              id="cardSubtitle"
              type="text"
              value={cardSubtitle}
              onChange={(e) => setCardSubtitle(e.target.value)}
              placeholder="e.g. Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)"
              maxLength={200}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.375rem",
                border: fieldErrors.cardSubtitle ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Narrative Paragraph 1 */}
        <div>
          <label
            htmlFor="narrativeParagraph1"
            style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
          >
            Narrative Paragraph 1
          </label>
          <textarea
            id="narrativeParagraph1"
            value={narrativeParagraph1}
            onChange={(e) => setNarrativeParagraph1(e.target.value)}
            rows={4}
            maxLength={2000}
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              borderRadius: "0.375rem",
              border: fieldErrors.narrativeParagraph1 ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
              fontSize: "0.875rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Narrative Paragraph 2 */}
        <div>
          <label
            htmlFor="narrativeParagraph2"
            style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}
          >
            Narrative Paragraph 2
          </label>
          <textarea
            id="narrativeParagraph2"
            value={narrativeParagraph2}
            onChange={(e) => setNarrativeParagraph2(e.target.value)}
            rows={4}
            maxLength={2000}
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              borderRadius: "0.375rem",
              border: fieldErrors.narrativeParagraph2 ? "1px solid #dc2626" : "1px solid var(--border, #cbd5e1)",
              fontSize: "0.875rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Hero Showcase Image Field */}
        <div>
          <AdminImageUploadField
            label="Activity Showcase Image (Optional)"
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
            altLabel="Showcase Image Descriptive Alt Text (Required if image set)"
            altError={fieldErrors.heroImageAlt?.[0]}
          />
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
            padding: "0.625rem 1.5rem",
            borderRadius: "0.375rem",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: "none",
            cursor: isPending ? "not-allowed" : "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Activity Overview
        </button>
      </div>
    </form>
  );
}
