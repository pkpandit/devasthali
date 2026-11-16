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
    <div className="topper-workspace-wrapper">
      {/* Top Workspace Header */}
      <div className="topper-workspace-toolbar">
        <div className="topper-workspace-toolbar__info">
          <h2 className="topper-workspace-toolbar__title">
            Homepage Content Management
          </h2>
          <p className="topper-workspace-toolbar__count">
            4 sections configured &bull; Live public synchronization &bull; Hero, stats &amp; highlights active
          </p>
        </div>
      </div>

      {/* Semantic Accessible Tab Bar */}
      <div
        role="tablist"
        aria-label="Homepage Sections"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-gray-200"
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
              className={`min-h-[44px] px-4 py-2 text-xs sm:text-sm font-heading font-bold rounded-xl inline-flex items-center gap-2 shrink-0 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B91C1C] focus-visible:outline-offset-2 ${
                isActive
                  ? "bg-[#B91C1C] text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
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
        className="focus-visible:outline-none"
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
