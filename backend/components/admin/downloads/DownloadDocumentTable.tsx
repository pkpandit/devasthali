"use client";

import {
  FileText,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import type { SerializedDownloadDocument } from "./DownloadDocumentDialog";

interface DownloadDocumentTableProps {
  documents: SerializedDownloadDocument[];
  isPending: boolean;
  onEdit: (doc: SerializedDownloadDocument) => void;
  onDelete: (doc: SerializedDownloadDocument) => void;
  onToggleStatus: (doc: SerializedDownloadDocument) => void;
  onMove: (currentIndex: number, direction: "UP" | "DOWN") => void;
}

export function DownloadDocumentTable({
  documents,
  isPending,
  onEdit,
  onDelete,
  onToggleStatus,
  onMove,
}: DownloadDocumentTableProps) {
  if (documents.length === 0) {
    return (
      <div className="admin-empty-state" style={{ margin: "12px 0", padding: "24px 16px" }}>
        <FileText size={24} color="#9ca3af" aria-hidden="true" />
        <p style={{ margin: 0, fontWeight: 500 }}>No documents in this category yet.</p>
        <p style={{ margin: 0, fontSize: "0.75rem" }}>Click &ldquo;Add Document&rdquo; above to attach a PDF.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", width: "100%", marginTop: "12px" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.875rem",
          textAlign: "left",
          background: "#ffffff",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}
      >
        <thead>
          <tr style={{ background: "#f9fafb", borderBottom: "1px solid var(--border)" }}>
            <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151" }}>Document</th>
            <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151", width: "110px" }}>Size</th>
            <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151", width: "80px" }}>Order</th>
            <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151", width: "110px" }}>Status</th>
            <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151", width: "150px", textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === documents.length - 1;

            return (
              <tr
                key={doc.id}
                style={{
                  borderBottom: idx === documents.length - 1 ? "none" : "1px solid var(--border)",
                  transition: "background 0.15s ease",
                }}
              >
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <FileText size={18} color="var(--red)" style={{ marginTop: "2px", flexShrink: 0 }} aria-hidden="true" />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>
                        {doc.title}
                      </p>
                      {doc.description && (
                        <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", color: "#6b7280", lineHeight: 1.3 }}>
                          {doc.description}
                        </p>
                      )}
                      {doc.fileStorageKey && (
                        <span style={{ display: "inline-block", marginTop: "4px", fontSize: "0.7rem", color: "#059669", background: "#ecfdf5", padding: "1px 6px", borderRadius: "4px", border: "1px solid #a7f3d0" }}>
                          Managed PDF Storage
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td style={{ padding: "12px 14px", color: "#6b7280", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                  {doc.fileSize || (doc.fileSizeBytes ? `${Math.round(doc.fileSizeBytes / 1024)} KB` : "—")}
                </td>

                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <button
                      type="button"
                      onClick={() => onMove(idx, "UP")}
                      disabled={isPending || isFirst}
                      className="admin-icon-button"
                      style={{ width: "28px", height: "28px", minWidth: "28px", minHeight: "28px" }}
                      aria-label={`Move ${doc.title} up`}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMove(idx, "DOWN")}
                      disabled={isPending || isLast}
                      className="admin-icon-button"
                      style={{ width: "28px", height: "28px", minWidth: "28px", minHeight: "28px" }}
                      aria-label={`Move ${doc.title} down`}
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </td>

                <td style={{ padding: "12px 14px" }}>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(doc)}
                    disabled={isPending}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: isPending ? "not-allowed" : "pointer",
                      padding: 0,
                    }}
                    title={`Click to ${doc.isPublished ? "unpublish" : "publish"}`}
                    aria-label={`Toggle status for ${doc.title}`}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: "9999px",
                        background: doc.isPublished ? "#ecfdf5" : "#f3f4f6",
                        color: doc.isPublished ? "#065f46" : "#6b7280",
                        border: `1px solid ${doc.isPublished ? "#a7f3d0" : "#d1d5db"}`,
                      }}
                    >
                      {doc.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{doc.isPublished ? "Active" : "Draft"}</span>
                    </span>
                  </button>
                </td>

                <td style={{ padding: "12px 14px", textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                    {(doc.fileUrl || doc.fileStorageKey) && (
                      <a
                        href={doc.fileUrl || `/api/public/documents/${doc.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-icon-button"
                        style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px" }}
                        title="Open Document File"
                        aria-label={`Open file for ${doc.title}`}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onEdit(doc)}
                      disabled={isPending}
                      className="admin-icon-button"
                      style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px" }}
                      title="Edit Document"
                      aria-label={`Edit ${doc.title}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(doc)}
                      disabled={isPending}
                      className="admin-icon-button"
                      style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px", color: "#dc2626" }}
                      title="Delete Document"
                      aria-label={`Delete ${doc.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
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
