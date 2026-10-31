export interface NoticeItem {
  id: string;
  title: string;
  category: "Circular" | "Examination" | "Admission" | "Event";
  date: string;
  isNew?: boolean;
  fileUrl?: string;
  fileSize?: string;
}

export interface BoardTopper {
  name: string;
  score: string;
  grade: "Class X" | "Class XII";
  stream?: string;
  year: string;
  achievement: string;
}

export interface FacilityItem {
  id: string;
  title: string;
  category: "Academic" | "Residential" | "Sports" | "Transport" | "Wellness";
  description: string;
  iconName: string;
  highlights: string[];
}

export interface FacultyMember {
  name: string;
  designation: string;
  department: string;
  qualification: string;
  experienceYears: number;
}

export const SCHOOL_INFO = {
  name: "Devasthaly Vidyapeeth",
  tagline: "Nurturing Academic Rigour, Moral Character & Leadership Since 1988",
  shortDesc: "Ballia's premier CBSE co-educational residential and day-boarding institution.",
  affiliationNo: "2130238",
  schoolCode: "70184",
  establishedYear: 1988,
  legacyYears: "38+",
  type: "Co-educational, Residential & Day-Boarding",
  medium: "English Medium (CBSE Affiliated, New Delhi)",
  grades: "LKG to Class XII (Science, Commerce, Humanities)",
  address: {
    campus: "Chilkahar",
    tehsil: "Rasra",
    district: "Ballia",
    state: "Uttar Pradesh",
    pinCode: "277123",
    landmark: "Near Chilkahar Railway Crossing / Ballia-Rasra State Highway",
  },
  contacts: {
    primaryPhone: "9554960408",
    admissionsPhone: "9554960408",
    hostelWardenPhone: "6307010040",
    receptionPhone: "9554960415",
    vicePrincipalPhone: "6306580532",
    whatsappNumber: "919554960408",
    email: "principaldvp@gmail.com",
    officeEmail: "principaldvp@gmail.com",
    workingHours: "Monday – Saturday: 8:00 AM – 3:30 PM",
  },
  social: {
    facebook: "https://facebook.com/devasthalyvidyapeeth",
    youtube: "https://youtube.com/devasthalyvidyapeeth",
    instagram: "https://instagram.com/devasthalyvidyapeeth",
  },
  stats: [
    { label: "Years of Heritage", value: "36+", subtext: "Established in 1988" },
    { label: "CBSE Board Pass Rate", value: "100%", subtext: "Consistent Merit Ranks" },
    { label: "Lush Green Campus", value: "15+ Acres", subtext: "Eco-Friendly & Safe" },
    { label: "Student-Teacher Ratio", value: "1 : 25", subtext: "Personal Mentorship" },
    { label: "Alumni Across India", value: "3,500+", subtext: "IITs, AIIMS, Armed Forces" },
    { label: "Transport Nodes", value: "40+ Stops", subtext: "Ballia & Rasra Network" },
  ],
};

export const NOTICES_DATA: NoticeItem[] = [
  {
    id: "not-01",
    title: "Result of Entrance Exam held on 29.03.2026 Class – XI",
    category: "Examination",
    date: "29 Mar 2026",
    isNew: true,
    fileUrl: "/documents/original/entrance-2026-29th-march-2026-class-11.pdf",
    fileSize: "145 KB",
  },
  {
    id: "not-02",
    title: "Result of Entrance Exam held on 29.03.2026 Class – LKG to IX",
    category: "Examination",
    date: "29 Mar 2026",
    isNew: true,
    fileUrl: "/documents/original/entrance-2026-29th-march-2026-lkg-to-9th.pdf",
    fileSize: "262 KB",
  },
  {
    id: "not-03",
    title: "Official School Prospectus & Admission Guidelines",
    category: "Admission",
    date: "Session 2026-27",
    isNew: true,
    fileUrl: "/documents/original/prospectus-2.pdf",
    fileSize: "5.6 MB",
  },
  {
    id: "not-04",
    title: "Annual Holidays & Academic Calendar 2026-27",
    category: "Circular",
    date: "Academic Year 2026-27",
    isNew: true,
    fileUrl: "/documents/original/holydays-calender-2025-26.pdf",
    fileSize: "541 KB",
  },
  {
    id: "not-05",
    title: "Result of Entrance Exam held on 15.03.2026 Class – XI",
    category: "Examination",
    date: "15 Mar 2026",
    isNew: false,
    fileUrl: "/documents/original/class-11-entrance-2026-15th-march-2026.pdf",
    fileSize: "233 KB",
  },
  {
    id: "not-06",
    title: "Result of Entrance Exam held on 15.03.2026 Class – LKG to IX",
    category: "Examination",
    date: "15 Mar 2026",
    isNew: false,
    fileUrl: "/documents/original/class-lkg-to-9-entrance-2026-15th-march-2026.pdf",
    fileSize: "282 KB",
  },
  {
    id: "not-07",
    title: "Result of Entrance Exam held on 22.02.2026",
    category: "Examination",
    date: "22 Feb 2026",
    isNew: false,
    fileUrl: "/documents/original/entrance-2026-22nd-feb-2026.pdf",
    fileSize: "360 KB",
  },
];

