export interface AdminLink {
  label: string;
  href: string;
  publicHref: string;
  badge?: string;
  description?: string;
  isDownloadOrDocument?: boolean;
}

export interface AdminLinkGroup {
  heading?: string;
  items: AdminLink[];
}

export interface AdminSection {
  id: string;
  label: string;
  href: string;
  publicHref: string;
  description?: string;
  groups: AdminLinkGroup[];
}

export interface AdminWorkspace {
  title: string;
  href: string;
  publicHref: string;
  breadcrumbs: string[];
  badge?: string;
  sectionId?: string;
  description?: string;
  isDownloadOrDocument?: boolean;
  childItems?: { label: string; href: string; badge?: string }[];
}
