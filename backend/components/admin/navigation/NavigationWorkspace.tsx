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
    <div className="admin-workspace">
      {/* Top Navigation Level Tab Switcher */}
      <div
        role="tablist"
        aria-label="Navigation Menu Levels"
        className="admin-tabs"
      >
        <button
          role="tab"
          id="tab-header"
          aria-selected={activeTab === "HEADER"}
          aria-controls="tabpanel-header"
          tabIndex={activeTab === "HEADER" ? 0 : -1}
          type="button"
          onClick={() => setActiveTab("HEADER")}
          className={`admin-tab ${activeTab === "HEADER" ? "admin-tab--active" : ""}`}
        >
          <Menu size={16} aria-hidden="true" />
          <span>Header Primary Menu</span>
          <span className="admin-tab__badge">{headerItems.length}</span>
        </button>

        <button
          role="tab"
          id="tab-footer"
          aria-selected={activeTab === "FOOTER"}
          aria-controls="tabpanel-footer"
          tabIndex={activeTab === "FOOTER" ? 0 : -1}
          type="button"
          onClick={() => setActiveTab("FOOTER")}
          className={`admin-tab ${activeTab === "FOOTER" ? "admin-tab--active" : ""}`}
        >
          <LayoutGrid size={16} aria-hidden="true" />
          <span>Footer Link Columns</span>
          <span className="admin-tab__badge">{footerAdmissions.length + footerCommunity.length}</span>
        </button>
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
