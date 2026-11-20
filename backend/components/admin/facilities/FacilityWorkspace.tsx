"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  FolderPlus,
  Search,
  Filter,
  Building,
} from "lucide-react";
import type { SerializedFacilityCategory } from "./FacilityCategoryDialog";
import type { SerializedFacilityItem } from "./FacilityItemDialog";
import {
  FacilityCategoryCard,
  type SerializedCategoryWithItems,
} from "./FacilityCategoryCard";
import { FacilityCategoryDialog } from "./FacilityCategoryDialog";
import { FacilityItemDialog } from "./FacilityItemDialog";
import {
  DeleteFacilityDialog,
  type DeleteFacilityTarget,
} from "./DeleteFacilityDialog";
import {
  reorderFacilityCategoriesAction,
  reorderFacilityItemsAction,
  toggleFacilityCategoryStatusAction,
  toggleFacilityItemStatusAction,
} from "@/lib/server/facility-actions";

interface FacilityWorkspaceProps {
  categories: SerializedCategoryWithItems[];
}

export function FacilityWorkspace({ categories }: FacilityWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Modal states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SerializedFacilityCategory | null>(null);

  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SerializedFacilityItem | null>(null);
  const [selectedCategoryIdForItem, setSelectedCategoryIdForItem] = useState<string>("");

  const [deleteTarget, setDeleteTarget] = useState<DeleteFacilityTarget | null>(null);

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

    const orders = reordered.map((c, idx) => ({ id: c.id, displayOrder: idx }));

    startTransition(async () => {
      try {
        const res = await reorderFacilityCategoriesAction({ orders });
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

  // Reordering items within category
  const handleMoveItem = (
    categoryId: string,
    currentIndex: number,
    direction: "UP" | "DOWN"
  ) => {
    if (isPending) return;
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;

    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= cat.items.length) return;

    const reorderedItems = [...cat.items];
    const [moved] = reorderedItems.splice(currentIndex, 1);
    reorderedItems.splice(targetIndex, 0, moved);

    const orders = reorderedItems.map((item, idx) => ({ id: item.id, displayOrder: idx }));

    startTransition(async () => {
      try {
        const res = await reorderFacilityItemsAction({
          categoryId,
          orders,
        });
        if (res.success) {
          handleSuccess();
        } else {
          alert(res.error || "Failed to reorder facility items.");
        }
      } catch (err) {
        console.error("Reorder facility items error:", err);
        alert("Unexpected error reordering facility items.");
      }
    });
  };

  // Category status toggle
  const handleToggleCategoryStatus = (cat: SerializedFacilityCategory) => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const res = await toggleFacilityCategoryStatusAction({
          id: cat.id,
          isPublished: !cat.isPublished,
        });
        if (res.success) {
          handleSuccess();
        } else {
          alert(res.error || "Failed to update category status.");
        }
      } catch (err) {
        console.error("Toggle category status error:", err);
        alert("Unexpected error updating category status.");
      }
    });
  };

  // Facility item status toggle
  const handleToggleItemStatus = (item: SerializedFacilityItem) => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const res = await toggleFacilityItemStatusAction({
          id: item.id,
          isPublished: !item.isPublished,
        });
        if (res.success) {
          handleSuccess();
        } else {
          alert(res.error || "Failed to update facility item status.");
        }
      } catch (err) {
        console.error("Toggle facility item status error:", err);
        alert("Unexpected error updating facility status.");
      }
    });
  };

  // Filter and search
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return categories
      .filter((cat) => {
        if (categoryFilter !== "ALL" && cat.id !== categoryFilter) {
          return false;
        }

        if (statusFilter === "PUBLISHED" && !cat.isPublished) return false;
        if (statusFilter === "DRAFT" && cat.isPublished) return false;

        return true;
      })
      .map((cat) => {
        if (!q) return cat;

        const categoryMatches =
          cat.title.toLowerCase().includes(q) ||
          (cat.description && cat.description.toLowerCase().includes(q));

        if (categoryMatches) {
          return cat;
        }

        const matchingItems = cat.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.highlights.some((h) => h.toLowerCase().includes(q))
        );

        return {
          ...cat,
          items: matchingItems,
        };
      })
      .filter((cat) => {
        if (!q) return true;
        const categoryMatches =
          cat.title.toLowerCase().includes(q) ||
          (cat.description && cat.description.toLowerCase().includes(q));
        return categoryMatches || cat.items.length > 0;
      });
  }, [categories, searchQuery, statusFilter, categoryFilter]);

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      displayOrder: c.displayOrder,
      isPublished: c.isPublished,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }, [categories]);

  return (
    <div className="admin-workspace-inner" style={{ display: "flex", flexDirection: "column", maxWidth: "100%" }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>
            Campus Infrastructure & Facilities
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
            Manage campus categories, academic laboratories, residential hostels, athletic complex, and transport network.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={() => {
              setEditingCategory(null);
              setIsCategoryDialogOpen(true);
            }}
            disabled={isPending}
            className="admin-button admin-button--secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <FolderPlus size={16} aria-hidden="true" />
            <span>New Category</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setSelectedCategoryIdForItem(categories[0]?.id || "");
              setIsItemDialogOpen(true);
            }}
            disabled={isPending || categories.length === 0}
            className="admin-button admin-button--primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            title={categories.length === 0 ? "Create a category first" : "Add a new facility item"}
          >
            <Plus size={16} aria-hidden="true" />
            <span>Add Facility</span>
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
          backgroundColor: "#f8fafc",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "160px", maxWidth: "100%" }}>
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
              placeholder="Search facilities, labs, descriptions, highlights..."
              className="admin-input"
              style={{ paddingLeft: "36px" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", maxWidth: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={16} color="#6b7280" aria-hidden="true" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="admin-select"
              style={{ width: "auto", minWidth: "110px", maxWidth: "100%" }}
              aria-label="Filter by category"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | "PUBLISHED" | "DRAFT")}
              className="admin-select"
              style={{ width: "auto", minWidth: "100px", maxWidth: "100%" }}
              aria-label="Filter by publish status"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Draft Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories & Items List */}
      {filteredCategories.length === 0 ? (
        <div className="admin-empty-state">
          <Building size={32} color="#9ca3af" aria-hidden="true" />
          <h3 style={{ margin: 0, fontWeight: 700, color: "#111827" }}>No facilities or categories found</h3>
          <p style={{ margin: 0 }}>
            {searchQuery
              ? `No results matching "${searchQuery}". Try a different search term or reset filters.`
              : "Get started by creating a facility category or adding a facility."}
          </p>
          {!searchQuery && categories.length === 0 && (
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
            <FacilityCategoryCard
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
                setDeleteTarget({
                  type: "category",
                  id: c.id,
                  title: c.title,
                  itemCount: c.items.length,
                });
              }}
              onToggleCategoryStatus={handleToggleCategoryStatus}
              onMoveCategory={handleMoveCategory}
              onAddItem={(catId) => {
                setEditingItem(null);
                setSelectedCategoryIdForItem(catId);
                setIsItemDialogOpen(true);
              }}
              onEditItem={(item) => {
                setEditingItem(item);
                setIsItemDialogOpen(true);
              }}
              onDeleteItem={(item) => {
                setDeleteTarget({ type: "item", id: item.id, title: item.title });
              }}
              onToggleItemStatus={handleToggleItemStatus}
              onMoveItem={handleMoveItem}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <FacilityCategoryDialog
        isOpen={isCategoryDialogOpen}
        category={editingCategory}
        onClose={() => {
          setIsCategoryDialogOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={handleSuccess}
      />

      <FacilityItemDialog
        isOpen={isItemDialogOpen}
        categories={categoryOptions}
        defaultCategoryId={selectedCategoryIdForItem}
        item={editingItem}
        onClose={() => {
          setIsItemDialogOpen(false);
          setEditingItem(null);
        }}
        onSuccess={handleSuccess}
      />

      <DeleteFacilityDialog
        isOpen={Boolean(deleteTarget)}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
