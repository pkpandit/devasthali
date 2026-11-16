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
    <div className="topper-workspace-wrapper space-y-6">
      {/* 3-Section Accessible Top Switcher */}
      <div className="topper-workspace-toolbar p-2 rounded-2xl bg-white border border-gray-200 shadow-xs">
        <div
          role="tablist"
          aria-label="About and Leadership Sections"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
        >
          <button
            role="tab"
            id="tab-about"
            aria-selected={activeTab === "ABOUT"}
            aria-controls="tabpanel-about"
            type="button"
            onClick={() => setActiveTab("ABOUT")}
            className={`min-h-[44px] px-4 py-2.5 text-sm font-heading font-bold rounded-xl inline-flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === "ABOUT"
                ? "bg-[#B91C1C] text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>About School & Narrative</span>
          </button>

          <button
            role="tab"
            id="tab-vision-mission"
            aria-selected={activeTab === "VISION_MISSION"}
            aria-controls="tabpanel-vision-mission"
            type="button"
            onClick={() => setActiveTab("VISION_MISSION")}
            className={`min-h-[44px] px-4 py-2.5 text-sm font-heading font-bold rounded-xl inline-flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === "VISION_MISSION"
                ? "bg-[#B91C1C] text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Vision & Mission</span>
          </button>

          <button
            role="tab"
            id="tab-leadership"
            aria-selected={activeTab === "LEADERSHIP"}
            aria-controls="tabpanel-leadership"
            type="button"
            onClick={() => setActiveTab("LEADERSHIP")}
            className={`min-h-[44px] px-4 py-2.5 text-sm font-heading font-bold rounded-xl inline-flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === "LEADERSHIP"
                ? "bg-[#B91C1C] text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Leadership Messages & Profiles (5)</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "ABOUT" && (
        <div role="tabpanel" id="tabpanel-about" aria-labelledby="tab-about">
          <AboutPageEditor
            initialSetting={aboutSetting}
            credentials={credentials}
            narrativeSections={narrativeSections}
          />
        </div>
      )}

      {activeTab === "VISION_MISSION" && (
        <div role="tabpanel" id="tabpanel-vision-mission" aria-labelledby="tab-vision-mission">
          <VisionMissionEditor
            initialSetting={vmSetting}
            coreValues={coreValues}
          />
        </div>
      )}

      {activeTab === "LEADERSHIP" && (
        <div role="tabpanel" id="tabpanel-leadership" aria-labelledby="tab-leadership">
          <LeadershipEditor members={leadershipMembers} />
        </div>
      )}
    </div>
  );
}
