import React from "react";
import { SCHOOL_INFO, FAQ_DATA } from "@/lib/school-data";

export function LocalSeoSchema() {
  const schoolSchema = {
    "@context": "https://schema.org",
    "@type": "School",
    "@id": "https://devasthalyballia.com/#school",
    name: SCHOOL_INFO.name,
    alternateName: ["Devasthaly Vidyapeeth Chilkahar", "Devasthali Vidyapeeth Ballia"],
    url: "https://devasthalyballia.com",
    logo: "https://devasthalyballia.com/images/branding/devasthalyballia.webp",
    image: "https://devasthalyballia.com/images/about/campus-showcase.jpg",
    foundingDate: "1988",
    description: "Devasthaly Vidyapeeth is a premier CBSE-affiliated co-educational residential and day-boarding school in Chilkahar, Ballia, Uttar Pradesh, established in 1988.",
    telephone: SCHOOL_INFO.contacts.admissionsPhone,
    email: SCHOOL_INFO.contacts.email,
    identifier: `CBSE Affiliation No. ${SCHOOL_INFO.affiliationNo}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: SCHOOL_INFO.address.campus,
      addressLocality: SCHOOL_INFO.address.district,
      addressRegion: "Uttar Pradesh",
      postalCode: SCHOOL_INFO.address.pinCode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 25.8624,
      longitude: 84.0215,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:00",
        closes: "15:30",
      },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: SCHOOL_INFO.contacts.admissionsPhone,
        contactType: "admissions",
        areaServed: ["IN", "UP", "Ballia", "Rasra"],
        availableLanguage: ["English", "Hindi"],
      },
      {
        "@type": "ContactPoint",
        telephone: SCHOOL_INFO.contacts.hostelWardenPhone,
        contactType: "hostel warden",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_DATA.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schoolSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
