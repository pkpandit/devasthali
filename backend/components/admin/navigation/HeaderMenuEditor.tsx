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
    <div className="admin-workspace">
      <div className="admin-section-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-workspace-toolbar__title">Header Primary Menu Items</h2>
            <p className="admin-workspace-toolbar__count">
              Top-level links, mega-menus, dropdown columns, and child links.
            </p>
          </div>
          <div className="admin-card-actions">
            <button
              type="button"
              onClick={handleAddItem}
              className="admin-button admin-button--primary"
            >
              <Plus size={16} />
              <span>Add Top-Level Menu Item</span>
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="admin-empty-state">
            <p style={{ margin: "0 0 12px" }}>No header navigation items defined.</p>
            <button
              type="button"
              onClick={handleAddItem}
              className="admin-button admin-button--primary"
            >
              <Plus size={16} />
              <span>Create First Item</span>
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {items.map((item, index) => {
              const maxCols = getMaxColumnsForPanelType(item.panelType);
              const canAddColumn = item.panelType !== "NONE" && item.columns.length < maxCols;

              return (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    background: "#ffffff",
                    overflow: "hidden",
                    opacity: item.isPublished ? 1 : 0.8,
                  }}
                >
                  {/* Top-Level Item Header Bar */}
                  <div
                    style={{
                      padding: "12px 16px",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      background: "#f9fafb",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                      {/* Order Steppers */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, "up")}
                          disabled={index === 0}
                          aria-label="Move item up"
                          className="admin-icon-button"
                          style={{ width: "24px", height: "24px", minWidth: "24px", minHeight: "24px", padding: 0 }}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(index, "down")}
                          disabled={index === items.length - 1}
                          aria-label="Move item down"
                          className="admin-icon-button"
                          style={{ width: "24px", height: "24px", minWidth: "24px", minHeight: "24px", padding: 0 }}
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "var(--heading-font)", fontWeight: 700, fontSize: "0.9375rem", color: "#111827" }}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "0.625rem", fontWeight: 700, padding: "1px 6px", background: "#b91c1c", color: "#ffffff", borderRadius: "9999px" }}>
                              <Sparkles size={10} />
                              {item.badge}
                            </span>
                          )}
                          <span
                            className="admin-pill"
                            style={{
                              background: item.panelType === "MEGA" ? "#f3e8ff" : item.panelType === "MEDIUM" ? "#dbeafe" : item.panelType === "COMPACT" ? "#dcfce7" : "#f3f4f6",
                              color: item.panelType === "MEGA" ? "#6b21a8" : item.panelType === "MEDIUM" ? "#1e40af" : item.panelType === "COMPACT" ? "#166534" : "#374151",
                            }}
                          >
                            {item.panelType}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "#6b7280", marginTop: "2px" }}>
                          <span style={{ fontFamily: "monospace" }}>{item.href}</span>
                          {item.openInNewTab && (
                            <span title="Opens in new tab">
                              <ExternalLink size={12} style={{ color: "#9ca3af" }} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                      {/* Toggle Published */}
                      <button
                        type="button"
                        onClick={() => handleToggleItemStatus(item)}
                        title={item.isPublished ? "Unpublish item" : "Publish item"}
                        className={`admin-pill ${item.isPublished ? "admin-pill--published" : "admin-pill--draft"}`}
                        style={{ cursor: "pointer", border: "none", minHeight: "28px" }}
                      >
                        {item.isPublished ? <Eye size={12} style={{ marginRight: "3px" }} /> : <EyeOff size={12} style={{ marginRight: "3px" }} />}
                        <span>{item.isPublished ? "Live" : "Draft"}</span>
                      </button>

                      {/* Add Column Button */}
                      {canAddColumn && (
                        <button
                          type="button"
                          onClick={() => handleAddColumn(item.id)}
                          className="admin-button admin-button--secondary"
                          style={{ minHeight: "32px", padding: "4px 10px", fontSize: "0.75rem" }}
                          title="Add dropdown column"
                        >
                          <Columns size={13} style={{ color: "#b91c1c" }} />
                          <span>Add Column</span>
                        </button>
                      )}

                      {/* Edit Item */}
                      <button
                        type="button"
                        onClick={() => handleEditItem(item)}
                        className="admin-icon-button"
                        style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px" }}
                        title="Edit item details"
                      >
                        <Pencil size={14} />
                      </button>

                      {/* Delete Item */}
                      <button
                        type="button"
                        onClick={() => promptDelete("ITEM", item.id, item.label)}
                        className="admin-icon-button"
                        style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px", color: "#dc2626" }}
                        title="Delete item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Subtree: Columns and Links */}
                  {item.panelType !== "NONE" && (
                    <div style={{ padding: "16px", background: "#ffffff" }}>
                      {item.columns.length === 0 ? (
                        <div style={{ padding: "16px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "8px", fontSize: "0.75rem", color: "#9ca3af" }}>
                          No columns added yet. Click &ldquo;Add Column&rdquo; above to group dropdown links.
                        </div>
                      ) : (
                        <div className="admin-form-grid-3">
                          {item.columns.map((column, cIdx) => (
                            <div
                              key={column.id}
                              style={{
                                padding: "14px",
                                borderRadius: "10px",
                                border: "1px solid var(--border)",
                                background: column.isPublished ? "#f9fafb" : "#f3f4f6",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                gap: "10px",
                              }}
                            >
                              {/* Column Header */}
                              <div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "8px", marginBottom: "8px", borderBottom: "1px solid var(--border)" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                                    <Columns size={14} style={{ color: "#6b7280", flexShrink: 0 }} />
                                    <span style={{ fontFamily: "var(--heading-font)", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#374151" }}>
                                      {column.heading || `Column ${cIdx + 1}`}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleColumnStatus(column)}
                                      title={column.isPublished ? "Unpublish column" : "Publish column"}
                                      className="admin-icon-button"
                                      style={{ width: "26px", height: "26px", minWidth: "26px", minHeight: "26px", padding: 0 }}
                                    >
                                      {column.isPublished ? <Eye size={12} style={{ color: "#059669" }} /> : <EyeOff size={12} style={{ color: "#9ca3af" }} />}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleEditColumn(column)}
                                      className="admin-icon-button"
                                      style={{ width: "26px", height: "26px", minWidth: "26px", minHeight: "26px", padding: 0 }}
                                      title="Edit column heading"
                                    >
                                      <Pencil size={12} />
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
                                      className="admin-icon-button"
                                      style={{ width: "26px", height: "26px", minWidth: "26px", minHeight: "26px", padding: 0, color: "#dc2626" }}
                                      title="Delete column"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>

                                {/* Links List inside Column */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px", minHeight: "40px" }}>
                                  {column.links.length === 0 ? (
                                    <p style={{ margin: 0, fontSize: "0.6875rem", color: "#9ca3af", fontStyle: "italic", textAlign: "center", padding: "8px 0" }}>
                                      No links in this column.
                                    </p>
                                  ) : (
                                    column.links.map((link) => (
                                      <div
                                        key={link.id}
                                        style={{
                                          padding: "8px 10px",
                                          borderRadius: "6px",
                                          border: "1px solid var(--border)",
                                          background: link.isPublished ? "#ffffff" : "#f3f4f6",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          gap: "8px",
                                        }}
                                      >
                                        <div style={{ minWidth: 0 }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, fontSize: "0.75rem", color: "#1f2937" }}>
                                            <ChevronRight size={12} style={{ color: "#9ca3af", flexShrink: 0 }} />
                                            <span>{link.label}</span>
                                            {link.badge && (
                                              <span style={{ fontSize: "0.5625rem", fontWeight: 700, padding: "1px 4px", background: "#b91c1c", color: "#ffffff", borderRadius: "9999px" }}>
                                                {link.badge}
                                              </span>
                                            )}
                                          </div>
                                          <span style={{ display: "block", fontSize: "0.625rem", color: "#9ca3af", fontFamily: "monospace", paddingLeft: "16px" }}>
                                            {link.href}
                                          </span>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
                                          <button
                                            type="button"
                                            onClick={() => handleToggleLinkStatus(link)}
                                            title={link.isPublished ? "Unpublish link" : "Publish link"}
                                            className="admin-icon-button"
                                            style={{ width: "24px", height: "24px", minWidth: "24px", minHeight: "24px", padding: 0 }}
                                          >
                                            {link.isPublished ? <Eye size={11} style={{ color: "#059669" }} /> : <EyeOff size={11} style={{ color: "#9ca3af" }} />}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleEditLink(link)}
                                            className="admin-icon-button"
                                            style={{ width: "24px", height: "24px", minWidth: "24px", minHeight: "24px", padding: 0 }}
                                            title="Edit link"
                                          >
                                            <Pencil size={11} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => promptDelete("LINK", link.id, link.label)}
                                            className="admin-icon-button"
                                            style={{ width: "24px", height: "24px", minWidth: "24px", minHeight: "24px", padding: 0, color: "#dc2626" }}
                                            title="Delete link"
                                          >
                                            <Trash2 size={11} />
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
                                className="admin-button admin-button--secondary"
                                style={{ width: "100%", minHeight: "32px", padding: "4px 8px", fontSize: "0.75rem", color: "#b91c1c" }}
                              >
                                <Plus size={13} />
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
      </div>

      {/* Item Dialog */}
      <ItemFormDialog
        isOpen={itemDialogOpen}
        location="HEADER_PRIMARY"
        initialItem={selectedItem}
        onClose={() => setItemDialogOpen(false)}
        onSuccess={onRefresh}
      />

      {/* Column Dialog */}
      <ColumnFormDialog
        isOpen={columnDialogOpen}
        itemId={selectedColumnItemId}
        initialColumn={selectedColumn}
        onClose={() => setColumnDialogOpen(false)}
        onSuccess={onRefresh}
      />

      {/* Link Dialog */}
      <LinkFormDialog
        isOpen={linkDialogOpen}
        columnId={selectedLinkColumnId}
        initialLink={selectedLink}
        onClose={() => setLinkDialogOpen(false)}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteNavigationDialog
        isOpen={deleteDialogOpen}
        targetType={deleteTarget?.type || "ITEM"}
        targetId={deleteTarget?.id || ""}
        targetLabel={deleteTarget?.label || ""}
        onClose={() => setDeleteDialogOpen(false)}
        onSuccess={onRefresh}
      />
    </div>
  );
}
