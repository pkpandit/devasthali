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
    <div className="space-y-6">
      {/* Top Navigation Level Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("HEADER")}
          className={`px-4 py-2 text-sm font-heading font-bold rounded-xl inline-flex items-center gap-2 transition-all ${
            activeTab === "HEADER"
              ? "bg-[#B91C1C] text-white shadow-xs"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Menu className="w-4 h-4" />
          <span>Header Primary Menu ({headerItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("FOOTER")}
          className={`px-4 py-2 text-sm font-heading font-bold rounded-xl inline-flex items-center gap-2 transition-all ${
            activeTab === "FOOTER"
              ? "bg-[#B91C1C] text-white shadow-xs"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Footer Link Columns ({footerAdmissions.length + footerCommunity.length})</span>
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === "HEADER" ? (
        <HeaderMenuEditor items={headerItems} onRefresh={handleRefresh} />
      ) : (
        <FooterMenuEditor
          admissionsLinks={footerAdmissions}
          communityLinks={footerCommunity}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
