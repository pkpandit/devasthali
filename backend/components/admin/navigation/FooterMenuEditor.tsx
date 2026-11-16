"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  GraduationCap,
  Users,
} from "lucide-react";
import {
  toggleNavigationItemStatusAction,
  reorderNavigationItemsAction,
} from "@/lib/server/navigation-actions";
import { ItemFormDialog, type SerializedNavigationItem } from "./ItemFormDialog";
import { DeleteNavigationDialog } from "./DeleteNavigationDialog";

interface FooterMenuEditorProps {
  admissionsLinks: SerializedNavigationItem[];
  communityLinks: SerializedNavigationItem[];
  onRefresh: () => void;
}

export function FooterMenuEditor({
  admissionsLinks,
  communityLinks,
  onRefresh,
}: FooterMenuEditorProps) {
  const [, startTransition] = useTransition();

  const [activeLocation, setActiveLocation] = useState<"FOOTER_ADMISSIONS" | "FOOTER_COMMUNITY">("FOOTER_ADMISSIONS");
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SerializedNavigationItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  const currentLinks = activeLocation === "FOOTER_ADMISSIONS" ? admissionsLinks : communityLinks;

  const handleAddItem = () => {
    setSelectedItem(null);
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: SerializedNavigationItem) => {
    setSelectedItem(item);
    setItemDialogOpen(true);
  };

  const handleToggleStatus = (item: SerializedNavigationItem) => {
    startTransition(async () => {
      await toggleNavigationItemStatusAction(null, {
        id: item.id,
        isPublished: !item.isPublished,
      });
      onRefresh();
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentLinks.length) return;

    const newLinks = [...currentLinks];
    const [moved] = newLinks.splice(index, 1);
    newLinks.splice(targetIndex, 0, moved);

    startTransition(async () => {
      await reorderNavigationItemsAction(null, {
        location: activeLocation,
        itemIds: newLinks.map((i) => i.id),
      });
      onRefresh();
    });
  };

  const promptDelete = (id: string, label: string) => {
    setDeleteTarget({ id, label });
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab selection */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveLocation("FOOTER_ADMISSIONS")}
          className={`py-2.5 px-4 text-xs font-heading font-bold border-b-2 inline-flex items-center gap-2 transition-colors ${
            activeLocation === "FOOTER_ADMISSIONS"
              ? "border-[#B91C1C] text-[#B91C1C]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Column 2: Admissions & Academics ({admissionsLinks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLocation("FOOTER_COMMUNITY")}
          className={`py-2.5 px-4 text-xs font-heading font-bold border-b-2 inline-flex items-center gap-2 transition-colors ${
            activeLocation === "FOOTER_COMMUNITY"
              ? "border-[#B91C1C] text-[#B91C1C]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Column 3: Life at School & Community ({communityLinks.length})</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            {activeLocation === "FOOTER_ADMISSIONS"
              ? "Admissions & Academics Links"
              : "Life at School & Community Links"}
          </h3>
          <p className="text-xs text-gray-500">
            These links appear in the institutional footer across all public pages.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Footer Link</span>
        </button>
      </div>

      {currentLinks.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-500 mb-3">No links in this footer column.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B91C1C] text-white text-xs font-semibold rounded-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Link</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-xs">
          {currentLinks.map((link, index) => (
            <div
              key={link.id}
              className={`p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors ${
                !link.isPublished ? "bg-gray-50/60 opacity-70" : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    aria-label="Move link up"
                    className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === currentLinks.length - 1}
                    aria-label="Move link down"
                    className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-sm text-gray-900 truncate">
                      {link.label}
                    </span>
                    {link.openInNewTab && (
                      <span title="Opens in new tab">
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </span>
                    )}
                  </div>
                  <span className="block font-mono text-xs text-gray-400 truncate">
                    {link.href}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(link)}
                  title={link.isPublished ? "Unpublish link" : "Publish link"}
                  className={`p-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1 transition-colors ${
                    link.isPublished
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  {link.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{link.isPublished ? "Live" : "Draft"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleEditItem(link)}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit link"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => promptDelete(link.id, link.label)}
                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete link"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Form Dialog */}
      <ItemFormDialog
        isOpen={itemDialogOpen}
        location={activeLocation}
        initialItem={selectedItem}
        onClose={() => setItemDialogOpen(false)}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation */}
      {deleteTarget && (
        <DeleteNavigationDialog
          isOpen={deleteDialogOpen}
          targetType="ITEM"
          targetId={deleteTarget.id}
          targetLabel={deleteTarget.label}
          onClose={() => {
            setDeleteDialogOpen(false);
            setDeleteTarget(null);
          }}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
