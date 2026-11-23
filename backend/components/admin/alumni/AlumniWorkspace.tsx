"use client";

import { useState } from "react";
import { Users, Briefcase, SlidersHorizontal, Image as ImageIcon } from "lucide-react";
import {
  AlumniReunionsManager,
  type SerializedAlumniReunion,
} from "./AlumniReunionsManager";
import {
  CareerOpportunitiesManager,
  type SerializedCareerOpportunity,
} from "./CareerOpportunitiesManager";
import {
  AlumniOverviewForm,
  type SerializedAlumniOverview,
} from "./AlumniOverviewForm";

export type AlumniTabType = "reunions" | "opportunities" | "overview";

export interface AlumniWorkspaceProps {
  overview: SerializedAlumniOverview | null;
  reunions: SerializedAlumniReunion[];
  opportunities: SerializedCareerOpportunity[];
  initialTab?: AlumniTabType;
}

export function AlumniWorkspace({
  overview,
  reunions,
  opportunities,
  initialTab = "reunions",
}: AlumniWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<AlumniTabType>(initialTab);

  const publishedReunionsCount = reunions.filter((r) => r.isPublished).length;
  const publishedOpportunitiesCount = opportunities.filter((o) => o.isPublished).length;
  const reunionsWithImageCount = reunions.filter((r) => Boolean(r.heroImage)).length;

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
          Alumni Network & Career Opportunities
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--muted-foreground, #64748b)",
            margin: 0,
            lineHeight: "1.5",
          }}
        >
          Manage alumni reunion announcements, homecoming meets, career openings, and header overview configuration.
        </p>
      </div>

      {/* Top Stats Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "14px",
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        {/* Stat 1: Reunions */}
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
            <Users size={22} />
          </div>
          <div>
            <div
              style={{
                fontSize: "1.375rem",
                fontWeight: 700,
                color: "var(--foreground, #0f172a)",
                lineHeight: "1.2",
              }}
            >
              {publishedReunionsCount} / {reunions.length}
            </div>
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--muted-foreground, #64748b)",
                marginTop: "2px",
              }}
            >
              Published Reunions
            </div>
          </div>
        </div>

        {/* Stat 2: Career Opportunities */}
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
              background: "#f0fdf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#16a34a",
              flexShrink: 0,
            }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <div
              style={{
                fontSize: "1.375rem",
                fontWeight: 700,
                color: "var(--foreground, #0f172a)",
                lineHeight: "1.2",
              }}
            >
              {publishedOpportunitiesCount} / {opportunities.length}
            </div>
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--muted-foreground, #64748b)",
                marginTop: "2px",
              }}
            >
              Active Career Notices
            </div>
          </div>
        </div>

        {/* Stat 3: Showcase Imagery */}
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
              background: "#fdf2f8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#db2777",
              flexShrink: 0,
            }}
          >
            <ImageIcon size={22} />
          </div>
          <div>
            <div
              style={{
                fontSize: "1.375rem",
                fontWeight: 700,
                color: "var(--foreground, #0f172a)",
                lineHeight: "1.2",
              }}
            >
              {reunionsWithImageCount}
            </div>
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--muted-foreground, #64748b)",
                marginTop: "2px",
              }}
            >
              Banners & Visuals
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border, #e2e8f0)",
          gap: "8px",
          overflowX: "auto",
          maxWidth: "100%",
          width: "100%",
          minWidth: 0,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("reunions")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            fontSize: "0.875rem",
            fontWeight: activeTab === "reunions" ? 600 : 500,
            color: activeTab === "reunions" ? "#2563eb" : "var(--muted-foreground, #64748b)",
            borderBottom: activeTab === "reunions" ? "2px solid #2563eb" : "2px solid transparent",
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            marginBottom: "-1px",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <Users size={16} />
          Alumni Meets & Reunions ({reunions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("opportunities")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            fontSize: "0.875rem",
            fontWeight: activeTab === "opportunities" ? 600 : 500,
            color: activeTab === "opportunities" ? "#2563eb" : "var(--muted-foreground, #64748b)",
            borderBottom: activeTab === "opportunities" ? "2px solid #2563eb" : "2px solid transparent",
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            marginBottom: "-1px",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <Briefcase size={16} />
          Career Opportunities ({opportunities.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            fontSize: "0.875rem",
            fontWeight: activeTab === "overview" ? 600 : 500,
            color: activeTab === "overview" ? "#2563eb" : "var(--muted-foreground, #64748b)",
            borderBottom: activeTab === "overview" ? "2px solid #2563eb" : "2px solid transparent",
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            marginBottom: "-1px",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <SlidersHorizontal size={16} />
          Header & Banner Overview
        </button>
      </div>

      {/* Tab Panels */}
      <div style={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
        {activeTab === "reunions" && <AlumniReunionsManager reunions={reunions} />}
        {activeTab === "opportunities" && (
          <CareerOpportunitiesManager opportunities={opportunities} />
        )}
        {activeTab === "overview" && <AlumniOverviewForm overview={overview} />}
      </div>
    </div>
  );
}
