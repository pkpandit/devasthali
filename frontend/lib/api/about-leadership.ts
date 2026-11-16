import { z } from "zod";
import type {
  PublicAboutData,
  AboutSettingData,
  AboutCredentialData,
  AboutNarrativeSectionData,
  PublicVisionMissionData,
  VisionMissionSettingData,
  PublicLeadershipData,
  LeadershipMemberData,
} from "@/types/about-leadership";

// ==========================================
// ZOD SCHEMAS FOR PUBLIC API VALIDATION
// ==========================================

export const publicAboutSettingSchema = z
  .object({
    breadcrumb: z.string().min(1),
    heading: z.string().min(1),
    subheading: z.string().min(1),
    showcaseImageUrl: z.string().nullable().optional(),
    showcaseImageAlt: z.string().nullable().optional(),
    showcaseBadge: z.string().nullable().optional(),
  })
  .nullable();

export const publicAboutCredentialSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  title: z.string().min(1),
  subtext: z.string().min(1),
  iconName: z.string().nullable().optional(),
  displayOrder: z.number(),
});

export const publicAboutNarrativeSectionSchema = z.object({
  id: z.string().min(1),
  heading: z.string().nullable().optional(),
  body: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  imageAlt: z.string().nullable().optional(),
  displayOrder: z.number(),
});

export const publicAboutResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    setting: publicAboutSettingSchema,
    credentials: z.array(publicAboutCredentialSchema),
    narrativeSections: z.array(publicAboutNarrativeSectionSchema),
  }),
});

export const publicVisionMissionSettingSchema = z
  .object({
    breadcrumb: z.string().min(1),
    heading: z.string().min(1),
    subheading: z.string().min(1),
    visionTitle: z.string().min(1),
    visionBody: z.string().min(1),
    visionIcon: z.string().nullable().optional(),
    missionTitle: z.string().min(1),
    missionBody: z.string().min(1),
    missionIcon: z.string().nullable().optional(),
  })
  .nullable();

export const publicCoreValueSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  iconName: z.string().nullable().optional(),
  displayOrder: z.number(),
});

export const publicVisionMissionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    setting: publicVisionMissionSettingSchema,
    coreValues: z.array(publicCoreValueSchema),
  }),
});

export const publicLeadershipMemberSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["FOUNDER", "PATRON", "PRESIDENT", "MANAGER", "PRINCIPAL"]),
  slug: z.string().min(1),
  pageTitle: z.string().min(1),
  breadcrumb: z.string().min(1),
  badgeText: z.string().min(1),
  name: z.string().min(1),
  designation: z.string().min(1),
  termOrAffiliation: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  shortIntro: z.string().min(1),
  quote: z.string().nullable().optional(),
  messageBody: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  imageAlt: z.string().nullable().optional(),
  signatureImageUrl: z.string().nullable().optional(),
  signatureAlt: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  ctaLabel: z.string().nullable().optional(),
  ctaHref: z.string().nullable().optional(),
  displayOrder: z.number(),
});

export const publicLeadershipListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    members: z.array(publicLeadershipMemberSchema),
  }),
});

export const publicLeadershipSingleResponseSchema = z.object({
  success: z.boolean(),
  data: publicLeadershipMemberSchema,
});

// ==========================================
// STATIC FALLBACKS
// ==========================================

export const STATIC_FALLBACK_ABOUT_SETTING: AboutSettingData = {
  breadcrumb: "Home / About School",
  heading: "About School",
  subheading:
    "Devasthaly Vidyapeeth — Imparting comprehensive modern education with valuable Indian traditions since 2nd October 1988.",
  showcaseImageUrl: "/images/gallery/image-1-1.webp",
  showcaseImageAlt: "Devasthaly Vidyapeeth Campus Academic Block",
  showcaseBadge: "Estd. 1988",
};

