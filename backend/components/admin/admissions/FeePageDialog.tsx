"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save, FileImage, AlertCircle } from "lucide-react";
import {
  createFeeStructurePageAction,
  updateFeeStructurePageAction,
} from "@/lib/server/admissions-publication-actions";
import { isValidImageUrl } from "@/lib/validation/admissions-publication";

export interface SerializedFeePage {
  id: string;
  pageNumber: number;
  title: string;
  imageUrl: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeePageDialogProps {
  isOpen: boolean;
  page: SerializedFeePage | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function FeePageDialog({
  isOpen,
  page,
  onClose,
  onSuccess,
}: FeePageDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [pageNumber, setPageNumber] = useState<number>(page?.pageNumber ?? 1);
  const [title, setTitle] = useState<string>(page?.title ?? "");
  const [imageUrl, setImageUrl] = useState<string>(page?.imageUrl ?? "");
  const [displayOrder, setDisplayOrder] = useState<number>(page?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(page?.isPublished ?? true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidImageUrl(imageUrl)) {
      setError(
        "Invalid image URL. Must start with /images/ and end with .jpg, .jpeg, .png, or .webp with no directory traversal."
      );
      return;
    }

    startTransition(async () => {
      try {
        let res;
        if (page) {
          res = await updateFeeStructurePageAction({
            id: page.id,
            pageNumber: Number(pageNumber),
            title: title.trim(),
            imageUrl: imageUrl.trim(),
            displayOrder: Number(displayOrder),
            isPublished,
          });
        } else {
          res = await createFeeStructurePageAction({
            pageNumber: Number(pageNumber),
            title: title.trim(),
            imageUrl: imageUrl.trim(),
            displayOrder: Number(displayOrder),
            isPublished,
          });
        }

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Failed to save fee structure page.");
        }
      } catch (err) {
        console.error("Save fee page error:", err);
        setError("An unexpected error occurred while saving.");
      }
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "540px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileImage size={20} style={{ color: "#b91c1c" }} />
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#111827" }}>
              {page ? `Edit Fee Page ${page.pageNumber}` : "Add Fee Structure Page"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
              padding: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#991b1b",
                fontSize: "13px",
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label htmlFor="page-number-input" style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                Page Number *
              </label>
              <input
                id="page-number-input"
                type="number"
                min={1}
                required
                value={pageNumber}
                onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                className="admin-input"
                style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label htmlFor="display-order-input" style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
                Display Order
              </label>
              <input
                id="display-order-input"
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                className="admin-input"
                style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="title-input" style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Title / Description Label *
            </label>
            <input
              id="title-input"
              type="text"
              required
              placeholder="e.g. Fee Structure 2026–27 - Page 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="admin-input"
              style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label htmlFor="image-url-input" style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Image Path / Relative URL *
            </label>
            <input
              id="image-url-input"
              type="text"
              required
              placeholder="/images/admissions/fees/Fee-Structure-26-27_page-0001.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="admin-input"
              style={{ width: "100%", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
            />
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
              Must refer to an approved static asset under /images/admissions/fees/
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <input
              id="publish-toggle-input"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <label htmlFor="publish-toggle-input" style={{ fontSize: "14px", fontWeight: 500, color: "#374151", cursor: "pointer" }}>
              Publish immediately on public /admissions/fees route
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="admin-button admin-button--secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="admin-button admin-button--primary"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} aria-hidden="true" />
                  <span>{page ? "Update Page" : "Create Page"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
