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
import type { SerializedDisclosureDocument } from "./DisclosureDocumentDialog";

interface DisclosureDocumentTableProps {
  documents: SerializedDisclosureDocument[];
  isPending: boolean;
  onEdit: (doc: SerializedDisclosureDocument) => void;
  onDelete: (doc: SerializedDisclosureDocument) => void;
  onToggleStatus: (doc: SerializedDisclosureDocument) => void;
  onMove: (currentIndex: number, direction: "UP" | "DOWN") => void;
}

export function DisclosureDocumentTable({
  documents,
  isPending,
  onEdit,
  onDelete,
  onToggleStatus,
  onMove,
}: DisclosureDocumentTableProps) {
  if (documents.length === 0) {
    return (
      <div className="admin-empty-state" style={{ margin: "12px 0", padding: "24px 16px" }}>
        <FileText size={24} color="#9ca3af" aria-hidden="true" />
        <p style={{ margin: 0, fontWeight: 500 }}>No documents in this section yet.</p>
        <p style={{ margin: 0, fontSize: "0.75rem" }}>Click &ldquo;Add Document&rdquo; above to attach a PDF.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", width: "100%", marginTop: "12px" }}>
      <table
        className="documents-table"
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
            <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151", width: "140px" }}>Button Label</th>
            <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151", width: "100px" }}>Size</th>
            <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151", width: "80px" }}>Order</th>
            <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151", width: "100px" }}>Status</th>
            <th style={{ padding: "10px 14px", fontWeight: 600, color: "#374151", width: "110px", textAlign: "right" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === documents.length - 1;
            const viewHref = doc.fileStorageKey
              ? `/api/public/documents/${doc.id}`
              : doc.fileUrl || "#";

            return (
              <tr
                key={doc.id}
                style={{
                  borderBottom: "1px solid var(--border)",
                  opacity: isPending ? 0.6 : 1,
                  background: doc.isPublished ? "#ffffff" : "#fcfcfc",
                }}
              >
                {/* Title & Description */}
                <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <FileText
                      size={18}
                      color="var(--primary)"
                      style={{ marginTop: "2px", flexShrink: 0 }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: doc.isPublished ? "var(--foreground)" : "#6b7280",
                        }}
                      >
                        {doc.title}
                      </div>
                      {doc.description && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--muted-foreground)",
                            marginTop: "2px",
                          }}
                        >
                          {doc.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Button / Link Label */}
                <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "#F3F4F6",
                      color: "#1F2937",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {doc.linkLabel || "VIEW/DOWNLOAD"}
                  </span>
                </td>

                {/* File Size */}
                <td
                  style={{
                    padding: "10px 14px",
                    verticalAlign: "middle",
                    color: "var(--muted-foreground)",
                    fontSize: "0.8rem",
                  }}
                >
                  {doc.fileSize || "PDF"}
                </td>

                {/* Order Arrows */}
                <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <button
                      type="button"
                      disabled={isFirst || isPending}
                      onClick={() => onMove(idx, "UP")}
                      aria-label="Move document up"
                      style={{
                        padding: "3px",
                        background: "transparent",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        cursor: isFirst || isPending ? "not-allowed" : "pointer",
                        opacity: isFirst ? 0.3 : 1,
                        color: "var(--foreground)",
                      }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={isLast || isPending}
                      onClick={() => onMove(idx, "DOWN")}
                      aria-label="Move document down"
                      style={{
                        padding: "3px",
                        background: "transparent",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        cursor: isLast || isPending ? "not-allowed" : "pointer",
                        opacity: isLast ? 0.3 : 1,
                        color: "var(--foreground)",
                      }}
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </td>

                {/* Status Toggle */}
                <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(doc)}
                    disabled={isPending}
                    aria-label={doc.isPublished ? "Unpublish document" : "Publish document"}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      border: "none",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: isPending ? "not-allowed" : "pointer",
                      background: doc.isPublished ? "#DEF7EC" : "#F3F4F6",
                      color: doc.isPublished ? "#03543F" : "#6B7280",
                    }}
                  >
                    {doc.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{doc.isPublished ? "Active" : "Draft"}</span>
                  </button>
                </td>

                {/* Row Actions */}
                <td style={{ padding: "10px 14px", verticalAlign: "middle", textAlign: "right" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "6px",
                    }}
                  >
                    {viewHref !== "#" && (
                      <a
                        href={viewHref}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`Preview ${doc.title}`}
                        style={{
                          padding: "5px",
                          color: "var(--muted-foreground)",
                          borderRadius: "4px",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onEdit(doc)}
                      disabled={isPending}
                      aria-label={`Edit ${doc.title}`}
                      style={{
                        padding: "5px",
                        background: "transparent",
                        border: "none",
                        color: "var(--foreground)",
                        cursor: isPending ? "not-allowed" : "pointer",
                        borderRadius: "4px",
                      }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(doc)}
                      disabled={isPending}
                      aria-label={`Delete ${doc.title}`}
                      style={{
                        padding: "5px",
                        background: "transparent",
                        border: "none",
                        color: "var(--destructive)",
                        cursor: isPending ? "not-allowed" : "pointer",
                        borderRadius: "4px",
                      }}
                    >
                      <Trash2 size={15} />
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