export const TOPPERS_DATA: BoardTopper[] = [
  {
    name: "Priya Singh",
    score: "98.4%",
    grade: "Class XII",
    stream: "Science (PCM)",
    year: "2024",
    achievement: "District Rank 1 | Currently pursuing B.Tech at IIT Roorkee",
  },
  {
    name: "Aman Kumar Verma",
    score: "97.8%",
    grade: "Class X",
    year: "2024",
    achievement: "School Topper & 100/100 in Mathematics & Science",
  },
  {
    name: "Shweta Tiwari",
    score: "97.2%",
    grade: "Class XII",
    stream: "Commerce",
    year: "2024",
    achievement: "Qualified CUET with 99.8th percentile | SRCC New Delhi",
  },
  {
    name: "Rohan Upadhyay",
    score: "96.6%",
    grade: "Class XII",
    stream: "Science (PCB)",
    year: "2023",
    achievement: "Cleared NEET UG in First Attempt (AIR 1420)",
  },
];

export const FACILITIES_DATA: FacilityItem[] = [
  {
    id: "fac-smart-classes",
    title: "Interactive Smart Classrooms",
    category: "Academic",
    description: "Equipped with interactive digital smart-boards, high-resolution multimedia curriculum content, and ergonomic seating designed for engaging pedagogical delivery.",
    iconName: "MonitorPlay",
    highlights: ["Interactive Touch Panels", "NCERT 3D Digital Content", "Climate-controlled Ergonomics"],
  },
  {
    id: "fac-composite-labs",
    title: "Physics, Chemistry & Biology Laboratories",
    category: "Academic",
    description: "Fully certified, advanced laboratory infrastructure enabling students to perform hands-on experimentation under strict laboratory safety protocols.",
    iconName: "FlaskConical",
    highlights: ["Individual Workstations", "Safety Eye-Wash & First Aid", "Certified Faculty Supervision"],
  },
  {
    id: "fac-computer-ai-lab",
    title: "Advanced Computer & AI Tech Lab",
    category: "Academic",
    description: "Modern computer terminal suite with high-speed fiber internet, Python programming suites, robotics kits, and introductory AI curriculum for classes VI–XII.",
    iconName: "Cpu",
    highlights: ["1:1 Computer Ratio", "Gigabit Internet", "Robotics & Coding Curriculum"],
  },
  {
    id: "fac-hostel-mess",
    title: "Residential Hostels & Pure Veg Mess",
    category: "Residential",
    description: "Separate, secure air-cooled hostels for boys and girls with 24/7 dedicated resident wardens, CCTV corridors, and a pure vegetarian hygienic dining hall.",
    iconName: "Home",
    highlights: ["Separate Boys & Girls Wings", "4 Balanced Meals Daily", "Supervised Evening Study Halls"],
  },
  {
    id: "fac-sports-complex",
    title: "5+ Acre Sports & Athletics Complex",
    category: "Sports",
    description: "Dedicated turf cricket pitch, standard football field, outdoor basketball court, badminton arenas, and daily morning yoga sessions under trained NIS coaches.",
    iconName: "Trophy",
    highlights: ["Cricket Turf & Practice Nets", "Full-size Football Ground", "Daily Yoga & Martial Arts"],
  },
  {
    id: "fac-gps-transport",
    title: "Safe GPS-Tracked Transport Network",
    category: "Transport",
    description: "A well-maintained fleet of buses serving over 40 pick-up locations across Ballia, Rasra, Chilkahar, Sikanderpur, and nearby rural educational clusters.",
    iconName: "Bus",
    highlights: ["Real-time GPS Tracking", "Speed Governors & First Aid", "Experienced Drivers & Attendants"],
  },
  {
    id: "fac-library-reading",
    title: "Central Library & Resource Sanctum",
    category: "Academic",
    description: "Stocked with over 10,000 volumes encompassing curriculum references, Olympiad preparation materials, encyclopedias, national journals, and quiet study alcoves.",
    iconName: "BookOpen",
    highlights: ["10,000+ Curated Books", "Daily National Dailies & Magazines", "Digital E-Library Corner"],
  },
  {
    id: "fac-infirmary-care",
    title: "24/7 Campus Medical Care & Infirmary",
    category: "Wellness",
    description: "In-house healthcare unit staffed with a certified nurse and on-call medical practitioners with ambulance tie-ups for emergency hospital transit.",
    iconName: "HeartPulse",
    highlights: ["Resident Nurse on Duty", "Routine Student Health Checkups", "Emergency Hospital Tie-up"],
  },
];

