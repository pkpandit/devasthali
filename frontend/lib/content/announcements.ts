export interface AnnouncementConfig {
  id: string;
  enabled: boolean;
  title: string;
  badge?: string;
  subtitle?: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  link: {
    href: string;
    label: string;
  };
  delayMs?: number;
  dismissalKey: string;
}

export const homeAnnouncement: AnnouncementConfig = {
  id: "alumni-meet-2026",
  enabled: true,
  title: "Alumni Meet 2026",
  badge: "Special Event",
  subtitle: "Reconnect, Relive, Rejoice",
  image: {
    src: "/images/announcements/alumni-meet-2026.webp",
    alt: "Devasthaly Vidyapeeth Alumni Meet 2026 Official Poster - Reconnect, Relive, Rejoice",
    width: 1696,
    height: 2528,
  },
  link: {
    href: "/alumni",
    label: "Join the Meet",
  },
  delayMs: 3000,
  dismissalKey: "dvp_announcement_dismissed_alumni_meet_2026",
};
