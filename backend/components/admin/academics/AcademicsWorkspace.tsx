"use client";

import { useState } from "react";
import { GraduationCap, Award, BookOpen, SlidersHorizontal } from "lucide-react";
import {
  AcademicWingsManager,
  type SerializedAcademicWing,
} from "./AcademicWingsManager";
import {
  AcademicStreamsManager,
  type SerializedAcademicStream,
} from "./AcademicStreamsManager";
import {
  AcademicAssessmentRulesManager,
  type SerializedAcademicAssessmentRule,
} from "./AcademicAssessmentRulesManager";
import {
  AcademicOverviewForm,
  type SerializedAcademicOverview,
} from "./AcademicOverviewForm";

export type AcademicsTabType = "wings" | "streams" | "rules" | "overview";

export interface AcademicsWorkspaceProps {
  overview: SerializedAcademicOverview | null;
  wings: SerializedAcademicWing[];
  streams: SerializedAcademicStream[];
  rules: SerializedAcademicAssessmentRule[];
  initialTab?: AcademicsTabType;
}

export function AcademicsWorkspace({
  overview,
  wings,
  streams,
  rules,
  initialTab = "wings",
}: AcademicsWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<AcademicsTabType>(initialTab);

  const publishedWingsCount = wings.filter((w) => w.isPublished).length;
  const publishedStreamsCount = streams.filter((s) => s.isPublished).length;
  const publishedRulesCount = rules.filter((r) => r.isPublished).length;
  const isHeroConfigured = Boolean(overview?.heroImage && overview.heroImage.trim().length > 0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            margin: "0 0 0.375rem 0",
            color: "var(--foreground, #0f172a)",
            letterSpacing: "-0.025em",
          }}
        >
          Academics & Curriculum Management
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--muted-foreground, #64748b)",
            margin: 0,
            lineHeight: "1.5",
          }}
        >
          Manage foundational to senior secondary academic wings, streams, assessment criteria, and curriculum overview.
        </p>
      </div>

      {/* Top Stats Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        {/* Stat 1: Academic Wings */}
        <div
          style={{
            background: "var(--card, #ffffff)",
            border: "1px solid var(--border, #e2e8f0)",
            borderRadius: "8px",
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
              flexShrink: 0,
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--muted-foreground, #64748b)", fontWeight: 500 }}>
              Academic Wings
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground, #0f172a)", marginTop: "2px" }}>
              {wings.length}
              <span style={{ fontSize: "12px", fontWeight: 400, color: "#16a34a", marginLeft: "6px" }}>
                ({publishedWingsCount} published)
              </span>
            </div>
          </div>
        </div>

        {/* Stat 2: Senior Streams */}
        <div
          style={{
            background: "var(--card, #ffffff)",
            border: "1px solid var(--border, #e2e8f0)",
            borderRadius: "8px",
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              background: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d97706",
              flexShrink: 0,
            }}
          >
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--muted-foreground, #64748b)", fontWeight: 500 }}>
              Curriculum Streams
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground, #0f172a)", marginTop: "2px" }}>
              {streams.length}
              <span style={{ fontSize: "12px", fontWeight: 400, color: "#16a34a", marginLeft: "6px" }}>
                ({publishedStreamsCount} published)
              </span>
            </div>
          </div>
        </div>

        {/* Stat 3: Assessment Rules */}
        <div
          style={{
            background: "var(--card, #ffffff)",
            border: "1px solid var(--border, #e2e8f0)",
            borderRadius: "8px",
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              background: "#ecfdf5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#059669",
              flexShrink: 0,
            }}
          >
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--muted-foreground, #64748b)", fontWeight: 500 }}>
              Assessment Rules
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--foreground, #0f172a)", marginTop: "2px" }}>
              {rules.length}
              <span style={{ fontSize: "12px", fontWeight: 400, color: "#16a34a", marginLeft: "6px" }}>
                ({publishedRulesCount} active)
              </span>
            </div>
          </div>
        </div>

        {/* Stat 4: Overview Setup */}
        <div
          style={{
            background: "var(--card, #ffffff)",
            border: "1px solid var(--border, #e2e8f0)",
            borderRadius: "8px",
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              background: "#f3e8ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9333ea",
              flexShrink: 0,
            }}
          >
            <SlidersHorizontal size={22} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "var(--muted-foreground, #64748b)", fontWeight: 500 }}>
              Overview Status
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground, #0f172a)", marginTop: "4px" }}>
              {isHeroConfigured ? (
                <span style={{ color: "#15803d" }}>Hero Configured</span>
              ) : (
                <span style={{ color: "#d97706" }}>Default Banner</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div
        role="tablist"
        aria-label="Academics Management Sections"
        style={{
          display: "flex",
          borderBottom: "2px solid var(--border, #e2e8f0)",
          gap: "8px",
          width: "100%",
          overflowX: "auto",
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "wings"}
          onClick={() => setActiveTab("wings")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 18px",
            fontSize: "14px",
            fontWeight: 600,
            color: activeTab === "wings" ? "#0284c7" : "#64748b",
            borderBottom: activeTab === "wings" ? "2px solid #0284c7" : "2px solid transparent",
            marginBottom: "-2px",
            backgroundColor: "transparent",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s ease",
          }}
        >
          <GraduationCap size={16} />
          Academic Wings ({wings.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "streams"}
          onClick={() => setActiveTab("streams")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 18px",
            fontSize: "14px",
            fontWeight: 600,
            color: activeTab === "streams" ? "#0284c7" : "#64748b",
            borderBottom: activeTab === "streams" ? "2px solid #0284c7" : "2px solid transparent",
            marginBottom: "-2px",
            backgroundColor: "transparent",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s ease",
          }}
        >
          <Award size={16} />
          Senior Streams ({streams.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "rules"}
          onClick={() => setActiveTab("rules")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 18px",
            fontSize: "14px",
            fontWeight: 600,
            color: activeTab === "rules" ? "#0284c7" : "#64748b",
            borderBottom: activeTab === "rules" ? "2px solid #0284c7" : "2px solid transparent",
            marginBottom: "-2px",
            backgroundColor: "transparent",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s ease",
          }}
        >
          <BookOpen size={16} />
          Assessment Regulations ({rules.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 18px",
            fontSize: "14px",
            fontWeight: 600,
            color: activeTab === "overview" ? "#0284c7" : "#64748b",
            borderBottom: activeTab === "overview" ? "2px solid #0284c7" : "2px solid transparent",
            marginBottom: "-2px",
            backgroundColor: "transparent",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s ease",
          }}
        >
          <SlidersHorizontal size={16} />
          Overview & Notices
        </button>
      </div>

      {/* Tab Panels */}
      <div style={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
        {activeTab === "wings" && (
          <div role="tabpanel" aria-label="Academic Wings Panel">
            <AcademicWingsManager wings={wings} />
          </div>
        )}

        {activeTab === "streams" && (
          <div role="tabpanel" aria-label="Senior Secondary Streams Panel">
            <AcademicStreamsManager streams={streams} />
          </div>
        )}

        {activeTab === "rules" && (
          <div role="tabpanel" aria-label="Assessment Rules Panel">
            <AcademicAssessmentRulesManager rules={rules} />
          </div>
        )}

        {activeTab === "overview" && (
          <div role="tabpanel" aria-label="Academic Overview Panel">
            <AcademicOverviewForm overview={overview} />
          </div>
        )}
      </div>
    </div>
  );
}
