"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
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
      {/* Top Toolbar */}
      <div className="topper-workspace-toolbar">
        <div className="topper-workspace-toolbar__info">
          <h2 className="topper-workspace-toolbar__title">
            Notices &amp; Circulars Register
          </h2>
          <p className="topper-workspace-toolbar__count">
            {notices.length} total recorded &bull; {publishedCount} currently published
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="topper-button topper-button--primary topper-add-btn"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Publish Notice</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, summary, or slug..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Filter notices by search keyword"
          />
        </div>

        {/* Status and Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="text-xs py-1.5 px-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="Filter by lifecycle status"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="EXPIRED">Expired</option>
              <option value="URGENT">Urgent Only</option>
            </select>
          </div>

          {/* Category Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-600">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs py-1.5 px-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="Filter by category"
            >
              <option value="ALL">All Categories</option>
              <option value="CIRCULAR">Circulars</option>
              <option value="EXAMINATION">Examinations</option>
              <option value="ADMISSION">Admissions</option>
              <option value="EVENT">Events</option>
            </select>
          </div>

          {(statusFilter !== "ALL" || categoryFilter !== "ALL" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setCategoryFilter("ALL");
                setSearchQuery("");
              }}
              className="text-xs text-blue-600 hover:text-blue-800 underline ml-1"
            >
              Reset
            </button>
          )}
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
