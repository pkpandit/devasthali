"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { TopperList } from "./TopperList";
import { TopperFormDialog, type SerializedTopper } from "./TopperFormDialog";
import { DeleteTopperDialog } from "./DeleteTopperDialog";
import {
  reorderToppersAction,
  toggleTopperStatusAction,
} from "@/lib/server/topper-actions";

interface TopperWorkspaceProps {
  toppers: SerializedTopper[];
}

export function TopperWorkspace({ toppers }: TopperWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTopper, setEditingTopper] = useState<SerializedTopper | null>(null);
  const [deletingTopper, setDeletingTopper] = useState<SerializedTopper | null>(null);

  const handleSuccess = () => {
    router.refresh();
  };

  const handleToggleStatus = (topper: SerializedTopper) => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const res = await toggleTopperStatusAction({
          id: topper.id,
          isPublished: !topper.isPublished,
        });
        if (res.success) {
          handleSuccess();
        } else {
          alert(res.error || "Failed to toggle topper status.");
        }
      } catch (err) {
        console.error("Toggle topper status error:", err);
        alert("Unexpected error updating topper status.");
      }
    });
  };

  const handleMove = (currentIndex: number, direction: "UP" | "DOWN") => {
    if (isPending) return;
    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= toppers.length) return;

    const reordered = [...toppers];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const orders = reordered.map((item, index) => ({
      id: item.id,
      displayOrder: index,
    }));

    startTransition(async () => {
      try {
        const res = await reorderToppersAction({ orders });
        if (res.success) {
          handleSuccess();
        } else {
          alert(res.error || "Failed to reorder toppers.");
        }
      } catch (err) {
        console.error("Reorder toppers error:", err);
        alert("Unexpected error reordering toppers.");
      }
    });
  };

  return (
    <div className="topper-workspace-wrapper">
      {/* Top Toolbar */}
      <div className="topper-workspace-toolbar">
        <div className="topper-workspace-toolbar__info">
          <h2 className="topper-workspace-toolbar__title">
            Merit Roster Management
          </h2>
          <p className="topper-workspace-toolbar__count">
            {toppers.length} merit {toppers.length === 1 ? "record" : "records"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="topper-button topper-button--primary topper-add-btn"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Add Topper</span>
        </button>
      </div>

      {/* Semantic Table Roster or Empty State */}
      <TopperList
        toppers={toppers}
        isPending={isPending}
        onAdd={() => setIsCreateOpen(true)}
        onEdit={(topper) => setEditingTopper(topper)}
        onDelete={(topper) => setDeletingTopper(topper)}
        onToggleStatus={handleToggleStatus}
        onMove={handleMove}
      />

      {/* Create / Edit Form Modal */}
      <TopperFormDialog
        isOpen={isCreateOpen || Boolean(editingTopper)}
        initialTopper={editingTopper}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingTopper(null);
        }}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Alert Dialog */}
      <DeleteTopperDialog
        isOpen={Boolean(deletingTopper)}
        topper={deletingTopper}
        onClose={() => setDeletingTopper(null)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
