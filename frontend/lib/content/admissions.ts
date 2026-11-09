import type { AdmissionStep, FeePageItem } from "@/types/content";

export const ADMISSION_STEPS: AdmissionStep[] = [
  {
    step: "01",
    title: "Registration & Prospectus",
    description:
      "Parents can submit the online enquiry form or collect the hardcopy registration prospectus from the school administrative desk at Chilkahar campus.",
    badge: "Step 1",
  },
  {
    step: "02",
    title: "Diagnostic Interaction / Assessment",
    description:
      "For Foundational classes (LKG to Class 1), an informal parent-child interaction takes place. For Classes 2 to 9 and 11, a written diagnostic assessment is conducted.",
    badge: "Step 2",
  },
  {
    step: "03",
    title: "Document Verification",
    description:
      "Upon clearing the assessment, submit original Transfer Certificate (countersigned by CBSE/State Board), report cards, birth certificate, and Aadhaar copy.",
    badge: "Step 3",
  },
  {
    step: "04",
    title: "Provisional Admission & Fee Deposit",
    description:
      "Complete enrolment by depositing first quarter admission dues via online bank gateway or campus counter, securing day-scholar or boarding hostel seat.",
    badge: "Step 4",
  },
];

export const FEE_PAGES: FeePageItem[] = [
  {
    page: 1,
    src: "/images/admissions/fees/Fee-Structure-26-27_page-0001.jpg",
    title: "Fee Structure 2026–27 - Page 1",
  },
  {
    page: 2,
    src: "/images/admissions/fees/Fee-Structure-26-27_page-0002.jpg",
    title: "Fee Structure 2026–27 - Page 2",
  },
  {
    page: 3,
    src: "/images/admissions/fees/Fee-Structure-26-27_page-0003.jpg",
    title: "Fee Structure 2026–27 - Page 3",
  },
  {
    page: 4,
    src: "/images/admissions/fees/Fee-Structure-26-27_page-0004.jpg",
    title: "Fee Structure 2026–27 - Page 4",
  },
  {
    page: 5,
    src: "/images/admissions/fees/Fee-Structure-26-27_page-0005.jpg",
    title: "Fee Structure 2026–27 - Page 5",
  },
];

export const ADMISSION_DOCUMENTS_REQUIRED = [
  "Original Transfer Certificate (TC) countersigned by competent education authority",
  "Photocopy of Student's Birth Certificate (Municipal or Gram Panchayat)",
  "Report Card / Marksheet of previous passed academic class",
  "Photocopy of Student and Parent Aadhaar Cards",
  "Six recent passport-sized color photographs of the student",
  "Category certificate (SC/ST/OBC/EWS) if applicable",
  "Medical fitness certificate signed by registered MBBS medical practitioner",
];
