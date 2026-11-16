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
    <div className="admin-workspace">
      {/* 3-Section Accessible Top Switcher */}
      <div
        role="tablist"
        aria-label="About and Leadership Sections"
        className="admin-tabs"
      >
        <button
          role="tab"
          id="tab-about"
          aria-selected={activeTab === "ABOUT"}
          aria-controls="tabpanel-about"
          tabIndex={activeTab === "ABOUT" ? 0 : -1}
          type="button"
          onClick={() => setActiveTab("ABOUT")}
          className={`admin-tab ${activeTab === "ABOUT" ? "admin-tab--active" : ""}`}
        >
          <BookOpen size={16} aria-hidden="true" />
          <span>About School &amp; Narrative</span>
        </button>

        <button
          role="tab"
          id="tab-vision-mission"
          aria-selected={activeTab === "VISION_MISSION"}
          aria-controls="tabpanel-vision-mission"
          tabIndex={activeTab === "VISION_MISSION" ? 0 : -1}
          type="button"
          onClick={() => setActiveTab("VISION_MISSION")}
          className={`admin-tab ${activeTab === "VISION_MISSION" ? "admin-tab--active" : ""}`}
        >
          <Compass size={16} aria-hidden="true" />
          <span>Vision &amp; Mission</span>
        </button>

        <button
          role="tab"
          id="tab-leadership"
          aria-selected={activeTab === "LEADERSHIP"}
          aria-controls="tabpanel-leadership"
          tabIndex={activeTab === "LEADERSHIP" ? 0 : -1}
          type="button"
          onClick={() => setActiveTab("LEADERSHIP")}
          className={`admin-tab ${activeTab === "LEADERSHIP" ? "admin-tab--active" : ""}`}
        >
          <Users size={16} aria-hidden="true" />
          <span>Leadership Messages &amp; Profiles</span>
          <span className="admin-tab__badge">5</span>
        </button>
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
