"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  FolderPlus,
  Search,
  Filter,
  FileText,
} from "lucide-react";
import type { SerializedDownloadCategory } from "./DownloadCategoryDialog";
import type { SerializedDownloadDocument } from "./DownloadDocumentDialog";
import { DownloadCategoryCard } from "./DownloadCategoryCard";
import { DownloadCategoryDialog } from "./DownloadCategoryDialog";
import { DownloadDocumentDialog } from "./DownloadDocumentDialog";
import { DeleteDownloadDialog, type DeleteTarget } from "./DeleteDownloadDialog";
import {
  reorderDownloadCategoriesAction,
  reorderDownloadDocumentsAction,
  toggleDownloadCategoryStatusAction,
  toggleDownloadDocumentStatusAction,
} from "@/lib/server/download-actions";

export interface SerializedCategoryWithDocs extends SerializedDownloadCategory {
  documents: SerializedDownloadDocument[];
}

interface DownloadWorkspaceProps {
  categories: SerializedCategoryWithDocs[];
}

export function DownloadWorkspace({ categories }: DownloadWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  // Modal states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SerializedDownloadCategory | null>(null);

  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<SerializedDownloadDocument | null>(null);
  const [selectedCategoryIdForDoc, setSelectedCategoryIdForDoc] = useState<string>("");

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const handleSuccess = () => {
    router.refresh();
  };

  // Reordering categories
  const handleMoveCategory = (currentIndex: number, direction: "UP" | "DOWN") => {
    if (isPending) return;
    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((c) => c.id);

    startTransition(async () => {
      try {
        const res = await reorderDownloadCategoriesAction(null, { orderedIds });
        if (res.success) {
          handleSuccess();
        } else {
          alert(res.error || "Failed to reorder categories.");
        }
      } catch (err) {
        console.error("Reorder categories error:", err);
        alert("Unexpected error reordering categories.");
      }
    });
  };

  // Reordering documents within category
  const handleMoveDocument = (
    categoryId: string,
    currentIndex: number,
    direction: "UP" | "DOWN"
  ) => {
    if (isPending) return;
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;

    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= cat.documents.length) return;

    const reorderedDocs = [...cat.documents];
    const [moved] = reorderedDocs.splice(currentIndex, 1);
    reorderedDocs.splice(targetIndex, 0, moved);

    const orderedIds = reorderedDocs.map((d) => d.id);

    startTransition(async () => {
      try {
        const res = await reorderDownloadDocumentsAction(null, {
          categoryId,
          orderedIds,
        });
        if (res.success) {
          handleSuccess();
        } else {
          alert(res.error || "Failed to reorder documents.");
        }
      } catch (err) {
        console.error("Reorder documents error:", err);
        alert("Unexpected error reordering documents.");
      }
    });
  };

  // Category status toggle
  const handleToggleCategoryStatus = (cat: SerializedDownloadCategory) => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const res = await toggleDownloadCategoryStatusAction(null, {
          id: cat.id,
          isPublished: !cat.isPublished,
        });
        if (res.success) {
          handleSuccess();
        } else {
          alert(res.error || "Failed to toggle category status.");
        }
      } catch (err) {
        console.error("Toggle category error:", err);
        alert("Unexpected error toggling category status.");
      }
    });
  };

  // Document status toggle
  const handleToggleDocumentStatus = (doc: SerializedDownloadDocument) => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const res = await toggleDownloadDocumentStatusAction(null, {
          id: doc.id,
          isPublished: !doc.isPublished,
        });
        if (res.success) {
          handleSuccess();
        } else {
          alert(res.error || "Failed to toggle document status.");
        }
      } catch (err) {
        console.error("Toggle document error:", err);
        alert("Unexpected error toggling document status.");
      }
    });
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return categories
      .filter((cat) => {
        if (statusFilter === "PUBLISHED" && !cat.isPublished) return false;
        if (statusFilter === "DRAFT" && cat.isPublished) return false;
        return true;
      })
      .map((cat) => {
        if (!q) return cat;

        const catMatches =
          cat.title.toLowerCase().includes(q) ||
          (cat.description && cat.description.toLowerCase().includes(q));

        if (catMatches) return cat;

        const matchingDocs = cat.documents.filter(
          (doc) =>
            doc.title.toLowerCase().includes(q) ||
            (doc.description && doc.description.toLowerCase().includes(q))
        );

        return matchingDocs.length > 0 ? { ...cat, documents: matchingDocs } : null;
      })
      .filter((cat): cat is SerializedCategoryWithDocs => cat !== null);
  }, [categories, searchQuery, statusFilter]);

  const totalDocumentsCount = categories.reduce((sum, c) => sum + c.documents.length, 0);

  const categoryOptions = categories.map((c) => ({ id: c.id, title: c.title }));

  return (
    <div style={{ width: "100%" }}>
      {/* Workspace Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "16px 20px",
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>
            Downloads &amp; Public Records
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.8125rem", color: "#6b7280" }}>
            {categories.length} categories • {totalDocumentsCount} documents
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              setEditingCategory(null);
              setIsCategoryDialogOpen(true);
            }}
            disabled={isPending}
            className="admin-button admin-button--secondary"
          >
            <FolderPlus size={16} aria-hidden="true" />
            <span>New Category</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingDocument(null);
              setSelectedCategoryIdForDoc(categories[0]?.id || "");
              setIsDocumentDialogOpen(true);
            }}
            disabled={isPending || categories.length === 0}
            className="admin-button admin-button--primary"
          >
            <Plus size={16} aria-hidden="true" />
            <span>Add Document</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "260px" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "380px" }}>
            <Search
              size={16}
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories and documents..."
              className="admin-input"
              style={{ paddingLeft: "36px" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={16} color="#6b7280" aria-hidden="true" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "PUBLISHED" | "DRAFT")}
            className="admin-select"
            style={{ width: "auto", minWidth: "140px" }}
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="DRAFT">Draft Only</option>
          </select>
        </div>
      </div>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="admin-empty-state">
          <FileText size={32} color="#9ca3af" aria-hidden="true" />
          <h3 style={{ margin: 0, fontWeight: 700, color: "#111827" }}>No categories or documents found</h3>
          <p style={{ margin: 0 }}>
            {searchQuery
              ? `No results matching "${searchQuery}". Try a different keyword.`
              : "Get started by creating a new category."}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                setIsCategoryDialogOpen(true);
              }}
              className="admin-button admin-button--primary"
              style={{ marginTop: "12px" }}
            >
              <FolderPlus size={16} aria-hidden="true" />
              <span>Create First Category</span>
            </button>
          )}
        </div>
      ) : (
        <div>
          {filteredCategories.map((cat, idx) => (
            <DownloadCategoryCard
              key={cat.id}
              category={cat}
              categoryIndex={idx}
              totalCategories={filteredCategories.length}
              isPending={isPending}
              onEditCategory={(c) => {
                setEditingCategory(c);
                setIsCategoryDialogOpen(true);
              }}
              onDeleteCategory={(c) => {
                setDeleteTarget({ type: "category", id: c.id, title: c.title });
              }}
              onToggleCategoryStatus={handleToggleCategoryStatus}
              onMoveCategory={handleMoveCategory}
              onAddDocument={(catId) => {
                setEditingDocument(null);
                setSelectedCategoryIdForDoc(catId);
                setIsDocumentDialogOpen(true);
              }}
              onEditDocument={(doc) => {
                setEditingDocument(doc);
                setIsDocumentDialogOpen(true);
              }}
              onDeleteDocument={(doc) => {
                setDeleteTarget({ type: "document", id: doc.id, title: doc.title });
              }}
              onToggleDocumentStatus={handleToggleDocumentStatus}
              onMoveDocument={handleMoveDocument}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <DownloadCategoryDialog
        isOpen={isCategoryDialogOpen}
        category={editingCategory}
        onClose={() => {
          setIsCategoryDialogOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={handleSuccess}
      />

      <DownloadDocumentDialog
        isOpen={isDocumentDialogOpen}
        categories={categoryOptions}
        defaultCategoryId={selectedCategoryIdForDoc}
        document={editingDocument}
        onClose={() => {
          setIsDocumentDialogOpen(false);
          setEditingDocument(null);
        }}
        onSuccess={handleSuccess}
      />

      <DeleteDownloadDialog
        isOpen={Boolean(deleteTarget)}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
