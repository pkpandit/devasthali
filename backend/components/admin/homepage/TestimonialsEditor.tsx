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
  MessageSquareQuote,
  Star,
} from "lucide-react";
import {
  toggleHomepageTestimonialStatusAction,
  deleteHomepageTestimonialAction,
  reorderHomepageTestimonialsAction,
} from "@/lib/server/homepage-testimonial-actions";
import {
  TestimonialFormDialog,
  type SerializedHomepageTestimonial,
} from "./TestimonialFormDialog";
import { DeleteHomepageDialog } from "./DeleteHomepageDialog";

interface TestimonialsEditorProps {
  testimonials: SerializedHomepageTestimonial[];
  onRefresh: () => void;
}

export function TestimonialsEditor({
  testimonials,
  onRefresh,
}: TestimonialsEditorProps) {
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<SerializedHomepageTestimonial | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<SerializedHomepageTestimonial | null>(null);

  const handleCreate = () => {
    setEditingTestimonial(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: SerializedHomepageTestimonial) => {
    setEditingTestimonial(item);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (item: SerializedHomepageTestimonial) => {
    startTransition(async () => {
      await toggleHomepageTestimonialStatusAction({ id: item.id });
      onRefresh();
    });
  };

  const handleMove = (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= testimonials.length) return;

    const reordered = [...testimonials];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const items = reordered.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    startTransition(async () => {
      await reorderHomepageTestimonialsAction({ items });
      onRefresh();
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteHomepageTestimonialAction({ id: deleteTarget.id });
    onRefresh();
  };

  return (
    <div className="admin-workspace">
      <div className="admin-section-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-workspace-toolbar__title">
              Homepage Parent &amp; Community Testimonials
            </h2>
            <p className="admin-workspace-toolbar__count">
              Manage parent, guardian, and community reflections displayed in Section 9 of the homepage ({testimonials.length} total).
            </p>
          </div>

          <div className="admin-card-actions">
            <button
              type="button"
              onClick={handleCreate}
              className="admin-button admin-button--primary"
            >
              <Plus size={16} />
              <span>Add Testimonial</span>
            </button>
          </div>
        </div>

        {testimonials.length === 0 ? (
          <div className="admin-empty-state">
            <MessageSquareQuote className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">No parent testimonials configured yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Click &quot;Add Testimonial&quot; to add reflections from parents and alumni. If no testimonials exist, Section 9 is suppressed on the homepage.
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table" aria-label="Homepage Testimonials Roster">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "48px", textAlign: "center" }}>
                    #
                  </th>
                  <th scope="col" style={{ width: "28%" }}>
                    Author &amp; Relationship
                  </th>
                  <th scope="col">Quote &amp; Rating</th>
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
                {testimonials.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{ opacity: !item.isPublished ? 0.6 : 1 }}
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
                      <div className="flex items-center gap-3">
                        {item.avatarUrl ? (
                          <div
                            className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.avatarUrl}
                              alt={item.author}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full bg-[#B91C1C] text-white flex items-center justify-center font-bold text-xs shrink-0 tracking-wider shadow-xs"
                          >
                            {item.monogram || "★"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div
                            style={{
                              fontFamily: "var(--heading-font)",
                              fontWeight: 700,
                              color: "#111827",
                              fontSize: "0.875rem",
                              lineHeight: 1.4,
                            }}
                          >
                            {item.author}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#6b7280",
                              lineHeight: 1.3,
                            }}
                          >
                            {item.relationship}
                          </div>
                          {item.subject && (
                            <span
                              className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-800 rounded border border-amber-200"
                            >
                              {item.subject}
                            </span>
                          )}
                        </div>
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
                          fontStyle: "italic",
                        }}
                      >
                        &ldquo;{item.quote}&rdquo;
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-amber-500">
                        {Array.from({ length: Math.max(1, Math.min(5, item.rating || 5)) }).map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            size={12}
                            className="fill-amber-400 text-amber-400"
                          />
                        ))}
                        <span className="text-xs text-gray-400 font-medium ml-1">
                          {item.rating}/5
                        </span>
                      </div>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        disabled={isPending}
                        aria-label={`Toggle status for testimonial by: ${item.author}`}
                        className={`admin-pill ${
                          item.isPublished
                            ? "admin-pill--published"
                            : "admin-pill--draft"
                        }`}
                        style={{
                          cursor: "pointer",
                          border: "none",
                          minHeight: "28px",
                        }}
                      >
                        {item.isPublished ? (
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
                          aria-label={`Move testimonial #${idx + 1} up`}
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
                          disabled={isPending || idx === testimonials.length - 1}
                          aria-label={`Move testimonial #${idx + 1} down`}
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
                          justifyContent: "flex-end",
                          gap: "4px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          disabled={isPending}
                          aria-label={`Edit testimonial by ${item.author}`}
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
                          onClick={() => setDeleteTarget(item)}
                          disabled={isPending}
                          aria-label={`Delete testimonial by ${item.author}`}
                          className="admin-icon-button admin-icon-button--danger"
                          style={{
                            width: "32px",
                            height: "32px",
                            minWidth: "32px",
                            minHeight: "32px",
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

      <TestimonialFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        testimonial={editingTestimonial}
      />

      <DeleteHomepageDialog
        isOpen={!!deleteTarget}
        title="Delete Homepage Testimonial"
        itemDescription={
          deleteTarget
            ? `testimonial from "${deleteTarget.author}" (${deleteTarget.relationship})`
            : "this testimonial"
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
