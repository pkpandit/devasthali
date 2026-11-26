"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  Filter,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Archive,
  XCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  ApplicationDetailDialog,
  type SerializedApplication,
} from "./ApplicationDetailDialog";
import {
  RegistrationSettingsDialog,
} from "./RegistrationSettingsDialog";
import type { SerializedRegistrationSettings } from "@/lib/server/online-admission-actions";
import type { ApplicationStatusType } from "@/lib/validation/online-admissions";

interface OnlineAdmissionDeskWorkspaceProps {
  applications: SerializedApplication[];
  settings: SerializedRegistrationSettings;
}

type TabType = "ALL" | ApplicationStatusType;

export function OnlineAdmissionDeskWorkspace({
  applications,
  settings,
}: OnlineAdmissionDeskWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [selectedApp, setSelectedApp] = useState<SerializedApplication | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSuccess = () => {
    router.refresh();
  };

  // Metrics
  const submittedCount = useMemo(
    () => applications.filter((a) => a.status === "SUBMITTED").length,
    [applications]
  );
  const reviewCount = useMemo(
    () => applications.filter((a) => a.status === "UNDER_REVIEW").length,
    [applications]
  );
  const verifiedCount = useMemo(
    () => applications.filter((a) => a.status === "VERIFIED").length,
    [applications]
  );

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Tab status filter
      if (activeTab !== "ALL" && app.status !== activeTab) {
        return false;
      }

      // Class filter
      if (classFilter !== "ALL" && app.appliedClass !== classFilter) {
        return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        app.applicationNumber.toLowerCase().includes(q) ||
        app.studentName.toLowerCase().includes(q) ||
        app.fatherName.toLowerCase().includes(q) ||
        app.mobile.includes(q) ||
        (app.email && app.email.toLowerCase().includes(q)) ||
        app.appliedClass.toLowerCase().includes(q)
      );
    });
  }, [applications, activeTab, classFilter, searchQuery]);

  const uniqueClasses = useMemo(() => {
    const set = new Set(applications.map((a) => a.appliedClass));
    return Array.from(set).sort();
  }, [applications]);

  const statusBadgeColors: Record<ApplicationStatusType, { bg: string; text: string }> = {
    SUBMITTED: { bg: "#e0e7ff", text: "#3730a3" },
    UNDER_REVIEW: { bg: "#fef3c7", text: "#92400e" },
    VERIFIED: { bg: "#dcfce7", text: "#166534" },
    WITHDRAWN: { bg: "#f3f4f6", text: "#4b5563" },
    REJECTED: { bg: "#fee2e2", text: "#991b1b" },
    ARCHIVED: { bg: "#f1f5f9", text: "#475569" },
  };

  return (
    <div style={{ padding: "0 4px" }}>
      {/* Workspace Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1
              id="admin-workspace-title"
              style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0 }}
            >
              Online Admission Applications Desk
            </h1>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                padding: "2px 10px",
                borderRadius: "12px",
                backgroundColor: settings.isRegistrationOpen ? "#ecfdf5" : "#fef2f2",
                color: settings.isRegistrationOpen ? "#065f46" : "#991b1b",
                border: `1px solid ${settings.isRegistrationOpen ? "#a7f3d0" : "#fecaca"}`,
              }}
            >
              Portal: {settings.isRegistrationOpen ? "OPEN" : "CLOSED"}
            </span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6b7280" }}>
            Review, verify, and update online student registrations for Session {settings.sessionLabel}.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="admin-button admin-button--secondary"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Settings size={16} aria-hidden="true" />
            <span>Portal Settings</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div style={{ padding: "14px 16px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>Total Applications</span>
            <FileText size={18} color="#6b7280" aria-hidden="true" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#111827", marginTop: "4px" }}>
            {applications.length}
          </div>
        </div>

        <div style={{ padding: "14px 16px", backgroundColor: submittedCount > 0 ? "#eff6ff" : "#fff", border: `1px solid ${submittedCount > 0 ? "#bfdbfe" : "#e5e7eb"}`, borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: submittedCount > 0 ? "#1e40af" : "#6b7280" }}>
              New Submissions
            </span>
            <Clock size={18} color={submittedCount > 0 ? "#3b82f6" : "#6b7280"} aria-hidden="true" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: submittedCount > 0 ? "#1e40af" : "#111827", marginTop: "4px" }}>
            {submittedCount}
          </div>
        </div>

        <div style={{ padding: "14px 16px", backgroundColor: reviewCount > 0 ? "#fffbeb" : "#fff", border: `1px solid ${reviewCount > 0 ? "#fde68a" : "#e5e7eb"}`, borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: reviewCount > 0 ? "#b45309" : "#6b7280" }}>
              Under Review
            </span>
            <AlertCircle size={18} color={reviewCount > 0 ? "#d97706" : "#6b7280"} aria-hidden="true" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: reviewCount > 0 ? "#b45309" : "#111827", marginTop: "4px" }}>
            {reviewCount}
          </div>
        </div>

        <div style={{ padding: "14px 16px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>Verified Admissions</span>
            <CheckCircle size={18} color="#16a34a" aria-hidden="true" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#16a34a", marginTop: "4px" }}>
            {verifiedCount}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        role="tablist"
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "2px solid #e5e7eb",
          marginBottom: "20px",
          overflowX: "auto",
          maxWidth: "100%",
          paddingBottom: "2px",
        }}
      >
        {(["ALL", "SUBMITTED", "UNDER_REVIEW", "VERIFIED", "WITHDRAWN", "REJECTED", "ARCHIVED"] as TabType[]).map((tab) => {
          const isActive = activeTab === tab;
          const count =
            tab === "ALL"
              ? applications.length
              : applications.filter((a) => a.status === tab).length;

          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className="admin-tab-button"
              style={{
                padding: "8px 14px",
                border: "none",
                background: "none",
                borderBottom: isActive ? "2px solid #b91c1c" : "2px solid transparent",
                color: isActive ? "#b91c1c" : "#4b5563",
                fontWeight: isActive ? 700 : 500,
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
                marginBottom: "-2px",
              }}
            >
              <span>{tab.replace("_", " ")}</span>
              <span
                style={{
                  fontSize: "11px",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  backgroundColor: isActive ? "#fee2e2" : "#f3f4f6",
                  color: isActive ? "#b91c1c" : "#6b7280",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search
            size={16}
            color="#9ca3af"
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, ref #, parent, phone..."
            className="admin-input"
            style={{ width: "100%", paddingLeft: "34px", paddingRight: "10px", fontSize: "13px", height: "36px" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Filter size={16} color="#6b7280" aria-hidden="true" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="admin-input"
            style={{ padding: "6px 10px", fontSize: "13px", height: "36px" }}
          >
            <option value="ALL">All Applied Classes</option>
            {uniqueClasses.map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflowX: "auto",
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Ref #</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Student Name</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Class</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Parent / Mobile</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Location</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Status</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Date</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "32px 14px", textAlign: "center", color: "#6b7280" }}>
                  <FileText size={32} color="#9ca3af" style={{ margin: "0 auto 8px" }} aria-hidden="true" />
                  <p style={{ margin: 0, fontWeight: 600 }}>No applications found matching criteria.</p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px" }}>
                    {searchQuery ? "Try refining your search term or clearing filters." : "No applications have been registered in this category."}
                  </p>
                </td>
              </tr>
            ) : (
              filteredApplications.map((app) => (
                <tr
                  key={app.id}
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "10px 14px", fontFamily: "monospace", fontWeight: 700, color: "#111827" }}>
                    {app.applicationNumber}
                  </td>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "#111827" }}>
                    {app.studentName}
                    <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 400 }}>
                      DOB: {app.dob} ({app.gender})
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        backgroundColor: "#f3f4f6",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      {app.appliedClass}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div>{app.fatherName}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280", fontFamily: "monospace" }}>{app.mobile}</div>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#4b5563" }}>
                    {app.city}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "10px",
                        backgroundColor: statusBadgeColors[app.status]?.bg || "#f3f4f6",
                        color: statusBadgeColors[app.status]?.text || "#111827",
                      }}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: "12px", color: "#6b7280" }}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApp(app);
                        setIsDetailOpen(true);
                      }}
                      className="admin-button admin-button--secondary"
                      style={{ padding: "4px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <Eye size={14} aria-hidden="true" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Application Detail Dialog */}
      <ApplicationDetailDialog
        isOpen={isDetailOpen}
        application={selectedApp}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedApp(null);
        }}
        onSuccess={handleSuccess}
      />

      {/* Portal Settings Dialog */}
      <RegistrationSettingsDialog
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
