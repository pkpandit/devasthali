"use client";

import Image from "next/image";
import {
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Building,
  MonitorPlay,
  FlaskConical,
  Cpu,
  Home,
  Trophy,
  Bus,
  BookOpen,
  HeartPulse,
  Sparkles,
  Shield,
} from "lucide-react";
import type { SerializedFacilityCategory } from "./FacilityCategoryDialog";
import type { SerializedFacilityItem } from "./FacilityItemDialog";

export interface SerializedCategoryWithItems extends SerializedFacilityCategory {
  items: SerializedFacilityItem[];
}

interface FacilityCategoryCardProps {
  category: SerializedCategoryWithItems;
  categoryIndex: number;
  totalCategories: number;
  isPending: boolean;
  onEditCategory: (cat: SerializedFacilityCategory) => void;
  onDeleteCategory: (cat: SerializedCategoryWithItems) => void;
  onToggleCategoryStatus: (cat: SerializedFacilityCategory) => void;
  onMoveCategory: (currentIndex: number, direction: "UP" | "DOWN") => void;
  onAddItem: (categoryId: string) => void;
  onEditItem: (item: SerializedFacilityItem) => void;
  onDeleteItem: (item: SerializedFacilityItem) => void;
  onToggleItemStatus: (item: SerializedFacilityItem) => void;
  onMoveItem: (
    categoryId: string,
    currentIndex: number,
    direction: "UP" | "DOWN"
  ) => void;
}

function renderFacilityIcon(iconName: string | null | undefined, size = 16) {
  switch (iconName) {
    case "MonitorPlay":
      return <MonitorPlay size={size} />;
    case "FlaskConical":
      return <FlaskConical size={size} />;
    case "Cpu":
      return <Cpu size={size} />;
    case "Home":
      return <Home size={size} />;
    case "Trophy":
      return <Trophy size={size} />;
    case "Bus":
      return <Bus size={size} />;
    case "BookOpen":
      return <BookOpen size={size} />;
    case "HeartPulse":
      return <HeartPulse size={size} />;
    case "Sparkles":
      return <Sparkles size={size} />;
    case "Shield":
      return <Shield size={size} />;
    default:
      return <BookOpen size={size} />;
  }
}

