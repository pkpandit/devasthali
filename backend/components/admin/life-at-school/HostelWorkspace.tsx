"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Save,
  Loader2,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  updateHostelSectionAction,
  deleteHostelFeatureAction,
  toggleHostelFeatureStatusAction,
  reorderHostelFeaturesAction,
} from "@/lib/server/transport-hostel-actions";
import {
  HostelFeatureDialog,
  type SerializedHostelFeature,
} from "./HostelFeatureDialog";

export interface SerializedHostelSection {
  id: string;
  badge: string;
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface HostelWorkspaceProps {
  section: SerializedHostelSection | null;
  features: SerializedHostelFeature[];
}

export function HostelWorkspace({ section, features }: HostelWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Overview Form state
  const [badge, setBadge] = useState(section?.badge ?? "Residential Boarding Life");
  const [title, setTitle] = useState(
    section?.title ?? 'A Safe, Caring "Home Away From Home"'
  );
  const [description, setDescription] = useState(
    section?.description ??
      "Our residential boarding is structured to instill life-long habits of self-reliance, physical vigor, and focused academic discipline. We maintain completely segregated hostel blocks for boys and girls with strict 24/7 security, resident female and male wardens, and zero tolerance for bullying or ragging."
  );

  const [headerError, setHeaderError] = useState<string | null>(null);
  const [headerSuccess, setHeaderSuccess] = useState<string | null>(null);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<SerializedHostelFeature | null>(null);

  const handleHeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHeaderError(null);
    setHeaderSuccess(null);

    startTransition(async () => {
      try {
        const res = await updateHostelSectionAction({
          badge: badge.trim(),
          title: title.trim(),
          description: description.trim(),
        });

        if (res.success) {
          setHeaderSuccess("Hostel section overview updated successfully.");
          router.refresh();
        } else {
          setHeaderError(res.error || "Failed to update hostel section.");
        }
      } catch (err) {
        console.error("Header update error:", err);
        setHeaderError("An unexpected error occurred.");
      }
    });
  };

  const handleToggle = (id: string) => {
    startTransition(async () => {
      try {
        const res = await toggleHostelFeatureStatusAction({ id });
        if (res.success) {
          router.refresh();
        } else {
          alert(res.error || "Failed to toggle status.");
        }
      } catch (err) {
        console.error("Toggle error:", err);
        alert("Unexpected error.");
      }
    });
  };

  const handleDelete = (id: string, featureTitle: string) => {
    if (!confirm(`Are you sure you want to delete the boarding feature "${featureTitle}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await deleteHostelFeatureAction({ id });
        if (res.success) {
          router.refresh();
        } else {
          alert(res.error || "Failed to delete feature.");
        }
      } catch (err) {
        console.error("Delete error:", err);
        alert("Unexpected error.");
      }
    });
  };

  const handleMove = (index: number, direction: "UP" | "DOWN") => {
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= features.length) return;

    const reordered = [...features];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const items = reordered.map((f, idx) => ({ id: f.id, displayOrder: idx }));

    startTransition(async () => {
      try {
        const res = await reorderHostelFeaturesAction({ items });
        if (res.success) {
          router.refresh();
        } else {
          alert(res.error || "Failed to reorder features.");
        }
      } catch (err) {
        console.error("Reorder error:", err);
        alert("Unexpected error reordering features.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. SECTION OVERVIEW FORM */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center shrink-0 border border-red-100">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Residential Hostel Overview</h2>
            <p className="text-xs text-gray-500">
              Manage the primary headline, badge, and narrative description shown on the public Facilities page.
            </p>
          </div>
        </div>

        {headerError && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{headerError}</span>
          </div>
        )}

        {headerSuccess && (
          <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{headerSuccess}</span>
          </div>
        )}

        <form onSubmit={handleHeaderSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Badge / Tagline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Residential Boarding Life"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Section Heading <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='e.g. A Safe, Caring "Home Away From Home"'
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Narrative Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              maxLength={3000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe campus residential discipline, security, wardens, dining, and healthcare..."
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#B91C1C] focus:outline-hidden focus:ring-1 focus:ring-[#B91C1C]"
            />
            <p className="mt-1 text-xs text-gray-500">Max 3,000 characters.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#B91C1C] px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-[#991B1B] transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Hostel Overview</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. BOARDING FEATURES MANAGEMENT */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Residential Boarding Features</h2>
            <p className="text-xs text-gray-500">
              Manage the 3-column feature cards displayed below the residential narrative (Dining, Study, Care).
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedFeature(null);
              setIsDialogOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-black transition-colors shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Boarding Feature</span>
          </button>
        </div>

        {features.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500 text-sm">
            No boarding features published. Click &ldquo;Add Boarding Feature&rdquo; to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-800">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-1/4">Feature Title</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 w-28 text-center">Status</th>
                  <th className="py-3 px-4 w-32 text-center">Reorder</th>
                  <th className="py-3 px-4 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {features.map((feature, idx) => (
                  <tr key={feature.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-gray-500 text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {feature.title}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600 leading-relaxed max-w-md line-clamp-2">
                      {feature.description}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(feature.id)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                          feature.isPublished
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                        }`}
                        title="Click to toggle published status"
                      >
                        {feature.isPublished ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-gray-500" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "UP")}
                          disabled={idx === 0 || isPending}
                          className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
                          title="Move up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, "DOWN")}
                          disabled={idx === features.length - 1 || isPending}
                          className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none"
                          title="Move down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFeature(feature);
                            setIsDialogOpen(true);
                          }}
                          disabled={isPending}
                          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          title="Edit feature"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(feature.id, feature.title)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                          title="Delete feature"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog for Add / Edit */}
      <HostelFeatureDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedFeature(null);
        }}
        feature={selectedFeature}
      />
    </div>
  );
}
