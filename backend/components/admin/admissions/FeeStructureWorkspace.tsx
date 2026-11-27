"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Settings,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  FeePageDialog,
  type SerializedFeePage,
} from "./FeePageDialog";
import {
  FeeOverviewDialog,
  type SerializedAdmissionOverview,
} from "./FeeOverviewDialog";
import {
  toggleFeeStructurePageStatusAction,
  deleteFeeStructurePageAction,
  reorderFeeStructurePagesAction,
} from "@/lib/server/admissions-publication-actions";

interface FeeStructureWorkspaceProps {
  overview: SerializedAdmissionOverview | null;
  feePages: SerializedFeePage[];
}

export function FeeStructureWorkspace({
  overview,
  feePages,
}: FeeStructureWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<SerializedFeePage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleTogglePublish = (page: SerializedFeePage) => {
    setActionError(null);
    startTransition(async () => {
      try {
        const res = await toggleFeeStructurePageStatusAction({
          id: page.id,
          isPublished: !page.isPublished,
        });
        if (res.success) {
          handleRefresh();
        } else {
          setActionError(res.error || "Failed to change publication status.");
        }
      } catch (err) {
        console.error("Toggle error:", err);
        setActionError("An unexpected error occurred.");
      }
    });
  };

  const handleDelete = (id: string) => {
    setActionError(null);
    startTransition(async () => {
      try {
        const res = await deleteFeeStructurePageAction({ id });
        if (res.success) {
          setDeleteConfirmId(null);
          handleRefresh();
        } else {
          setActionError(res.error || "Failed to delete fee structure page.");
        }
      } catch (err) {
        console.error("Delete error:", err);
        setActionError("An unexpected error occurred.");
      }
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= feePages.length) return;

    const items = [...feePages];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);

    const reorderedItems = items.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    setActionError(null);
    startTransition(async () => {
      try {
        const res = await reorderFeeStructurePagesAction({ items: reorderedItems });
        if (res.success) {
          handleRefresh();
        } else {
          setActionError(res.error || "Failed to reorder fee pages.");
        }
      } catch (err) {
        console.error("Reorder error:", err);
        setActionError("An unexpected error occurred.");
      }
    });
  };

  const publishedCount = feePages.filter((p) => p.isPublished).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      {/* Overview Banner Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "9999px", backgroundColor: "#fef2f2", color: "#b91c1c", fontSize: "12px", fontWeight: 700, marginBottom: "8px" }}>
              <Sparkles size={14} />
              <span>Session {overview?.sessionLabel ?? "2026-27"}</span>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 6px 0", color: "#111827" }}>
              {overview?.feeStructureTitle ?? "Fee Structure"}
            </h2>
            <p style={{ fontSize: "14px", color: "#4b5563", margin: "0 0 12px 0", maxWidth: "680px" }}>
              {overview?.feeStructureSubtitle}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", fontSize: "13px", color: "#6b7280" }}>
              <span>
                Chart Document: <strong>{overview?.admissionChartDisplayLabel}</strong>
              </span>
              <span>
                Total Pages: <strong>{feePages.length}</strong> ({publishedCount} published)
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setIsOverviewOpen(true)}
              className="admin-button admin-button--secondary"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Settings size={16} />
              <span>Edit Page Header</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedPage(null);
                setIsPageDialogOpen(true);
              }}
              className="admin-button admin-button--primary"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={16} />
              <span>Add Fee Page</span>
            </button>
          </div>
        </div>
      </div>

      {actionError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#991b1b",
            fontSize: "14px",
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Pages Table */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#111827" }}>
            Scanned Fee Structure Charts ({feePages.length})
          </h3>
          <span style={{ fontSize: "13px", color: "#6b7280" }}>
            Order reflects top-to-bottom rendering on public /admissions/fees
          </span>
        </div>

        {feePages.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "#6b7280" }}>
            <FileText size={40} style={{ margin: "0 auto 12px auto", color: "#9ca3af" }} />
            <p style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 4px 0", color: "#374151" }}>
              No fee structure pages configured
            </p>
            <p style={{ fontSize: "14px", margin: 0 }}>
              Click &quot;Add Fee Page&quot; to publish scanned fee charts.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
              <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <tr>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151", width: "80px" }}>Order</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151", width: "90px" }}>Page</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151" }}>Title / Description</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151" }}>Image Asset</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151", width: "110px" }}>Status</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#374151", textAlign: "right", width: "180px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feePages.map((page, index) => (
                  <tr key={page.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => handleMove(index, "up")}
                          disabled={index === 0 || isPending}
                          title="Move up"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: index === 0 ? "not-allowed" : "pointer",
                            opacity: index === 0 ? 0.3 : 1,
                            padding: "2px",
                            color: "#4b5563",
                          }}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, "down")}
                          disabled={index === feePages.length - 1 || isPending}
                          title="Move down"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: index === feePages.length - 1 ? "not-allowed" : "pointer",
                            opacity: index === feePages.length - 1 ? 0.3 : 1,
                            padding: "2px",
                            color: "#4b5563",
                          }}
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#111827" }}>
                      Page {page.pageNumber}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#111827", fontWeight: 500 }}>
                      {page.title}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <a
                        href={page.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "#b91c1c",
                          textDecoration: "none",
                          fontSize: "13px",
                          fontWeight: 500,
                        }}
                      >
                        <span style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {page.imageUrl}
                        </span>
                        <ExternalLink size={14} />
                      </a>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          fontSize: "12px",
                          fontWeight: 600,
                          backgroundColor: page.isPublished ? "#dcfce7" : "#f3f4f6",
                          color: page.isPublished ? "#166534" : "#4b5563",
                        }}
                      >
                        {page.isPublished ? "Published" : "Hidden"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(page)}
                          disabled={isPending}
                          title={page.isPublished ? "Hide from public view" : "Publish to public view"}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            color: page.isPublished ? "#16a34a" : "#9ca3af",
                          }}
                        >
                          {page.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPage(page);
                            setIsPageDialogOpen(true);
                          }}
                          disabled={isPending}
                          title="Edit page"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            color: "#2563eb",
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(page.id)}
                          disabled={isPending}
                          title="Delete page"
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            color: "#dc2626",
                          }}
                        >
                          <Trash2 size={16} />
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px 0", color: "#111827" }}>
              Delete Fee Structure Page?
            </h3>
            <p style={{ fontSize: "14px", color: "#4b5563", margin: "0 0 20px 0" }}>
              Are you sure you want to remove this fee chart page from the database? This action only removes the database reference; underlying static files are preserved.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isPending}
                className="admin-button admin-button--secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isPending}
                className="admin-button admin-button--primary"
                style={{ backgroundColor: "#dc2626", borderColor: "#dc2626" }}
              >
                {isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Header Overview Dialog */}
      <FeeOverviewDialog
        isOpen={isOverviewOpen}
        overview={overview}
        onClose={() => setIsOverviewOpen(false)}
        onSuccess={handleRefresh}
      />

      {/* Add / Edit Fee Page Dialog */}
      <FeePageDialog
        isOpen={isPageDialogOpen}
        page={selectedPage}
        onClose={() => {
          setIsPageDialogOpen(false);
          setSelectedPage(null);
        }}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
