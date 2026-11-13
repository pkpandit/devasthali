"use client";

import { GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import type { SerializedTopper } from "./TopperFormDialog";

interface TopperListProps {
  toppers: SerializedTopper[];
  onAdd?: () => void;
  onEdit?: (topper: SerializedTopper) => void;
  onDelete?: (topper: SerializedTopper) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Table-first record listing for Board Examination Toppers and Merit Records.
 * Implements accessible semantic markup (table, thead, tbody, th scope="col", sr-only caption)
 * and responsive horizontal-scrolling table container.
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

  return (
    <div className="admin-table-container">
      <table className="admin-table" aria-label="Academic Toppers Merit Roster">
        <caption className="sr-only">
          CBSE Board Examination Merit Records and Academic Toppers Roster
        </caption>
        <thead>
          <tr>
            <th scope="col" className="admin-table__photo-col">Photo</th>
            <th scope="col" className="admin-table__name-col">Student Name</th>
            <th scope="col" className="admin-table__score-col">Score (%)</th>
            <th scope="col" className="admin-table__class-col">Class</th>
            <th scope="col" className="admin-table__stream-col">Stream</th>
            <th scope="col" className="admin-table__session-col">Session</th>
            <th scope="col" className="admin-table__citation-col">Achievement / Merit Citation</th>
            <th scope="col" className="admin-table__order-col">Order</th>
            <th scope="col" className="admin-table__featured-col">Featured</th>
            <th scope="col" className="admin-table__actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {toppers.map((topper) => {
            const hasPhoto = Boolean(topper.photoUrl && topper.photoUrl.trim() !== "");
            const scoreDisplay = `${Number(topper.scorePercent).toFixed(2)}%`;

            return (
              <tr key={topper.id}>
                <td className="admin-table__photo-col">
                  {hasPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={topper.photoUrl!}
                      alt={`Photo of ${topper.studentName}`}
                      className="topper-table-photo"
                    />
                  ) : (
                    <div
                      className="topper-table-initials"
                      aria-label={`Initials for ${topper.studentName}`}
                    >
                      {getInitials(topper.studentName)}
                    </div>
                  )}
                </td>
                <td className="admin-table__name-col">
                  <span className="admin-table__name-text">{topper.studentName}</span>
                </td>
                <td className="admin-table__score-col">
                  <span className="admin-table__score-value">{scoreDisplay}</span>
                </td>
                <td className="admin-table__class-col">
                  <Badge variant="subtle">{topper.grade}</Badge>
                </td>
                <td className="admin-table__stream-col">
                  {topper.stream ? (
                    <span className="admin-table__stream-text">{topper.stream}</span>
                  ) : (
                    <span className="admin-table__empty-dash">—</span>
                  )}
                </td>
                <td className="admin-table__session-col">
                  <span className="admin-table__session-text">{topper.academicYear}</span>
                </td>
                <td className="admin-table__citation-col">
                  <span className="admin-table__citation-text">{topper.achievement}</span>
                </td>
                <td className="admin-table__order-col">
                  <span className="admin-table__order-text">{topper.displayOrder}</span>
                </td>
                <td className="admin-table__featured-col">
                  {topper.isFeatured ? (
                    <span className="admin-pill admin-pill--featured">Featured</span>
                  ) : (
                    <span className="admin-pill admin-pill--standard">No</span>
                  )}
                </td>
                <td className="admin-table__actions-col">
                  <div className="topper-card-actions">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(topper)}
                        className="topper-icon-button"
                        aria-label={`Edit merit record for ${topper.studentName}`}
                        title="Edit record"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(topper)}
                        className="topper-icon-button topper-icon-button--danger"
                        aria-label={`Delete merit record for ${topper.studentName}`}
                        title="Delete record"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
