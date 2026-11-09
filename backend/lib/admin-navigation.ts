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

export const adminSections: AdminSection[] = [
  {
    id: "about",
    label: "About Us",
    href: "/admin/about",
    publicHref: "/about",
    description: "Manage institutional heritage, leadership messages, and CBSE disclosure.",
    groups: [
      {
        heading: "Overview & Heritage",
        items: [
          {
            label: "About School & Heritage",
            href: "/admin/about/heritage",
            publicHref: "/about",
            description: "Institutional background, founding history, and campus heritage.",
          },
          {
            label: "Vision and Mission",
            href: "/admin/about/vision-mission",
            publicHref: "/vision-mission",
            description: "Core guiding philosophy, pedagogical pillars, and values.",
          },
          {
            label: "CBSE Mandatory Disclosure",
            href: "/admin/about/mandatory-disclosure",
            publicHref: "/mandatory-public-disclosure",
            description: "Mandatory public disclosure tables, affiliation certificates, and safety proformas.",
            isDownloadOrDocument: true,
          },
        ],
      },
      {
        heading: "Leadership Messages",
        items: [
          {
            label: "Founder’s Message",
            href: "/admin/about/founders-message",
            publicHref: "/founders-message",
            description: "Message and vision from the founder.",
          },
          {
            label: "Patron’s Message",
            href: "/admin/about/patrons-message",
            publicHref: "/patrons-message",
            description: "Inspirational message from the institutional patron.",
          },
          {
            label: "President’s Message",
            href: "/admin/about/presidents-message",
            publicHref: "/presidents-message",
            description: "Governance perspective and presidential address.",
          },
          {
            label: "Manager’s Message",
            href: "/admin/about/managers-message",
            publicHref: "/managers-message",
            description: "Administrative commitments and operational oversight.",
          },
          {
            label: "Principal’s Message",
            href: "/admin/about/principals-message",
            publicHref: "/principals-message",
            description: "Academic direction and pedagogical message from the Principal.",
          },
        ],
      },
    ],
  },
  {
    id: "academics",
    label: "Academics",
    href: "/admin/academics",
    publicHref: "/academics",
    description: "Manage curriculum frameworks, assessments, faculty roster, toppers, and events.",
    groups: [
      {
        heading: "Curriculum & System",
        items: [
          {
            label: "Curriculum & CBSE Framework",
            href: "/admin/academics/curriculum",
            publicHref: "/academics",
            description: "Academic wings (Pre-Primary, Primary, Middle, Secondary, Senior Secondary).",
          },
          {
            label: "Academic System & Assessment",
            href: "/admin/academics/academic-system",
            publicHref: "/academic-system",
            description: "Examination structure, grading pattern, and continuous evaluation system.",
          },
        ],
      },
      {
        heading: "Faculty & Achievements",
        items: [
          {
            label: "Faculty & Academic Mentors",
            href: "/admin/academics/faculty",
            publicHref: "/faculty",
            description: "Teacher qualifications, department designations, and experience.",
          },
          {
            label: "Board Results & Toppers",
            href: "/admin/academics/results",
            publicHref: "/results",
            description: "CBSE Class X and XII board toppers, merit lists, and scores.",
          },
          {
            label: "Academic Calendar & Events",
            href: "/admin/academics/events",
            publicHref: "/events",
            description: "Annual academic schedule, holiday calendar, and co-curricular milestones.",
          },
        ],
      },
    ],
  },
  {
    id: "admissions",
    label: "Admissions",
    href: "/admin/admissions",
    publicHref: "/admissions",
    description: "Manage admissions criteria, procedures, fee schedules, prospectus, and online forms.",
    groups: [
      {
        heading: "Guidelines & Fees",
        items: [
          {
            label: "Admission Overview & Eligibility",
            href: "/admin/admissions/overview",
            publicHref: "/admissions",
            description: "General eligibility rules, class availability, and age criteria.",
          },
          {
            label: "Admission Procedure & Entrance",
            href: "/admin/admissions/procedure",
            publicHref: "/admissions/procedure",
            description: "Entrance examination dates, syllabus, and document verification steps.",
          },
          {
            label: "Fee Structure (2026–27)",
            href: "/admin/admissions/fees",
            publicHref: "/admissions/fees",
            description: "Tuition, boarding, transport, and installment fee charts.",
          },
        ],
      },
      {
        heading: "Application & Prospectus",
        items: [
          {
            label: "School Prospectus",
            href: "/admin/admissions/prospectus",
            publicHref: "/school-prospectus",
            description: "Official downloadable prospectus PDF and brochure guidelines.",
            isDownloadOrDocument: true,
          },
          {
            label: "Online Admission Form",
            href: "/admin/admissions/online-form",
            publicHref: "/online-admission-form",
            badge: "Apply Now",
            description: "Online registration form fields, instructions, and parental notice.",
          },
        ],
      },
    ],
  },
  {
    id: "life-at-school",
    label: "Life at School",
    href: "/admin/life-at-school",
    publicHref: "/facilities",
    description: "Manage facilities, hostels, transport fleet, activities, and campus photo gallery.",
    groups: [
      {
        heading: "Campus & Boarding",
        items: [
          {
            label: "Campus Infrastructure & Facilities",
            href: "/admin/life-at-school/facilities",
            publicHref: "/facilities",
            description: "Smart classrooms, laboratories, library, and 15-acre campus grounds.",
          },
          {
            label: "Hostels & Residential Care",
            href: "/admin/life-at-school/hostels",
            publicHref: "/facilities#hostel",
            description: "Boys & girls boarding houses, resident wardens, and mess care.",
          },
          {
            label: "Safe Transport Network",
            href: "/admin/life-at-school/transport",
            publicHref: "/facilities#transport",
            description: "GPS-enabled bus routes covering Ballia, Rasra, and Chilkahar nodes.",
          },
        ],
      },
      {
        heading: "Activities & Culture",
        items: [
          {
            label: "Co-Curricular Activities & Sports",
            href: "/admin/life-at-school/activities",
            publicHref: "/co-curricular-activities",
            description: "Cricket, football, yoga, annual athletic meets, and clubs.",
          },
          {
            label: "Campus Photo Gallery",
            href: "/admin/life-at-school/gallery",
            publicHref: "/gallery",
            description: "Categorized photo albums, campus events, and celebration archives.",
          },
        ],
      },
    ],
  },
  {
    id: "students-parents",
    label: "Students & Parents",
    href: "/admin/students-parents",
    publicHref: "/notices",
    description: "Manage circulars, downloadable documents, student guidelines, and alumni network.",
    groups: [
      {
        heading: "Notices & Records",
        items: [
          {
            label: "Official Notices & Circulars",
            href: "/admin/students-parents/notices",
            publicHref: "/notices",
            description: "Administrative circulars, exam dates, and student announcements.",
          },
          {
            label: "Downloads & Public Records",
            href: "/admin/students-parents/downloads",
            publicHref: "/downloads",
            description: "PDF forms, syllabus downloads, certificates, and academic calendars.",
            isDownloadOrDocument: true,
          },
          {
            label: "General Instructions & Rules",
            href: "/admin/students-parents/instructions",
            publicHref: "/general-instructions",
            description: "School discipline, code of conduct, uniform guidelines, and attendance rules.",
          },
          {
            label: "Alumni Corner & Reunion",
            href: "/admin/students-parents/alumni",
            publicHref: "/alumni",
            description: "Alumni profiles, reunion information, and graduate achievements.",
          },
        ],
      },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    href: "/admin/contact",
    publicHref: "/contact",
    description: "Manage administrative directory, office phones, coordinators, and campus map directions.",
    groups: [
      {
        heading: "Directory & Campus Location",
        items: [
          {
            label: "Contact Us & Directory",
            href: "/admin/contact/directory",
            publicHref: "/contact",
            description: "Official campus phone directory, department extensions, and email addresses.",
          },
          {
            label: "How to Reach Campus",
            href: "/admin/contact/location",
            publicHref: "/contact#location",
            description: "Campus address, driving directions from Ballia/Rasra, and map embed.",
          },
        ],
      },
    ],
  },
];

export const adminWorkspaces: AdminWorkspace[] = [
  {
    title: "Home",
    href: "/admin",
    publicHref: "/",
    breadcrumbs: ["Admin", "Home"],
    description: "Devasthaly Vidyapeeth Administration Overview. Manage public site content and navigation.",
  },
];

for (const section of adminSections) {
  const childItems = section.groups.flatMap((g) =>
    g.items.map((i) => ({ label: i.label, href: i.href, badge: i.badge }))
  );

  adminWorkspaces.push({
    title: section.label,
    href: section.href,
    publicHref: section.publicHref,
    sectionId: section.id,
    breadcrumbs: ["Admin", section.label],
    description: section.description,
    childItems,
  });

  for (const group of section.groups) {
    for (const item of group.items) {
      adminWorkspaces.push({
        title: item.label,
        href: item.href,
        publicHref: item.publicHref,
        badge: item.badge,
        sectionId: section.id,
        description: item.description,
        isDownloadOrDocument: item.isDownloadOrDocument,
        breadcrumbs: [
          "Admin",
          section.label,
          ...(group.heading ? [group.heading] : []),
          item.label,
        ],
      });
    }
  }
}

const workspaceByHref = new Map(
  adminWorkspaces.map((workspace) => [workspace.href, workspace]),
);

export function getAdminWorkspace(href: string): AdminWorkspace | undefined {
  return workspaceByHref.get(href);
}

export function getAdminSectionId(href: string): string | null {
  return (
    adminSections.find(
      (section) =>
        href === section.href ||
        href.startsWith(`${section.href}/`) ||
        section.groups.some((group) =>
          group.items.some((item) => item.href === href),
        ),
    )?.id ?? null
  );
}
