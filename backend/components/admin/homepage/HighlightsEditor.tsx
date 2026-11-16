"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  LayoutGrid,
  ExternalLink,
} from "lucide-react";
import {
  toggleHomepageHighlightStatusAction,
  deleteHomepageHighlightAction,
  reorderHomepageHighlightsAction,
} from "@/lib/server/homepage-actions";
import {
  HighlightFormDialog,
  type SerializedHighlight,
} from "./HighlightFormDialog";
import { DeleteHomepageDialog } from "./DeleteHomepageDialog";

interface HighlightsEditorProps {
  highlights: SerializedHighlight[];
  onRefresh: () => void;
}

export function HighlightsEditor({ highlights, onRefresh }: HighlightsEditorProps) {
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<SerializedHighlight | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<SerializedHighlight | null>(null);

  const handleCreate = () => {
    setEditingHighlight(null);
    setIsFormOpen(true);
  };

  const handleEdit = (hl: SerializedHighlight) => {
    setEditingHighlight(hl);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (hl: SerializedHighlight) => {
    startTransition(async () => {
      await toggleHomepageHighlightStatusAction(null, {
        id: hl.id,
        isPublished: !hl.isPublished,
      });
      onRefresh();
    });
  };

  const handleMove = (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= highlights.length) return;

    const reordered = [...highlights];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const payload = reordered.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    startTransition(async () => {
      await reorderHomepageHighlightsAction(null, { highlights: payload });
      onRefresh();
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteHomepageHighlightAction(null, { id: deleteTarget.id });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-heading font-bold text-gray-900 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#B91C1C]" />
            <span>Promotional Highlights & Quick Actions</span>
          </h2>
          <p className="text-xs text-gray-500 font-sans mt-0.5">
            Key cards for prospectus download, fees, bus routes, toppers, notices, and CBSE disclosure ({highlights.length} total).
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="px-4 py-2 rounded-xl text-sm font-heading font-bold bg-[#B91C1C] text-white hover:bg-[#991b1b] transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Highlight</span>
        </button>
      </div>

      {highlights.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">No promotional highlights configured yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-heading font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Title & Description</th>
                  <th className="py-3.5 px-4">CTA & Target</th>
                  <th className="py-3.5 px-4">Photo</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Reorder</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {highlights.map((hl, idx) => (
                  <tr
                    key={hl.id}
                    className={`hover:bg-gray-50/60 transition-colors ${
                      !hl.isPublished ? "opacity-60 bg-gray-50/30" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-400">
                      {idx + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-heading font-bold text-gray-900 text-sm flex items-center gap-2">
                        <span>{hl.title}</span>
                        {hl.badge && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-heading font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                            {hl.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{hl.description}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-heading font-bold text-[#B91C1C]">
                        {hl.ctaLabel}
                      </div>
                      <div className="text-xs font-mono text-gray-500 truncate max-w-xs flex items-center gap-1 mt-0.5">
                        <span>{hl.ctaHref}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 text-gray-400" />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {hl.imageUrl ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <Image
                            src={hl.imageUrl}
                            alt={hl.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No image</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(hl)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          hl.isPublished
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {hl.isPublished ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-gray-500" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "UP")}
                          disabled={isPending || idx === 0}
                          title="Move up"
                          className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "DOWN")}
                          disabled={isPending || idx === highlights.length - 1}
                          title="Move down"
                          className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(hl)}
                          title="Edit highlight"
                          className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(hl)}
                          title="Delete highlight"
                          className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
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
        </div>
      )}

      {/* Form Dialog */}
      <HighlightFormDialog
        isOpen={isFormOpen}
        highlight={editingHighlight}
        onClose={() => setIsFormOpen(false)}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteHomepageDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Highlight"
        itemDescription={deleteTarget ? deleteTarget.title : ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
