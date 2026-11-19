"use client";

import {
  FileText,
  Pencil,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { getNoticeStatus, type NoticeComputedStatus } from "@/lib/validation/notices";
import type { SerializedNotice } from "./NoticeFormDialog";

interface NoticeListProps {
  notices: SerializedNotice[];
  onAdd?: () => void;
  onEdit?: (notice: SerializedNotice) => void;
  onDelete?: (notice: SerializedNotice) => void;
  onToggleStatus?: (notice: SerializedNotice) => void;
  onMove?: (index: number, direction: "UP" | "DOWN") => void;
  isReorderDisabled?: boolean;
}

function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function renderStatusBadge(status: NoticeComputedStatus) {
  switch (status) {
    case "PUBLISHED":
      return <span className="admin-pill admin-pill--published">Published</span>;
    case "SCHEDULED":
      return <span className="admin-pill admin-pill--scheduled">Scheduled</span>;
    case "EXPIRED":
      return <span className="admin-pill admin-pill--expired">Expired</span>;
    case "DRAFT":
    default:
      return <span className="admin-pill admin-pill--draft">Draft</span>;
  }
}

function renderCategoryBadge(category: string) {
  switch (category) {
    case "CIRCULAR":
      return <Badge variant="subtle">Circular</Badge>;
    case "EXAMINATION":
      return <Badge variant="doc">Exam</Badge>;
    case "ADMISSION":
      return <Badge variant="subtle">Admission</Badge>;
    case "EVENT":
      return <Badge variant="default">Event</Badge>;
    default:
      return <Badge variant="subtle">{category}</Badge>;
  }
}

/**
 * Table-first record listing for School Notices & Circulars.
 * Implements accessible semantic markup (table, thead, tbody, th scope="col", sr-only caption)
 * and responsive horizontal-scrolling table container.
 */
export function NoticeList({
  notices,
  onAdd,
  onEdit,
  onDelete,
  onToggleStatus,
  onMove,
  isReorderDisabled = false,
}: NoticeListProps) {
  if (!notices || notices.length === 0) {
    return (
      <EmptyState
        title="No Notices or Circulars Found"
        description="There are currently no official notices, circulars, or announcements matching the criteria."
        icon={FileText}
      >
        {onAdd && (
          <div style={{ paddingTop: "16px" }}>
            <button
              type="button"
              onClick={onAdd}
              className="topper-button topper-button--primary topper-add-btn"
            >
              <Plus size={16} aria-hidden="true" />
              <span>Publish First Notice</span>
            </button>
          </div>
        )}
      </EmptyState>
    );
  }

  return (
    <div className="admin-table-container">
      <table className="admin-table" aria-label="Official Notices and Circulars Register">
        <caption className="sr-only">
          Official School Notices, Examination Circulars, Admission Bulletins, and Event Announcements
        </caption>
        <thead>
          <tr>
            <th scope="col" className="notice-table__status-col">Status</th>
            <th scope="col" className="notice-table__category-col">Category</th>
            <th scope="col" className="notice-table__title-col">Title &amp; Summary</th>
            <th scope="col" className="notice-table__date-col">Publish Date</th>
            <th scope="col" className="notice-table__date-col">Expiry Date</th>
            <th scope="col" className="notice-table__doc-col">Attachments</th>
            <th scope="col" className="notice-table__order-col">Order</th>
            <th scope="col" className="notice-table__actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notices.map((notice, index) => {
            const status = getNoticeStatus(notice);
            const attachments = notice.attachments || [];
            const hasAttachments = attachments.length > 0;
            const hasLegacyDoc = Boolean(notice.fileStorageKey || notice.fileUrl);

            return (
              <tr key={notice.id}>
                <td className="notice-table__status-col">
                  <div className="notice-table__status-wrapper">
                    {renderStatusBadge(status)}
                    {notice.isUrgent && (
                      <span className="admin-pill admin-pill--urgent">
                        <AlertCircle size={10} aria-hidden="true" style={{ marginRight: "3px" }} />
                        <span>Urgent</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="notice-table__category-col">
                  {renderCategoryBadge(notice.category)}
                </td>
                <td className="notice-table__title-col">
                  <div className="notice-table__title-wrapper">
                    <span className="notice-table__title-text">
                      {notice.title}
                    </span>
                    {notice.summary && (
                      <span className="notice-table__summary-text" title={notice.summary}>
                        {notice.summary}
                      </span>
                    )}
                    <span className="notice-table__slug-text">
                      /{notice.slug}
                    </span>
                  </div>
                </td>
                <td className="notice-table__date-col">
                  <span className="notice-table__date-text">
                    {formatDate(notice.publishDate)}
                  </span>
                </td>
                <td className="notice-table__date-col">
                  <span className="notice-table__date-text">
                    {formatDate(notice.expiryDate)}
                  </span>
                </td>
                <td className="notice-table__doc-col">
                  {hasAttachments ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Badge variant="doc">
                          {attachments.length} {attachments.length === 1 ? "file" : "files"}
                        </Badge>
                      </div>
                      {attachments.slice(0, 2).map((att) => {
                        const href = att.fileStorageKey
                          ? `/api/admin/notices/${att.id}/document`
                          : att.fileUrl;
                        return href ? (
                          <a
                            key={att.id}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="notice-table__doc-link"
                            title={att.title}
                          >
                            <ExternalLink size={12} className="shrink-0" aria-hidden="true" />
                            <span
                              className="notice-table__doc-text"
                              style={{
                                maxWidth: "150px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {att.title}
                            </span>
                          </a>
                        ) : null;
                      })}
                      {attachments.length > 2 && (
                        <span style={{ fontSize: "11px", color: "var(--color-text-secondary, #6b7280)" }}>
                          +{attachments.length - 2} more
                        </span>
                      )}
                    </div>
                  ) : hasLegacyDoc ? (
                    <a
                      href={
                        notice.fileStorageKey
                          ? `/api/admin/notices/${notice.id}/document`
                          : (notice.fileUrl || "#")
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="notice-table__doc-link"
                      title={notice.fileOriginalName || notice.fileUrl || "Document"}
                    >
                      <ExternalLink size={13} className="shrink-0" aria-hidden="true" />
                      <span className="notice-table__doc-text">
                        {notice.fileSize || "Document"}
                      </span>
                    </a>
                  ) : (
                    <span className="admin-table__empty-dash">—</span>
                  )}
                </td>
                <td className="notice-table__order-col">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="admin-table__order-text">
                      {notice.displayOrder}
                    </span>
                    {onMove && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <button
                          type="button"
                          className="admin-icon-btn"
                          onClick={() => onMove(index, "UP")}
                          disabled={index === 0 || isReorderDisabled}
                          aria-label={`Move notice up: ${notice.title}`}
                          title={isReorderDisabled ? "Reset search/filters to reorder" : "Move up"}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn"
                          onClick={() => onMove(index, "DOWN")}
                          disabled={index === notices.length - 1 || isReorderDisabled}
                          aria-label={`Move notice down: ${notice.title}`}
                          title={isReorderDisabled ? "Reset search/filters to reorder" : "Move down"}
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="notice-table__actions-col">
                  <div className="topper-card-actions justify-end">
                    {onToggleStatus && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(notice)}
                        className="topper-icon-button"
                        aria-label={
                          notice.isPublished
                            ? `Unpublish notice: ${notice.title}`
                            : `Publish notice: ${notice.title}`
                        }
                        title={notice.isPublished ? "Unpublish to draft" : "Publish now"}
                      >
                        {notice.isPublished ? (
                          <EyeOff size={15} style={{ color: "#64748b" }} />
                        ) : (
                          <Eye size={15} style={{ color: "#059669" }} />
                        )}
                      </button>
                    )}
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(notice)}
                        className="topper-icon-button"
                        aria-label={`Edit notice: ${notice.title}`}
                        title="Edit notice"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(notice)}
                        className="topper-icon-button topper-icon-button--danger"
                        aria-label={`Delete notice: ${notice.title}`}
                        title="Delete notice"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
