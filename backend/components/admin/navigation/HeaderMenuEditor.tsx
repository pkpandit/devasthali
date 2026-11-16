"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Columns,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  toggleNavigationItemStatusAction,
  toggleNavigationColumnStatusAction,
  toggleNavigationLinkStatusAction,
  reorderNavigationItemsAction,
} from "@/lib/server/navigation-actions";
import { ItemFormDialog, type SerializedNavigationItem } from "./ItemFormDialog";
import { ColumnFormDialog, type SerializedNavigationColumn } from "./ColumnFormDialog";
import { LinkFormDialog, type SerializedNavigationLink } from "./LinkFormDialog";
import { DeleteNavigationDialog, type NavigationTargetType } from "./DeleteNavigationDialog";
import { getMaxColumnsForPanelType } from "@/lib/validation/navigation";

export type FullNavigationLink = SerializedNavigationLink;

export interface FullNavigationColumn extends SerializedNavigationColumn {
  links: FullNavigationLink[];
}

export interface FullNavigationItem extends SerializedNavigationItem {
  columns: FullNavigationColumn[];
}

interface HeaderMenuEditorProps {
  items: FullNavigationItem[];
  onRefresh: () => void;
}

export function HeaderMenuEditor({ items, onRefresh }: HeaderMenuEditorProps) {
  const [, startTransition] = useTransition();

  // Dialog states
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SerializedNavigationItem | null>(null);

  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [selectedColumnItemId, setSelectedColumnItemId] = useState<string>("");
  const [selectedColumn, setSelectedColumn] = useState<SerializedNavigationColumn | null>(null);

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedLinkColumnId, setSelectedLinkColumnId] = useState<string>("");
  const [selectedLink, setSelectedLink] = useState<SerializedNavigationLink | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: NavigationTargetType;
    id: string;
    label: string;
  } | null>(null);

  // Item handlers
  const handleAddItem = () => {
    setSelectedItem(null);
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: FullNavigationItem) => {
    setSelectedItem(item);
    setItemDialogOpen(true);
  };

  const handleToggleItemStatus = (item: FullNavigationItem) => {
    startTransition(async () => {
      await toggleNavigationItemStatusAction(null, {
        id: item.id,
        isPublished: !item.isPublished,
      });
      onRefresh();
    });
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);

    startTransition(async () => {
      await reorderNavigationItemsAction(null, {
        location: "HEADER_PRIMARY",
        itemIds: newItems.map((i) => i.id),
      });
      onRefresh();
    });
  };

  // Column handlers
  const handleAddColumn = (itemId: string) => {
    setSelectedColumnItemId(itemId);
    setSelectedColumn(null);
    setColumnDialogOpen(true);
  };

  const handleEditColumn = (col: FullNavigationColumn) => {
    setSelectedColumnItemId(col.itemId);
    setSelectedColumn(col);
    setColumnDialogOpen(true);
  };

  const handleToggleColumnStatus = (col: FullNavigationColumn) => {
    startTransition(async () => {
      await toggleNavigationColumnStatusAction(null, {
        id: col.id,
        isPublished: !col.isPublished,
      });
      onRefresh();
    });
  };

  // Link handlers
  const handleAddLink = (columnId: string) => {
    setSelectedLinkColumnId(columnId);
    setSelectedLink(null);
    setLinkDialogOpen(true);
  };

  const handleEditLink = (link: FullNavigationLink) => {
    setSelectedLinkColumnId(link.columnId);
    setSelectedLink(link);
    setLinkDialogOpen(true);
  };

  const handleToggleLinkStatus = (link: FullNavigationLink) => {
    startTransition(async () => {
      await toggleNavigationLinkStatusAction(null, {
        id: link.id,
        isPublished: !link.isPublished,
      });
      onRefresh();
    });
  };

  // Delete handler
  const promptDelete = (type: NavigationTargetType, id: string, label: string) => {
    setDeleteTarget({ type, id, label });
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">Header Primary Menu Items</h2>
          <p className="text-xs text-gray-500">
            Top-level links, mega-menus, dropdown columns, and child links.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Top-Level Menu Item</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-500 mb-3">No header navigation items defined.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B91C1C] text-white text-xs font-semibold rounded-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Item</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => {
            const maxCols = getMaxColumnsForPanelType(item.panelType);
            const canAddColumn = item.panelType !== "NONE" && item.columns.length < maxCols;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all ${
                  item.isPublished
                    ? "border-gray-200 shadow-xs hover:border-gray-300"
                    : "border-gray-200 bg-gray-50/60 opacity-80"
                }`}
              >
                {/* Top-Level Item Header Bar */}
                <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-gray-50/80 rounded-t-2xl border-b border-gray-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Order Steppers */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveItem(index, "up")}
                        disabled={index === 0}
                        aria-label="Move item up"
                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveItem(index, "down")}
                        disabled={index === items.length - 1}
                        aria-label="Move item down"
                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-gray-900">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[#B91C1C] text-white rounded-full">
                            <Sparkles className="w-2.5 h-2.5" />
                            {item.badge}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            item.panelType === "MEGA"
                              ? "bg-purple-100 text-purple-800"
                              : item.panelType === "MEDIUM"
                              ? "bg-blue-100 text-blue-800"
                              : item.panelType === "COMPACT"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.panelType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="font-mono text-gray-600 truncate max-w-xs">{item.href}</span>
                        {item.openInNewTab && (
                          <span title="Opens in new tab">
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Toggle Published */}
                    <button
                      type="button"
                      onClick={() => handleToggleItemStatus(item)}
                      title={item.isPublished ? "Unpublish item" : "Publish item"}
                      className={`p-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1 transition-colors ${
                        item.isPublished
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      {item.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{item.isPublished ? "Live" : "Draft"}</span>
                    </button>

                    {/* Add Column Button */}
                    {canAddColumn && (
                      <button
                        type="button"
                        onClick={() => handleAddColumn(item.id)}
                        className="p-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg inline-flex items-center gap-1 transition-colors"
                        title="Add dropdown column"
                      >
                        <Columns className="w-3.5 h-3.5 text-[#B91C1C]" />
                        <span className="hidden sm:inline">Add Column</span>
                      </button>
                    )}

                    {/* Edit Item */}
                    <button
                      type="button"
                      onClick={() => handleEditItem(item)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 rounded-lg transition-colors"
                      title="Edit item details"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Item */}
                    <button
                      type="button"
                      onClick={() => promptDelete("ITEM", item.id, item.label)}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtree: Columns and Links */}
                {item.panelType !== "NONE" && (
                  <div className="p-4 bg-white rounded-b-2xl">
                    {item.columns.length === 0 ? (
                      <div className="p-4 text-center border border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
                        No columns added yet. Click &ldquo;Add Column&rdquo; above to group dropdown links.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {item.columns.map((column, cIdx) => (
                          <div
                            key={column.id}
                            className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                              column.isPublished
                                ? "bg-[#F9FAFB] border-gray-200"
                                : "bg-gray-100/60 border-gray-200 opacity-75"
                            }`}
                          >
                            {/* Column Header */}
                            <div>
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200/80">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <Columns className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span className="font-heading font-bold text-xs uppercase tracking-wider text-gray-700 truncate">
                                    {column.heading || `Column ${cIdx + 1}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleColumnStatus(column)}
                                    title={column.isPublished ? "Unpublish column" : "Publish column"}
                                    className={`p-1 rounded text-[11px] ${
                                      column.isPublished ? "text-emerald-700" : "text-amber-700"
                                    }`}
                                  >
                                    {column.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleEditColumn(column)}
                                    className="p-1 text-gray-500 hover:text-gray-800 rounded"
                                    title="Edit column heading"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      promptDelete(
                                        "COLUMN",
                                        column.id,
                                        column.heading || `Column ${cIdx + 1}`
                                      )
                                    }
                                    className="p-1 text-red-500 hover:text-red-700 rounded"
                                    title="Delete column"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Links List inside Column */}
                              <div className="space-y-1.5 min-h-[48px]">
                                {column.links.length === 0 ? (
                                  <p className="text-[11px] text-gray-400 italic py-2 text-center">
                                    No links in this column.
                                  </p>
                                ) : (
                                  column.links.map((link) => (
                                    <div
                                      key={link.id}
                                      className={`p-2 rounded-lg text-xs flex items-center justify-between gap-2 border ${
                                        link.isPublished
                                          ? "bg-white border-gray-200/90 shadow-2xs"
                                          : "bg-gray-50 border-gray-200 opacity-70"
                                      }`}
                                    >
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 font-medium text-gray-800">
                                          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                                          <span className="truncate">{link.label}</span>
                                          {link.badge && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#B91C1C] text-white rounded-full shrink-0">
                                              {link.badge}
                                            </span>
                                          )}
                                        </div>
                                        <span className="block text-[10px] text-gray-400 font-mono pl-4 truncate">
                                          {link.href}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => handleToggleLinkStatus(link)}
                                          title={link.isPublished ? "Unpublish link" : "Publish link"}
                                          className={`p-1 rounded ${
                                            link.isPublished ? "text-emerald-700" : "text-amber-700"
                                          }`}
                                        >
                                          {link.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleEditLink(link)}
                                          className="p-1 text-gray-500 hover:text-gray-800"
                                          title="Edit link"
                                        >
                                          <Pencil className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => promptDelete("LINK", link.id, link.label)}
                                          className="p-1 text-red-500 hover:text-red-700"
                                          title="Delete link"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Add Link Button inside Column */}
                            <button
                              type="button"
                              onClick={() => handleAddLink(column.id)}
                              className="mt-3 w-full py-1.5 px-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-[#B91C1C] inline-flex items-center justify-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Link</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <ItemFormDialog
        isOpen={itemDialogOpen}
        location="HEADER_PRIMARY"
        initialItem={selectedItem}
        onClose={() => setItemDialogOpen(false)}
        onSuccess={onRefresh}
      />

      <ColumnFormDialog
        isOpen={columnDialogOpen}
        itemId={selectedColumnItemId}
        initialColumn={selectedColumn}
        onClose={() => setColumnDialogOpen(false)}
        onSuccess={onRefresh}
      />

      <LinkFormDialog
        isOpen={linkDialogOpen}
        columnId={selectedLinkColumnId}
        initialLink={selectedLink}
        onClose={() => setLinkDialogOpen(false)}
        onSuccess={onRefresh}
      />

      {deleteTarget && (
        <DeleteNavigationDialog
          isOpen={deleteDialogOpen}
          targetType={deleteTarget.type}
          targetId={deleteTarget.id}
          targetLabel={deleteTarget.label}
          onClose={() => {
            setDeleteDialogOpen(false);
            setDeleteTarget(null);
          }}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
