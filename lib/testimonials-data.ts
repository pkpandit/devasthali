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

/**
 * GENUINE APPROVED TESTIMONIALS DATA
 * Provenance: Extracted from existing homepage parent testimonials.
 * Preserves exact wording, attribution, and designations without alteration.
 */
export const APPROVED_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "tiwari-residential",
    author: "Shri Rajeshwar Tiwari",
    relationship: "Parent of Class IX Boarding Scholar • Rasra",
    subject: "Residential Care & Academic Discipline",
    quote:
      "Enrolling our son in Devasthaly Vidyapeeth’s residential wing was the best decision for his discipline. The teachers take personal ownership of every boarder’s study routine, and the evening study supervision has produced wonderful academic gains.",
    rating: 5,
    monogram: "RT",
    approved: true,
    provenance: "Homepage Section 8 parent review record",
  },
  {
    id: "pandey-safety-care",
    author: "Dr. Sunita Pandey",
    relationship: "Parent of Class VI Day-Scholar • Ballia City",
    subject: "Safety, Care & English Confidence",
    quote:
      "As a doctor working long hours in Ballia, safety and English speaking confidence were our top priorities. Devasthaly delivers on both counts with remarkable teachers, strict anti-bullying policies, and safe GPS-tracked bus transportation.",
    rating: 5,
    monogram: "SP",
    approved: true,
    provenance: "Homepage Section 8 parent review record",
  },
];

