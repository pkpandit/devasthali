"use client";

import { useState } from "react";
import { Sparkles, SlidersHorizontal, Image as ImageIcon, LayoutGrid } from "lucide-react";
import {
  StudentClubsManager,
  type SerializedStudentClub,
} from "./StudentClubsManager";
import {
  ActivityOverviewForm,
  type SerializedActivityOverview,
} from "./ActivityOverviewForm";

export type ActivitiesTabType = "clubs" | "overview";

export interface ActivitiesWorkspaceProps {
  overview: SerializedActivityOverview | null;
  clubs: SerializedStudentClub[];
  initialTab?: ActivitiesTabType;
}

export function ActivitiesWorkspace({
  overview,
  clubs,
  initialTab = "clubs",
}: ActivitiesWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<ActivitiesTabType>(initialTab);

  const publishedClubsCount = clubs.filter((c) => c.isPublished).length;
  const isImageConfigured = Boolean(overview?.heroImage && overview.heroImage.trim().length > 0);

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
          Co-Curricular & Student Clubs Management
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--muted-foreground, #64748b)",
            margin: 0,
            lineHeight: "1.5",
          }}
        >
          Manage student clubs, activity infrastructure highlights, and co-curricular programs.
        </p>
      </div>

      {/* Top Stats Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr)))",
          gap: "14px",
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        {/* Stat 1: Student Clubs */}
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
            <Sparkles size={22} />
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
              {publishedClubsCount} / {clubs.length}
            </div>
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--muted-foreground, #64748b)",
                marginTop: "2px",
              }}
            >
              Published Clubs
            </div>
          </div>
        </div>

        {/* Stat 2: Arena Complex */}
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
            <LayoutGrid size={22} />
          </div>
          <div>
            <div
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "var(--foreground, #0f172a)",
                lineHeight: "1.2",
              }}
            >
              {overview?.arenaSize || "Configured"}
            </div>
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--muted-foreground, #64748b)",
                marginTop: "2px",
              }}
            >
              Activity Arena
            </div>
          </div>
        </div>

        {/* Stat 3: Showcase Media */}
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
              background: isImageConfigured ? "#fdf4ff" : "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isImageConfigured ? "#a855f7" : "#94a3b8",
              flexShrink: 0,
            }}
          >
            <ImageIcon size={22} />
          </div>
          <div>
            <div
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "var(--foreground, #0f172a)",
                lineHeight: "1.2",
              }}
            >
              {isImageConfigured ? "Active" : "None"}
            </div>
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--muted-foreground, #64748b)",
                marginTop: "2px",
              }}
            >
              Showcase Visual
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
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("clubs")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            fontSize: "0.875rem",
            fontWeight: activeTab === "clubs" ? 600 : 500,
            color: activeTab === "clubs" ? "#2563eb" : "var(--muted-foreground, #64748b)",
            borderBottom: activeTab === "clubs" ? "2px solid #2563eb" : "2px solid transparent",
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            marginBottom: "-1px",
          }}
        >
          <Sparkles size={16} />
          Student Clubs ({clubs.length})
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
          }}
        >
          <SlidersHorizontal size={16} />
          Overview & Arena Details
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "clubs" && <StudentClubsManager clubs={clubs} />}
        {activeTab === "overview" && <ActivityOverviewForm overview={overview} />}
      </div>
    </div>
  );
}
