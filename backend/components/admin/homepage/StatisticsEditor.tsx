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
  BarChart3,
} from "lucide-react";
import {
  toggleHomepageStatisticStatusAction,
  deleteHomepageStatisticAction,
  reorderHomepageStatisticsAction,
} from "@/lib/server/homepage-actions";
import {
  StatisticFormDialog,
  type SerializedStatistic,
} from "./StatisticFormDialog";
import { DeleteHomepageDialog } from "./DeleteHomepageDialog";

interface StatisticsEditorProps {
  statistics: SerializedStatistic[];
  onRefresh: () => void;
}

export function StatisticsEditor({ statistics, onRefresh }: StatisticsEditorProps) {
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<SerializedStatistic | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<SerializedStatistic | null>(null);

  const handleCreate = () => {
    setEditingStat(null);
    setIsFormOpen(true);
  };

  const handleEdit = (stat: SerializedStatistic) => {
    setEditingStat(stat);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (stat: SerializedStatistic) => {
    startTransition(async () => {
      await toggleHomepageStatisticStatusAction(null, {
        id: stat.id,
        isPublished: !stat.isPublished,
      });
      onRefresh();
    });
  };

  const handleMove = (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= statistics.length) return;

    const reordered = [...statistics];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const payload = reordered.map((item, idx) => ({
      id: item.id,
      displayOrder: idx,
    }));

    startTransition(async () => {
      await reorderHomepageStatisticsAction(null, { statistics: payload });
      onRefresh();
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteHomepageStatisticAction(null, { id: deleteTarget.id });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-heading font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#B91C1C]" />
            <span>Key Statistics & Trust Metrics</span>
          </h2>
          <p className="text-xs text-gray-500 font-sans mt-0.5">
            Institutional milestones, student-teacher ratio, and heritage numbers ({statistics.length} total).
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="px-4 py-2 rounded-xl text-sm font-heading font-bold bg-[#B91C1C] text-white hover:bg-[#991b1b] transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Statistic</span>
        </button>
      </div>

      {statistics.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">No statistics configured yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-heading font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Metric & Value</th>
                  <th className="py-3.5 px-4">Subtext & Badge</th>
                  <th className="py-3.5 px-4">Photo</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Reorder</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {statistics.map((stat, idx) => (
                  <tr
                    key={stat.id}
                    className={`hover:bg-gray-50/60 transition-colors ${
                      !stat.isPublished ? "opacity-60 bg-gray-50/30" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-gray-400">
                      {idx + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-heading font-bold text-gray-900 text-base">
                        {stat.numericValue} {stat.suffix && <span className="text-xs font-normal text-gray-500">{stat.suffix}</span>}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs text-gray-600">{stat.subtext || "—"}</div>
                      {stat.badge && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-heading font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                          {stat.badge}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {stat.imageUrl ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <Image
                            src={stat.imageUrl}
                            alt={stat.label}
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
                        onClick={() => handleToggleStatus(stat)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          stat.isPublished
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {stat.isPublished ? (
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
                          disabled={isPending || idx === statistics.length - 1}
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
                          onClick={() => handleEdit(stat)}
                          title="Edit statistic"
                          className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(stat)}
                          title="Delete statistic"
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
      <StatisticFormDialog
        isOpen={isFormOpen}
        statistic={editingStat}
        onClose={() => setIsFormOpen(false)}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteHomepageDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Statistic"
        itemDescription={deleteTarget ? `${deleteTarget.label} (${deleteTarget.numericValue})` : ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
