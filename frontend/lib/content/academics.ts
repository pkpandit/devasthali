import type { BoardTopper, FacultyMember, SchoolEvent } from "@/types/content";

export const TOPPERS_DATA: BoardTopper[] = [
  {
    name: "Priya Singh",
    score: "98.4%",
    grade: "Class XII",
    stream: "Science (PCM)",
    year: "2024",
    achievement: "District Rank 1 | Currently pursuing B.Tech at IIT Roorkee",
    photoUrl: "/images/academics/toppers/topper-priya.jpg",
  },
  {
    name: "Aman Kumar Verma",
    score: "97.8%",
    grade: "Class X",
    year: "2024",
    achievement: "School Topper & 100/100 in Mathematics & Science",
    photoUrl: "/images/academics/toppers/topper-aman.jpg",
  },
  {
    name: "Shweta Tiwari",
    score: "97.2%",
    grade: "Class XII",
    stream: "Commerce",
    year: "2024",
    achievement: "Qualified CUET with 99.8th percentile | SRCC New Delhi",
    photoUrl: "/images/academics/toppers/topper-shweta.jpg",
  },
  {
    name: "Rohan Upadhyay",
    score: "96.6%",
    grade: "Class XII",
    stream: "Science (PCB)",
    year: "2023",
    achievement: "Cleared NEET UG in First Attempt (AIR 1420)",
    photoUrl: "/images/academics/toppers/topper-rohan.jpg",
  },
];

export const TOPPER_IMAGE_MAP: Record<string, string> = {
  "Priya Singh": "/images/academics/toppers/topper-priya.jpg",
  "Aman Kumar Verma": "/images/academics/toppers/topper-aman.jpg",
  "Shweta Tiwari": "/images/academics/toppers/topper-shweta.jpg",
  "Rohan Upadhyay": "/images/academics/toppers/topper-rohan.jpg",
};

export const FACULTY_DATA: FacultyMember[] = [
  {
    name: "Dr. K. N. Pandey",
    designation: "Principal & Academic Director",
    department: "Administration & Science",
    qualification: "M.Sc. (Physics), M.Ed., Ph.D. in Education",
    experienceYears: 24,
    photoUrl: "/images/leadership/principal-mentor.jpg",
  },
  {
    name: "Smt. Manorama Singh",
    designation: "Vice Principal & Head of Senior Secondary",
    department: "English & Humanities",
    qualification: "M.A. (English Literature), B.Ed., PGCTE",
    experienceYears: 20,
    photoUrl: "/images/academics/faculty/faculty-vice-principal.jpg",
  },
  {
    name: "Shri Rajeshwar Nath Rai",
    designation: "Post Graduate Teacher (PGT)",
    department: "Mathematics",
    qualification: "M.Sc. (Mathematics), B.Ed.",
    experienceYears: 18,
    photoUrl: "/images/academics/faculty/faculty-math-teacher.jpg",
  },
  {
    name: "Dr. Alok Srivastava",
    designation: "Post Graduate Teacher (PGT)",
    department: "Chemistry & NEET Coordinator",
    qualification: "M.Sc. (Organic Chemistry), Ph.D., B.Ed.",
    experienceYears: 16,
    photoUrl: "/images/academics/faculty/faculty-chemistry-teacher.jpg",
  },
  {
    name: "Smt. Priyanka Mishra",
    designation: "Trained Graduate Teacher (TGT)",
    department: "Science & Biology",
    qualification: "M.Sc. (Botany), B.Ed.",
    experienceYears: 12,
    photoUrl: "/images/academics/faculty/faculty-biology-teacher.jpg",
  },
  {
    name: "Shri Devendra Yadav",
    designation: "Physical Education Director & Sports Head",
    department: "Physical Education",
    qualification: "M.P.Ed., NIS Certified Cricket Coach",
    experienceYears: 15,
    photoUrl: "/images/academics/faculty/faculty-sports-director.jpg",
  },
  {
    name: "Shri Arvind Kumar Shukla",
    designation: "Post Graduate Teacher (PGT)",
    department: "Computer Science & AI",
    qualification: "M.Tech (CSE), B.Ed., Python & Robotics Certified",
    experienceYears: 14,
    photoUrl: "/images/academics/faculty/faculty-teachers.jpg",
  },
  {
    name: "Dr. Sunita Upadhyay",
    designation: "Post Graduate Teacher (PGT)",
    department: "Social Science & Hindi",
    qualification: "M.A. (History & Hindi), Ph.D., B.Ed.",
    experienceYears: 17,
    photoUrl: "/images/academics/faculty/faculty-teachers.jpg",
  },
];

export const FACULTY_IMAGE_MAP: Record<string, string> = {
  "Dr. K. N. Pandey": "/images/leadership/principal-mentor.jpg",
  "Smt. Manorama Singh": "/images/academics/faculty/faculty-vice-principal.jpg",
  "Shri Rajeshwar Nath Rai": "/images/academics/faculty/faculty-math-teacher.jpg",
  "Dr. Alok Srivastava": "/images/academics/faculty/faculty-chemistry-teacher.jpg",
  "Smt. Priyanka Mishra": "/images/academics/faculty/faculty-biology-teacher.jpg",
  "Shri Devendra Yadav": "/images/academics/faculty/faculty-sports-director.jpg",
  "Shri Arvind Kumar Shukla": "/images/academics/faculty/faculty-teachers.jpg",
  "Dr. Sunita Upadhyay": "/images/academics/faculty/faculty-teachers.jpg",
};

export const ACADEMIC_EVENTS: SchoolEvent[] = [
  {
    id: "evt-01",
    title: "Commencement of New Academic Session 2026–27",
    date: "April 2026",
    timeSlot: "8:00 AM – 2:00 PM",
    venue: "Main Campus, Chilkahar",
    description: "Orientation and commencement of classes for LKG to Class XII.",
    isPublic: true,
  },
  {
    id: "evt-02",
    title: "CBSE Board Examination Practical & Written Assessments",
    date: "February – March 2026",
    timeSlot: "9:30 AM – 1:30 PM",
    venue: "Designated Examination Centres",
    description: "Annual CBSE Board exams for Class X and Class XII students.",
    isPublic: true,
  },
];