export const STATIC_FALLBACK_ABOUT_CREDENTIALS: AboutCredentialData[] = [
  {
    id: "cred-1",
    category: "Affiliation",
    title: "CBSE No. 2133848",
    subtext: "School Code: 71922",
    iconName: "ShieldCheck",
    displayOrder: 0,
  },
  {
    id: "cred-2",
    category: "Heritage",
    title: "Founded in 1988",
    subtext: "2nd October 1988",
    iconName: "Award",
    displayOrder: 1,
  },
  {
    id: "cred-3",
    category: "Campus",
    title: "Chilkahar, Ballia",
    subtext: "Ballia-Lucknow Highway",
    iconName: "Building",
    displayOrder: 2,
  },
  {
    id: "cred-4",
    category: "Founder",
    title: "Chandra Shekhar",
    subtext: "Former Prime Minister",
    iconName: "GraduationCap",
    displayOrder: 3,
  },
];

export const STATIC_FALLBACK_ABOUT_NARRATIVES: AboutNarrativeSectionData[] = [
  {
    id: "narrative-1",
    heading: null,
    body:
      'Devasthaly Vidyapeeth was founded on the 2nd October 1988 with the prime aim of imparting a comprehensive modern education to the children with valuable Indian tradition of education , irrespective of caste, creed and community. "Devasthaly Vidyapeeth was established under the vision of our founder, Ex-Prime Minister of India, Mr. Chandra Shekhar ."',
    imageUrl: null,
    imageAlt: null,
    displayOrder: 0,
  },
  {
    id: "narrative-2",
    heading: null,
    body:
      "The institute is located in plush premises at Devasthaly, surrounded by attractive healthy, natural environment that creates favourable academic conditions for alround development of children. Since the day of inception it has been determined to scale an unparalleled new graph of success to impart it to the children.",
    imageUrl: null,
    imageAlt: null,
    displayOrder: 1,
  },
  {
    id: "narrative-3",
    heading: null,
    body:
      "We want our children to imbibe moral values in life. At present the rapid changes in technology and accelerated pace of privatisation and liberalisation created a new sense of uncertainity about the future of society. Thus education should respond meaningfully and effectively to address the crucial academic burning issues. Devasthaly Vidyapeeth in its efforts is providing need-based quality education to the blossoming knowledge which has decided to equip the children will pragmatic skills so that they can face the future with renewed confidence and matchless courage. The president of school is always nurturing the institute keeping sight and presenting all the facilities with help of management committee.",
    imageUrl: null,
    imageAlt: null,
    displayOrder: 2,
  },
];

export const STATIC_FALLBACK_ABOUT: PublicAboutData = {
  setting: STATIC_FALLBACK_ABOUT_SETTING,
  credentials: STATIC_FALLBACK_ABOUT_CREDENTIALS,
  narrativeSections: STATIC_FALLBACK_ABOUT_NARRATIVES,
};

export const STATIC_FALLBACK_VISION_MISSION_SETTING: VisionMissionSettingData = {
  breadcrumb: "About School / Vision & Mission",
  heading: "Vision and Mission",
  subheading:
    "Guiding educational philosophy and institutional objectives of Devasthaly Vidyapeeth.",
  visionTitle: "Our Vision & Establishment",
  visionBody:
    "To meet a long-felt need of providing quality educational facilities to our younger children, Devasthaly Vidyapeeth, Devasthaly, Ballia has been opened. The School is located 8kms. away from Rasra or 25kms. away from Ballia on Ballia-Lucknow State Highway.",
  visionIcon: "Compass",
  missionTitle: "Our Mission & Development Goals",
  missionBody:
    "The School was started on Oct., 2, 1988. It is an English medium institution co-educational and prepares students for CBSE examination. This institution aims at all round physical, mental moral and spiritual development of the child. Special care is taken to make the child a useful member of the society.",
  missionIcon: "Target",
};

export const STATIC_FALLBACK_VISION_MISSION: PublicVisionMissionData = {
  setting: STATIC_FALLBACK_VISION_MISSION_SETTING,
  coreValues: [],
};

export const STATIC_FALLBACK_LEADERSHIP_MEMBERS: Record<
  string,
  LeadershipMemberData
