"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Save } from "lucide-react";
import { updateAlumniOverviewAction } from "@/lib/server/alumni-actions";

export interface SerializedAlumniOverview {
  id: string;
  badgeText: string | null;
  title: string | null;
  subtitle: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlumniOverviewFormProps {
  overview: SerializedAlumniOverview | null;
}

export function AlumniOverviewForm({ overview }: AlumniOverviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state
  const [badgeText, setBadgeText] = useState(overview?.badgeText || "");
  const [title, setTitle] = useState(overview?.title || "");
  const [subtitle, setSubtitle] = useState(overview?.subtitle || "");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await updateAlumniOverviewAction({
        badgeText: badgeText.trim() || null,
        title: title.trim() || null,
        subtitle: subtitle.trim() || null,
      });

      if (result.success) {
        setFeedback({
          type: "success",
          message: "Alumni overview settings saved successfully.",
        });
        router.refresh();
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setFeedback({
          type: "error",
          message: result.error || "Failed to update alumni overview.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--foreground, #0f172a)" }}>
          Alumni Portal Header & Banner Overview
        </h2>
        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "var(--muted-foreground, #64748b)" }}>
          Configure the public header banner text, title, and intro subtitle displayed on the Alumni Corner page.
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

      {/* Banner Settings Card */}
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
              placeholder="e.g. Students & Parents / Alumni"
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
              placeholder="e.g. Alumni Corner"
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
            placeholder="Welcome to the Devasthaly Vidyapeeth Alumni Network. Celebrating memories, reunions, and enduring bonds."
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
