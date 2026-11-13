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
}: NoticeListProps) {
  if (!notices || notices.length === 0) {
    return (
      <EmptyState
        title="No Notices or Circulars Found"
        description="There are currently no official notices, circulars, or announcements recorded."
        icon={FileText}
      >
        {onAdd && (
          <div className="pt-4">
            <button
              type="button"
              onClick={onAdd}
              className="topper-button topper-button--primary inline-flex items-center gap-1.5"
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
            <th scope="col" style={{ width: "110px" }}>Status</th>
            <th scope="col" style={{ width: "100px" }}>Category</th>
            <th scope="col" style={{ minWidth: "260px" }}>Title &amp; Summary</th>
            <th scope="col" style={{ width: "120px" }}>Publish Date</th>
            <th scope="col" style={{ width: "120px" }}>Expiry Date</th>
            <th scope="col" style={{ width: "130px" }}>Document</th>
            <th scope="col" style={{ width: "70px", textAlign: "center" }}>Order</th>
            <th scope="col" style={{ width: "120px", textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {notices.map((notice) => {
            const status = getNoticeStatus(notice);
            const hasDocument = Boolean(notice.fileUrl);

            return (
              <tr key={notice.id}>
                <td>
                  <div className="flex flex-col gap-1 items-start">
                    {renderStatusBadge(status)}
                    {notice.isUrgent && (
                      <span className="admin-pill admin-pill--urgent flex items-center gap-1">
                        <AlertCircle size={10} aria-hidden="true" />
                        Urgent
                      </span>
                    )}
                  </div>
                </td>
                <td>{renderCategoryBadge(notice.category)}</td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 leading-snug">
                      {notice.title}
                    </span>
                    {notice.summary && (
                      <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {notice.summary}
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                      /{notice.slug}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="text-xs text-slate-700 whitespace-nowrap">
                    {formatDate(notice.publishDate)}
                  </span>
                </td>
                <td>
                  <span className="text-xs text-slate-600 whitespace-nowrap">
                    {formatDate(notice.expiryDate)}
                  </span>
                </td>
                <td>
                  {hasDocument ? (
                    <a
                      href={notice.fileUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline max-w-[120px] truncate"
                      title={notice.fileUrl!}
                    >
                      <ExternalLink size={12} className="shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {notice.fileSize ? notice.fileSize : "Link"}
                      </span>
                    </a>
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  <span className="text-xs font-mono text-slate-700">
                    {notice.displayOrder}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
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
                          <EyeOff size={15} className="text-slate-500" />
                        ) : (
                          <Eye size={15} className="text-emerald-600" />
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
