"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  PhoneCall,
  MapPin,
  Building2,
  Navigation,
} from "lucide-react";
import { ContactLocationForm, type SerializedSiteProfile } from "./ContactLocationForm";
import { ContactHelplinesForm } from "./ContactHelplinesForm";
import { DirectoryList } from "@/components/admin/profile/DirectoryList";
import type { SerializedDirectoryEntry } from "@/components/admin/profile/DirectoryFormDialog";

export interface ContactWorkspaceProps {
  profile: SerializedSiteProfile;
  directoryEntries: SerializedDirectoryEntry[];
  initialTab?: "directory" | "helplines" | "location";
}

type TabType = "directory" | "helplines" | "location";

export function ContactWorkspace({
  profile,
  directoryEntries,
  initialTab = "directory",
}: ContactWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const publishedDirectoryCount = directoryEntries.filter((e) => e.isPublished).length;
  const isMapConfigured = Boolean(profile.mapEmbedUrl && profile.mapEmbedUrl.trim().length > 0);

  const handleRefresh = () => {
    router.refresh();
  };

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
      {/* Top Stats Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        {/* Stat 1: Directory Entries */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            minWidth: 0,
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              backgroundColor: "#EFF6FF",
              color: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Users style={{ width: "22px", height: "22px" }} />
          </div>
          <div style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
            <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
              Campus Directory
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              {publishedDirectoryCount} / {directoryEntries.length}
            </div>
            <div style={{ fontSize: "11px", color: "#059669", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Active Published Contacts
            </div>
          </div>
        </div>

        {/* Stat 2: Primary Helpline */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            minWidth: 0,
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              backgroundColor: "#ECFDF5",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PhoneCall style={{ width: "22px", height: "22px" }} />
          </div>
          <div style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
            <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
              Primary Helpline
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={profile.primaryPhone || "Not Configured"}
            >
              {profile.primaryPhone || "Not Configured"}
            </div>
            <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Main Reception / Inquiries
            </div>
          </div>
        </div>

        {/* Stat 3: Campus Landmark */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            minWidth: 0,
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              backgroundColor: "#FEF3C7",
              color: "#D97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Building2 style={{ width: "22px", height: "22px" }} />
          </div>
          <div style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
            <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
              Campus Landmark
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={profile.landmark || "Near Chilkahar Bus Stand"}
            >
              {profile.landmark || "Chilkahar Node"}
            </div>
            <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile.tehsil ? `${profile.tehsil}, ${profile.district || "Ballia"}` : "Rasra, Ballia"}
            </div>
          </div>
        </div>

        {/* Stat 4: Map Embed Status */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            minWidth: 0,
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "8px",
              backgroundColor: isMapConfigured ? "#F0FDF4" : "#FEF2F2",
              color: isMapConfigured ? "#16A34A" : "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Navigation style={{ width: "22px", height: "22px" }} />
          </div>
          <div style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
            <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
              Google Maps Embed
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: isMapConfigured ? "#15803D" : "#B91C1C", lineHeight: 1.2 }}>
              {isMapConfigured ? "Verified Active" : "Not Configured"}
            </div>
            <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {isMapConfigured ? "Live Public Route Map" : "Needs HTTPS Embed Link"}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        role="tablist"
        aria-label="Contact Management Tabs"
        style={{
          display: "flex",
          borderBottom: "2px solid #E5E7EB",
          gap: "8px",
          overflowX: "auto",
          maxWidth: "100%",
          width: "100%",
          minWidth: 0,
          WebkitOverflowScrolling: "touch",
          paddingBottom: "2px",
          boxSizing: "border-box",
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "directory"}
          onClick={() => setActiveTab("directory")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 18px",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "var(--font-heading, inherit)",
            color: activeTab === "directory" ? "#B91C1C" : "#6B7280",
            borderBottom: activeTab === "directory" ? "2px solid #B91C1C" : "2px solid transparent",
            marginBottom: "-2px",
            backgroundColor: "transparent",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <Users style={{ width: "16px", height: "16px" }} />
          <span>Campus Directory ({directoryEntries.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "helplines"}
          onClick={() => setActiveTab("helplines")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 18px",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "var(--font-heading, inherit)",
            color: activeTab === "helplines" ? "#B91C1C" : "#6B7280",
            borderBottom: activeTab === "helplines" ? "2px solid #B91C1C" : "2px solid transparent",
            marginBottom: "-2px",
            backgroundColor: "transparent",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <PhoneCall style={{ width: "16px", height: "16px" }} />
          <span>Helplines &amp; Operational Hours</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "location"}
          onClick={() => setActiveTab("location")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 18px",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "var(--font-heading, inherit)",
            color: activeTab === "location" ? "#B91C1C" : "#6B7280",
            borderBottom: activeTab === "location" ? "2px solid #B91C1C" : "2px solid transparent",
            marginBottom: "-2px",
            backgroundColor: "transparent",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <MapPin style={{ width: "16px", height: "16px" }} />
          <span>Campus Location &amp; Map Directions</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div style={{ width: "100%", maxWidth: "100%", minWidth: 0, overflowX: "auto" }}>
        {activeTab === "directory" && (
          <div role="tabpanel" aria-label="Campus Directory Panel" style={{ minWidth: 0, maxWidth: "100%" }}>
            <DirectoryList entries={directoryEntries} onRefresh={handleRefresh} />
          </div>
        )}

        {activeTab === "helplines" && (
          <div role="tabpanel" aria-label="Helplines and Operational Hours Panel" style={{ minWidth: 0, maxWidth: "100%" }}>
            <ContactHelplinesForm initialProfile={profile} onSuccess={handleRefresh} />
          </div>
        )}

        {activeTab === "location" && (
          <div role="tabpanel" aria-label="Campus Location and Map Directions Panel" style={{ minWidth: 0, maxWidth: "100%" }}>
            <ContactLocationForm initialProfile={profile} onSuccess={handleRefresh} />
          </div>
        )}
      </div>
    </div>
  );
}
