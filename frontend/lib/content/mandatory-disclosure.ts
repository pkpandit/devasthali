import type {
  MandatoryGeneralInfo,
  MandatoryComplianceDoc,
  MandatoryStaffDetail,
  MandatoryInfraDetail,
} from "@/types/content";

export const MANDATORY_GENERAL_INFO: MandatoryGeneralInfo[] = [
  { sno: "01", info: "NAME OF THE SCHOOL", details: "DEVASTHALY VIDYAPEETH" },
  { sno: "02", info: "AFFILIATION NO.(IF APPLICABLE)", details: "2130238" },
  { sno: "03", info: "SCHOOL CODE (IF APPLICABLE)", details: "70184" },
  { sno: "04", info: "COMPLETE ADDRESS WITH PIN CODE", details: "CHILKAHAR, BALLIA- 221701" },
  { sno: "05", info: "PRINCIPAL NAME & QUALIFICATION:", details: "MR. PREM CHANDRA SHRIVASTAVA (M.A., B.Ed.)" },
  { sno: "06", info: "SCHOOL EMAIL ID", details: "principaldvp@gmail.com" },
  { sno: "07", info: "CONTACT DETAILS (LANDLINE/MOBILE)", details: "9554960408" },
];

export const MANDATORY_COMPLIANCE_DOCS: MandatoryComplianceDoc[] = [
  { sno: "01", doc: "GENERAL INFORMATION (APPENDIX-IX)", file: "/documents/original/general-information-1.pdf" },
  { sno: "02", doc: "Letter of Affiliation Upgradation", file: "/documents/original/affliation-certificate-2025.pdf" },
  { sno: "03", doc: "COPIES OF SOCIETY/ TRUST/ COMPANY REGISTRATION/ RENEWAL CERTIFICATE, AS APPLICABLE", file: "/documents/original/trustsociety.pdf" },
  { sno: "04", doc: "COPY OF NO OBJECTION CERTIFICATE (NOC) ISSUED, IF APPLICABLE, BY THE STATE GOVT./UT", file: "/documents/original/noc.pdf" },
  { sno: "05", doc: "COPIES OF RECOGNITION CERTIFICATE UNDER RTE ACT, 2009, AND IT'S RENEWAL IF APPLICABLE", file: "/documents/original/school-recognition.pdf" },
  { sno: "06", doc: "COPY OF VALID BUILDING SAFETY CERTIFICATE AS PER THE NATIONAL BUILDING CODE", file: "/documents/original/building-safety.pdf" },
  { sno: "07", doc: "COPY OF VALID FIRE SAFETY CERTIFICATE ISSUED BY THE COMPETENT AUTHORITY", file: "/documents/original/fire-service-_-uttar-pradesh-3.pdf" },
  { sno: "08", doc: "COPY OF THE DEO CERTIFICATE SUBMITTED BY THE SCHOOL FOR AFFILIATION", file: "/documents/original/deo.pdf" },
  { sno: "09", doc: "COPIES OF VALID WATER, HEALTH AND SANITATION CERTIFICATES", file: "/documents/original/health1_health2_merged-1.pdf" },
];

export const MANDATORY_RESULTS_ACADEMICS: MandatoryComplianceDoc[] = [
  { sno: "1", doc: "Fee Structure 2026-27", file: "/documents/original/new-admission-chart-2026-27.pdf" },
  { sno: "2", doc: "Annual School Calendar 2025-26", file: "/documents/original/holydays-calender-2025-26.pdf" },
  { sno: "3", doc: "List of School Management Committee (SMC)", file: "/documents/original/list-of-school-management-2025-26.pdf" },
  { sno: "4", doc: "List of Parents Teachers Association (PTA) Members", file: "/documents/original/list-of-parent-teacher-2025-26.pdf" },
  { sno: "5", doc: "Self Certification Proforma", file: "/documents/original/self-certification-proforma.pdf" },
];

export const MANDATORY_STAFF_DETAILS: MandatoryStaffDetail[] = [
  { sno: "1", info: "PRINCIPAL", details: "MR. PREM CHANDRA SHRIVASTAVA" },
  { sno: "2", info: "TOTAL NO. OF TEACHERS", details: "96" },
  { sno: "", info: "• PGT", details: "33" },
  { sno: "", info: "• TGT", details: "29" },
  { sno: "", info: "• PRT", details: "28" },
  { sno: "", info: "• PTI", details: "3" },
  { sno: "3", info: "TEACHERS SECTION RATIO", details: "1 : 1.5" },
  { sno: "4", info: "DETAILS OF SPECIAL EDUCATOR", details: "APPOINTED" },
  { sno: "5", info: "DETAILS OF COUNSELLOR AND WELLNESS TEACHER", details: "APPOINTED" },
];

export const MANDATORY_INFRA_DETAILS: MandatoryInfraDetail[] = [
  { sno: "1", info: "TOTAL CAMPUS AREA OF THE SCHOOL (IN SQUARE MTR)", details: "202343 Sq. Mtr. (50 Acres)" },
  { sno: "2", info: "NO AND SIZE OF CLASS ROOMS (IN SQ MTR)", details: "60 Rooms (48 Sq. Mtr. each)" },
  { sno: "3", info: "NO AND SIZE OF LABORATORIES INCLUDING COMPUTER LABS (IN SQ MTR)", details: "6 Labs (100 Sq. Mtr. each)" },
  { sno: "4", info: "INTERNET FACILITY (Y/N)", details: "YES (High-speed broadband)" },
  { sno: "5", info: "NO. OF GIRLS TOILETS", details: "40" },
  { sno: "6", info: "NO. OF BOYS TOILETS", details: "40" },
  { sno: "7", info: "LINK OF YOUTUBE VIDEO OF THE INSPECTION OF SCHOOL COVERING THE INFRASTRUCTURE OF THE SCHOOL", details: "AVAILABLE" },
];
