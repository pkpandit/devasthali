"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LayoutGrid } from "lucide-react";
import { HeaderMenuEditor, type FullNavigationItem } from "./HeaderMenuEditor";
import { FooterMenuEditor } from "./FooterMenuEditor";
import type { SerializedNavigationItem } from "./ItemFormDialog";

interface NavigationWorkspaceProps {
  headerItems: FullNavigationItem[];
  footerAdmissions: SerializedNavigationItem[];
  footerCommunity: SerializedNavigationItem[];
}

export function NavigationWorkspace({
  headerItems,
  footerAdmissions,
  footerCommunity,
}: NavigationWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"HEADER" | "FOOTER">("HEADER");

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="topper-workspace-wrapper space-y-6">
      {/* Top Navigation Level Tab Switcher */}
      <div className="topper-workspace-toolbar p-2 rounded-2xl bg-white border border-gray-200 shadow-xs">
        <div
          role="tablist"
          aria-label="Navigation Menu Levels"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
        >
          <button
            role="tab"
            id="tab-header"
            aria-selected={activeTab === "HEADER"}
            aria-controls="tabpanel-header"
            type="button"
            onClick={() => setActiveTab("HEADER")}
            className={`min-h-[44px] px-4 py-2 text-sm font-heading font-bold rounded-xl inline-flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === "HEADER"
                ? "bg-[#B91C1C] text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Menu className="w-4 h-4 shrink-0" />
            <span>Header Primary Menu ({headerItems.length})</span>
          </button>

          <button
            role="tab"
            id="tab-footer"
            aria-selected={activeTab === "FOOTER"}
            aria-controls="tabpanel-footer"
            type="button"
            onClick={() => setActiveTab("FOOTER")}
            className={`min-h-[44px] px-4 py-2 text-sm font-heading font-bold rounded-xl inline-flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === "FOOTER"
                ? "bg-[#B91C1C] text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            <span>Footer Link Columns ({footerAdmissions.length + footerCommunity.length})</span>
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      {activeTab === "HEADER" ? (
        <div role="tabpanel" id="tabpanel-header" aria-labelledby="tab-header">
          <HeaderMenuEditor items={headerItems} onRefresh={handleRefresh} />
        </div>
      ) : (
        <div role="tabpanel" id="tabpanel-footer" aria-labelledby="tab-footer">
          <FooterMenuEditor
            admissionsLinks={footerAdmissions}
            communityLinks={footerCommunity}
            onRefresh={handleRefresh}
          />
        </div>
      )}
    </div>
  );
}
