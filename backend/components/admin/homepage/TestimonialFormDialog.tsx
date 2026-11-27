"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import {
  createHomepageTestimonialAction,
  updateHomepageTestimonialAction,
} from "@/lib/server/homepage-testimonial-actions";

export interface SerializedHomepageTestimonial {
  id: string;
  author: string;
  relationship: string;
  subject: string | null;
  quote: string;
  rating: number;
  avatarUrl: string | null;
  monogram: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface TestimonialFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  testimonial?: SerializedHomepageTestimonial | null;
}

export function TestimonialFormDialog({
  isOpen,
  onClose,
  testimonial,
}: TestimonialFormDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditing = !!testimonial;
  const [author, setAuthor] = useState(testimonial?.author ?? "");
  const [relationship, setRelationship] = useState(testimonial?.relationship ?? "");
  const [subject, setSubject] = useState(testimonial?.subject ?? "");
  const [quote, setQuote] = useState(testimonial?.quote ?? "");
  const [rating, setRating] = useState<number>(testimonial?.rating ?? 5);
  const [monogram, setMonogram] = useState(testimonial?.monogram ?? "★");
  const [avatarUrl, setAvatarUrl] = useState(testimonial?.avatarUrl ?? "");
  const [displayOrder, setDisplayOrder] = useState<number>(testimonial?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(testimonial?.isPublished ?? true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedAuthor = author.trim();
    const trimmedRelationship = relationship.trim();
    const trimmedSubject = subject.trim();
    const trimmedQuote = quote.trim();
    const trimmedMonogram = monogram.trim() || "★";
    const trimmedAvatarUrl = avatarUrl.trim();

    if (!trimmedAuthor) {
      setError("Author name is required.");
      return;
    }
    if (!trimmedRelationship) {
      setError("Relationship / Child details are required.");
      return;
    }
    if (!trimmedQuote) {
      setError("Testimonial quote is required (minimum 10 characters).");
      return;
    }
    if (trimmedQuote.length < 10) {
      setError("Testimonial quote must be at least 10 characters.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing && testimonial) {
          const res = await updateHomepageTestimonialAction({
            id: testimonial.id,
            author: trimmedAuthor,
            relationship: trimmedRelationship,
            subject: trimmedSubject || null,
            quote: trimmedQuote,
            rating: Number(rating),
            avatarUrl: trimmedAvatarUrl || null,
            monogram: trimmedMonogram,
            displayOrder: Number(displayOrder),
            isPublished,
          });

          if (res.success) {
            router.refresh();
            onClose();
          } else {
            setError(res.error || "Failed to update testimonial.");
          }
        } else {
          const res = await createHomepageTestimonialAction({
            author: trimmedAuthor,
            relationship: trimmedRelationship,
            subject: trimmedSubject || null,
            quote: trimmedQuote,
            rating: Number(rating),
            avatarUrl: trimmedAvatarUrl || null,
            monogram: trimmedMonogram,
            displayOrder: Number(displayOrder),
            isPublished,
          });

          if (res.success) {
            router.refresh();
            onClose();
          } else {
            setError(res.error || "Failed to create testimonial.");
          }
        }
      } catch (err) {
        console.error("Save testimonial error:", err);
        setError("An unexpected error occurred while saving.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div
        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="testimonial-form-dialog-title"
      >
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 id="testimonial-form-dialog-title" className="text-lg font-bold text-gray-900">
            {isEditing ? "Edit Parent Testimonial" : "Add Parent Testimonial"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Author / Parent Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Shri Rajeshwar Tiwari"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
              />
              <p className="mt-1 text-xs text-gray-400">Max 100 characters.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Relationship / Student Details <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g. Parent of Aarav Tiwari, Class X-A"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
              />
              <p className="mt-1 text-xs text-gray-400">Max 100 characters.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Subject / Focus Area (Optional)
              </label>
              <input
                type="text"
                maxLength={100}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Boarding & Academic Rigour"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
              />
              <p className="mt-1 text-xs text-gray-400">Max 100 characters.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Rating <span className="text-red-500">*</span>
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
              >
                <option value={5}>5 Stars ★★★★★ (Exceptional)</option>
                <option value={4}>4 Stars ★★★★☆ (Very Good)</option>
                <option value={3}>3 Stars ★★★☆☆ (Good)</option>
                <option value={2}>2 Stars ★★☆☆☆ (Fair)</option>
                <option value={1}>1 Star  ★☆☆☆☆ (Basic)</option>
              </select>
              <p className="mt-1 text-xs text-gray-400">Integer scale: 1 to 5.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Testimonial Quote <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              maxLength={1000}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Reflections on the school, values, academic discipline, and atmosphere..."
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
            />
            <p className="mt-1 text-xs text-gray-400">10 to 1,000 characters.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Monogram (Initials) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={monogram}
                onChange={(e) => setMonogram(e.target.value)}
                placeholder="e.g. RT, SP (Default: ★)"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
              />
              <p className="mt-1 text-xs text-gray-400">
                Primary visual initials in the testimonial badge. Max 10 chars.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Approved Avatar Image Path (Optional)
              </label>
              <input
                type="text"
                maxLength={255}
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="/images/testimonials/parent.webp"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
              />
              <p className="mt-1 text-xs text-gray-400">
                Must start with /images/ and end in .webp, .jpg, .jpeg, or .png.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
              />
              <p className="mt-1 text-xs text-gray-400">Ascending order on homepage.</p>
            </div>

            <div className="flex items-center pt-6">
              <label className="relative flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-gray-300 text-[#B91C1C] focus:ring-[#B91C1C] w-4 h-4"
                />
                <span>Published (Visible publicly)</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#B91C1C] px-5 py-2 text-sm font-bold text-white shadow-xs hover:bg-[#991B1B] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Create Testimonial"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
