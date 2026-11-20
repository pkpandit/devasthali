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
import type { SerializedDisclosureSection } from "./DisclosureSectionDialog";
import type { SerializedDisclosureDocument } from "./DisclosureDocumentDialog";
import { DisclosureSectionCard } from "./DisclosureSectionCard";
import { DisclosureSectionDialog } from "./DisclosureSectionDialog";
import { DisclosureDocumentDialog } from "./DisclosureDocumentDialog";
import { DeleteDisclosureDialog, type DeleteDisclosureTarget } from "./DeleteDisclosureDialog";
import {
  reorderDisclosureSectionsAction,
  reorderDisclosureDocumentsAction,
  toggleDisclosureSectionStatusAction,
  toggleDisclosureDocumentStatusAction,
} from "@/lib/server/disclosure-actions";

export interface SerializedSectionWithDocs extends SerializedDisclosureSection {
  documents: SerializedDisclosureDocument[];
}

interface DisclosureWorkspaceProps {
  sections: SerializedSectionWithDocs[];
}

export function DisclosureWorkspace({ sections }: DisclosureWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");

  // Modal states
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SerializedDisclosureSection | null>(null);

  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<SerializedDisclosureDocument | null>(null);
  const [selectedSectionIdForDoc, setSelectedSectionIdForDoc] = useState<string>("");

  const [deleteTarget, setDeleteTarget] = useState<DeleteDisclosureTarget | null>(null);

  const handleSuccess = () => {
    router.refresh();
  };

  // Reordering sections
  const handleMoveSection = (currentIndex: number, direction: "UP" | "DOWN") => {
    if (isPending) return;
    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const reordered = [...sections];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const items = reordered.map((sec, idx) => ({ id: sec.id, displayOrder: idx }));

    startTransition(async () => {
      try {
        const res = await reorderDisclosureSectionsAction({ items });
        if (res.success) {
          handleSuccess();
        } else {
          alert(res.error || "Failed to reorder sections.");
        }
      } catch (err) {
        console.error("Reorder sections error:", err);
        alert("Unexpected error reordering sections.");
      }
    });
  };

  // Reordering documents within section
  const handleMoveDocument = (
    sectionId: string,
    currentIndex: number,
    direction: "UP" | "DOWN"
  ) => {
    if (isPending) return;
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec) return;

    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sec.documents.length) return;

    const reorderedDocs = [...sec.documents];
    const [moved] = reorderedDocs.splice(currentIndex, 1);
    reorderedDocs.splice(targetIndex, 0, moved);

    const items = reorderedDocs.map((doc, idx) => ({ id: doc.id, displayOrder: idx }));

    startTransition(async () => {
      try {
        const res = await reorderDisclosureDocumentsAction({
          sectionId,
          items,
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

  // Section status toggle
  const handleToggleSectionStatus = (sec: SerializedDisclosureSection) => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const res = await toggleDisclosureSectionStatusAction({
          id: sec.id,
          isPublished: !sec.isPublished,
        });
        if (res.success) {
          handleSuccess();
        } else {
          alert(res.error || "Failed to toggle section status.");
        }
      } catch (err) {
        console.error("Toggle section error:", err);
        alert("Unexpected error toggling section status.");
      }
    });
  };

  // Document status toggle
  const handleToggleDocumentStatus = (doc: SerializedDisclosureDocument) => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const res = await toggleDisclosureDocumentStatusAction({
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

  // Filter sections and documents based on query and status
  const filteredSections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return sections
      .filter((sec) => {
        if (statusFilter === "PUBLISHED" && !sec.isPublished) return false;
        if (statusFilter === "DRAFT" && sec.isPublished) return false;
        return true;
      })
      .map((sec) => {
        if (!q) return sec;

        const sectionMatches =
          sec.title.toLowerCase().includes(q) ||
          (sec.description && sec.description.toLowerCase().includes(q));

        const matchedDocs = sec.documents.filter(
          (doc) =>
            doc.title.toLowerCase().includes(q) ||
            (doc.description && doc.description.toLowerCase().includes(q)) ||
            (doc.fileUrl && doc.fileUrl.toLowerCase().includes(q))
        );

        if (sectionMatches) return sec;
        return {
          ...sec,
          documents: matchedDocs,
        };
      })
      .filter((sec) => {
        if (!q) return true;
        const sectionMatches =
          sec.title.toLowerCase().includes(q) ||
          (sec.description && sec.description.toLowerCase().includes(q));
        return sectionMatches || sec.documents.length > 0;
      });
  }, [sections, searchQuery, statusFilter]);

  const totalDocuments = useMemo(() => {
    return sections.reduce((acc, sec) => acc + sec.documents.length, 0);
  }, [sections]);

  const sectionOptions = useMemo(() => {
    return sections.map((s) => ({ id: s.id, title: s.title }));
  }, [sections]);

  return (
    <div className="admin-workspace-container" style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Action Header Card */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "20px 24px",
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--foreground)",
                margin: "0 0 4px 0",
              }}
            >
              CBSE Mandatory Public Disclosure
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", margin: 0 }}>
              {sections.length} section{sections.length === 1 ? "" : "s"} • {totalDocuments} compliance document{totalDocuments === 1 ? "" : "s"}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                setEditingSection(null);
                setIsSectionDialogOpen(true);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "#ffffff",
                color: "var(--foreground)",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <FolderPlus size={16} />
              <span>New Section</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingDocument(null);
                setSelectedSectionIdForDoc(sections[0]?.id || "");
                setIsDocumentDialogOpen(true);
              }}
              disabled={sections.length === 0}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                background: "var(--primary)",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: sections.length === 0 ? "not-allowed" : "pointer",
                opacity: sections.length === 0 ? 0.5 : 1,
              }}
            >
              <Plus size={16} />
              <span>Add Document</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border)",
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative", flex: "1 1 240px", minWidth: "200px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted-foreground)",
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections and compliance documents..."
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "0.875rem",
                background: "var(--background)",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={16} color="var(--muted-foreground)" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | "PUBLISHED" | "DRAFT")}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "0.875rem",
                background: "var(--background)",
                color: "var(--foreground)",
                cursor: "pointer",
              }}
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Draft Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sections List */}
      {filteredSections.length === 0 ? (
        <div
          className="admin-empty-state"
          style={{
            background: "#ffffff",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <FileText size={36} color="#9ca3af" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ margin: "0 0 6px 0", fontSize: "1.1rem", fontWeight: 600 }}>
            No disclosure sections found
          </h3>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
            {searchQuery
              ? "No sections or documents match your search criteria."
              : "Click \"New Section\" above to create your first statutory disclosure section."}
          </p>
        </div>
      ) : (
        filteredSections.map((sec, idx) => (
          <DisclosureSectionCard
            key={sec.id}
            section={sec}
            sectionIndex={idx}
            totalSections={filteredSections.length}
            isPending={isPending}
            onEditSection={(sectionToEdit) => {
              setEditingSection(sectionToEdit);
              setIsSectionDialogOpen(true);
            }}
            onDeleteSection={(sectionToDelete) => {
              setDeleteTarget({
                type: "section",
                id: sectionToDelete.id,
                title: sectionToDelete.title,
              });
            }}
            onToggleSectionStatus={handleToggleSectionStatus}
            onMoveSection={handleMoveSection}
            onAddDocument={(sectionId) => {
              setEditingDocument(null);
              setSelectedSectionIdForDoc(sectionId);
              setIsDocumentDialogOpen(true);
            }}
            onEditDocument={(docToEdit) => {
              setEditingDocument(docToEdit);
              setSelectedSectionIdForDoc(docToEdit.sectionId);
              setIsDocumentDialogOpen(true);
            }}
            onDeleteDocument={(docToDelete) => {
              setDeleteTarget({
                type: "document",
                id: docToDelete.id,
                title: docToDelete.title,
              });
            }}
            onToggleDocumentStatus={handleToggleDocumentStatus}
            onMoveDocument={handleMoveDocument}
          />
        ))
      )}

      {/* Section Dialog */}
      <DisclosureSectionDialog
        isOpen={isSectionDialogOpen}
        section={editingSection}
        onClose={() => {
          setIsSectionDialogOpen(false);
          setEditingSection(null);
        }}
        onSuccess={handleSuccess}
      />

      {/* Document Dialog */}
      <DisclosureDocumentDialog
        isOpen={isDocumentDialogOpen}
        sections={sectionOptions}
        defaultSectionId={selectedSectionIdForDoc}
        document={editingDocument}
        onClose={() => {
          setIsDocumentDialogOpen(false);
          setEditingDocument(null);
        }}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDisclosureDialog
        isOpen={Boolean(deleteTarget)}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
