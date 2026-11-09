import type { NavItem, FooterLinkItem } from "@/types/content";

export const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  {
    name: "About Us",
    href: "/about",
    panelType: "mega",
    columns: [
      {
        heading: "Overview & Heritage",
        items: [
          { name: "About School & Heritage", href: "/about" },
          { name: "Vision and Mission", href: "/vision-mission" },
          {
            name: "CBSE Mandatory Disclosure",
            href: "/mandatory-public-disclosure",
          },
        ],
      },
      {
        heading: "Leadership Messages",
        items: [
          { name: "Founder’s Message", href: "/founders-message" },
          { name: "Patron’s Message", href: "/patrons-message" },
          { name: "President’s Message", href: "/presidents-message" },
          { name: "Manager’s Message", href: "/managers-message" },
          { name: "Principal’s Message", href: "/principals-message" },
        ],
      },
    ],
  },
  {
    name: "Academics",
    href: "/academics",
    panelType: "medium",
    columns: [
      {
        heading: "Curriculum & System",
        items: [
          { name: "Curriculum & CBSE Framework", href: "/academics" },
          { name: "Academic System & Assessment", href: "/academic-system" },
        ],
      },
      {
        heading: "Faculty & Achievements",
        items: [
          { name: "Faculty & Academic Mentors", href: "/faculty" },
          { name: "Board Results & Toppers", href: "/results" },
          { name: "Academic Calendar & Events", href: "/events" },
        ],
      },
    ],
  },
  {
    name: "Admissions",
    href: "/admissions",
    panelType: "medium",
    columns: [
      {
        heading: "Guidelines & Fees",
        items: [
          { name: "Admission Overview & Eligibility", href: "/admissions" },
          {
            name: "Admission Procedure & Entrance",
            href: "/admissions/procedure",
          },
          { name: "Fee Structure (2026–27)", href: "/admissions/fees" },
        ],
      },
      {
        heading: "Application & Prospectus",
        items: [
          { name: "School Prospectus", href: "/school-prospectus" },
          {
            name: "Online Admission Form",
            href: "/online-admission-form",
            badge: "Apply Now",
          },
        ],
      },
    ],
  },
  {
    name: "Life at School",
    href: "/facilities",
    panelType: "medium",
    columns: [
      {
        heading: "Campus & Boarding",
        items: [
          {
            name: "Campus Infrastructure & Facilities",
            href: "/facilities",
          },
          { name: "Hostels & Residential Care", href: "/facilities#hostel" },
          { name: "Safe Transport Network", href: "/facilities#transport" },
        ],
      },
      {
        heading: "Activities & Culture",
        items: [
          {
            name: "Co-Curricular Activities & Sports",
            href: "/co-curricular-activities",
          },
          { name: "Campus Photo Gallery", href: "/gallery" },
        ],
      },
    ],
  },
  {
    name: "Students & Parents",
    href: "/notices",
    panelType: "compact",
    columns: [
      {
        items: [
          { name: "Official Notices & Circulars", href: "/notices" },
          { name: "Downloads & Public Records", href: "/downloads" },
          { name: "General Instructions & Rules", href: "/general-instructions" },
          { name: "Alumni Corner & Reunion", href: "/alumni" },
        ],
      },
    ],
  },
  { name: "Contact", href: "/contact" },
];

export const footerAdmissionsLinks: FooterLinkItem[] = [
  { name: "Admissions 2026–27 Overview", href: "/admissions" },
  { name: "Admission Procedure & Guidelines", href: "/admissions/procedure" },
  { name: "Fee Schedule & Structure", href: "/admissions/fees" },
  { name: "School Prospectus (PDF)", href: "/school-prospectus" },
  { name: "Online Admission Form", href: "/online-admission-form" },
  { name: "CBSE Curriculum & Wings", href: "/academics" },
  { name: "Academic System & Assessment", href: "/academic-system" },
  { name: "Board Examination Results", href: "/results" },
];

export const footerLifeLinks: FooterLinkItem[] = [
  { name: "Campus Facilities & 15-Acre Grounds", href: "/facilities" },
  { name: "Residential Hostels & Mess", href: "/facilities#hostel" },
  { name: "Safe Transport Network", href: "/facilities#transport" },
  { name: "Co-Curricular Activities & Sports", href: "/co-curricular-activities" },
  { name: "Campus Photo Gallery", href: "/gallery" },
  { name: "Official Notices & Circulars", href: "/notices" },
  { name: "General Instructions & Rules", href: "/general-instructions" },
  { name: "Alumni Network & Reunion", href: "/alumni" },
];