> = {
  "founders-message": {
    id: "leader-1",
    role: "FOUNDER",
    slug: "founders-message",
    pageTitle: "Founder’s Message | Devasthaly Vidyapeeth",
    breadcrumb: "About School / Leadership",
    badgeText: "Founder",
    name: "Shri Chandra Shekhar",
    designation: "Founder of Devasthaly Vidyapeeth",
    termOrAffiliation: "8th Prime Minister of India (1990–1991)",
    location: "Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)",
    shortIntro:
      "Shri Chandra Shekhar (8th Prime Minister of India, 1990–1991) — Founder of Devasthaly Vidyapeeth.",
    quote:
      "Devasthaly Vidyapeeth was established under the vision of our founder, Ex-Prime Minister of India, Mr. Chandra Shekhar, to empower rural youth through modern education rooted in timeless values.",
    messageBody:
      "Shri Chandra Shekhar was born on April 17, 1927, in a farmer’s family in village Ibrahimpatti in District Ballia, Uttar Pradesh. He was President of the Janata Party from 1977 to 1988. Shri Chandra Shekhar was attracted to politics from his student days and was known as a fire-brand idealist with revolutionary fervour. After his Master’s Degree in Political Science from Allahabad University (1950-51), he joined the Socialist Movement. He had the privilege of having been associated very closely with Acharya Narendra Dev. He was elected Secretary of the District Praja Socialist Party, Ballia. Within a year, he was elected Joint Secretary of the U.P. State Praja Socialist Party. In 1955-56 he took over as General Secretary of the U.P., State Praja Socialist Party. In 1962, he was elected to the Rajya Sabha from Uttar Pradesh. He joined the Indian National Congress in January 1965. In 1967 he was elected General Secretary of the Congress Parliamentary Party. As a Member of Parliament he made a mark by taking keen interest in espousing the cause of the downtrodden and pleading for policies for rapid social change. In this context, when he attacked the disproportionate growth of monopoly houses with State patronage, he came in conflict with the centres of power.Chandra Shekhar (8th Prime Minister of India, 1990–1991) was known as a \"Young Turk\" and a steadfast socialist leader who championed the cause of the poor, farmers, and the downtrodden. His vision was defined by ideological politics, grassroots connection, and a commitment to democratic values over personality-driven leadership.",
    imageUrl: "/images/leadership/chadrashekherji.webp",
    imageAlt: "Shri Chandra Shekhar - Founder of Devasthaly Vidyapeeth",
    signatureImageUrl: null,
    signatureAlt: null,
    bio: null,
    ctaLabel: null,
    ctaHref: null,
    displayOrder: 0,
  },
  "patrons-message": {
    id: "leader-2",
    role: "PATRON",
    slug: "patrons-message",
    pageTitle: "Patron’s Message | Devasthaly Vidyapeeth",
    breadcrumb: "About School / Leadership",
    badgeText: "Patron",
    name: "Shri Neeraj Shekhar",
    designation: "Patron",
    termOrAffiliation: "Member of Rajya Sabha • Patron",
    location: "Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)",
    shortIntro:
      "Address by Neeraj Shekhar, Member of Rajya Sabha — Patron, Devasthaly Vidyapeeth.",
    quote:
      "My father late Chandrashekhar Ji would always dream of progressing his native land in multidirectional aspects. His vision was to establish an institution that empowers the upcoming generation through quality education.",
    messageBody:
      "My father late Chandrashekhar Ji would always dream of progressing his native land in multidirectional aspects. He thought deeply and was firmly determined to impart the upcoming generation the quality education and to enrich their life so that they could lead the nation on the path of unprecedented glory. To materialise his this thought he decided to establish Devasthaly Vidyapeeth, a co-educational, English medium institution, which was founded on Oct. 2, 1988 at Devasthaly.\n\nIt was an inevitable need of that time of the district and purvanchal along with neighboring states like Bihar to have such a leading and dedicated institution. Since the day of its inception, it has achieved unprecedented success in its noble mission.\n\nSince then it has been inclined to achieve his desired motive providing its best services to make the children competent and to enrich their capability to lead a dignified and successful life.\n\nIt is a motif of grandiose to me that I have been inherited the devoir to patron the institution. It is not an institution but an embodiment of ideal education. It always tries to imbibe valuable Indian ethos along with modern education in children. In fact, it is an institution where values and knowledge run in same vein. May the Almighty empower us with his divine blessings to maintain the dignity and standard of the institution.",
    imageUrl: "/images/leadership/patron.webp",
    imageAlt: "Shri Neeraj Shekhar - Patron of Devasthaly Vidyapeeth",
    signatureImageUrl: null,
    signatureAlt: null,
    bio: null,
    ctaLabel: null,
    ctaHref: null,
    displayOrder: 1,
  },
  "presidents-message": {
    id: "leader-3",
    role: "PRESIDENT",
    slug: "presidents-message",
    pageTitle: "President’s Message | Devasthaly Vidyapeeth",
    breadcrumb: "About School / Leadership",
    badgeText: "President",
    name: "Ravishankar Singh",
    designation: "President",
    termOrAffiliation: "M.L.C • President",
    location: "Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)",
    shortIntro:
      "Address by Ravishankar Singh, M.L.C — President, Devasthaly Vidyapeeth.",
    quote:
      "Devasthaly Vidyapeeth was one of the dream projects of my Baba (Late Chandrashekhar Ji) because he believes that educational institutions are the last ray of hope for humanity.",
    messageBody:
      "Devasthaly Vidyapeeth, was one of the dream project of my Baba (Late Chandrashekhar Ji) because he believes that educational Institutions are the last rayof hope for the humanity. I would like to quote one of his statements through which we would feel his approach about children who are not getting proper nourishment and putting a big question mark to the society.",
    imageUrl: "/images/leadership/president.webp",
    imageAlt: "Ravishankar Singh - President of Devasthaly Vidyapeeth",
    signatureImageUrl: null,
    signatureAlt: null,
    bio: null,
    ctaLabel: null,
    ctaHref: null,
    displayOrder: 2,
  },
  "managers-message": {
    id: "leader-4",
    role: "MANAGER",
    slug: "managers-message",
    pageTitle: "Manager’s Message | Devasthaly Vidyapeeth",
    breadcrumb: "About School / Leadership",
    badgeText: "Manager",
    name: "Dr. Naveen Singh",
    designation: "Manager",
    termOrAffiliation: "Manager",
    location: "Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)",
    shortIntro:
      "Address by Dr. Naveen Singh — Manager, Devasthaly Vidyapeeth.",
    quote:
      "A child is an ocean of immense possibilities and it is our noble duty to fish-out pearls for them.",
    messageBody:
      'About 38 years ago Late Shri Chandrashekhar (Founder of Devasthaly) thoughts shaped a line "A child is an ocean of immense possibilities and it is our noble duty to fish-out pearls for them". Of course, every child possesses unique inherent quality but latent talents not elsewhere found in conjecture. Its utilisation needs alert parental care at home and continuous inspiration, encouragement, environment clubbed with timely redressal of problems at school. Teacher\'s responsibility is to inculcate moral values, self-realisation, patience, restrain, tolerance and dutifulness to build a sound character, besides academic enhancement, variable excellence and personality development. This must be done consistantly, as per child\'s needs which always differs from child to child. Students must set a goal of life based on merits and mental inclination and not on glamoured choices. Therefore, choice of a child must not be rediculed. Its hostilities must be weeded out by psycho counselling. Children are tender, to them cruelty and hurting remarks are shocking. Our aim is to make them good, smart, dynamic, alert, honest, dutiful, dispilined, compassionate and caring. They need us. So do we. In such a situation orignal thoughts and ideas (which are changing face of globe) will come forth like water from a fountain. Efforts should innovative coupled with classical method of learning. Technology and audio-visual devices too should be accomodated to bring out inner potentional of students. Hence, inspiration will be the point of origin. Our students should be versatile and good in math, music and marathon.',
    imageUrl: "/images/leadership/manager_sir.webp",
    imageAlt: "Dr. Naveen Singh - Manager of Devasthaly Vidyapeeth",
    signatureImageUrl: null,
    signatureAlt: null,
    bio: null,
    ctaLabel: null,
    ctaHref: null,
    displayOrder: 3,
  },
  "principals-message": {
    id: "leader-5",
    role: "PRINCIPAL",
    slug: "principals-message",
    pageTitle: "Principal’s Message | Devasthaly Vidyapeeth",
    breadcrumb: "About School / Leadership",
    badgeText: "Principal",
    name: "P. C. Shrivastava",
    designation: "Principal",
    termOrAffiliation: "Principal, Devasthaly Vidyapeeth",
    location: "Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)",
    shortIntro:
      "Address by P. C. Shrivastava — Principal, Devasthaly Vidyapeeth.",
    quote:
      "Devasthaly Vidyapeeth is an amalgamation of competent teachers, state-of-the-art infrastructure, an idyllic setting and an experienced administration, creating a safe and supportive environment for student growth.",
    messageBody:
      "Devasthaly Vidyapeeth is an amalgamation of competent teachers, state-of-the-art infrastructure, an idyllic setting and an experienced and efficient administration. The school came into existence with the vision of creating a safe and supportive environment for its students – to provide a perfect balance of academics, sports, artistic and social opportunities. Childhood, youth and learning should be a joy and we strive for that.\n\nDevasthaly Vidyapeeth aims at holistic growth and development of its students. The school's genuine concern ensures student's emotional growth along with intellectual excellence. This empowers them to develop their self esteem, self-awareness and self-confidence. Sharing ideas, analysing situations and expressing them confidently are essential skills which are honed here, through experiential learning. The school takes leadership seriously and our concern for character is a point of distinction. Our mission has never been narrow to prepare students for college, but rather to provide an experience which goes far beyond college requirements, addressing important personal aspects of growth and maturity.\n\nModern and secure infrastructure, pollution free environment, excellent pastoral care, nutritious and sumptuous vegetarian food are some of our strengths. While studying at Devasthaly Vidyapeeth, your ward is groomed to become a confident, articulate and enlightened young citizen, ready to step into global society with dignity, honour and integrity.\n\nWe believe in giving our students deep roots along with a set of strong wings which may carry them far and wide but still continue nourishing with rich moral values. In other words, our students are equipped to face the challenges of the rapidly changing world.",
    imageUrl: "/images/leadership/principal_sir.webp",
    imageAlt: "P. C. Shrivastava - Principal of Devasthaly Vidyapeeth",
    signatureImageUrl: "/images/leadership/principal-signature.webp",
    signatureAlt: "Principal Signature",
    bio: null,
    ctaLabel: null,
    ctaHref: null,
    displayOrder: 4,
  },
};

