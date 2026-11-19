"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";
import {
  toggleSchoolEventStatus,
  deleteSchoolEvent,
  reorderSchoolEvents,
} from "@/lib/server/events-actions";
import { EventFormDialog, type SerializedSchoolEvent } from "./EventFormDialog";
import { DeleteEventDialog } from "./DeleteEventDialog";

interface EventsWorkspaceProps {
  events: SerializedSchoolEvent[];
}

export function EventsWorkspace({ events }: EventsWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SerializedSchoolEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SerializedSchoolEvent | null>(null);

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) {
      if (e.category) set.add(e.category);
    }
    return Array.from(set).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "ALL") return events;
    return events.filter((e) => e.category === selectedCategory);
  }, [events, selectedCategory]);

  const handleCreate = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (event: SerializedSchoolEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (event: SerializedSchoolEvent) => {
    startTransition(async () => {
      await toggleSchoolEventStatus({
        id: event.id,
        isPublished: !event.isPublished,
      });
      router.refresh();
    });
  };

  const handleMove = (currentIndex: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= events.length) return;

    const reordered = [...events];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((item) => item.id);

    startTransition(async () => {
      await reorderSchoolEvents({ orderedIds });
      router.refresh();
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteSchoolEvent({ id: deleteTarget.id });
    setDeleteTarget(null);
    router.refresh();
  };

  return (
    <div className="admin-workspace">
      {/* Workspace Toolbar Card */}
      <div className="admin-section-card">
        <div className="admin-card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 className="admin-workspace-toolbar__title">
                Student Activities &amp; Competitions
              </h2>
              <span className="admin-workspace-toolbar__count">
                ({events.length} event{events.length === 1 ? "" : "s"})
              </span>
            </div>
            <p className="admin-card-subtitle">
              Manage annual academic calendar milestones, examination dates, student competitions, and celebrations.
            </p>
          </div>

          <div className="admin-card-actions">
            <button
              type="button"
              onClick={handleCreate}
              className="admin-btn admin-btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={16} />
              New Event
            </button>
          </div>
        </div>

        {/* Category Filters */}
        {categories.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              padding: "12px 16px",
              borderTop: "1px solid var(--color-border-subtle, #f3f4f6)",
              background: "var(--color-bg-subtle, #fafafa)",
            }}
          >
            <button
              type="button"
              className={`admin-btn admin-btn-sm ${selectedCategory === "ALL" ? "admin-btn-primary" : "admin-btn-secondary"}`}
              onClick={() => setSelectedCategory("ALL")}
            >
              All Categories ({events.length})
            </button>
            {categories.map((cat) => {
              const count = events.filter((e) => e.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`admin-btn admin-btn-sm ${selectedCategory === cat ? "admin-btn-primary" : "admin-btn-secondary"}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Events Table Card */}
      <div className="admin-section-card" style={{ marginTop: "16px" }}>
        {filteredEvents.length === 0 ? (
          <div
            style={{
              padding: "48px 16px",
              textAlign: "center",
              color: "var(--color-text-secondary, #6b7280)",
            }}
          >
            <Calendar size={36} style={{ color: "#9ca3af", margin: "0 auto 12px" }} />
            <p style={{ margin: 0, fontWeight: 500 }}>
              No events found in this category.
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "48px" }}>Order</th>
                  <th style={{ width: "120px" }}>Date</th>
                  <th>Event Details</th>
                  <th style={{ width: "140px" }}>Category</th>
                  <th style={{ width: "100px" }}>Status</th>
                  <th style={{ width: "120px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event, index) => (
                  <tr key={event.id}>
                    {/* Order Controls */}
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <button
                          type="button"
                          className="admin-icon-btn"
                          onClick={() => handleMove(index, "UP")}
                          disabled={index === 0 || isPending || selectedCategory !== "ALL"}
                          aria-label="Move up"
                          title={selectedCategory !== "ALL" ? "Switch to 'All Categories' to reorder" : "Move up"}
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn"
                          onClick={() => handleMove(index, "DOWN")}
                          disabled={index === filteredEvents.length - 1 || isPending || selectedCategory !== "ALL"}
                          aria-label="Move down"
                          title={selectedCategory !== "ALL" ? "Switch to 'All Categories' to reorder" : "Move down"}
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </td>

                    {/* Date */}
                    <td>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-primary, #111827)" }}>
                        {event.eventDate}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-secondary, #6b7280)", marginTop: "2px" }}>
                        ISO: {event.isoDate}
                      </div>
                    </td>

                    {/* Title & Metadata */}
                    <td>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        {event.coverImageUrl && (
                          <div
                            style={{
                              position: "relative",
                              width: "60px",
                              height: "42px",
                              borderRadius: "4px",
                              overflow: "hidden",
                              flexShrink: 0,
                              background: "#e5e7eb",
                            }}
                          >
                            <Image
                              src={event.coverImageUrl}
                              alt={event.coverImageAlt || event.title}
                              fill
                              sizes="60px"
                              style={{ objectFit: "cover" }}
                              unoptimized
                            />
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text-primary, #111827)" }}>
                            {event.title}
                          </div>

                          <div style={{ fontSize: "12px", color: "var(--color-text-secondary, #6b7280)", marginTop: "3px" }}>
                            {event.description}
                          </div>

                          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "6px", fontSize: "12px", color: "#4b5563" }}>
                            {event.time && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <Clock size={12} style={{ color: "#6b7280" }} /> {event.time}
                              </span>
                            )}
                            {event.location && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <MapPin size={12} style={{ color: "#6b7280" }} /> {event.location}
                              </span>
                            )}
                            {event.linkHref && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <ExternalLink size={12} style={{ color: "#2563eb" }} />
                                <a
                                  href={event.linkHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "#2563eb", textDecoration: "underline" }}
                                >
                                  {event.linkLabel || "Link"}
                                </a>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 500,
                          background: "#f3f4f6",
                          color: "#374151",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        {event.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <button
                        type="button"
                        className={`admin-badge ${event.isPublished ? "admin-badge--success" : "admin-badge--draft"}`}
                        onClick={() => handleToggleStatus(event)}
                        disabled={isPending}
                        style={{ cursor: "pointer", border: "none" }}
                        title="Click to toggle publish status"
                      >
                        {event.isPublished ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Eye size={12} /> Published
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <EyeOff size={12} /> Draft
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="admin-icon-btn"
                          onClick={() => handleEdit(event)}
                          disabled={isPending}
                          title="Edit event"
                          aria-label="Edit event"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn admin-icon-btn--danger"
                          onClick={() => setDeleteTarget(event)}
                          disabled={isPending}
                          title="Delete event"
                          aria-label="Delete event"
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

      {/* Event Form Dialog */}
      {isFormOpen && (
        <EventFormDialog
          isOpen={isFormOpen}
          event={editingEvent}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            router.refresh();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <DeleteEventDialog
          isOpen={Boolean(deleteTarget)}
          eventTitle={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
