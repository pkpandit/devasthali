"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Phone,
} from "lucide-react";
import {
  toggleCampusDirectoryStatusAction,
  reorderCampusDirectoryEntriesAction,
} from "@/lib/server/profile-actions";
import {
  DirectoryFormDialog,
  type SerializedDirectoryEntry,
} from "./DirectoryFormDialog";
import { DeleteDirectoryDialog } from "./DeleteDirectoryDialog";

interface DirectoryListProps {
  entries: SerializedDirectoryEntry[];
  onRefresh: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  ADMINISTRATION: "Administration & Desk",
  HOSTEL_WARDEN: "Hostel Wardens",
  ACADEMIC_COORDINATOR: "Academic Coordinators",
  OFFICE_ACCOUNTS: "Accounts & Fees",
  SECURITY_TRANSPORT: "Security & Transport",
};

export function DirectoryList({ entries, onRefresh }: DirectoryListProps) {
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SerializedDirectoryEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<SerializedDirectoryEntry | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (categoryFilter !== "ALL" && entry.category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const titleMatch = entry.roleTitle.toLowerCase().includes(q);
        const nameMatch = entry.contactName?.toLowerCase().includes(q) ?? false;
        const deptMatch = entry.department?.toLowerCase().includes(q) ?? false;
        const phoneMatch = entry.phoneNumber.includes(q);
        if (!titleMatch && !nameMatch && !deptMatch && !phoneMatch) {
          return false;
        }
      }
      return true;
    });
  }, [entries, categoryFilter, searchQuery]);

  const handleTogglePublished = (entry: SerializedDirectoryEntry) => {
    startTransition(async () => {
      try {
        const res = await toggleCampusDirectoryStatusAction(null, {
          id: entry.id,
          isPublished: !entry.isPublished,
        });
        if (res.success) {
          onRefresh();
        } else {
          alert(res.error || "Failed to toggle publication status.");
        }
      } catch (err) {
        console.error("Toggle error:", err);
      }
    });
  };

  const handleMoveOrder = (entry: SerializedDirectoryEntry, direction: "up" | "down") => {
    const currentIndex = entries.findIndex((e) => e.id === entry.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= entries.length) return;

    const targetEntry = entries[targetIndex];
    startTransition(async () => {
      try {
        const res = await reorderCampusDirectoryEntriesAction(null, {
          entries: [
            { id: entry.id, displayOrder: targetEntry.displayOrder },
            { id: targetEntry.id, displayOrder: entry.displayOrder },
          ],
        });
        if (res.success) {
          onRefresh();
        } else {
          alert(res.error || "Failed to reorder entries.");
        }
      } catch (err) {
        console.error("Reorder error:", err);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Bar: Category tabs, search and Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role, name, or phone..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600 bg-white"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Directory Contact</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 pt-1 border-b pb-3">
        {["ALL", "ADMINISTRATION", "HOSTEL_WARDEN", "ACADEMIC_COORDINATOR", "OFFICE_ACCOUNTS", "SECURITY_TRANSPORT"].map(
          (cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                categoryFilter === cat
                  ? "bg-[#111827] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat === "ALL" ? `All Contacts (${entries.length})` : CATEGORY_LABELS[cat] || cat}
            </button>
          )
        )}
      </div>

      {/* Table (Desktop) */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Phone className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-gray-700">No directory contacts found</p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your category filter or search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-14">Order</th>
                  <th className="py-3 px-4">Role &amp; Contact Person</th>
                  <th className="py-3 px-4">Category &amp; Department</th>
                  <th className="py-3 px-4">Phone Number(s)</th>
                  <th className="py-3 px-4 w-28 text-center">Status</th>
                  <th className="py-3 px-4 w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEntries.map((entry, idx) => (
                  <tr key={entry.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-xs font-mono text-gray-400">
                      <div className="flex items-center gap-1">
                        <span>{entry.displayOrder}</span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(entry, "up")}
                            disabled={idx === 0 || isPending}
                            className="text-gray-400 hover:text-gray-900 disabled:opacity-20"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(entry, "down")}
                            disabled={idx === filteredEntries.length - 1 || isPending}
                            className="text-gray-400 hover:text-gray-900 disabled:opacity-20"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{entry.roleTitle}</div>
                      {entry.contactName && (
                        <div className="text-xs text-gray-600">{entry.contactName}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 mb-0.5">
                        {CATEGORY_LABELS[entry.category] || entry.category}
                      </span>
                      {entry.department && (
                        <div className="text-xs text-gray-500">{entry.department}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-gray-800">
                        {entry.phoneNumber}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePublished(entry)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          entry.isPublished
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title="Click to toggle status"
                      >
                        {entry.isPublished ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-gray-400" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingEntry(entry)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Contact"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingEntry(entry)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Dialogs */}
      <DirectoryFormDialog
        isOpen={isCreateOpen}
        initialEntry={null}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={onRefresh}
      />

      <DirectoryFormDialog
        isOpen={Boolean(editingEntry)}
        initialEntry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSuccess={onRefresh}
      />

      <DeleteDirectoryDialog
        isOpen={Boolean(deletingEntry)}
        entry={deletingEntry}
        onClose={() => setDeletingEntry(null)}
        onSuccess={onRefresh}
      />
    </div>
  );
}
