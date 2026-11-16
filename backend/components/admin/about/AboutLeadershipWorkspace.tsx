"use client";

import { useState } from "react";
import { BookOpen, Compass, Users } from "lucide-react";
import {
  AboutPageEditor,
  type SerializedAboutPageSetting,
} from "./AboutPageEditor";
import {
  VisionMissionEditor,
  type SerializedVisionMissionSetting,
} from "./VisionMissionEditor";
import {
  LeadershipEditor,
  type SerializedLeadershipMember,
} from "./LeadershipEditor";
import type { SerializedAboutCredential } from "./CredentialFormDialog";
import type { SerializedAboutNarrativeSection } from "./NarrativeSectionFormDialog";
import type { SerializedInstitutionalCoreValue } from "./CoreValueFormDialog";

interface AboutLeadershipWorkspaceProps {
  aboutSetting: SerializedAboutPageSetting | null;
  credentials: SerializedAboutCredential[];
  narrativeSections: SerializedAboutNarrativeSection[];
  vmSetting: SerializedVisionMissionSetting | null;
  coreValues: SerializedInstitutionalCoreValue[];
  leadershipMembers: SerializedLeadershipMember[];
}

export function AboutLeadershipWorkspace({
  aboutSetting,
  credentials,
  narrativeSections,
  vmSetting,
  coreValues,
  leadershipMembers,
}: AboutLeadershipWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"ABOUT" | "VISION_MISSION" | "LEADERSHIP">("ABOUT");

  return (
    <div className="space-y-6">
      {/* 3-Section Top Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("ABOUT")}
          className={`px-4 py-2 text-sm font-heading font-bold rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "ABOUT"
              ? "bg-[#B91C1C] text-white shadow-xs"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>About School & Narrative</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("VISION_MISSION")}
          className={`px-4 py-2 text-sm font-heading font-bold rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "VISION_MISSION"
              ? "bg-[#B91C1C] text-white shadow-xs"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Vision & Mission</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("LEADERSHIP")}
          className={`px-4 py-2 text-sm font-heading font-bold rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "LEADERSHIP"
              ? "bg-[#B91C1C] text-white shadow-xs"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Leadership Messages & Profiles (5)</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "ABOUT" && (
        <AboutPageEditor
          initialSetting={aboutSetting}
          credentials={credentials}
          narrativeSections={narrativeSections}
        />
      )}

      {activeTab === "VISION_MISSION" && (
        <VisionMissionEditor
          initialSetting={vmSetting}
          coreValues={coreValues}
        />
      )}

      {activeTab === "LEADERSHIP" && (
        <LeadershipEditor members={leadershipMembers} />
      )}
    </div>
  );
}
