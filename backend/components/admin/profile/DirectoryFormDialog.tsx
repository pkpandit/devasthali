"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save } from "lucide-react";
import {
  createCampusDirectoryEntryAction,
  updateCampusDirectoryEntryAction,
} from "@/lib/server/profile-actions";

export interface SerializedDirectoryEntry {
  id: string;
  category: "ADMINISTRATION" | "HOSTEL_WARDEN" | "ACADEMIC_COORDINATOR" | "OFFICE_ACCOUNTS" | "SECURITY_TRANSPORT";
  roleTitle: string;
  contactName: string | null;
  department: string | null;
  phoneNumber: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DirectoryFormDialogProps {
  isOpen: boolean;
  initialEntry?: SerializedDirectoryEntry | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface DirectoryFormInnerProps {
  initialEntry?: SerializedDirectoryEntry | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: "ADMINISTRATION", label: "Administration & Front Desk" },
  { value: "HOSTEL_WARDEN", label: "Hostel Wardens & Residential" },
  { value: "ACADEMIC_COORDINATOR", label: "Academic Coordinators" },
  { value: "OFFICE_ACCOUNTS", label: "Office & Accounts / Fee Counter" },
  { value: "SECURITY_TRANSPORT", label: "Security & Transport" },
];

function DirectoryFormInner({
  initialEntry,
  onClose,
  onSuccess,
}: DirectoryFormInnerProps) {
  const isEdit = Boolean(initialEntry);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    category: initialEntry?.category || "ADMINISTRATION",
    roleTitle: initialEntry?.roleTitle || "",
    contactName: initialEntry?.contactName || "",
    department: initialEntry?.department || "",
    phoneNumber: initialEntry?.phoneNumber || "",
    displayOrder: initialEntry ? String(initialEntry.displayOrder) : "0",
    isPublished: initialEntry ? initialEntry.isPublished : true,
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const payload = {
          ...formData,
          displayOrder: Number(formData.displayOrder) || 0,
        };

        const res = isEdit && initialEntry
          ? await updateCampusDirectoryEntryAction(null, { ...payload, id: initialEntry.id })
          : await createCampusDirectoryEntryAction(null, payload);

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setServerError(res.error || "Failed to save directory contact.");
          if (res.fieldErrors) {
            setFieldErrors(res.fieldErrors);
          }
        }
      } catch (err) {
        console.error("Directory dialog error:", err);
        setServerError("An unexpected error occurred while saving entry.");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 id="dialog-title" className="text-lg font-bold font-heading text-gray-900">
            {isEdit ? "Edit Campus Directory Contact" : "Add Campus Directory Contact"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-red-600 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Role / Designation Title *
            </label>
            <input
              type="text"
              name="roleTitle"
              value={formData.roleTitle}
              onChange={handleChange}
              placeholder="e.g. Chief Warden, Receptionist, Co-ordinator"
              className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
              required
            />
            {fieldErrors.roleTitle && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.roleTitle[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Contact Person Name
            </label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              placeholder="e.g. Mr. B. C. Dubey (optional)"
              className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Department / Wing / Notes
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Draupadi Niketan (Kids Wing), Class IX to XII"
              className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Phone Number(s) *
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="e.g. 9554960415 or 8810973997, 8887526375"
              className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
              required
            />
            {fieldErrors.phoneNumber && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.phoneNumber[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                min={0}
                className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-800">
                Published on Public Site
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold bg-[#B91C1C] hover:bg-[#991B1B] text-white rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? "Update Contact" : "Create Contact"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DirectoryFormDialog({
  isOpen,
  initialEntry,
  onClose,
  onSuccess,
}: DirectoryFormDialogProps) {
  if (!isOpen) return null;

  return (
    <DirectoryFormInner
      key={initialEntry ? initialEntry.id : "new"}
      initialEntry={initialEntry}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
