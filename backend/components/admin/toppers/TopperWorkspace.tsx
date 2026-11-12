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
    <div className="topper-workspace-wrapper space-y-6">
      {/* Top Toolbar */}
      <div className="topper-workspace-toolbar flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Merit Roster Management
          </h2>
          <p className="text-xs text-slate-500">
            {toppers.length} published merit {toppers.length === 1 ? "record" : "records"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="topper-button topper-button--primary inline-flex items-center gap-1.5"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Add Topper</span>
        </button>
      </div>

      {/* Roster List or Empty State */}
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
