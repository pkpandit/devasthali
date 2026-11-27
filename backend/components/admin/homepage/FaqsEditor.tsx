"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  HelpCircle,
} from "lucide-react";
import {
  toggleHomepageFaqStatusAction,
  deleteHomepageFaqAction,
  reorderHomepageFaqsAction,
} from "@/lib/server/homepage-announcement-faq-actions";
import { FaqFormDialog, type SerializedHomepageFaq } from "./FaqFormDialog";
import { DeleteHomepageDialog } from "./DeleteHomepageDialog";

interface FaqsEditorProps {
  faqs: SerializedHomepageFaq[];
  onRefresh: () => void;
}

export function FaqsEditor({ faqs, onRefresh }: FaqsEditorProps) {
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<SerializedHomepageFaq | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SerializedHomepageFaq | null>(null);

  const handleCreate = () => {
    setEditingFaq(null);
    setIsFormOpen(true);
  };

  const handleEdit = (faq: SerializedHomepageFaq) => {
    setEditingFaq(faq);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (faq: SerializedHomepageFaq) => {
    startTransition(async () => {
      await toggleHomepageFaqStatusAction({ id: faq.id });
      onRefresh();
    });
  };

  const handleMove = (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const reordered = [...faqs];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const items = reordered.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    startTransition(async () => {
      await reorderHomepageFaqsAction({ items });
      onRefresh();
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteHomepageFaqAction({ id: deleteTarget.id });
    onRefresh();
  };

  return (
    <div className="admin-workspace">
      <div className="admin-section-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-workspace-toolbar__title">
              Homepage Frequently Asked Questions
            </h2>
            <p className="admin-workspace-toolbar__count">
              Manage parent &amp; prospective student FAQs displayed in Section 10 of the homepage ({faqs.length} total).
            </p>
          </div>

          <div className="admin-card-actions">
            <button
              type="button"
              onClick={handleCreate}
              className="admin-button admin-button--primary"
            >
              <Plus size={16} />
              <span>Add FAQ</span>
            </button>
          </div>
        </div>

        {faqs.length === 0 ? (
          <div className="admin-empty-state">
            <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">No homepage FAQs configured yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Click &quot;Add FAQ&quot; to create admissions, hostel, transport, or curriculum questions.
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table" aria-label="Homepage FAQs Roster">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "48px", textAlign: "center" }}>
                    #
                  </th>
                  <th scope="col" style={{ width: "35%" }}>
                    Question
                  </th>
                  <th scope="col">Answer Preview</th>
                  <th scope="col" style={{ width: "100px", textAlign: "center" }}>
                    Status
                  </th>
                  <th scope="col" style={{ width: "90px", textAlign: "center" }}>
                    Reorder
                  </th>
                  <th scope="col" style={{ width: "90px", textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((faq, idx) => (
                  <tr
                    key={faq.id}
                    style={{ opacity: !faq.isPublished ? 0.6 : 1 }}
                  >
                    <td
                      style={{
                        textAlign: "center",
                        fontFamily: "monospace",
                        color: "#9ca3af",
                        fontSize: "0.75rem",
                      }}
                    >
                      {idx + 1}
                    </td>

                    <td>
                      <div
                        style={{
                          fontFamily: "var(--heading-font)",
                          fontWeight: 700,
                          color: "#111827",
                          fontSize: "0.875rem",
                          lineHeight: 1.4,
                        }}
                      >
                        {faq.question}
                      </div>
                    </td>

                    <td>
                      <div
                        style={{
                          fontSize: "0.8125rem",
                          color: "#4b5563",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {faq.answer}
                      </div>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(faq)}
                        disabled={isPending}
                        aria-label={`Toggle status for FAQ: ${faq.question}`}
                        className={`admin-pill ${
                          faq.isPublished
                            ? "admin-pill--published"
                            : "admin-pill--draft"
                        }`}
                        style={{
                          cursor: "pointer",
                          border: "none",
                          minHeight: "28px",
                        }}
                      >
                        {faq.isPublished ? (
                          <>
                            <Eye size={12} style={{ marginRight: "4px" }} />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} style={{ marginRight: "4px" }} />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "UP")}
                          disabled={isPending || idx === 0}
                          aria-label={`Move FAQ #${idx + 1} up`}
                          className="admin-icon-button"
                          style={{
                            width: "32px",
                            height: "32px",
                            minWidth: "32px",
                            minHeight: "32px",
                          }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "DOWN")}
                          disabled={isPending || idx === faqs.length - 1}
                          aria-label={`Move FAQ #${idx + 1} down`}
                          className="admin-icon-button"
                          style={{
                            width: "32px",
                            height: "32px",
                            minWidth: "32px",
                            minHeight: "32px",
                          }}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleEdit(faq)}
                          aria-label={`Edit FAQ: ${faq.question}`}
                          className="admin-icon-button"
                          style={{
                            width: "32px",
                            height: "32px",
                            minWidth: "32px",
                            minHeight: "32px",
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(faq)}
                          aria-label={`Delete FAQ: ${faq.question}`}
                          className="admin-icon-button"
                          style={{
                            width: "32px",
                            height: "32px",
                            minWidth: "32px",
                            minHeight: "32px",
                            color: "#dc2626",
                          }}
                        >
                          <Trash2 size={14} />
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

      {/* Dialog for create / edit */}
      {isFormOpen && (
        <FaqFormDialog
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          faq={editingFaq}
        />
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <DeleteHomepageDialog
          isOpen={!!deleteTarget}
          title="Delete Homepage FAQ"
          itemDescription={`"${deleteTarget.question}"`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
