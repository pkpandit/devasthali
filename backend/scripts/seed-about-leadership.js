/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Idempotent Seed Script for Milestone 4:
 * About School, Vision & Mission, and Leadership Messages & Profiles.
 *
 * Rules:
 * - Creates singletons only when missing.
 * - Never overwrites existing admin-edited singletons on rerun.
 * - Seeds collections only when their tables are empty.
 * - Creates missing leadership member roles only; never overwrites existing roles.
 * - Uses exact verbatim text from the live public frontend pages.
 * - Uses root-relative static image paths (never absolute localhost URLs).
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: ".env" });
const prisma = new PrismaClient();

const ABOUT_SETTING_SEED = {
  id: "default",
  breadcrumb: "Home / About School",
  heading: "About School",
  subheading:
    "Devasthaly Vidyapeeth — Imparting comprehensive modern education with valuable Indian traditions since 2nd October 1988.",
  showcaseImageUrl: "/images/gallery/image-1-1.webp",
  showcaseImageStorageKey: null,
  showcaseImageAlt: "Devasthaly Vidyapeeth Campus Academic Block",
  showcaseBadge: "Estd. 1988",
  isPublished: true,
};

const ABOUT_CREDENTIALS_SEED = [
  {
    category: "Affiliation",
    title: "CBSE No. 2130103",
    subtext: "School Code: 70060",
    iconName: "ShieldCheck",
    displayOrder: 0,
    isPublished: true,
  },
  {
    category: "Heritage",
    title: "Founded in 1988",
    subtext: "2nd October 1988",
    iconName: "Award",
    displayOrder: 1,
    isPublished: true,
  },
  {
    category: "Campus",
    title: "Chilkahar, Ballia",
    subtext: "Ballia-Lucknow Highway",
    iconName: "Building",
    displayOrder: 2,
    isPublished: true,
  },
  {
    category: "Founder",
    title: "Chandra Shekhar",
    subtext: "Former Prime Minister",
    iconName: "GraduationCap",
    displayOrder: 3,
    isPublished: true,
  },
];

const ABOUT_NARRATIVE_SEED = [
  {
    heading: null,
    body:
      'Devasthaly Vidyapeeth was founded on the 2nd October 1988 with the prime aim of imparting a comprehensive modern education to the children with valuable Indian tradition of education , irrespective of caste, creed and community. "Devasthaly Vidyapeeth was established under the vision of our founder, Ex-Prime Minister of India, Mr. Chandra Shekhar ."',
    imageUrl: null,
    imageStorageKey: null,
    imageAlt: null,
    displayOrder: 0,
    isPublished: true,
  },
  {
    heading: null,
    body:
      "The institute is located in plush premises at Devasthaly, surrounded by attractive healthy, natural environment that creates favourable academic conditions for alround development of children. Since the day of inception it has been determined to scale an unparalleled new graph of success to impart it to the children.",
    imageUrl: null,
    imageStorageKey: null,
    imageAlt: null,
    displayOrder: 1,
    isPublished: true,
  },
  {
    heading: null,
    body:
      "We want our children to imbibe moral values in life. At present the rapid changes in technology and accelerated pace of privatisation and liberalisation created a new sense of uncertainity about the future of society. Thus education should respond meaningfully and effectively to address the crucial academic burning issues. Devasthaly Vidyapeeth in its efforts is providing need-based quality education to the blossoming knowledge which has decided to equip the children will pragmatic skills so that they can face the future with renewed confidence and matchless courage. The president of school is always nurturing the institute keeping sight and presenting all the facilities with help of management committee.",
    imageUrl: null,
    imageStorageKey: null,
    imageAlt: null,
    displayOrder: 2,
    isPublished: true,
  },
];

const VISION_MISSION_SETTING_SEED = {
  id: "default",
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
  isPublished: true,
};

