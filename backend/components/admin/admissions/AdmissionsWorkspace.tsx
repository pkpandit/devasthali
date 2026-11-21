"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Inbox,
  ListOrdered,
  Table as TableIcon,
  FileCheck,
  HelpCircle,
  Plus,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import {
  toggleAdmissionStepPublish,
  reorderAdmissionSteps,
  toggleAdmissionEligibilityPublish,
  reorderAdmissionEligibility,
  toggleAdmissionDocumentRequirementPublish,
  reorderAdmissionDocumentRequirements,
  toggleAdmissionFaqPublish,
  reorderAdmissionFaqs,
} from "@/lib/server/admissions-actions";
import {
  EnquiryDetailDialog,
  type SerializedEnquiry,
} from "./EnquiryDetailDialog";
import {
  AdmissionStepDialog,
  type SerializedAdmissionStep,
} from "./AdmissionStepDialog";
import {
  EligibilityCriteriaDialog,
  type SerializedEligibilityCriteria,
} from "./EligibilityCriteriaDialog";
import {
  DocumentRequirementDialog,
  type SerializedDocumentRequirement,
} from "./DocumentRequirementDialog";
import {
  AdmissionFaqDialog,
  type SerializedAdmissionFaq,
} from "./AdmissionFaqDialog";
import {
  DeleteAdmissionDialog,
  type DeleteAdmissionTarget,
} from "./DeleteAdmissionDialog";

export interface AdmissionsWorkspaceProps {
  enquiries: SerializedEnquiry[];
  steps: SerializedAdmissionStep[];
  eligibilityCriteria: SerializedEligibilityCriteria[];
  documentRequirements: SerializedDocumentRequirement[];
  faqs: SerializedAdmissionFaq[];
}

type TabType = "ENQUIRIES" | "STEPS" | "ELIGIBILITY" | "DOCUMENTS" | "FAQS";

