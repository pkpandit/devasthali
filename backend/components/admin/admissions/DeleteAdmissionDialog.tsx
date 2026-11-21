"use client";

import { useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  deleteEnquiry,
  deleteAdmissionStep,
  deleteAdmissionEligibility,
  deleteAdmissionDocumentRequirement,
  deleteAdmissionFaq,
} from "@/lib/server/admissions-actions";

export interface DeleteAdmissionTarget {
  type: "enquiry" | "step" | "eligibility" | "document" | "faq";
  id: string;
  title: string;
}

interface DeleteAdmissionDialogProps {
  isOpen: boolean;
  target: DeleteAdmissionTarget | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteAdmissionDialog({
  isOpen,
  target,
  onClose,
  onSuccess,
}: DeleteAdmissionDialogProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !target) return null;

  const typeLabels: Record<DeleteAdmissionTarget["type"], string> = {
    enquiry: "Admission Enquiry",
    step: "Admission Step",
    eligibility: "Eligibility Criteria",
    document: "Document Requirement",
    faq: "Admission FAQ",
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        let res;
        switch (target.type) {
          case "enquiry":
            res = await deleteEnquiry(target.id);
            break;
          case "step":
            res = await deleteAdmissionStep(target.id);
            break;
          case "eligibility":
            res = await deleteAdmissionEligibility(target.id);
            break;
          case "document":
            res = await deleteAdmissionDocumentRequirement(target.id);
            break;
          case "faq":
            res = await deleteAdmissionFaq(target.id);
            break;
        }

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          alert(res.error || `Failed to delete ${typeLabels[target.type]}.`);
        }
      } catch (err) {
        console.error("Delete admission entity error:", err);
        alert("An unexpected error occurred while deleting.");
      }
    });
  };

  return (
    <div
      className="admin-dialog-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="admin-dialog-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "460px" }}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={20} aria-hidden="true" />
          </div>
          <div>
            <h3
              id="delete-dialog-title"
              style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}
            >
              Delete {typeLabels[target.type]}
            </h3>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#6b7280", lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>&ldquo;{target.title}&rdquo;</strong>? This action cannot be undone.
            </p>
          </div>
        </div>

        <div
          className="admin-dialog-actions"
          style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="admin-button admin-button--secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="admin-button admin-button--danger"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Confirm Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
