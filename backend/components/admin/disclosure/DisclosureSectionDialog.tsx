"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, Loader2, FolderPlus, Edit3 } from "lucide-react";
import {
  createDisclosureSectionAction,
  updateDisclosureSectionAction,
} from "@/lib/server/disclosure-actions";

export interface SerializedDisclosureSection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DisclosureSectionDialogProps {
  isOpen: boolean;
  section?: SerializedDisclosureSection | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface SectionFormInnerProps {
  section?: SerializedDisclosureSection | null;
  onClose: () => void;
  onSuccess: () => void;
}

function SectionFormInner({
  section,
  onClose,
  onSuccess,
}: SectionFormInnerProps) {
  const isEdit = Boolean(section);
  const [isPending, startTransition] = useTransition();

  // Initialize directly from props (keyed remounting pattern)
  const [title, setTitle] = useState(section?.title ?? "");
  const [description, setDescription] = useState(section?.description ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    section ? String(section.displayOrder) : "0"
  );
  const [isPublished, setIsPublished] = useState(section?.isPublished ?? true);

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    setGeneralError(null);
    setFieldErrors({});

    const payload = {
      ...(isEdit ? { id: section!.id } : {}),
      title: title.trim(),
      description: description.trim() || null,
      displayOrder: parseInt(displayOrder, 10) || 0,
      isPublished,
    };

    startTransition(async () => {
      try {
        const res = isEdit
          ? await updateDisclosureSectionAction(payload)
          : await createDisclosureSectionAction(payload);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setGeneralError(res.error || "Failed to save disclosure section.");
          if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        }
      } catch (err) {
        setGeneralError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Modal Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isEdit ? (
            <Edit3 size={20} color="var(--primary)" />
          ) : (
            <FolderPlus size={20} color="var(--primary)" />
          )}
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            {isEdit ? "Edit Disclosure Section" : "New Disclosure Section"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            color: "var(--muted-foreground)",
            borderRadius: "6px",
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Modal Body */}
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {generalError && (
          <div
            role="alert"
            style={{
              padding: "10px 14px",
              background: "#FEE2E2",
              border: "1px solid #F87171",
              borderRadius: "8px",
              color: "#991B1B",
              fontSize: "0.875rem",
            }}
          >
            {generalError}
          </div>
        )}

        {/* Section Title */}
        <div>
          <label
            htmlFor="sec-title"
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: "6px",
            }}
          >
            Section Title <span style={{ color: "var(--destructive)" }}>*</span>
          </label>
          <input
            id="sec-title"
            ref={firstInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. DOCUMENTS AND INFORMATION"
            required
            maxLength={150}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: fieldErrors.title ? "1px solid #DC2626" : "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "0.95rem",
              color: "var(--foreground)",
              background: "var(--background)",
              boxSizing: "border-box",
            }}
          />
          {fieldErrors.title && (
            <p style={{ color: "#DC2626", fontSize: "0.8rem", marginTop: "4px" }}>
              {fieldErrors.title[0]}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="sec-desc"
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: "6px",
            }}
          >
            Description (Optional)
          </label>
          <textarea
            id="sec-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of statutory documents in this group..."
            rows={3}
            maxLength={500}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "0.95rem",
              color: "var(--foreground)",
              background: "var(--background)",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
          <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "4px" }}>
            {description.length}/500 characters
          </div>
        </div>

        {/* Display Order */}
        <div>
          <label
            htmlFor="sec-order"
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: "6px",
            }}
          >
            Display Order
          </label>
          <input
            id="sec-order"
            type="number"
            min={0}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            style={{
              width: "120px",
              padding: "8px 12px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "0.95rem",
              color: "var(--foreground)",
              background: "var(--background)",
            }}
          />
        </div>

        {/* Status Checkbox */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            id="sec-published"
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
          />
          <label
            htmlFor="sec-published"
            style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)" }}
          >
            Published & Active (visible to the public when section has documents)
          </label>
        </div>
      </div>

      {/* Modal Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          padding: "16px 24px",
          borderTop: "1px solid var(--border)",
          background: "#F9FAFB",
          borderRadius: "0 0 16px 16px",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="admin-btn-secondary"
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "#ffffff",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="admin-btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "8px",
            border: "none",
            background: "var(--primary)",
            color: "#ffffff",
            cursor: isPending ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          <span>{isEdit ? "Update Section" : "Create Section"}</span>
        </button>
      </div>
    </form>
  );
}

export function DisclosureSectionDialog({
  isOpen,
  section,
  onClose,
  onSuccess,
}: DisclosureSectionDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="topper-dialog-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={section ? "Edit Disclosure Section" : "New Disclosure Section"}
        className="topper-dialog-container"
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        <SectionFormInner
          key={section?.id ?? "create"}
          section={section}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
