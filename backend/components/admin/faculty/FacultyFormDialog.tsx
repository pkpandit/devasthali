"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Loader2, Sparkles } from "lucide-react";
import {
  createFacultyMember,
  updateFacultyMember,
} from "@/lib/server/faculty-actions";

export interface SerializedFacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  qualification: string | null;
  experienceYears: number;
  bio: string | null;
  imageUrl: string | null;
  imageStorageKey: string | null;
  imageAlt: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FacultyFormDialogProps {
  isOpen: boolean;
  member: SerializedFacultyMember | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function FacultyFormDialog({
  isOpen,
  member,
  onClose,
  onSuccess,
}: FacultyFormDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="topper-dialog-backdrop" onClick={onClose}>
      <FacultyFormInner
        key={member?.id || "new-faculty-member"}
        member={member}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}

function FacultyFormInner({
  member,
  onClose,
  onSuccess,
}: {
  member: SerializedFacultyMember | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: member?.name || "",
    designation: member?.designation || "",
    department: member?.department || "",
    qualification: member?.qualification || "",
    experienceYears: member?.experienceYears || 0,
    bio: member?.bio || "",
    imageUrl: member?.imageUrl || "",
    imageAlt: member?.imageAlt || "",
    displayOrder: member?.displayOrder || 0,
    isPublished: member ? member.isPublished : true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    startTransition(async () => {
      const payload = {
        name: formData.name,
        designation: formData.designation,
        department: formData.department,
        qualification: formData.qualification || null,
        experienceYears: Number(formData.experienceYears),
        bio: formData.bio || null,
        imageUrl: formData.imageUrl || null,
        imageAlt: formData.imageAlt,
        displayOrder: Number(formData.displayOrder),
        isPublished: formData.isPublished,
      };

      let result;
      if (member) {
        result = await updateFacultyMember({
          id: member.id,
          ...payload,
        });
      } else {
        result = await createFacultyMember(payload);
      }

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        if (result.error) {
          setGeneralError(result.error);
        }
      }
    });
  };

  return (
    <div
      className="topper-dialog-container"
      style={{ maxWidth: "680px" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="faculty-dialog-title"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="topper-dialog-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={20} style={{ color: "#b91c1c" }} />
          <h2 id="faculty-dialog-title" className="topper-dialog-title">
            {member ? "Edit Faculty Member" : "Add Faculty Member"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="admin-icon-button"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="topper-dialog-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {generalError && (
            <div className="admin-banner--warning" role="alert" style={{ marginBottom: "16px" }}>
              {generalError}
            </div>
          )}

          <div className="admin-form-grid-2">
            <div className="admin-field">
              <label className="admin-label">
                Full Name <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                required
                placeholder="e.g. Dr. K. N. Pandey"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="admin-input"
              />
              {errors.name && <p className="admin-field-error">{errors.name}</p>}
            </div>

            <div className="admin-field">
              <label className="admin-label">
                Designation <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Principal & Academic Director"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="admin-input"
              />
              {errors.designation && <p className="admin-field-error">{errors.designation}</p>}
            </div>
          </div>

          <div className="admin-form-grid-2" style={{ marginTop: "16px" }}>
            <div className="admin-field">
              <label className="admin-label">
                Department / Subject <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mathematics, Science & Biology"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="admin-input"
              />
              {errors.department && <p className="admin-field-error">{errors.department}</p>}
            </div>

            <div className="admin-field">
              <label className="admin-label">Experience (Years)</label>
              <input
                type="number"
                min={0}
                max={99}
                placeholder="e.g. 18"
                value={formData.experienceYears}
                onChange={(e) =>
                  setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })
                }
                className="admin-input"
              />
              {errors.experienceYears && (
                <p className="admin-field-error">{errors.experienceYears}</p>
              )}
            </div>
          </div>

          <div className="admin-field" style={{ marginTop: "16px" }}>
            <label className="admin-label">Academic Qualifications</label>
            <input
              type="text"
              placeholder="e.g. M.Sc. (Physics), M.Ed., Ph.D. in Education"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              className="admin-input"
            />
            <p className="admin-field-note">
              Degrees and certifications displayed on the public faculty card.
            </p>
            {errors.qualification && (
              <p className="admin-field-error">{errors.qualification}</p>
            )}
          </div>

          <div className="admin-field" style={{ marginTop: "16px" }}>
            <label className="admin-label">Short Biography / Mentorship Note (Optional)</label>
            <textarea
              rows={3}
              placeholder="Editorial note on pedagogy, leadership responsibilities, or special achievements..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="admin-textarea"
            />
            {errors.bio && <p className="admin-field-error">{errors.bio}</p>}
          </div>

          <div className="admin-form-grid-2" style={{ marginTop: "16px" }}>
            <div className="admin-field">
              <label className="admin-label">Portrait Image Path</label>
              <input
                type="text"
                placeholder="/images/academics/faculty/faculty-teachers.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="admin-input"
              />
              <p className="admin-field-note">
                Root-relative path (/images/...) or approved secure HTTPS URL.
              </p>
              {errors.imageUrl && <p className="admin-field-error">{errors.imageUrl}</p>}
            </div>

            <div className="admin-field">
              <label className="admin-label">
                Image Alt Text{" "}
                {formData.imageUrl && <span style={{ color: "#dc2626" }}>*</span>}
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. K. N. Pandey - Principal & Academic Director"
                value={formData.imageAlt}
                onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                className="admin-input"
              />
              <p className="admin-field-note">Accessible description for screen readers.</p>
              {errors.imageAlt && <p className="admin-field-error">{errors.imageAlt}</p>}
            </div>
          </div>

          {/* Live Portrait Preview Box */}
          {formData.imageUrl && (
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                borderRadius: "12px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "#e5e7eb",
                  border: "2px solid #ffffff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={formData.imageUrl}
                  alt={formData.imageAlt || "Faculty Preview"}
                  fill
                  sizes="64px"
                  unoptimized
                  style={{ objectFit: "cover", objectPosition: "top" }}
                  onError={() => {}}
                />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827" }}>
                  {formData.name || "Faculty Member Preview"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  {formData.designation || "Designation"} • {formData.department || "Department"}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "#9ca3af", marginTop: "2px" }}>
                  Alt: {formData.imageAlt || "(Alt text empty)"}
                </div>
              </div>
            </div>
          )}

          <div className="admin-form-grid-2" style={{ marginTop: "16px" }}>
            <div className="admin-field">
              <label className="admin-label">Display Order</label>
              <input
                type="number"
                min={0}
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                }
                className="admin-input"
              />
              <p className="admin-field-note">Lower numbers appear first on the public roster.</p>
            </div>

            <div className="admin-field" style={{ justifyContent: "center" }}>
              <label className="admin-checkbox-row" style={{ marginTop: "24px" }}>
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  className="admin-toggle"
                />
                <span style={{ fontWeight: 600, color: "#111827" }}>Publish to Directory</span>
              </label>
            </div>
          </div>
        </div>

        <div className="topper-dialog-actions">
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
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{member ? "Update Member" : "Create Member"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