// ==========================================
// BACKEND ORIGIN RESOLUTION
// ==========================================

function getBackendOrigin(): string | null {
  if (process.env.INTERNAL_BACKEND_ORIGIN) {
    return process.env.INTERNAL_BACKEND_ORIGIN.replace(/\/+$/, "");
  }

  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://127.0.0.1:3001";
  }

  return null;
}

// ==========================================
// PUBLIC FETCH METHODS
// ==========================================

/**
 * Fetches public About School content from the backend API.
 * Uses 60s revalidation with Next.js cache.
 *
 * CRITICAL EMPTY-ARRAY INTEGRITY:
 * Empty published collections return [] and render empty.
 * Fallback is strictly for network error, non-200, or Zod validation failure.
 */
export async function getPublicAbout(): Promise<PublicAboutData> {
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return STATIC_FALLBACK_ABOUT;
  }

  const endpoint = `${backendOrigin}/api/public/about`;

  try {
    const res = await fetch(endpoint, {
      next: { revalidate: 60, tags: ["about-leadership"] },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[About] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return STATIC_FALLBACK_ABOUT;
    }

    const json = await res.json();
    const parsed = publicAboutResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[About] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return STATIC_FALLBACK_ABOUT;
    }

    return parsed.data.data;
  } catch (error) {
    console.warn(
      `[About] Failed to fetch about content from ${endpoint}. Using static fallback:`,
      error instanceof Error ? error.message : String(error)
    );
    return STATIC_FALLBACK_ABOUT;
  }
}

