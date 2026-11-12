"use client";

import { Award, GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import type { SerializedTopper } from "./TopperFormDialog";

interface TopperListProps {
  toppers: SerializedTopper[];
  onAdd?: () => void;
  onEdit?: (topper: SerializedTopper) => void;
  onDelete?: (topper: SerializedTopper) => void;
}

/**
 * List view for Board Examination Toppers and Merit Records.
 * Displays published records grouped by academic year.
 * Exposes accessible Edit and Delete actions for authorized administrators.
 */
export function TopperList({
  toppers,
  onAdd,
  onEdit,
  onDelete,
}: TopperListProps) {
  if (!toppers || toppers.length === 0) {
    return (
      <EmptyState
        title="No Academic Toppers Published"
        description="There are currently no board examination toppers or merit records published."
        icon={GraduationCap}
      >
        {onAdd && (
          <div className="pt-4">
            <button
              type="button"
              onClick={onAdd}
              className="topper-button topper-button--primary inline-flex items-center gap-1.5"
            >
              <Plus size={16} aria-hidden="true" />
              <span>Add First Topper</span>
            </button>
          </div>
        )}
      </EmptyState>
    );
  }

  // Group toppers by Academic Year
  const groupedByYear = toppers.reduce<Record<string, SerializedTopper[]>>(
    (acc, topper) => {
      const year = topper.academicYear;
      if (!acc[year]) acc[year] = [];
      acc[year].push(topper);
      return acc;
    },
    {}
  );

  const years = Object.keys(groupedByYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="toppers-container space-y-6">
      {years.map((year) => {
        const yearToppers = groupedByYear[year];
        return (
          <section key={year} className="topper-year-group space-y-4">
            <div className="topper-year-header flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-bold text-slate-800">
                Academic Session {year}
              </h2>
              <Badge variant="subtle">{yearToppers.length} Records</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {yearToppers.map((topper) => (
                <div
                  key={topper.id}
                  className="topper-card p-4 rounded-lg border border-slate-200 bg-white shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {topper.studentName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {topper.grade}
                        {topper.stream ? ` • ${topper.stream}` : ""}
                      </p>
                    </div>
                    <Badge variant="default" className="text-xs">
                      {Number(topper.scorePercent).toFixed(2)}%
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">
                    {topper.achievement}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-2 text-[11px] text-slate-400 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Award size={13} aria-hidden="true" />
                      <span>Order: {topper.displayOrder}</span>
                      {topper.isFeatured && (
                        <span className="text-amber-600 font-semibold">• Featured</span>
                      )}
                    </div>

                    {(onEdit || onDelete) && (
                      <div className="topper-card-actions flex items-center gap-1">
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(topper)}
                            className="topper-icon-button"
                            aria-label={`Edit merit record for ${topper.studentName}`}
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(topper)}
                            className="topper-icon-button topper-icon-button--danger"
                            aria-label={`Delete merit record for ${topper.studentName}`}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
