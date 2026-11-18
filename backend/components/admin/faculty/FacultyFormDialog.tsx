"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import {
  createFacultyMember,
  updateFacultyMember,
} from "@/lib/server/faculty-actions";
import { AdminImageUploadField } from "@/components/admin/ui/AdminImageUploadField";

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

const DEPARTMENTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Computer Science",
  "Social Studies & Humanities",
  "Commerce",
  "Physical Education & Sports",
  "Arts & Performing Arts",
  "Administration & Leadership",
];

export function FacultyFormDialog({
  isOpen,
  member,
  onClose,
  onSuccess,
}: FacultyFormDialogProps) {
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

  // Photo state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);

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
      const payload = new FormData();
      if (member) {
        payload.append("id", member.id);
      }
      payload.append("name", formData.name.trim());
      payload.append("designation", formData.designation.trim());
      payload.append("department", formData.department.trim());
      if (formData.qualification.trim()) {
        payload.append("qualification", formData.qualification.trim());
      }
      payload.append("experienceYears", String(formData.experienceYears));
      if (formData.bio.trim()) {
        payload.append("bio", formData.bio.trim());
      }
      payload.append("imageAlt", formData.imageAlt.trim());
      payload.append("displayOrder", String(formData.displayOrder));
      payload.append("isPublished", String(formData.isPublished));

      if (selectedFile) {
        payload.append("photoFile", selectedFile);
      } else if (isPhotoRemoved) {
        payload.append("removePhoto", "true");
      } else if (formData.imageUrl) {
        payload.append("imageUrl", formData.imageUrl);
      }

      let result;
      if (member) {
        result = await updateFacultyMember(payload);
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
      {/* Header */}
      <div className="topper-dialog-header">
        <div>
          <h2 id="faculty-dialog-title" className="topper-dialog-title">
            {member ? "Edit Faculty Member" : "Add Faculty Member"}
          </h2>
          <p className="admin-field-note" style={{ margin: "2px 0 0" }}>
            {member
              ? "Update profile details, designations, qualifications, and portrait photo."
              : "Create a new verified faculty or department leadership record."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="topper-dialog-close"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        <div className="topper-dialog-body" style={{ maxHeight: "calc(85vh - 130px)" }}>
          {generalError && (
            <div className="topper-dialog-error-banner" role="alert">
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
                placeholder="e.g. Principal & Academic Director"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="admin-input"
              />
              {errors.designation && (
                <p className="admin-field-error">{errors.designation}</p>
              )}
            </div>
          </div>

          <div className="admin-form-grid-2" style={{ marginTop: "16px" }}>
            <div className="admin-field">
              <label className="admin-label">
                Department / Subject <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                list="department-suggestions"
                placeholder="e.g. Administration & Leadership, Mathematics"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="admin-input"
              />
              <datalist id="department-suggestions">
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} />
                ))}
              </datalist>
              <p className="admin-field-note">
                Pick from standard departments or type a specialized subject.
              </p>
              {errors.department && (
                <p className="admin-field-error">{errors.department}</p>
              )}
            </div>

            <div className="admin-field">
              <label className="admin-label">
                Years of Experience <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                max="99"
                value={formData.experienceYears}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experienceYears: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                className="admin-input"
              />
              <p className="admin-field-note">Teaching & academic experience (0–99 years).</p>
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

          {/* Standardized Portrait Image Upload Field */}
          <div style={{ marginTop: "16px" }}>
            <AdminImageUploadField
              label="Faculty Portrait"
              variant="circular"
              currentImageUrl={formData.imageUrl}
              selectedFile={selectedFile}
              isRemoved={isPhotoRemoved}
              onFileSelect={(file) => {
                setSelectedFile(file);
                setIsPhotoRemoved(false);
              }}
              onRemove={() => {
                setSelectedFile(null);
                setIsPhotoRemoved(true);
              }}
              error={errors.imageFile || errors.imageUrl}
              disabled={isPending}
              isPending={isPending}
              altText={formData.imageAlt}
              onAltChange={(alt) => setFormData({ ...formData, imageAlt: alt })}
              altLabel="Portrait Alt Text"
              altPlaceholder="e.g. Dr. K. N. Pandey - Principal & Academic Director"
              altRequired={Boolean(selectedFile || (!isPhotoRemoved && formData.imageUrl))}
              altError={errors.imageAlt}
            />
          </div>

          <div className="admin-form-grid-2" style={{ marginTop: "16px" }}>
            <div className="admin-field">
              <label className="admin-label">Display Order</label>
              <input
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayOrder: parseInt(e.target.value) || 0,
                  })
                }
                className="admin-input"
              />
              <p className="admin-field-note">Lower numbers appear first on the public directory.</p>
              {errors.displayOrder && (
                <p className="admin-field-error">{errors.displayOrder}</p>
              )}
            </div>

            <div className="admin-field" style={{ justifyContent: "center" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  marginTop: "24px",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  style={{ width: "18px", height: "18px", accentColor: "#b91c1c" }}
                />
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
                  Published to Directory
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="topper-dialog-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="topper-button topper-button--secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="topper-button topper-button--primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="topper-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>{member ? "Update Member" : "Create Member"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