/**
 * Fetches public Vision & Mission content from the backend API.
 */
export async function getPublicVisionMission(): Promise<PublicVisionMissionData> {
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return STATIC_FALLBACK_VISION_MISSION;
  }

  const endpoint = `${backendOrigin}/api/public/vision-mission`;

  try {
    const res = await fetch(endpoint, {
      next: { revalidate: 60, tags: ["about-leadership"] },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[VisionMission] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return STATIC_FALLBACK_VISION_MISSION;
    }

    const json = await res.json();
    const parsed = publicVisionMissionResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[VisionMission] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return STATIC_FALLBACK_VISION_MISSION;
    }

    return parsed.data.data;
  } catch (error) {
    console.warn(
      `[VisionMission] Failed to fetch vision-mission from ${endpoint}. Using static fallback:`,
      error instanceof Error ? error.message : String(error)
    );
    return STATIC_FALLBACK_VISION_MISSION;
  }
}

/**
 * Fetches public Leadership list from the backend API.
 */
export async function getPublicLeadership(): Promise<PublicLeadershipData> {
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return {
      members: Object.values(STATIC_FALLBACK_LEADERSHIP_MEMBERS),
    };
  }

  const endpoint = `${backendOrigin}/api/public/leadership`;

  try {
    const res = await fetch(endpoint, {
      next: { revalidate: 60, tags: ["about-leadership"] },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[Leadership] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return {
        members: Object.values(STATIC_FALLBACK_LEADERSHIP_MEMBERS),
      };
    }

    const json = await res.json();
    const parsed = publicLeadershipListResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[Leadership] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return {
        members: Object.values(STATIC_FALLBACK_LEADERSHIP_MEMBERS),
      };
    }

    return parsed.data.data;
  } catch (error) {
    console.warn(
      `[Leadership] Failed to fetch leadership list from ${endpoint}. Using static fallback:`,
      error instanceof Error ? error.message : String(error)
    );
    return {
      members: Object.values(STATIC_FALLBACK_LEADERSHIP_MEMBERS),
    };
  }
}

