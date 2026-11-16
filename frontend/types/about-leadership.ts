export interface AboutSettingData {
  breadcrumb: string;
  heading: string;
  subheading: string;
  showcaseImageUrl?: string | null;
  showcaseImageAlt?: string | null;
  showcaseBadge?: string | null;
}

export interface AboutCredentialData {
  id: string;
  category: string;
  title: string;
  subtext: string;
  iconName?: string | null;
  displayOrder: number;
}

export interface AboutNarrativeSectionData {
  id: string;
  heading?: string | null;
  body: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  displayOrder: number;
}

export interface PublicAboutData {
  setting: AboutSettingData | null;
  credentials: AboutCredentialData[];
  narrativeSections: AboutNarrativeSectionData[];
}

export interface VisionMissionSettingData {
  breadcrumb: string;
  heading: string;
  subheading: string;
  visionTitle: string;
  visionBody: string;
  visionIcon?: string | null;
  missionTitle: string;
  missionBody: string;
  missionIcon?: string | null;
}

export interface InstitutionalCoreValueData {
  id: string;
  title: string;
  description: string;
  iconName?: string | null;
  displayOrder: number;
}

export interface PublicVisionMissionData {
  setting: VisionMissionSettingData | null;
  coreValues: InstitutionalCoreValueData[];
}

export interface LeadershipMemberData {
  id: string;
  role: "FOUNDER" | "PATRON" | "PRESIDENT" | "MANAGER" | "PRINCIPAL";
  slug: string;
  pageTitle: string;
  breadcrumb: string;
  badgeText: string;
  name: string;
  designation: string;
  termOrAffiliation?: string | null;
  location?: string | null;
  shortIntro: string;
  quote?: string | null;
  messageBody: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  signatureImageUrl?: string | null;
  signatureAlt?: string | null;
  bio?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  displayOrder: number;
}

export interface PublicLeadershipData {
  members: LeadershipMemberData[];
}
