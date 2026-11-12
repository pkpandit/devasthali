import { Award, GraduationCap } from "lucide-react";
import type { BoardResultTopper } from "@prisma/client";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

interface TopperListProps {
  toppers: BoardResultTopper[];
}

/**
 * Read-only list view for Board Examination Toppers and Merit Records.
 * Displays published records grouped by academic year and grade.
 * Strictly read-only: does not expose Create, Edit, or Delete controls.
 */
export function TopperList({ toppers }: TopperListProps) {
  if (!toppers || toppers.length === 0) {
    return (
      <EmptyState
        title="No Academic Toppers Published"
        description="There are currently no board examination toppers or merit records published. Record creation will be enabled in a future increment."
        icon={GraduationCap}
      />
    );
  }

  // Group toppers by Academic Year
  const groupedByYear = toppers.reduce<Record<string, BoardResultTopper[]>>(
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
                  className="topper-card p-4 rounded-lg border border-slate-200 bg-white shadow-sm space-y-2"
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

                  <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400 border-t border-slate-100">
                    <Award size={13} aria-hidden="true" />
                    <span>Display Order: {topper.displayOrder}</span>
                    {topper.isFeatured && (
                      <span className="text-amber-600 font-semibold">• Featured</span>
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