export function AdmissionsWorkspace({
  enquiries,
  steps,
  eligibilityCriteria,
  documentRequirements,
  faqs,
}: AdmissionsWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabType>("ENQUIRIES");

  // Enquiries search & filter
  const [enquirySearch, setEnquirySearch] = useState("");
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<string>("ALL");

  // Dialog states
  const [selectedEnquiry, setSelectedEnquiry] = useState<SerializedEnquiry | null>(null);
  const [isEnquiryDialogOpen, setIsEnquiryDialogOpen] = useState(false);

  const [selectedStep, setSelectedStep] = useState<SerializedAdmissionStep | null>(null);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);

  const [selectedCriteria, setSelectedCriteria] = useState<SerializedEligibilityCriteria | null>(null);
  const [isCriteriaDialogOpen, setIsCriteriaDialogOpen] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState<SerializedDocumentRequirement | null>(null);
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);

  const [selectedFaq, setSelectedFaq] = useState<SerializedAdmissionFaq | null>(null);
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DeleteAdmissionTarget | null>(null);

  const handleSuccess = () => {
    router.refresh();
  };

  // Metrics
  const pendingCount = useMemo(
    () => enquiries.filter((e) => e.status === "PENDING").length,
    [enquiries]
  );

  // Filtered enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      const matchesStatus =
        enquiryStatusFilter === "ALL" || e.status === enquiryStatusFilter;
      if (!matchesStatus) return false;

      if (!enquirySearch.trim()) return true;
      const q = enquirySearch.toLowerCase();
      return (
        e.studentName.toLowerCase().includes(q) ||
        e.parentName.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        (e.email && e.email.toLowerCase().includes(q)) ||
        e.grade.toLowerCase().includes(q) ||
        (e.message && e.message.toLowerCase().includes(q))
      );
    });
  }, [enquiries, enquirySearch, enquiryStatusFilter]);

  // Reorder Steps
  const handleMoveStep = (index: number, direction: "UP" | "DOWN") => {
    if (isPending) return;
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= steps.length) return;

    const list = [...steps];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    startTransition(async () => {
      const orders = list.map((item, idx) => ({ id: item.id, displayOrder: idx }));
      const res = await reorderAdmissionSteps(orders);
      if (res.success) handleSuccess();
      else alert(res.error || "Failed to reorder steps.");
    });
  };

  const handleToggleStepPublish = (id: string) => {
    if (isPending) return;
    startTransition(async () => {
      const res = await toggleAdmissionStepPublish(id);
      if (res.success) handleSuccess();
      else alert(res.error || "Failed to toggle publish status.");
    });
  };

  // Reorder Eligibility
  const handleMoveEligibility = (index: number, direction: "UP" | "DOWN") => {
    if (isPending) return;
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= eligibilityCriteria.length) return;

    const list = [...eligibilityCriteria];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    startTransition(async () => {
      const orders = list.map((item, idx) => ({ id: item.id, displayOrder: idx }));
      const res = await reorderAdmissionEligibility(orders);
      if (res.success) handleSuccess();
      else alert(res.error || "Failed to reorder eligibility criteria.");
    });
  };

  const handleToggleEligibilityPublish = (id: string) => {
    if (isPending) return;
    startTransition(async () => {
      const res = await toggleAdmissionEligibilityPublish(id);
      if (res.success) handleSuccess();
      else alert(res.error || "Failed to toggle publish status.");
    });
  };

  // Reorder Document Requirements
  const handleMoveDocument = (index: number, direction: "UP" | "DOWN") => {
    if (isPending) return;
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= documentRequirements.length) return;

    const list = [...documentRequirements];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    startTransition(async () => {
      const orders = list.map((item, idx) => ({ id: item.id, displayOrder: idx }));
      const res = await reorderAdmissionDocumentRequirements(orders);
      if (res.success) handleSuccess();
      else alert(res.error || "Failed to reorder document requirements.");
    });
  };

  const handleToggleDocumentPublish = (id: string) => {
    if (isPending) return;
    startTransition(async () => {
      const res = await toggleAdmissionDocumentRequirementPublish(id);
      if (res.success) handleSuccess();
      else alert(res.error || "Failed to toggle publish status.");
    });
  };

  // Reorder FAQs
  const handleMoveFaq = (index: number, direction: "UP" | "DOWN") => {
    if (isPending) return;
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= faqs.length) return;

    const list = [...faqs];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    startTransition(async () => {
      const orders = list.map((item, idx) => ({ id: item.id, displayOrder: idx }));
      const res = await reorderAdmissionFaqs(orders);
      if (res.success) handleSuccess();
      else alert(res.error || "Failed to reorder FAQs.");
    });
  };

  const handleToggleFaqPublish = (id: string) => {
    if (isPending) return;
    startTransition(async () => {
      const res = await toggleAdmissionFaqPublish(id);
      if (res.success) handleSuccess();
      else alert(res.error || "Failed to toggle publish status.");
    });
  };

  const statusBadgeColors: Record<SerializedEnquiry["status"], { bg: string; text: string; label: string }> = {
    PENDING: { bg: "#fef3c7", text: "#92400e", label: "Pending" },
    CONTACTED: { bg: "#dbeafe", text: "#1e40af", label: "Contacted" },
    RESOLVED: { bg: "#dcfce7", text: "#166534", label: "Resolved" },
    ARCHIVED: { bg: "#f3f4f6", text: "#4b5563", label: "Archived" },
  };

  return (
    <div style={{ maxWidth: "100%", width: "100%" }}>
      {/* Metrics Row */}
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
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>Total Enquiries</span>
            <Inbox size={18} color="#6b7280" aria-hidden="true" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#111827", marginTop: "4px" }}>
            {enquiries.length}
          </div>
        </div>

        <div style={{ padding: "14px 16px", backgroundColor: pendingCount > 0 ? "#fffbeb" : "#fff", border: `1px solid ${pendingCount > 0 ? "#fde68a" : "#e5e7eb"}`, borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: pendingCount > 0 ? "#b45309" : "#6b7280" }}>
              Pending Enquiries
            </span>
            <AlertCircle size={18} color={pendingCount > 0 ? "#d97706" : "#6b7280"} aria-hidden="true" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: pendingCount > 0 ? "#b45309" : "#111827", marginTop: "4px" }}>
            {pendingCount}
          </div>
        </div>

        <div style={{ padding: "14px 16px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>Admission Steps</span>
            <ListOrdered size={18} color="#6b7280" aria-hidden="true" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#111827", marginTop: "4px" }}>
            {steps.filter((s) => s.isPublished).length} / {steps.length}
          </div>
        </div>

        <div style={{ padding: "14px 16px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>Eligibility Rows</span>
            <TableIcon size={18} color="#6b7280" aria-hidden="true" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#111827", marginTop: "4px" }}>
            {eligibilityCriteria.filter((c) => c.isPublished).length} / {eligibilityCriteria.length}
          </div>
        </div>

        <div style={{ padding: "14px 16px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>Active FAQs</span>
            <HelpCircle size={18} color="#6b7280" aria-hidden="true" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#111827", marginTop: "4px" }}>
            {faqs.filter((f) => f.isPublished).length} / {faqs.length}
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
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "ENQUIRIES"}
          onClick={() => setActiveTab("ENQUIRIES")}
          style={{
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: 600,
            color: activeTab === "ENQUIRIES" ? "#b91c1c" : "#4b5563",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: activeTab === "ENQUIRIES" ? "2px solid #b91c1c" : "2px solid transparent",
            marginBottom: "-2px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
          }}
        >
          <Inbox size={16} aria-hidden="true" />
          <span>Enquiries</span>
          {pendingCount > 0 && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: "10px",
                backgroundColor: "#b91c1c",
                color: "#fff",
              }}
            >
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "STEPS"}
          onClick={() => setActiveTab("STEPS")}
          style={{
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: 600,
            color: activeTab === "STEPS" ? "#b91c1c" : "#4b5563",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: activeTab === "STEPS" ? "2px solid #b91c1c" : "2px solid transparent",
            marginBottom: "-2px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
          }}
        >
          <ListOrdered size={16} aria-hidden="true" />
          <span>Admission Steps ({steps.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "ELIGIBILITY"}
          onClick={() => setActiveTab("ELIGIBILITY")}
          style={{
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: 600,
            color: activeTab === "ELIGIBILITY" ? "#b91c1c" : "#4b5563",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: activeTab === "ELIGIBILITY" ? "2px solid #b91c1c" : "2px solid transparent",
            marginBottom: "-2px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
          }}
        >
          <TableIcon size={16} aria-hidden="true" />
          <span>Eligibility Criteria ({eligibilityCriteria.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "DOCUMENTS"}
          onClick={() => setActiveTab("DOCUMENTS")}
          style={{
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: 600,
            color: activeTab === "DOCUMENTS" ? "#b91c1c" : "#4b5563",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: activeTab === "DOCUMENTS" ? "2px solid #b91c1c" : "2px solid transparent",
            marginBottom: "-2px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
          }}
        >
          <FileCheck size={16} aria-hidden="true" />
          <span>Required Documents ({documentRequirements.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "FAQS"}
          onClick={() => setActiveTab("FAQS")}
          style={{
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: 600,
            color: activeTab === "FAQS" ? "#b91c1c" : "#4b5563",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: activeTab === "FAQS" ? "2px solid #b91c1c" : "2px solid transparent",
            marginBottom: "-2px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
          }}
        >
          <HelpCircle size={16} aria-hidden="true" />
          <span>Admission FAQs ({faqs.length})</span>
        </button>
      </div>

      {/* Tab 1: ENQUIRIES */}
      {activeTab === "ENQUIRIES" && (
        <div>
          {/* Controls Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ position: "relative", minWidth: "220px", flex: 1, maxWidth: "400px" }}>
              <Search
                size={16}
                color="#9ca3af"
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                aria-hidden="true"
              />
              <input
                type="text"
                value={enquirySearch}
                onChange={(e) => setEnquirySearch(e.target.value)}
                placeholder="Search by student, parent, phone, email..."
                className="admin-input"
                style={{ paddingLeft: "36px", width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <Filter size={16} color="#6b7280" aria-hidden="true" />
              <select
                value={enquiryStatusFilter}
                onChange={(e) => setEnquiryStatusFilter(e.target.value)}
                className="admin-select"
                style={{ minWidth: "150px" }}
              >
                <option value="ALL">All Statuses ({enquiries.length})</option>
                <option value="PENDING">Pending Only ({enquiries.filter((e) => e.status === "PENDING").length})</option>
                <option value="CONTACTED">Contacted ({enquiries.filter((e) => e.status === "CONTACTED").length})</option>
                <option value="RESOLVED">Resolved ({enquiries.filter((e) => e.status === "RESOLVED").length})</option>
                <option value="ARCHIVED">Archived ({enquiries.filter((e) => e.status === "ARCHIVED").length})</option>
              </select>
            </div>
          </div>

          {/* Enquiries Table */}
          {filteredEnquiries.length === 0 ? (
            <div className="admin-empty-state">
              <Inbox size={32} color="#9ca3af" aria-hidden="true" />
              <h3 style={{ margin: 0, fontWeight: 700, color: "#111827" }}>No admission enquiries found</h3>
              <p style={{ margin: 0 }}>
                {enquirySearch
                  ? `No enquiries matching "${enquirySearch}". Try resetting filters.`
                  : "No public admission enquiries have been submitted yet."}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto", maxWidth: "100%", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <table className="admin-table" style={{ width: "100%", minWidth: "680px", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#4b5563", textTransform: "uppercase" }}>
                      Student &amp; Grade
                    </th>
                    <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#4b5563", textTransform: "uppercase" }}>
                      Parent &amp; Contact
                    </th>
                    <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#4b5563", textTransform: "uppercase" }}>
                      Date
                    </th>
                    <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#4b5563", textTransform: "uppercase" }}>
                      Status
                    </th>
                    <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "12px", fontWeight: 700, color: "#4b5563", textTransform: "uppercase" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnquiries.map((enq) => (
                    <tr
                      key={enq.id}
                      style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: enq.status === "PENDING" ? "#fffdf5" : "#fff" }}
                    >
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, color: "#111827", fontSize: "14px" }}>
                          {enq.studentName}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                          Grade: <strong>{enq.grade}</strong>
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 500, color: "#111827", fontSize: "13px" }}>
                          {enq.parentName}
                        </div>
                        <div style={{ fontSize: "12px", color: "#2563eb", marginTop: "2px" }}>
                          {enq.phone}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "12px", color: "#6b7280" }}>
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            backgroundColor: statusBadgeColors[enq.status].bg,
                            color: statusBadgeColors[enq.status].text,
                            display: "inline-block",
                          }}
                        >
                          {statusBadgeColors[enq.status].label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEnquiry(enq);
                              setIsEnquiryDialogOpen(true);
                            }}
                            className="admin-button admin-button--secondary"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                          >
                            Review &amp; Notes
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget({
                                type: "enquiry",
                                id: enq.id,
                                title: `${enq.studentName} (${enq.grade})`,
                              });
                            }}
                            className="admin-button admin-button--danger"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                            aria-label={`Delete enquiry from ${enq.studentName}`}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: ADMISSION STEPS */}
      {activeTab === "STEPS" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
              Configure the 4-step admission journey cards shown on the public admissions page.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedStep(null);
                setIsStepDialogOpen(true);
              }}
              className="admin-button admin-button--primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={16} aria-hidden="true" />
              <span>Add Step</span>
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {steps.map((st, idx) => (
              <div
                key={st.id}
                style={{
                  padding: "14px 16px",
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                  opacity: st.isPublished ? 1 : 0.6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "240px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: "#fee2e2",
                      color: "#b91c1c",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "15px",
                    }}
                  >
                    {st.stepNumber}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#111827", fontSize: "15px" }}>
                      {st.title}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px", lineHeight: 1.4 }}>
                      {st.description}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => handleMoveStep(idx, "UP")}
                    disabled={idx === 0 || isPending}
                    className="admin-button admin-button--icon"
                    aria-label={`Move step ${st.stepNumber} up`}
                  >
                    <ArrowUp size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveStep(idx, "DOWN")}
                    disabled={idx === steps.length - 1 || isPending}
                    className="admin-button admin-button--icon"
                    aria-label={`Move step ${st.stepNumber} down`}
                  >
                    <ArrowDown size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStepPublish(st.id)}
                    disabled={isPending}
                    className="admin-button admin-button--secondary"
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    {st.isPublished ? <Eye size={14} aria-hidden="true" /> : <EyeOff size={14} aria-hidden="true" />}
                    <span>{st.isPublished ? "Published" : "Draft"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStep(st);
                      setIsStepDialogOpen(true);
                    }}
                    disabled={isPending}
                    className="admin-button admin-button--secondary"
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    <Edit size={14} aria-hidden="true" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget({
                        type: "step",
                        id: st.id,
                        title: `Step ${st.stepNumber} - ${st.title}`,
                      });
                    }}
                    disabled={isPending}
                    className="admin-button admin-button--danger"
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                    aria-label={`Delete step ${st.stepNumber}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: ELIGIBILITY CRITERIA */}
      {activeTab === "ELIGIBILITY" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
              Age and evaluation requirements structured table on the public admissions page.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCriteria(null);
                setIsCriteriaDialogOpen(true);
              }}
              className="admin-button admin-button--primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={16} aria-hidden="true" />
              <span>Add Criteria Row</span>
            </button>
          </div>

          <div style={{ overflowX: "auto", maxWidth: "100%", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <table className="admin-table" style={{ width: "100%", minWidth: "640px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#4b5563" }}>
                    CLASS / GRADE
                  </th>
                  <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#4b5563" }}>
                    REQUIRED AGE (AS OF 31 MARCH)
                  </th>
                  <th style={{ padding: "12px 14px", textAlign: "left", fontSize: "12px", fontWeight: 700, color: "#4b5563" }}>
                    EVALUATION MODE
                  </th>
                  <th style={{ padding: "12px 14px", textAlign: "right", fontSize: "12px", fontWeight: 700, color: "#4b5563" }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {eligibilityCriteria.map((crit, idx) => (
                  <tr
                    key={crit.id}
                    style={{ borderBottom: "1px solid #f3f4f6", opacity: crit.isPublished ? 1 : 0.6 }}
                  >
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#111827", fontSize: "14px" }}>
                      {crit.classGrade}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#374151" }}>
                      {crit.ageRequirement}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: "#4b5563" }}>
                      {crit.evaluationMode}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => handleMoveEligibility(idx, "UP")}
                          disabled={idx === 0 || isPending}
                          className="admin-button admin-button--icon"
                          aria-label={`Move ${crit.classGrade} up`}
                        >
                          <ArrowUp size={14} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveEligibility(idx, "DOWN")}
                          disabled={idx === eligibilityCriteria.length - 1 || isPending}
                          className="admin-button admin-button--icon"
                          aria-label={`Move ${crit.classGrade} down`}
                        >
                          <ArrowDown size={14} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleEligibilityPublish(crit.id)}
                          disabled={isPending}
                          className="admin-button admin-button--secondary"
                          style={{ fontSize: "12px", padding: "4px 8px" }}
                        >
                          {crit.isPublished ? "Published" : "Draft"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCriteria(crit);
                            setIsCriteriaDialogOpen(true);
                          }}
                          disabled={isPending}
                          className="admin-button admin-button--secondary"
                          style={{ fontSize: "12px", padding: "4px 8px" }}
                        >
                          <Edit size={14} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget({
                              type: "eligibility",
                              id: crit.id,
                              title: crit.classGrade,
                            });
                          }}
                          disabled={isPending}
                          className="admin-button admin-button--danger"
                          style={{ fontSize: "12px", padding: "4px 8px" }}
                          aria-label={`Delete criteria for ${crit.classGrade}`}
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: DOCUMENT REQUIREMENTS */}
      {activeTab === "DOCUMENTS" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
              Checklist of mandatory certificates and reports required during admission verification.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedDoc(null);
                setIsDocDialogOpen(true);
              }}
              className="admin-button admin-button--primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={16} aria-hidden="true" />
              <span>Add Document</span>
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {documentRequirements.map((doc, idx) => (
              <div
                key={doc.id}
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "10px",
                  opacity: doc.isPublished ? 1 : 0.6,
                }}
              >
                <div style={{ flex: 1, minWidth: "240px" }}>
                  <div style={{ fontWeight: 600, color: "#111827", fontSize: "14px" }}>
                    {doc.title}
                  </div>
                  {doc.description && (
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                      {doc.description}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => handleMoveDocument(idx, "UP")}
                    disabled={idx === 0 || isPending}
                    className="admin-button admin-button--icon"
                    aria-label={`Move document ${idx + 1} up`}
                  >
                    <ArrowUp size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDocument(idx, "DOWN")}
                    disabled={idx === documentRequirements.length - 1 || isPending}
                    className="admin-button admin-button--icon"
                    aria-label={`Move document ${idx + 1} down`}
                  >
                    <ArrowDown size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleDocumentPublish(doc.id)}
                    disabled={isPending}
                    className="admin-button admin-button--secondary"
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    {doc.isPublished ? "Published" : "Draft"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDoc(doc);
                      setIsDocDialogOpen(true);
                    }}
                    disabled={isPending}
                    className="admin-button admin-button--secondary"
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    <Edit size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget({
                        type: "document",
                        id: doc.id,
                        title: doc.title,
                      });
                    }}
                    disabled={isPending}
                    className="admin-button admin-button--danger"
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                    aria-label={`Delete document ${doc.title}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: ADMISSION FAQS */}
      {activeTab === "FAQS" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
              Frequently asked questions accordion on the admissions page.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedFaq(null);
                setIsFaqDialogOpen(true);
              }}
              className="admin-button admin-button--primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={16} aria-hidden="true" />
              <span>Add FAQ</span>
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {faqs.map((faq, idx) => (
              <div
                key={faq.id}
                style={{
                  padding: "14px 16px",
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                  opacity: faq.isPublished ? 1 : 0.6,
                }}
              >
                <div style={{ flex: 1, minWidth: "240px" }}>
                  <div style={{ fontWeight: 700, color: "#111827", fontSize: "14px" }}>
                    Q: {faq.question}
                  </div>
                  <div style={{ fontSize: "13px", color: "#4b5563", marginTop: "4px", lineHeight: 1.5 }}>
                    {faq.answer}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => handleMoveFaq(idx, "UP")}
                    disabled={idx === 0 || isPending}
                    className="admin-button admin-button--icon"
                    aria-label={`Move FAQ ${idx + 1} up`}
                  >
                    <ArrowUp size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveFaq(idx, "DOWN")}
                    disabled={idx === faqs.length - 1 || isPending}
                    className="admin-button admin-button--icon"
                    aria-label={`Move FAQ ${idx + 1} down`}
                  >
                    <ArrowDown size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleFaqPublish(faq.id)}
                    disabled={isPending}
                    className="admin-button admin-button--secondary"
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    {faq.isPublished ? "Published" : "Draft"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFaq(faq);
                      setIsFaqDialogOpen(true);
                    }}
                    disabled={isPending}
                    className="admin-button admin-button--secondary"
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    <Edit size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget({
                        type: "faq",
                        id: faq.id,
                        title: faq.question,
                      });
                    }}
                    disabled={isPending}
                    className="admin-button admin-button--danger"
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                    aria-label={`Delete FAQ ${faq.question}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <EnquiryDetailDialog
        isOpen={isEnquiryDialogOpen}
        enquiry={selectedEnquiry}
        onClose={() => {
          setIsEnquiryDialogOpen(false);
          setSelectedEnquiry(null);
        }}
        onSuccess={handleSuccess}
      />

      <AdmissionStepDialog
        isOpen={isStepDialogOpen}
        step={selectedStep}
        onClose={() => {
          setIsStepDialogOpen(false);
          setSelectedStep(null);
        }}
        onSuccess={handleSuccess}
      />

      <EligibilityCriteriaDialog
        isOpen={isCriteriaDialogOpen}
        criteria={selectedCriteria}
        onClose={() => {
          setIsCriteriaDialogOpen(false);
          setSelectedCriteria(null);
        }}
        onSuccess={handleSuccess}
      />

      <DocumentRequirementDialog
        isOpen={isDocDialogOpen}
        document={selectedDoc}
        onClose={() => {
          setIsDocDialogOpen(false);
          setSelectedDoc(null);
        }}
        onSuccess={handleSuccess}
      />

      <AdmissionFaqDialog
        isOpen={isFaqDialogOpen}
        faq={selectedFaq}
        onClose={() => {
          setIsFaqDialogOpen(false);
          setSelectedFaq(null);
        }}
        onSuccess={handleSuccess}
      />

      <DeleteAdmissionDialog
        isOpen={Boolean(deleteTarget)}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
