"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Save } from "lucide-react";
import { updateInstructionOverviewAction } from "@/lib/server/instruction-actions";

export interface SerializedInstructionOverview {
  id: string;
  badgeText: string | null;
  title: string | null;
  subtitle: string | null;
  cardTitle: string | null;
  cardSubtitle: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstructionOverviewFormProps {
  overview: SerializedInstructionOverview | null;
}

export function InstructionOverviewForm({ overview }: InstructionOverviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state
  const [badgeText, setBadgeText] = useState(overview?.badgeText || "");
  const [title, setTitle] = useState(overview?.title || "");
  const [subtitle, setSubtitle] = useState(overview?.subtitle || "");
  const [cardTitle, setCardTitle] = useState(overview?.cardTitle || "");
  const [cardSubtitle, setCardSubtitle] = useState(overview?.cardSubtitle || "");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await updateInstructionOverviewAction({
        badgeText: badgeText.trim() || null,
        title: title.trim() || null,
        subtitle: subtitle.trim() || null,
        cardTitle: cardTitle.trim() || null,
        cardSubtitle: cardSubtitle.trim() || null,
      });

      if (result.success) {
        setFeedback({
          type: "success",
          message: "Instructions overview settings saved successfully.",
        });
        router.refresh();
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setFeedback({
          type: "error",
          message: result.error || "Failed to update instructions overview.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--foreground, #0f172a)" }}>
          Banner & Card Overview Narrative
        </h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "var(--muted-foreground, #64748b)" }}>
          Configure the public header banner text, subheadings, and the lead introductory card display on the General Instructions page.
        </p>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            fontSize: "0.875rem",
            background: feedback.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${feedback.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            color: feedback.type === "success" ? "#166534" : "#991b1b",
          }}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          ) : (
            <XCircle size={18} style={{ flexShrink: 0 }} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Section 1: Hero Banner Settings */}
      <div
        style={{
          border: "1px solid var(--border, #e2e8f0)",
          borderRadius: "8px",
          background: "var(--card, #ffffff)",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            margin: 0,
            color: "var(--foreground, #0f172a)",
            borderBottom: "1px solid var(--border, #e2e8f0)",
            paddingBottom: "0.75rem",
          }}
        >
          Page Header Banner
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {/* Badge Text */}
          <div>
            <label
              htmlFor="overview-badgeText"
              style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
            >
              Badge Label
            </label>
            <input
              id="overview-badgeText"
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="e.g. Students & Parents / Guidelines"
              maxLength={80}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid var(--border, #e2e8f0)",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
            {fieldErrors.badgeText && (
              <p style={{ color: "#dc2626", fontSize: "0.75rem", margin: "0.25rem 0 0 0" }}>
                {fieldErrors.badgeText.join(", ")}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="overview-title"
              style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
            >
              Hero Title
            </label>
            <input
              id="overview-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. General Instructions"
              maxLength={120}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid var(--border, #e2e8f0)",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
            {fieldErrors.title && (
              <p style={{ color: "#dc2626", fontSize: "0.75rem", margin: "0.25rem 0 0 0" }}>
                {fieldErrors.title.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Subtitle */}
        <div>
          <label
            htmlFor="overview-subtitle"
            style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
          >
            Banner Subtitle
          </label>
          <textarea
            id="overview-subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            rows={2}
            placeholder="Institutional code of conduct, discipline guidelines, and rules for students and guardians."
            maxLength={300}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid var(--border, #e2e8f0)",
              fontSize: "0.875rem",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
          {fieldErrors.subtitle && (
            <p style={{ color: "#dc2626", fontSize: "0.75rem", margin: "0.25rem 0 0 0" }}>
              {fieldErrors.subtitle.join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Section 2: Leading Card Content */}
      <div
        style={{
          border: "1px solid var(--border, #e2e8f0)",
          borderRadius: "8px",
          background: "var(--card, #ffffff)",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            margin: 0,
            color: "var(--foreground, #0f172a)",
            borderBottom: "1px solid var(--border, #e2e8f0)",
            paddingBottom: "0.75rem",
          }}
        >
          Leading Rules Card
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {/* Card Title */}
          <div>
            <label
              htmlFor="overview-cardTitle"
              style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
            >
              Card Heading
            </label>
            <input
              id="overview-cardTitle"
              type="text"
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              placeholder="e.g. School Rules & Regulations"
              maxLength={150}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid var(--border, #e2e8f0)",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
            {fieldErrors.cardTitle && (
              <p style={{ color: "#dc2626", fontSize: "0.75rem", margin: "0.25rem 0 0 0" }}>
                {fieldErrors.cardTitle.join(", ")}
              </p>
            )}
          </div>

          {/* Card Subtitle */}
          <div>
            <label
              htmlFor="overview-cardSubtitle"
              style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.375rem" }}
            >
              Card Subheading / Institution Line
            </label>
            <input
              id="overview-cardSubtitle"
              type="text"
              value={cardSubtitle}
              onChange={(e) => setCardSubtitle(e.target.value)}
              placeholder="e.g. Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)"
              maxLength={250}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid var(--border, #e2e8f0)",
                fontSize: "0.875rem",
                boxSizing: "border-box",
              }}
            />
            {fieldErrors.cardSubtitle && (
              <p style={{ color: "#dc2626", fontSize: "0.75rem", margin: "0.25rem 0 0 0" }}>
                {fieldErrors.cardSubtitle.join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.625rem 1.25rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            borderRadius: "6px",
            background: "#2563eb",
            color: "#ffffff",
            border: "none",
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.7 : 1,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{isPending ? "Saving Settings..." : "Save Overview Settings"}</span>
        </button>
      </div>
    </form>
  );
}