/**
 * Fetches a single public leadership message by slug.
 *
 * UNPUBLISHED / DRAFT ISOLATION GUARANTEE:
 * If the member does not exist or is unpublished (backend returns 404),
 * this function returns NULL so the consuming page invokes notFound().
 * It NEVER returns static fallback for a 404 response.
 */
export async function getPublicLeadershipMember(
  slug: string
): Promise<LeadershipMemberData | null> {
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return STATIC_FALLBACK_LEADERSHIP_MEMBERS[slug] ?? null;
  }

  const endpoint = `${backendOrigin}/api/public/leadership/${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(endpoint, {
      next: { revalidate: 60, tags: ["about-leadership"] },
      headers: { Accept: "application/json" },
    });

    // 404 means the member is draft, unpublished, or doesn't exist
    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      console.warn(
        `[LeadershipMember] API returned HTTP ${res.status} for slug ${slug}. Using static fallback.`
      );
      return STATIC_FALLBACK_LEADERSHIP_MEMBERS[slug] ?? null;
    }

    const json = await res.json();
    const parsed = publicLeadershipSingleResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        `[LeadershipMember] Payload validation failed for slug ${slug}. Using static fallback.`,
        parsed.error.issues
      );
      return STATIC_FALLBACK_LEADERSHIP_MEMBERS[slug] ?? null;
    }

    return parsed.data.data;
  } catch (error) {
    console.warn(
      `[LeadershipMember] Failed to fetch leadership member ${slug} from ${endpoint}. Using static fallback:`,
      error instanceof Error ? error.message : String(error)
    );
    return STATIC_FALLBACK_LEADERSHIP_MEMBERS[slug] ?? null;
  }
}
