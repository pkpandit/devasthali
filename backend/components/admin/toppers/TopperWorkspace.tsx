"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { TopperList } from "./TopperList";
import { TopperFormDialog, type SerializedTopper } from "./TopperFormDialog";
import { DeleteTopperDialog } from "./DeleteTopperDialog";

interface TopperWorkspaceProps {
  toppers: SerializedTopper[];
}

export function TopperWorkspace({ toppers }: TopperWorkspaceProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTopper, setEditingTopper] = useState<SerializedTopper | null>(null);
  const [deletingTopper, setDeletingTopper] = useState<SerializedTopper | null>(null);

  const handleSuccess = () => {
    router.refresh();
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
            {toppers.length} published merit {toppers.length === 1 ? "record" : "records"}
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
        onAdd={() => setIsCreateOpen(true)}
        onEdit={(topper) => setEditingTopper(topper)}
        onDelete={(topper) => setDeletingTopper(topper)}
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
