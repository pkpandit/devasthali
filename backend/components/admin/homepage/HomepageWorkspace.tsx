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

export function HomepageWorkspace({
  hero,
  principal,
  statistics,
  highlights,
}: HomepageWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"HERO" | "PRINCIPAL" | "STATISTICS" | "HIGHLIGHTS">("HERO");

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* 4-Section Top Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("HERO")}
          className={`px-4 py-2 text-sm font-heading font-bold rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "HERO"
              ? "bg-[#B91C1C] text-white shadow-xs"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Hero Banner</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PRINCIPAL")}
          className={`px-4 py-2 text-sm font-heading font-bold rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "PRINCIPAL"
              ? "bg-[#B91C1C] text-white shadow-xs"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Quote className="w-4 h-4" />
          <span>Principal&apos;s Message</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("STATISTICS")}
          className={`px-4 py-2 text-sm font-heading font-bold rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "STATISTICS"
              ? "bg-[#B91C1C] text-white shadow-xs"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Key Statistics ({statistics.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("HIGHLIGHTS")}
          className={`px-4 py-2 text-sm font-heading font-bold rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "HIGHLIGHTS"
              ? "bg-[#B91C1C] text-white shadow-xs"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Highlights & Actions ({highlights.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "HERO" && <HeroSectionEditor initialHero={hero} />}
      {activeTab === "PRINCIPAL" && <PrincipalMessageEditor initialPrincipal={principal} />}
      {activeTab === "STATISTICS" && (
        <StatisticsEditor statistics={statistics} onRefresh={handleRefresh} />
      )}
      {activeTab === "HIGHLIGHTS" && (
        <HighlightsEditor highlights={highlights} onRefresh={handleRefresh} />
      )}
    </div>
  );
}
