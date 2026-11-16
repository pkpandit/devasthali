"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  GraduationCap,
} from "lucide-react";
import {
  toggleFacultyPublish,
  deleteFacultyMember,
  reorderFacultyMembers,
} from "@/lib/server/faculty-actions";
import {
  FacultyFormDialog,
  type SerializedFacultyMember,
} from "./FacultyFormDialog";
import { DeleteFacultyDialog } from "./DeleteFacultyDialog";

interface FacultyWorkspaceProps {
  facultyMembers: SerializedFacultyMember[];
}

export function FacultyWorkspace({ facultyMembers }: FacultyWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<SerializedFacultyMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SerializedFacultyMember | null>(null);

  // Department filter state
  const [selectedDept, setSelectedDept] = useState<string>("ALL");

  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const f of facultyMembers) {
      if (f.department) set.add(f.department);
    }
    return Array.from(set).sort();
  }, [facultyMembers]);

  const filteredMembers = useMemo(() => {
    if (selectedDept === "ALL") return facultyMembers;
    return facultyMembers.filter((f) => f.department === selectedDept);
  }, [facultyMembers, selectedDept]);

  const handleCreate = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEdit = (member: SerializedFacultyMember) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleToggleStatus = (member: SerializedFacultyMember) => {
    startTransition(async () => {
      await toggleFacultyPublish({
        id: member.id,
        isPublished: !member.isPublished,
      });
      router.refresh();
    });
  };

  const handleMove = (currentIndex: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= facultyMembers.length) return;

    const reordered = [...facultyMembers];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((item) => item.id);

    startTransition(async () => {
      await reorderFacultyMembers({ orderedIds });
      router.refresh();
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteFacultyMember({ id: deleteTarget.id });
    router.refresh();
  };

  return (
    <div className="admin-workspace">
      {/* Workspace Toolbar */}
      <div className="admin-section-card">
        <div className="admin-card-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 className="admin-workspace-toolbar__title">
                Faculty &amp; Mentors Roster
              </h2>
              <span className="admin-workspace-toolbar__count">
                ({facultyMembers.length} educators registered)
              </span>
            </div>
            <p className="admin-card-subtitle">
              Manage teacher qualifications, department designations, years of experience, and public publication status.
            </p>
          </div>

          <div className="admin-card-actions">
            <button
              type="button"
              onClick={handleCreate}
              className="admin-button admin-button--primary"
            >
              <Plus size={16} />
              <span>Add Faculty Member</span>
            </button>
          </div>
        </div>

        {/* Department Quick Filter */}
        {departments.length > 0 && (
          <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#4b5563" }}>
              Filter by Department:
            </span>
            <button
              type="button"
              onClick={() => setSelectedDept("ALL")}
              className={`admin-tab ${selectedDept === "ALL" ? "admin-tab--active" : ""}`}
              style={{ padding: "6px 12px", minHeight: "32px", fontSize: "0.75rem" }}
            >
              All ({facultyMembers.length})
            </button>
            {departments.map((dept) => {
              const count = facultyMembers.filter((f) => f.department === dept).length;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`admin-tab ${selectedDept === dept ? "admin-tab--active" : ""}`}
                  style={{ padding: "6px 12px", minHeight: "32px", fontSize: "0.75rem" }}
                >
                  {dept} ({count})
                </button>
              );
            })}
          </div>
        )}

        {filteredMembers.length === 0 ? (
          <div className="admin-empty-state" style={{ marginTop: "24px" }}>
            <GraduationCap size={40} style={{ color: "#9ca3af", margin: "0 auto 12px" }} />
            <p style={{ fontWeight: 600, color: "#374151" }}>No faculty members found.</p>
            <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: "4px" }}>
              {selectedDept !== "ALL"
                ? `No educators registered under "${selectedDept}".`
                : 'Click "Add Faculty Member" to populate the faculty directory.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-container" style={{ marginTop: "20px" }}>
            <table className="admin-table" aria-label="Faculty and Mentors Roster">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "40px", textAlign: "center" }}>#</th>
                  <th scope="col" style={{ width: "64px" }}>Portrait</th>
                  <th scope="col">Educator Details</th>
                  <th scope="col">Department &amp; Qualification</th>
                  <th scope="col" style={{ textAlign: "center" }}>Experience</th>
                  <th scope="col" style={{ textAlign: "center" }}>Status</th>
                  <th scope="col" style={{ textAlign: "center" }}>Reorder</th>
                  <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const globalIdx = facultyMembers.findIndex((f) => f.id === member.id);
                  return (
                    <tr
                      key={member.id}
                      style={{ opacity: !member.isPublished ? 0.65 : 1 }}
                    >
                      <td style={{ textAlign: "center", fontFamily: "monospace", color: "#9ca3af", fontSize: "0.75rem" }}>
                        {member.displayOrder + 1}
                      </td>

                      <td>
                        {member.imageUrl ? (
                          <div
                            style={{
                              position: "relative",
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              overflow: "hidden",
                              background: "#f3f4f6",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            <Image
                              src={member.imageUrl}
                              alt={member.imageAlt || member.name}
                              fill
                              sizes="44px"
                              unoptimized
                              style={{ objectFit: "cover", objectPosition: "top" }}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              background: "#f3f4f6",
                              border: "1px solid #e5e7eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#9ca3af",
                            }}
                          >
                            <GraduationCap size={20} />
                          </div>
                        )}
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: "#111827", fontSize: "0.9375rem" }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: "1px" }}>
                          {member.designation}
                        </div>
                        {member.bio && (
                          <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "3px", fontStyle: "italic", maxWidth: "420px" }}>
                            &quot;{member.bio.slice(0, 80)}{member.bio.length > 80 ? "..." : ""}&quot;
                          </p>
                        )}
                      </td>

                      <td>
                        <span className="admin-pill admin-pill--neutral">
                          {member.department}
                        </span>
                        {member.qualification && (
                          <div style={{ fontSize: "0.75rem", color: "#4b5563", marginTop: "4px", maxWidth: "340px" }}>
                            {member.qualification}
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <span style={{ fontWeight: 700, color: "#111827", fontSize: "0.875rem" }}>
                          {member.experienceYears}+
                        </span>
                        <div style={{ fontSize: "0.6875rem", color: "#6b7280" }}>Years</div>
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(member)}
                          disabled={isPending}
                          aria-label={`Toggle status for ${member.name}`}
                          className={`admin-pill ${member.isPublished ? "admin-pill--published" : "admin-pill--draft"}`}
                          style={{ cursor: "pointer", border: "none", minHeight: "28px" }}
                        >
                          {member.isPublished ? (
                            <>
                              <Eye size={12} style={{ marginRight: "4px" }} />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} style={{ marginRight: "4px" }} />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "4px" }}>
                          <button
                            type="button"
                            onClick={() => handleMove(globalIdx, "UP")}
                            disabled={isPending || globalIdx === 0}
                            aria-label={`Move ${member.name} up`}
                            className="admin-icon-button"
                            style={{ width: "28px", height: "28px" }}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(globalIdx, "DOWN")}
                            disabled={isPending || globalIdx === facultyMembers.length - 1}
                            aria-label={`Move ${member.name} down`}
                            className="admin-icon-button"
                            style={{ width: "28px", height: "28px" }}
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={() => handleEdit(member)}
                            disabled={isPending}
                            aria-label={`Edit ${member.name}`}
                            className="admin-icon-button"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(member)}
                            disabled={isPending}
                            aria-label={`Delete ${member.name}`}
                            className="admin-icon-button"
                            style={{ color: "#dc2626" }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Dialog for Create / Edit */}
      <FacultyFormDialog
        isOpen={isFormOpen}
        member={editingMember}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => router.refresh()}
      />

      {/* Confirmation Dialog for Deletion */}
      <DeleteFacultyDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Faculty Member"
        itemDescription={deleteTarget ? `"${deleteTarget.name}" (${deleteTarget.designation})` : ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
