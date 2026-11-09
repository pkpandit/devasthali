import type { FAQItem } from "@/types/content";

export const HOME_FACILITY_IMAGES: Record<string, string> = {
  "fac-smart-classes": "/images/home/hero/hero-students.jpg",
  "fac-composite-labs": "/images/facilities/science-lab.jpg",
  "fac-computer-ai-lab": "/images/home/hero/hero-bg.webp",
  "fac-hostel-mess": "/images/facilities/campus-grounds.jpg",
  "fac-sports-complex": "/images/facilities/sports-activities.jpg",
  "fac-gps-transport": "/images/facilities/campus-grounds.jpg",
  "fac-library-reading": "/images/leadership/principal-mentor.jpg",
  "fac-infirmary-care": "/images/academics/faculty/faculty-teachers.jpg",
};

export const HOME_TOPPER_IMAGES: Record<string, string> = {
  "Priya Singh": "/images/academics/toppers/topper-priya.jpg",
  "Aman Kumar Verma": "/images/academics/toppers/topper-aman.jpg",
  "Shweta Tiwari": "/images/academics/toppers/topper-shweta.jpg",
  "Rohan Upadhyay": "/images/academics/toppers/topper-rohan.jpg",
};

export const HOME_STATS = [
  {
    label: "Years of Heritage",
    value: "36+",
    subtext: "Established in 1988",
    image: "/images/about/campus-showcase.jpg",
    iconName: "Award",
    color: "text-[#B45309]",
    bg: "bg-amber-50/80",
    borderHover: "hover:border-[#B45309]/40",
    topGradient: "from-amber-500 to-amber-600",
    badge: "Legacy",
  },
  {
    label: "CBSE Board Pass Rate",
    value: "100%",
    subtext: "Consistent Merit Ranks",
    image: "/images/home/hero/hero-students.jpg",
    iconName: "Trophy",
    color: "text-[#B91C1C]",
    bg: "bg-red-50/80",
    borderHover: "hover:border-[#B91C1C]/40",
    topGradient: "from-red-600 to-[#B91C1C]",
    badge: "Excellence",
  },
  {
    label: "Lush Green Campus",
    value: "15+ Acres",
    subtext: "Eco-Friendly & Safe",
    image: "/images/facilities/campus-grounds.jpg",
    iconName: "Building",
    color: "text-[#047857]",
    bg: "bg-emerald-50/80",
    borderHover: "hover:border-[#047857]/40",
    topGradient: "from-emerald-500 to-emerald-600",
    badge: "Environment",
  },
  {
    label: "Student-Teacher Ratio",
    value: "1 : 25",
    subtext: "Personal Mentorship",
    image: "/images/leadership/principal-mentor.jpg",
    iconName: "GraduationCap",
    color: "text-[#1E40AF]",
    bg: "bg-blue-50/80",
    borderHover: "hover:border-[#1E40AF]/40",
    topGradient: "from-blue-600 to-[#1E40AF]",
    badge: "Care",
  },
  {
    label: "Alumni Across India",
    value: "3,500+",
    subtext: "IITs, AIIMS, Armed Forces",
    image: "/images/alumni/alumni-graduates.jpg",
    iconName: "Sparkles",
    color: "text-[#7C2D12]",
    bg: "bg-orange-50/80",
    borderHover: "hover:border-[#7C2D12]/40",
    topGradient: "from-orange-500 to-[#7C2D12]",
    badge: "Network",
  },
  {
    label: "Transport Nodes",
    value: "40+ Stops",
    subtext: "Ballia & Rasra Network",
    image: "/images/facilities/school-bus-fleet.jpg",
    iconName: "Bus",
    color: "text-[#4338CA]",
    bg: "bg-indigo-50/80",
    borderHover: "hover:border-[#4338CA]/40",
    topGradient: "from-indigo-500 to-[#4338CA]",
    badge: "Reach",
  },
];

export const HOME_FAQ_DATA: FAQItem[] = [
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
