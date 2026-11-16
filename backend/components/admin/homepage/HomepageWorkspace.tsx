"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Quote, BarChart3, LayoutGrid } from "lucide-react";
import { HeroSectionEditor, type SerializedHomepageHero } from "./HeroSectionEditor";
import { PrincipalMessageEditor, type SerializedHomepagePrincipalMessage } from "./PrincipalMessageEditor";
import { StatisticsEditor } from "./StatisticsEditor";
import { HighlightsEditor } from "./HighlightsEditor";
import type { SerializedStatistic } from "./StatisticFormDialog";
import type { SerializedHighlight } from "./HighlightFormDialog";

interface HomepageWorkspaceProps {
  hero: SerializedHomepageHero | null;
  principal: SerializedHomepagePrincipalMessage | null;
  statistics: SerializedStatistic[];
  highlights: SerializedHighlight[];
}

type TabKey = "HERO" | "PRINCIPAL" | "STATISTICS" | "HIGHLIGHTS";

export function HomepageWorkspace({
  hero,
  principal,
  statistics,
  highlights,
}: HomepageWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("HERO");

  const handleRefresh = () => {
    router.refresh();
  };

  const tabs: { key: TabKey; label: string; icon: typeof Sparkles; count?: number }[] = [
    { key: "HERO", label: "Hero Banner", icon: Sparkles },
    { key: "PRINCIPAL", label: "Principal's Excerpt", icon: Quote },
    { key: "STATISTICS", label: "Key Statistics", icon: BarChart3, count: statistics.length },
    { key: "HIGHLIGHTS", label: "Highlights & Actions", icon: LayoutGrid, count: highlights.length },
  ];

  return (
    <div className="admin-workspace">
      {/* Top Workspace Header */}
      <div className="admin-workspace-toolbar">
        <div>
          <h2 className="admin-workspace-toolbar__title">
            Homepage Content Management
          </h2>
          <p className="admin-workspace-toolbar__count">
            4 sections configured &bull; Live public synchronization &bull; Hero, stats &amp; highlights active
          </p>
        </div>
      </div>

      {/* Semantic Accessible Tab Bar */}
      <div
        role="tablist"
        aria-label="Homepage Sections"
        className="admin-tabs"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              id={`homepage-tab-${tab.key.toLowerCase()}`}
              aria-selected={isActive}
              aria-controls={`homepage-panel-${tab.key.toLowerCase()}`}
              tabIndex={isActive ? 0 : -1}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`admin-tab ${isActive ? "admin-tab--active" : ""}`}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span className="admin-tab__badge">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div
        role="tabpanel"
        id={`homepage-panel-${activeTab.toLowerCase()}`}
        aria-labelledby={`homepage-tab-${activeTab.toLowerCase()}`}
      >
        {activeTab === "HERO" && <HeroSectionEditor initialHero={hero} />}
        {activeTab === "PRINCIPAL" && <PrincipalMessageEditor initialPrincipal={principal} />}
        {activeTab === "STATISTICS" && (
          <StatisticsEditor statistics={statistics} onRefresh={handleRefresh} />
        )}
        {activeTab === "HIGHLIGHTS" && (
          <HighlightsEditor highlights={highlights} onRefresh={handleRefresh} />
        )}
      </div>
    </div>
  );
}
