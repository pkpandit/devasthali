"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, ChevronDown, RotateCcw } from "lucide-react";
import { NoticeList } from "./NoticeList";
import { NoticeFormDialog, type SerializedNotice } from "./NoticeFormDialog";
import { DeleteNoticeDialog } from "./DeleteNoticeDialog";
import { toggleNoticeStatusAction } from "@/lib/server/notice-actions";
import { getNoticeStatus, type NoticeComputedStatus } from "@/lib/validation/notices";

interface NoticeWorkspaceProps {
  notices: SerializedNotice[];
}

type FilterStatus = "ALL" | NoticeComputedStatus | "URGENT";

export function NoticeWorkspace({ notices }: NoticeWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<SerializedNotice | null>(null);
  const [deletingNotice, setDeletingNotice] = useState<SerializedNotice | null>(null);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSuccess = () => {
    router.refresh();
  };

  const handleToggleStatus = (notice: SerializedNotice) => {
    if (isPending) return;

    startTransition(async () => {
      try {
        const res = await toggleNoticeStatusAction({
          id: notice.id,
          isPublished: !notice.isPublished,
        });
        if (res.success) {
          handleSuccess();
        } else {
          alert(res.error || "Failed to toggle notice status.");
        }
      } catch (err) {
        console.error("Toggle error:", err);
        alert("Unexpected error updating notice status.");
      }
    });
  };

  // Filtered notices
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      // 1. Status Filter
      if (statusFilter === "URGENT") {
        if (!notice.isUrgent) return false;
      } else if (statusFilter !== "ALL") {
        const status = getNoticeStatus(notice);
        if (status !== statusFilter) return false;
      }

      // 2. Category Filter
      if (categoryFilter !== "ALL" && notice.category !== categoryFilter) {
        return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = notice.title.toLowerCase().includes(q);
        const matchesSummary = notice.summary?.toLowerCase().includes(q) ?? false;
        const matchesSlug = notice.slug.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesSlug) return false;
      }

      return true;
    });
  }, [notices, statusFilter, categoryFilter, searchQuery]);

  const publishedCount = useMemo(
    () => notices.filter((n) => n.isPublished).length,
    [notices]
  );

  return (
    <div className="topper-workspace-wrapper">
      {/* Top Workspace Header */}
      <div className="topper-workspace-toolbar">
        <div className="topper-workspace-toolbar__info">
          <h2 className="topper-workspace-toolbar__title">
            Notices &amp; Circulars Register
          </h2>
          <p className="topper-workspace-toolbar__count">
            {notices.length} total recorded &bull; {publishedCount} currently published
          </p>
        </div>
      </div>

      {/* Unified Toolbar: Search, Filters, and Actions on One Visual Baseline */}
      <div className="notice-toolbar">
        <div className="notice-toolbar__filters">
          {/* Search Input */}
          <div className="notice-toolbar__search-wrapper">
            <Search
              size={16}
              className="notice-toolbar__search-icon"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, summary, or slug..."
              className="notice-toolbar__search-input"
              aria-label="Filter notices by search keyword"
            />
          </div>

          {/* Status Filter */}
          <div className="notice-toolbar__filter-group">
            <label htmlFor="notice-status-filter" className="notice-toolbar__filter-label">
              Status:
            </label>
            <div className="notice-toolbar__select-wrapper">
              <select
                id="notice-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className="notice-toolbar__select"
                aria-label="Filter by lifecycle status"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="EXPIRED">Expired</option>
                <option value="URGENT">Urgent Only</option>
              </select>
              <ChevronDown size={14} className="notice-toolbar__select-chevron" aria-hidden="true" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="notice-toolbar__filter-group">
            <label htmlFor="notice-category-filter" className="notice-toolbar__filter-label">
              Category:
            </label>
            <div className="notice-toolbar__select-wrapper">
              <select
                id="notice-category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="notice-toolbar__select"
                aria-label="Filter by category"
              >
                <option value="ALL">All Categories</option>
                <option value="CIRCULAR">Circulars</option>
                <option value="EXAMINATION">Examinations</option>
                <option value="ADMISSION">Admissions</option>
                <option value="EVENT">Events</option>
              </select>
              <ChevronDown size={14} className="notice-toolbar__select-chevron" aria-hidden="true" />
            </div>
          </div>

          {/* Reset Filters */}
          {(statusFilter !== "ALL" || categoryFilter !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setCategoryFilter("ALL");
                setSearchQuery("");
              }}
              className="notice-toolbar__reset-btn"
              title="Reset all search and filter criteria"
            >
              <RotateCcw size={13} aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Action Button: Publish Notice */}
        <div className="notice-toolbar__actions">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="topper-button topper-button--primary topper-add-btn"
          >
            <Plus size={16} aria-hidden="true" />
            <span>Publish Notice</span>
          </button>
        </div>
      </div>

      {/* Semantic Table Listing */}
      <NoticeList
        notices={filteredNotices}
        onAdd={() => setIsCreateOpen(true)}
        onEdit={(notice) => setEditingNotice(notice)}
        onDelete={(notice) => setDeletingNotice(notice)}
        onToggleStatus={handleToggleStatus}
      />

      {/* Create / Edit Form Modal */}
      <NoticeFormDialog
        isOpen={isCreateOpen || Boolean(editingNotice)}
        initialNotice={editingNotice}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingNotice(null);
        }}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Alert Dialog */}
      <DeleteNoticeDialog
        isOpen={Boolean(deletingNotice)}
        notice={deletingNotice}
        onClose={() => setDeletingNotice(null)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