export function FacilityCategoryCard({
  category,
  categoryIndex,
  totalCategories,
  isPending,
  onEditCategory,
  onDeleteCategory,
  onToggleCategoryStatus,
  onMoveCategory,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleItemStatus,
  onMoveItem,
}: FacilityCategoryCardProps) {
  const isFirstCategory = categoryIndex === 0;
  const isLastCategory = categoryIndex === totalCategories - 1;

  return (
    <div
      className="admin-card facility-cat-card"
      style={{
        marginBottom: "24px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        maxWidth: "100%",
      }}
    >
      {/* Category Header Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flexWrap: "wrap" }}>
          <Building size={20} color="#0284c7" aria-hidden="true" />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "#0f172a" }}>
                {category.title}
              </h3>
              <span
                className={`admin-status-badge ${
                  category.isPublished
                    ? "admin-status-badge--published"
                    : "admin-status-badge--draft"
                }`}
                style={{ fontSize: "0.75rem", padding: "2px 8px" }}
              >
                {category.isPublished ? "Published" : "Draft"}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  backgroundColor: "#e2e8f0",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  fontWeight: 600,
                }}
              >
                {category.items.length} {category.items.length === 1 ? "item" : "items"}
              </span>
            </div>
            {category.description && (
              <p style={{ margin: "4px 0 0 0", fontSize: "0.8125rem", color: "#64748b" }}>
                {category.description}
              </p>
            )}
          </div>
        </div>

        {/* Category Actions */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
          {/* Reorder Category */}
          <button
            type="button"
            onClick={() => onMoveCategory(categoryIndex, "UP")}
            disabled={isPending || isFirstCategory}
            className="admin-icon-button"
            title="Move Category Up"
            aria-label={`Move ${category.title} up`}
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={() => onMoveCategory(categoryIndex, "DOWN")}
            disabled={isPending || isLastCategory}
            className="admin-icon-button"
            title="Move Category Down"
            aria-label={`Move ${category.title} down`}
          >
            <ChevronDown size={16} />
          </button>

          {/* Toggle Category Status */}
          <button
            type="button"
            onClick={() => onToggleCategoryStatus(category)}
            disabled={isPending}
            className={`admin-button ${
              category.isPublished ? "admin-button--secondary" : "admin-button--accent"
            }`}
            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
            title={category.isPublished ? "Unpublish Category" : "Publish Category"}
          >
            {category.isPublished ? (
              <>
                <EyeOff size={14} aria-hidden="true" />
                <span>Unpublish</span>
              </>
            ) : (
              <>
                <Eye size={14} aria-hidden="true" />
                <span>Publish</span>
              </>
            )}
          </button>

          {/* Edit Category */}
          <button
            type="button"
            onClick={() => onEditCategory(category)}
            disabled={isPending}
            className="admin-button admin-button--secondary"
            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
          >
            <Edit2 size={14} aria-hidden="true" />
            <span>Edit</span>
          </button>

          {/* Delete Category */}
          <button
            type="button"
            onClick={() => onDeleteCategory(category)}
            disabled={isPending}
            className="admin-button admin-button--danger"
            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
            title="Delete Category"
          >
            <Trash2 size={14} aria-hidden="true" />
            <span>Delete</span>
          </button>

          {/* Add Item Button */}
          <button
            type="button"
            onClick={() => onAddItem(category.id)}
            disabled={isPending}
            className="admin-button admin-button--primary"
            style={{ fontSize: "0.75rem", padding: "4px 12px", marginLeft: "4px" }}
          >
            <Plus size={14} aria-hidden="true" />
            <span>Add Facility</span>
          </button>
        </div>
      </div>

      {/* Facility Items Table */}
      <div style={{ overflowX: "auto", maxWidth: "100%", WebkitOverflowScrolling: "touch" }}>
        {category.items.length === 0 ? (
          <div
            style={{
              padding: "32px 20px",
              textAlign: "center",
              color: "#6b7280",
              backgroundColor: "#f9fafb",
            }}
          >
            <Building size={28} color="#9ca3af" style={{ margin: "0 auto 8px auto" }} aria-hidden="true" />
            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>
              No facility items in this category yet.
            </p>
            <button
              type="button"
              onClick={() => onAddItem(category.id)}
              disabled={isPending}
              className="admin-button admin-button--secondary"
              style={{ marginTop: "10px", fontSize: "0.75rem" }}
            >
              <Plus size={14} aria-hidden="true" />
              <span>Add First Facility to {category.title}</span>
            </button>
          </div>
        ) : (
          <table className="admin-table" style={{ width: "100%", margin: 0 }}>
            <thead>
              <tr>
                <th style={{ width: "70px", textAlign: "center" }}>Photo</th>
                <th style={{ minWidth: "180px" }}>Title & Description</th>
                <th style={{ width: "110px", textAlign: "center" }}>Icon</th>
                <th style={{ width: "130px" }}>Highlights</th>
                <th style={{ width: "70px", textAlign: "center" }}>Order</th>
                <th style={{ width: "95px", textAlign: "center" }}>Status</th>
                <th style={{ width: "160px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {category.items.map((item, itemIdx) => {
                const isFirstItem = itemIdx === 0;
                const isLastItem = itemIdx === category.items.length - 1;

                return (
                  <tr key={item.id}>
                    {/* Photo thumbnail */}
                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                      {item.imageUrl ? (
                        <div
                          style={{
                            width: "52px",
                            height: "36px",
                            position: "relative",
                            borderRadius: "4px",
                            overflow: "hidden",
                            border: "1px solid #e5e7eb",
                            display: "inline-block",
                          }}
                        >
                          <Image
                            src={item.imageUrl}
                            alt={item.imageAlt || item.title}
                            fill
                            sizes="52px"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: "52px",
                            height: "36px",
                            borderRadius: "4px",
                            backgroundColor: "#f3f4f6",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#9ca3af",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <Building size={16} />
                        </div>
                      )}
                    </td>

                    {/* Title & Description */}
                    <td style={{ verticalAlign: "middle" }}>
                      <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.875rem" }}>
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#6b7280",
                          marginTop: "2px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.4,
                        }}
                      >
                        {item.description}
                      </div>
                      {item.imageAlt && (
                        <div style={{ fontSize: "0.6875rem", color: "#9ca3af", marginTop: "2px" }}>
                          Alt: {item.imageAlt}
                        </div>
                      )}
                    </td>

                    {/* Icon */}
                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          backgroundColor: "#f0fdf4",
                          color: "#166534",
                          border: "1px solid #bbf7d0",
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                        }}
                      >
                        {renderFacilityIcon(item.iconName, 14)}
                        <span>{item.iconName || "None"}</span>
                      </span>
                    </td>

                    {/* Highlights */}
                    <td style={{ verticalAlign: "middle" }}>
                      {item.highlights && item.highlights.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#374151" }}>
                            {item.highlights.length} {item.highlights.length === 1 ? "highlight" : "highlights"}
                          </span>
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              color: "#6b7280",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "130px",
                            }}
                          >
                            {item.highlights[0]}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>None</span>
                      )}
                    </td>

                    {/* Order */}
                    <td style={{ textAlign: "center", verticalAlign: "middle", fontWeight: 600, color: "#4b5563" }}>
                      {item.displayOrder}
                    </td>

                    {/* Status */}
                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                      <button
                        type="button"
                        onClick={() => onToggleItemStatus(item)}
                        disabled={isPending}
                        className={`admin-status-badge ${
                          item.isPublished
                            ? "admin-status-badge--published"
                            : "admin-status-badge--draft"
                        }`}
                        style={{ cursor: "pointer", border: "none" }}
                        title="Click to toggle publish status"
                      >
                        {item.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "right", verticalAlign: "middle" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => onMoveItem(category.id, itemIdx, "UP")}
                          disabled={isPending || isFirstItem}
                          className="admin-icon-button"
                          title="Move Item Up"
                          aria-label={`Move ${item.title} up`}
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveItem(category.id, itemIdx, "DOWN")}
                          disabled={isPending || isLastItem}
                          className="admin-icon-button"
                          title="Move Item Down"
                          aria-label={`Move ${item.title} down`}
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditItem(item)}
                          disabled={isPending}
                          className="admin-icon-button"
                          title="Edit Facility Item"
                          aria-label={`Edit ${item.title}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item)}
                          disabled={isPending}
                          className="admin-icon-button admin-icon-button--danger"
                          title="Delete Facility Item"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