const LEADERSHIP_MEMBERS_SEED = [
  {
    role: "FOUNDER",
    slug: "founders-message",
    pageTitle: "Founder’s Message",
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
    imageStorageKey: null,
    imageAlt: "Shri Chandra Shekhar - Founder of Devasthaly Vidyapeeth",
    signatureImageUrl: null,
    signatureStorageKey: null,
    signatureAlt: null,
    bio: null,
    ctaLabel: null,
    ctaHref: null,
    displayOrder: 0,
    isPublished: true,
  },
  {
    role: "PATRON",
    slug: "patrons-message",
    pageTitle: "Patron’s Message",
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
    imageStorageKey: null,
    imageAlt: "Shri Neeraj Shekhar - Patron of Devasthaly Vidyapeeth",
    signatureImageUrl: null,
    signatureStorageKey: null,
    signatureAlt: null,
    bio: null,
    ctaLabel: null,
    ctaHref: null,
    displayOrder: 1,
    isPublished: true,
  },
  {
    role: "PRESIDENT",
    slug: "presidents-message",
    pageTitle: "President’s Message",
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
    imageStorageKey: null,
    imageAlt: "Ravishankar Singh - President of Devasthaly Vidyapeeth",
    signatureImageUrl: null,
    signatureStorageKey: null,
    signatureAlt: null,
    bio: null,
    ctaLabel: null,
    ctaHref: null,
    displayOrder: 2,
    isPublished: true,
  },
  {
    role: "MANAGER",
    slug: "managers-message",
    pageTitle: "Manager’s Message",
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
      "About 38 years ago Late Shri Chandrashekhar (Founder of Devasthaly) thoughts shaped a line \"A child is an ocean of immense possibilities and it is our noble duty to fish-out pearls for them\". Of course, every child possesses unique inherent quality but latent talents not elsewhere found in conjecture. Its utilisation needs alert parental care at home and continuous inspiration, encouragement, environment clubbed with timely redressal of problems at school. Teacher's responsibility is to inculcate moral values, self-realisation, patience, restrain, tolerance and dutifulness to build a sound character, besides academic enhancement, variable excellence and personality development. This must be done consistantly, as per child's needs which always differs from child to child. Students must set a goal of life based on merits and mental inclination and not on glamoured choices. Therefore, choice of a child must not be rediculed. Its hostilities must be weeded out by psycho counselling. Children are tender, to them cruelty and hurting remarks are shocking. Our aim is to make them good, smart, dynamic, alert, honest, dutiful, dispilined, compassionate and caring. They need us. So do we. In such a situation orignal thoughts and ideas (which are changing face of globe) will come forth like water from a fountain. Efforts should innovative coupled with classical method of learning. Technology and audio-visual devices too should be accomodated to bring out inner potentional of students. Hence, inspiration will be the point of origin. Our students should be versatile and good in math, music and marathon.",
    imageUrl: "/images/leadership/manager_sir.webp",
    imageStorageKey: null,
    imageAlt: "Dr. Naveen Singh - Manager of Devasthaly Vidyapeeth",
    signatureImageUrl: null,
    signatureStorageKey: null,
    signatureAlt: null,
    bio: null,
    ctaLabel: null,
    ctaHref: null,
    displayOrder: 3,
    isPublished: true,
  },
  {
    role: "PRINCIPAL",
    slug: "principals-message",
    pageTitle: "Principal’s Message",
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
    imageStorageKey: null,
    imageAlt: "P. C. Shrivastava - Principal of Devasthaly Vidyapeeth",
    signatureImageUrl: "/images/leadership/principal-signature.webp",
    signatureStorageKey: null,
    signatureAlt: "Principal Signature",
    bio: null,
    ctaLabel: null,
    ctaHref: null,
    displayOrder: 4,
    isPublished: true,
  },
];

async function seedAboutAndLeadership() {
  console.log("==================================================================");
  console.log("  Seeding About School, Vision & Mission, and Leadership Content");
  console.log("==================================================================\n");

  // 1. AboutPageSetting singleton
  const existingAboutSetting = await prisma.aboutPageSetting.findUnique({
    where: { id: "default" },
  });
  if (!existingAboutSetting) {
    await prisma.aboutPageSetting.create({ data: ABOUT_SETTING_SEED });
    console.log("  [CREATED] AboutPageSetting default singleton created.");
  } else {
    console.log("  [SKIPPED] AboutPageSetting default singleton already exists. Preserving admin edits.");
  }

  // 2. AboutCredential collection
  const credentialCount = await prisma.aboutCredential.count();
  if (credentialCount === 0) {
    for (const cred of ABOUT_CREDENTIALS_SEED) {
      await prisma.aboutCredential.create({ data: cred });
    }
    console.log(`  [CREATED] Seeded ${ABOUT_CREDENTIALS_SEED.length} AboutCredential cards.`);
  } else {
    console.log(`  [SKIPPED] AboutCredential table has ${credentialCount} records. Preserving admin entries.`);
  }

  // 3. AboutNarrativeSection collection
  const narrativeCount = await prisma.aboutNarrativeSection.count();
  if (narrativeCount === 0) {
    for (const section of ABOUT_NARRATIVE_SEED) {
      await prisma.aboutNarrativeSection.create({ data: section });
    }
    console.log(`  [CREATED] Seeded ${ABOUT_NARRATIVE_SEED.length} AboutNarrativeSection paragraphs.`);
  } else {
    console.log(`  [SKIPPED] AboutNarrativeSection table has ${narrativeCount} records. Preserving admin entries.`);
  }

  // 4. VisionMissionSetting singleton
  const existingVmSetting = await prisma.visionMissionSetting.findUnique({
    where: { id: "default" },
  });
  if (!existingVmSetting) {
    await prisma.visionMissionSetting.create({ data: VISION_MISSION_SETTING_SEED });
    console.log("  [CREATED] VisionMissionSetting default singleton created.");
  } else {
    console.log("  [SKIPPED] VisionMissionSetting default singleton already exists. Preserving admin edits.");
  }

  // 5. LeadershipMember collection (per role check)
  for (const leader of LEADERSHIP_MEMBERS_SEED) {
    const existingLeader = await prisma.leadershipMember.findUnique({
      where: { role: leader.role },
    });
    if (!existingLeader) {
      await prisma.leadershipMember.create({ data: leader });
      console.log(`  [CREATED] LeadershipMember role '${leader.role}' (${leader.name}) created.`);
    } else {
      console.log(`  [SKIPPED] LeadershipMember role '${leader.role}' already exists. Preserving admin edits.`);
    }
  }

  console.log("\n==================================================================");
  console.log("  About and Leadership seeding completed successfully.");
  console.log("==================================================================\n");

  await prisma.$disconnect();
}

seedAboutAndLeadership().catch(async (e) => {
  console.error("Error during seeding:", e);
  await prisma.$disconnect();
  process.exit(1);
});
