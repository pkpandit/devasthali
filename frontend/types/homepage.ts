export interface HomepageHeroData {
  badgeText?: string | null;
  heading: string;
  highlightText?: string | null;
  subheading: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  } | null;
  backgroundImageUrl?: string | null;
}

export interface HomepagePrincipalData {
  heading: string;
  principalName: string;
  principalDesignation: string;
  quote: string;
  excerpt: string;
  imageUrl?: string | null;
  cta?: {
    label: string;
    href: string;
  } | null;
}

export interface HomepageStatisticData {
  id: string;
  label: string;
  numericValue: string;
  suffix?: string | null;
  subtext?: string | null;
  badge?: string | null;
  iconName?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
}

export interface HomepageHighlightData {
  id: string;
  title: string;
  description: string;
  badge?: string | null;
  iconName?: string | null;
  imageUrl?: string | null;
  ctaLabel: string;
  ctaHref: string;
  displayOrder: number;
}

export interface PublicHomepageData {
  hero: HomepageHeroData | null;
  principal: HomepagePrincipalData | null;
  statistics: HomepageStatisticData[];
  highlights: HomepageHighlightData[];
}
