"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Users } from "lucide-react";
import { ProfileForm, type SerializedSiteProfile } from "./ProfileForm";
import { DirectoryList } from "./DirectoryList";
import type { SerializedDirectoryEntry } from "./DirectoryFormDialog";

interface ProfileDirectoryWorkspaceProps {
  profile: SerializedSiteProfile;
  directoryEntries: SerializedDirectoryEntry[];
}

export function ProfileDirectoryWorkspace({
  profile,
  directoryEntries,
}: ProfileDirectoryWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "directory">("profile");

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 pb-3 text-sm font-heading font-bold border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-[#B91C1C] text-[#B91C1C]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Site Identity &amp; Helplines</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("directory")}
          className={`flex items-center gap-2 pb-3 text-sm font-heading font-bold border-b-2 transition-colors ${
            activeTab === "directory"
              ? "border-[#B91C1C] text-[#B91C1C]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Campus Directory Contacts ({directoryEntries.length})</span>
        </button>
      </div>

      {activeTab === "profile" ? (
        <ProfileForm initialProfile={profile} />
      ) : (
        <DirectoryList entries={directoryEntries} onRefresh={handleRefresh} />
      )}
    </div>
  );
}
