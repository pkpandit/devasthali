"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  GraduationCap,
  Users,
} from "lucide-react";
import {
  toggleNavigationItemStatusAction,
  reorderNavigationItemsAction,
} from "@/lib/server/navigation-actions";
import { ItemFormDialog, type SerializedNavigationItem } from "./ItemFormDialog";
import { DeleteNavigationDialog } from "./DeleteNavigationDialog";

interface FooterMenuEditorProps {
  admissionsLinks: SerializedNavigationItem[];
  communityLinks: SerializedNavigationItem[];
  onRefresh: () => void;
}

export function FooterMenuEditor({
  admissionsLinks,
  communityLinks,
  onRefresh,
}: FooterMenuEditorProps) {
  const [, startTransition] = useTransition();

  const [activeLocation, setActiveLocation] = useState<"FOOTER_ADMISSIONS" | "FOOTER_COMMUNITY">("FOOTER_ADMISSIONS");
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SerializedNavigationItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  const currentLinks = activeLocation === "FOOTER_ADMISSIONS" ? admissionsLinks : communityLinks;

  const handleAddItem = () => {
    setSelectedItem(null);
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: SerializedNavigationItem) => {
    setSelectedItem(item);
    setItemDialogOpen(true);
  };

  const handleToggleStatus = (item: SerializedNavigationItem) => {
    startTransition(async () => {
      await toggleNavigationItemStatusAction(null, {
        id: item.id,
        isPublished: !item.isPublished,
      });
      onRefresh();
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentLinks.length) return;

    const newLinks = [...currentLinks];
    const [moved] = newLinks.splice(index, 1);
    newLinks.splice(targetIndex, 0, moved);

    startTransition(async () => {
      await reorderNavigationItemsAction(null, {
        location: activeLocation,
        itemIds: newLinks.map((i) => i.id),
      });
      onRefresh();
    });
  };

  const promptDelete = (id: string, label: string) => {
    setDeleteTarget({ id, label });
    setDeleteDialogOpen(true);
  };

  return (
    <div className="admin-workspace">
      {/* Sub-tab selection */}
      <div
        role="tablist"
        aria-label="Footer Link Columns"
        className="admin-tabs"
      >
        <button
          role="tab"
          id="tab-footer-admissions"
          aria-selected={activeLocation === "FOOTER_ADMISSIONS"}
          tabIndex={activeLocation === "FOOTER_ADMISSIONS" ? 0 : -1}
          type="button"
          onClick={() => setActiveLocation("FOOTER_ADMISSIONS")}
          className={`admin-tab ${activeLocation === "FOOTER_ADMISSIONS" ? "admin-tab--active" : ""}`}
        >
          <GraduationCap size={16} aria-hidden="true" />
          <span>Column 2: Admissions &amp; Academics</span>
          <span className="admin-tab__badge">{admissionsLinks.length}</span>
        </button>

        <button
          role="tab"
          id="tab-footer-community"
          aria-selected={activeLocation === "FOOTER_COMMUNITY"}
          tabIndex={activeLocation === "FOOTER_COMMUNITY" ? 0 : -1}
          type="button"
          onClick={() => setActiveLocation("FOOTER_COMMUNITY")}
          className={`admin-tab ${activeLocation === "FOOTER_COMMUNITY" ? "admin-tab--active" : ""}`}
        >
          <Users size={16} aria-hidden="true" />
          <span>Column 3: Life at School &amp; Community</span>
          <span className="admin-tab__badge">{communityLinks.length}</span>
        </button>
      </div>

      <div className="admin-section-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-workspace-toolbar__title">
              {activeLocation === "FOOTER_ADMISSIONS"
                ? "Admissions & Academics Links"
                : "Life at School & Community Links"}
            </h3>
            <p className="admin-workspace-toolbar__count">
              These links appear in the institutional footer across all public pages.
            </p>
          </div>
          <div className="admin-card-actions">
            <button
              type="button"
              onClick={handleAddItem}
              className="admin-button admin-button--primary"
            >
              <Plus size={16} />
              <span>Add Footer Link</span>
            </button>
          </div>
        </div>

        {currentLinks.length === 0 ? (
          <div className="admin-empty-state">
            <p style={{ margin: "0 0 12px" }}>No links in this footer column.</p>
            <button
              type="button"
              onClick={handleAddItem}
              className="admin-button admin-button--primary"
            >
              <Plus size={16} />
              <span>Create First Link</span>
            </button>
          </div>
        ) : (
          <div className="admin-record-list">
            {currentLinks.map((link, index) => (
              <div
                key={link.id}
                className="admin-record-item"
                style={{ opacity: link.isPublished ? 1 : 0.75 }}
              >
                <div className="admin-record-item__info">
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <button
                      type="button"
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      aria-label="Move link up"
                      className="admin-icon-button"
                      style={{ width: "24px", height: "24px", minWidth: "24px", minHeight: "24px", padding: 0 }}
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, "down")}
                      disabled={index === currentLinks.length - 1}
                      aria-label="Move link down"
                      className="admin-icon-button"
                      style={{ width: "24px", height: "24px", minWidth: "24px", minHeight: "24px", padding: 0 }}
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontFamily: "var(--heading-font)", fontWeight: 600, fontSize: "0.875rem", color: "#111827" }}>
                        {link.label}
                      </span>
                      {link.openInNewTab && (
                        <span title="Opens in new tab">
                          <ExternalLink size={12} style={{ color: "#9ca3af" }} />
                        </span>
                      )}
                    </div>
                    <span style={{ display: "block", fontFamily: "monospace", fontSize: "0.75rem", color: "#6b7280" }}>
                      {link.href}
                    </span>
                  </div>
                </div>

                <div className="admin-record-item__actions">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(link)}
                    title={link.isPublished ? "Unpublish link" : "Publish link"}
                    className={`admin-pill ${link.isPublished ? "admin-pill--published" : "admin-pill--draft"}`}
                    style={{ cursor: "pointer", border: "none", minHeight: "28px" }}
                  >
                    {link.isPublished ? <Eye size={12} style={{ marginRight: "3px" }} /> : <EyeOff size={12} style={{ marginRight: "3px" }} />}
                    <span>{link.isPublished ? "Live" : "Draft"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditItem(link)}
                    className="admin-icon-button"
                    style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px" }}
                    title="Edit link"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => promptDelete(link.id, link.label)}
                    className="admin-icon-button"
                    style={{ width: "32px", height: "32px", minWidth: "32px", minHeight: "32px", color: "#dc2626" }}
                    title="Delete link"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Form Dialog */}
      <ItemFormDialog
        isOpen={itemDialogOpen}
        location={activeLocation}
        initialItem={selectedItem}
        onClose={() => setItemDialogOpen(false)}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation */}
      {deleteTarget && (
        <DeleteNavigationDialog
          isOpen={deleteDialogOpen}
          targetType="ITEM"
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
