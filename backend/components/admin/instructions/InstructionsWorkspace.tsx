"use client";

import { useState } from "react";
import { BookOpen, SlidersHorizontal, ShieldAlert, Layers } from "lucide-react";
import {
  GeneralInstructionsManager,
  type SerializedGeneralInstruction,
} from "./GeneralInstructionsManager";
import {
  InstructionOverviewForm,
  type SerializedInstructionOverview,
} from "./InstructionOverviewForm";

export type InstructionsTabType = "rules" | "overview";

export interface InstructionsWorkspaceProps {
  overview: SerializedInstructionOverview | null;
  instructions: SerializedGeneralInstruction[];
  initialTab?: InstructionsTabType;
}

export function InstructionsWorkspace({
  overview,
  instructions,
  initialTab = "rules",
}: InstructionsWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<InstructionsTabType>(initialTab);

  const publishedCount = instructions.filter((i) => i.isPublished).length;
  const criticalCount = instructions.filter((i) => i.isCritical).length;
  const uniqueCategoriesCount = new Set(instructions.map((i) => i.category)).size;

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
          Student Code of Conduct & Policy Guidelines
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--muted-foreground, #64748b)",
            margin: 0,
            lineHeight: "1.5",
          }}
        >
          Manage institutional code of conduct rules, critical policy flags, category classifications, and page overview text.
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
        {/* Stat 1: Total Rules */}
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
            <BookOpen size={22} />
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
              {publishedCount} / {instructions.length}
            </div>
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--muted-foreground, #64748b)",
                marginTop: "2px",
              }}
            >
              Published Rules
            </div>
          </div>
        </div>

        {/* Stat 2: Critical Rules */}
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
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626",
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={22} />
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
              {criticalCount}
            </div>
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--muted-foreground, #64748b)",
                marginTop: "2px",
              }}
            >
              Critical Guidelines
            </div>
          </div>
        </div>

        {/* Stat 3: Distinct Categories */}
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
            <Layers size={22} />
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
              {uniqueCategoriesCount}
            </div>
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--muted-foreground, #64748b)",
                marginTop: "2px",
              }}
            >
              Active Categories
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
          onClick={() => setActiveTab("rules")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            fontSize: "0.875rem",
            fontWeight: activeTab === "rules" ? 600 : 500,
            color: activeTab === "rules" ? "#2563eb" : "var(--muted-foreground, #64748b)",
            borderBottom: activeTab === "rules" ? "2px solid #2563eb" : "2px solid transparent",
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            marginBottom: "-1px",
          }}
        >
          <BookOpen size={16} />
          Code of Conduct Rules ({instructions.length})
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
          Banner & Card Overview
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "rules" && <GeneralInstructionsManager instructions={instructions} />}
        {activeTab === "overview" && <InstructionOverviewForm overview={overview} />}
      </div>
    </div>
  );
}
