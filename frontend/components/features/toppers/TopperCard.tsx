import React from "react";
import Image from "next/image";
import { Award, GraduationCap } from "lucide-react";
import type { PublicTopper } from "@/lib/api/toppers";

interface TopperCardProps {
  topper: PublicTopper;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Validates that photoUrl is a safe, root-relative local path (e.g. /images/...)
 * or an authorized backend media URL to adhere strictly to Next.js image domain configurations.
 */
function isDisplayablePhotoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();

  // Root-relative static assets
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return true;
  }

  // Allowed backend media URL
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      if (
        (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost") &&
        parsed.pathname.startsWith("/api/public/media/toppers/")
      ) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

export function TopperCard({ topper }: TopperCardProps) {
  const hasValidPhoto = isDisplayablePhotoUrl(topper.photoUrl);
  const formattedScore = `${topper.scorePercent.toFixed(2)}%`;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 hover:border-red-300 shadow-xs hover:shadow-xl hover:-translate-y-1 p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between group cursor-pointer">
      <div>
        {/* Top Image Container with Badges - Deliberate 3:4 portrait crop for student photos */}
        <div className="relative w-full aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-xs">
          {hasValidPhoto && topper.photoUrl ? (
            <Image
              src={topper.photoUrl}
              alt={`${topper.studentName} - ${topper.grade} CBSE Topper`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 group-hover:text-[#B91C1C] transition-colors p-4">
              <div className="w-16 h-16 rounded-full bg-white shadow-xs border border-gray-200/90 flex items-center justify-center mb-2 text-xl font-heading font-bold text-slate-700">
                {getInitials(topper.studentName)}
              </div>
              <span className="text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">
                CBSE Scholar
              </span>
            </div>
          )}

          {/* Top-Left Grade Badge */}
          <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B91C1C] text-white text-sm font-heading font-bold shadow-sm">
            <GraduationCap className="w-3.5 h-3.5 text-white" />
            <span>{topper.grade}</span>
          </div>

          {/* Top-Right Year Badge */}
          <div className="absolute top-3 right-3 z-10 inline-flex items-center px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[#111827] text-sm font-heading font-bold shadow-xs">
            <span>{topper.academicYear}</span>
          </div>
        </div>

        {/* Sub-header / Stream Capsule Pill with Dashed Border */}
        <div className="rounded-full border border-dashed border-[#CBD5E1] px-3 py-1 inline-flex items-center gap-1.5 w-fit bg-slate-50 mb-3 transition-colors duration-300">
          <Award className="w-3.5 h-3.5 text-[#B91C1C]" />
          <span className="text-sm font-medium text-gray-700">
            {topper.stream || "Board Distinction"}
          </span>
        </div>

        {/* Score & Name */}
        <div className="font-heading font-black text-3xl sm:text-4xl text-[#B91C1C] mb-1.5 tracking-tight">
          {formattedScore}
        </div>
        <h3 className="font-heading font-bold text-lg text-[#111827] group-hover:text-[#B91C1C] transition-colors mb-2">
          {topper.studentName}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 bg-[#F3F4F6] p-3 rounded-xl border border-[#E5E7EB] font-sans leading-relaxed">
          {topper.achievement}
        </p>
      </div>
    </div>
  );
}