export const FACULTY_DATA: FacultyMember[] = [
  {
    name: "Dr. K. N. Pandey",
    designation: "Principal & Academic Director",
    department: "Administration & Science",
    qualification: "M.Sc. (Physics), M.Ed., Ph.D. in Education",
    experienceYears: 24,
  },
  {
    name: "Smt. Manorama Singh",
    designation: "Vice Principal & Head of Senior Secondary",
    department: "English & Humanities",
    qualification: "M.A. (English Literature), B.Ed., PGCTE",
    experienceYears: 20,
  },
  {
    name: "Shri Rajeshwar Nath Rai",
    designation: "Post Graduate Teacher (PGT)",
    department: "Mathematics",
    qualification: "M.Sc. (Mathematics), B.Ed.",
    experienceYears: 18,
  },
  {
    name: "Dr. Alok Srivastava",
    designation: "Post Graduate Teacher (PGT)",
    department: "Chemistry & NEET Coordinator",
    qualification: "M.Sc. (Organic Chemistry), Ph.D., B.Ed.",
    experienceYears: 16,
  },
  {
    name: "Smt. Priyanka Mishra",
    designation: "Trained Graduate Teacher (TGT)",
    department: "Science & Biology",
    qualification: "M.Sc. (Botany), B.Ed.",
    experienceYears: 12,
  },
  {
    name: "Shri Devendra Yadav",
    designation: "Physical Education Director & Sports Head",
    department: "Physical Education",
    qualification: "M.P.Ed., NIS Certified Cricket Coach",
    experienceYears: 15,
  },
  {
    name: "Shri Arvind Kumar Shukla",
    designation: "Post Graduate Teacher (PGT)",
    department: "Computer Science & AI",
    qualification: "M.Tech (CSE), B.Ed., Python & Robotics Certified",
    experienceYears: 14,
  },
  {
    name: "Dr. Sunita Upadhyay",
    designation: "Post Graduate Teacher (PGT)",
    department: "Social Science & Hindi",
    qualification: "M.A. (History & Hindi), Ph.D., B.Ed.",
    experienceYears: 17,
  },
];

export const FAQ_DATA = [
  {
    question: "What is the procedure for admission to Devasthaly Vidyapeeth for 2025–26?",
    answer: "Admissions begin with submitting an online enquiry or collecting the registration prospectus from the school counter. For Foundational grades (LKG to Class 1), an informal parent-child interaction is conducted. For Classes 2 through 9 and 11, students undergo a written diagnostic assessment in English, Mathematics, and Science followed by document verification.",
  },
  {
    question: "Is Devasthaly Vidyapeeth affiliated with CBSE New Delhi?",
    answer: "Yes. Devasthaly Vidyapeeth is proudly affiliated with the Central Board of Secondary Education (CBSE), New Delhi, under Affiliation Number 2130238. We follow the NCERT curriculum strictly in accordance with NEP 2020 guidelines.",
  },
  {
    question: "What are the boarding and hostel facilities provided for residential students?",
    answer: "We offer separate, secure, air-cooled hostel residences for boys and girls. Facilities include 24/7 warden supervision, CCTV surveillance, 4 balanced pure vegetarian meals daily, mandatory evening supervised self-study with school teachers, sports coaching, and a 24/7 medical infirmary.",
  },
  {
    question: "Which bus routes does the school transport cover?",
    answer: "Our GPS-enabled bus network spans over 40 pick-up locations across Ballia City, Rasra Tehsil, Chilkahar, Sikanderpur, Nagra, and adjacent rural nodes. All buses are fitted with speed governors, CCTV cameras, and accompanied by trained attendants.",
  },
  {
    question: "Which subject streams are offered in Class XI and XII?",
    answer: "We offer three primary streams: Science (Physics, Chemistry, Mathematics / Biology with Computer Science or Physical Education), Commerce (Accountancy, Business Studies, Economics, Mathematics / Applied Math), and Humanities (History, Political Science, Geography, Economics, Hindi/English Core).",
  },
  {
    question: "Can parents pay school fees in installments?",
    answer: "Yes, school fees can be paid in four convenient quarterly installments (April, July, October, and January). We also support instant online payment through our Parent Portal via UPI, Debit/Credit Card, and Net Banking.",
  },
];
