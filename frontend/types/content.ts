// Domain Enums and Union Types matching Prisma Schema & Frontend Domain

export type Role =
  | "SUPER_ADMIN"
  | "PRINCIPAL"
  | "ADMISSIONS_OFFICER"
  | "TEACHER"
  | "STAFF";

export type AdmissionType = "DAY_SCHOLAR" | "RESIDENTIAL_BOARDER";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "CAMPUS_VISIT_BOOKED"
  | "EVALUATED"
  | "ADMISSION_OFFERED"
  | "ENROLLED"
  | "REJECTED";

export type NoticeCategory =
  | "CIRCULAR"
  | "EXAMINATION"
  | "ADMISSION"
  | "EVENT"
  | "Circular"
  | "Examination"
  | "Admission"
  | "Event";

export type DocumentCategory =
  | "CBSE_STATUTORY"
  | "ADMISSION_PROSPECTUS"
  | "STUDENT_FORM"
  | "ACADEMIC_CALENDAR";

export type GradeLevel =
  | "LKG"
  | "UKG"
  | "CLASS_1"
  | "CLASS_2"
  | "CLASS_3"
  | "CLASS_4"
  | "CLASS_5"
  | "CLASS_6"
  | "CLASS_7"
  | "CLASS_8"
  | "CLASS_9"
  | "CLASS_10"
  | "CLASS_11_SCIENCE"
  | "CLASS_11_COMMERCE"
  | "CLASS_11_HUMANITIES"
  | "CLASS_12_SCIENCE"
  | "CLASS_12_COMMERCE"
  | "CLASS_12_HUMANITIES";

export type FacilityCategory =
  | "Academic"
  | "Residential"
  | "Sports"
  | "Transport"
  | "Wellness";

export type GalleryCategory =
  | "Campus"
  | "Academics"
  | "Sports"
  | "Events"
  | "Hostel"
  | "Faculty"
  | "Achievements";

// ==========================================
// School Identity & Settings Interfaces
// ==========================================

export interface SchoolAddress {
  campus: string;
  tehsil: string;
  district: string;
  state: string;
  pinCode: string;
  landmark: string;
}

export interface SchoolContacts {
  primaryPhone: string;
  admissionsPhone: string;
  hostelWardenPhone: string;
  receptionPhone: string;
  vicePrincipalPhone: string;
  whatsappNumber: string;
  email: string;
  officeEmail: string;
  workingHours: string;
}

export interface SchoolSocial {
  facebook: string;
  youtube: string;
  instagram: string;
}

export interface StatMetric {
  label: string;
  value: string;
  subtext: string;
  image?: string;
  badge?: string;
}

export interface SchoolInfo {
  name: string;
  tagline: string;
  shortDesc: string;
  affiliationNo: string;
  schoolCode: string;
  establishedYear: number;
  legacyYears: string;
  type: string;
  medium: string;
  grades: string;
  address: SchoolAddress;
  contacts: SchoolContacts;
  social: SchoolSocial;
  stats: StatMetric[];
}

// ==========================================
// Academic & Campus Interfaces
// ==========================================

export interface NoticeItem {
  id: string;
  title: string;
  category: "Circular" | "Examination" | "Admission" | "Event" | NoticeCategory;
  date: string;
  isNew?: boolean;
  fileUrl?: string;
  fileSize?: string;
  summary?: string;
  content?: string;
}

export interface BoardTopper {
  name: string;
  score: string;
  grade: "Class X" | "Class XII" | string;
  stream?: string;
  year: string;
  achievement: string;
  photoUrl?: string;
}

export interface FacilityItem {
  id: string;
  title: string;
  category: FacilityCategory;
  description: string;
  iconName: string;
  highlights: string[];
  image?: string;
}

export interface FacultyMember {
  name: string;
  designation: string;
  department: string;
  qualification: string;
  experienceYears: number;
  photoUrl?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface TestimonialItem {
  id: string;
  author: string;
  relationship: string;
  subject?: string;
  quote: string;
  rating?: number;
  avatar?: string;
  monogram: string;
  approved: boolean;
  provenance: string;
}

// ==========================================
// Gallery Interfaces
// ==========================================

export interface GalleryPhoto {
  src: string;
  caption: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  category: GalleryCategory;
  coverImage: string;
  photos: GalleryPhoto[];
}

// ==========================================
// Leadership Messages
// ==========================================

export interface LeadershipMessage {
  role: string;
  title: string;
  name: string;
  subtitle: string;
  image: string;
  quote: string;
  message: string[];
  signatureImage?: string;
  qualifications?: string;
}

// ==========================================
// Statutory & Mandatory Disclosure
// ==========================================

export interface MandatoryGeneralInfo {
  sno: string;
  info: string;
  details: string;
}

export interface MandatoryComplianceDoc {
  sno: string;
  doc: string;
  file: string;
  size?: string;
}

export interface MandatoryStaffDetail {
  sno: string;
  info: string;
  details: string;
}

export interface MandatoryInfraDetail {
  sno: string;
  info: string;
  details: string;
}

export interface DocumentDownloadItem {
  title: string;
  size: string;
  file: string;
  category?: string;
}

export interface DownloadCategoryGroup {
  category: string;
  docs: DocumentDownloadItem[];
}

// ==========================================
// Admissions & Events
// ==========================================

export interface AdmissionStep {
  step: string;
  title: string;
  description: string;
  badge?: string;
}

export interface FeePageItem {
  page: number;
  src: string;
  title: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  timeSlot?: string;
  venue?: string;
  description: string;
  isPublic?: boolean;
}

// ==========================================
// Navigation Interfaces
// ==========================================

export interface NavItemChild {
  name: string;
  href: string;
  badge?: string;
}

export interface NavColumn {
  heading?: string;
  items: NavItemChild[];
}

export interface NavItem {
  name: string;
  href: string;
  panelType?: "compact" | "medium" | "mega";
  columns?: NavColumn[];
}

export interface FooterLinkItem {
  name: string;
  href: string;
}
