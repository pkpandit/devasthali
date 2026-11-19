/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Gallery & Events Seed Script for Devasthaly Vidyapeeth (Milestone 6)
 * Idempotent: Only seeds when gallery_albums or school_events tables are empty.
 * Never duplicates or overwrites admin-edited records.
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const GALLERY_ALBUMS_SEED = [
  {
    title: "Campus Grounds & Academic Infrastructure",
    description: "Devasthaly Vidyapeeth campus overview, academic blocks, courtyards, and tree-lined walkways in Chilkahar, Ballia.",
    category: "Campus",
    coverImageUrl: "/images/gallery/image-1-1.webp",
    coverImageStorageKey: null,
    coverImageAlt: "Campus Grounds & Academic Infrastructure",
    displayOrder: 0,
    isPublished: true,
    photos: [
      {
        imageUrl: "/images/gallery/chatgpt-image-apr-12-2026-09_43_54-pm.webp",
        imageStorageKey: null,
        caption: "Devasthaly Vidyapeeth campus overview in Chilkahar, Ballia",
        imageAlt: "Devasthaly Vidyapeeth campus overview in Chilkahar, Ballia",
        displayOrder: 0,
        isPublished: true,
      },
      {
        imageUrl: "/images/gallery/image-1-1.webp",
        imageStorageKey: null,
        caption: "Academic block surrounded by greenery and tree-lined walkways",
        imageAlt: "Academic block surrounded by greenery and tree-lined walkways",
        displayOrder: 1,
        isPublished: true,
      },
      {
        imageUrl: "/images/gallery/image-3-1.webp",
        imageStorageKey: null,
        caption: "Main school campus and activity area",
        imageAlt: "Main school campus and activity area",
        displayOrder: 2,
        isPublished: true,
      },
      {
        imageUrl: "/images/gallery/image-4-1.webp",
        imageStorageKey: null,
        caption: "Classroom blocks and open courtyards",
        imageAlt: "Classroom blocks and open courtyards",
        displayOrder: 3,
        isPublished: true,
      },
    ],
  },
  {
    title: "Student Activities & Cultural Assemblies",
    description: "Annual campus events, academic gatherings, morning assemblies, yoga, and inter-house competitions.",
    category: "Events",
    coverImageUrl: "/images/gallery/image-5-1.webp",
    coverImageStorageKey: null,
    coverImageAlt: "Student Activities & Cultural Assemblies",
    displayOrder: 1,
    isPublished: true,
    photos: [
      {
        imageUrl: "/images/gallery/image-5-1.webp",
        imageStorageKey: null,
        caption: "Annual campus events and academic gatherings",
        imageAlt: "Annual campus events and academic gatherings",
        displayOrder: 0,
        isPublished: true,
      },
      {
        imageUrl: "/images/gallery/image-7-1.webp",
        imageStorageKey: null,
        caption: "Student participation in inter-house competitions",
        imageAlt: "Student participation in inter-house competitions",
        displayOrder: 1,
        isPublished: true,
      },
      {
        imageUrl: "/images/gallery/image-8-1.webp",
        imageStorageKey: null,
        caption: "Morning assembly, yoga and cultural celebrations",
        imageAlt: "Morning assembly, yoga and cultural celebrations",
        displayOrder: 2,
        isPublished: true,
      },
      {
        imageUrl: "/images/gallery/dvp8.webp",
        imageStorageKey: null,
        caption: "Annual day cultural performances and felicitation",
        imageAlt: "Annual day cultural performances and felicitation",
        displayOrder: 3,
        isPublished: true,
      },
    ],
  },
  {
    title: "Sports, Laboratories & Student Life",
    description: "Athletics tournaments, science laboratories practicals, stage presentations, and campus recreation.",
    category: "Sports",
    coverImageUrl: "/images/gallery/dvp3.webp",
    coverImageStorageKey: null,
    coverImageAlt: "Sports, Laboratories & Student Life",
    displayOrder: 2,
    isPublished: true,
    photos: [
      {
        imageUrl: "/images/gallery/dvp3.webp",
        imageStorageKey: null,
        caption: "Athletics, sports ground tournaments and team races",
        imageAlt: "Athletics, sports ground tournaments and team races",
        displayOrder: 0,
        isPublished: true,
      },
      {
        imageUrl: "/images/gallery/dvp4.webp",
        imageStorageKey: null,
        caption: "Assembly and stage presentations",
        imageAlt: "Assembly and stage presentations",
        displayOrder: 1,
        isPublished: true,
      },
      {
        imageUrl: "/images/gallery/dvp2.webp",
        imageStorageKey: null,
        caption: "Science laboratories and experimental study practicals",
        imageAlt: "Science laboratories and experimental study practicals",
        displayOrder: 2,
        isPublished: true,
      },
      {
        imageUrl: "/images/gallery/dvp6.webp",
        imageStorageKey: null,
        caption: "Student club exhibitions and display arenas",
        imageAlt: "Student club exhibitions and display arenas",
        displayOrder: 3,
        isPublished: true,
      },
      {
        imageUrl: "/images/gallery/dvp7.webp",
        imageStorageKey: null,
        caption: "Outdoor physical education and campus recreation",
        imageAlt: "Outdoor physical education and campus recreation",
        displayOrder: 4,
        isPublished: true,
      },
    ],
  },
  {
    title: "Alumni Meet & Reunions",
    description: "Official Devasthaly Vidyapeeth Alumni Reunion gathering and graduate community connections.",
    category: "Achievements",
    coverImageUrl: "/images/gallery/ALUMNI-REUNION.webp",
    coverImageStorageKey: null,
    coverImageAlt: "Alumni Meet & Reunions",
    displayOrder: 3,
    isPublished: true,
    photos: [
      {
        imageUrl: "/images/gallery/ALUMNI-REUNION.webp",
        imageStorageKey: null,
        caption: "Official Devasthaly Vidyapeeth Alumni Reunion gathering",
        imageAlt: "Official Devasthaly Vidyapeeth Alumni Reunion gathering",
        displayOrder: 0,
        isPublished: true,
      },
    ],
  },
];

const SCHOOL_EVENTS_SEED = [
  {
    title: "Inter-School English Debate Competition",
    description: "Topic: 'Artificial Intelligence & the Future of Human Intellect' with participating CBSE schools from Ballia, Mau, and Ghazipur.",
    eventDate: "25 Nov 2025",
    isoDate: new Date("2025-11-25T09:30:00.000Z"),
    time: "9:30 AM – 1:30 PM",
    location: "Auditorium Hall, Devasthaly Campus",
    category: "Academic Competition",
    linkHref: "/downloads",
    linkLabel: "Official Calendar & Holidays (PDF)",
    coverImageUrl: null,
    coverImageStorageKey: null,
    coverImageAlt: null,
    displayOrder: 0,
    isPublished: true,
  },
  {
    title: "Annual Sports Meet & Athletic Championship",
    description: "Track and field events, relay races, martial arts demonstrations, and march-past by school houses.",
    eventDate: "12 Dec 2025",
    isoDate: new Date("2025-12-12T08:00:00.000Z"),
    time: "8:00 AM – 4:00 PM",
    location: "5-Acre Sports Complex",
    category: "Sports & Athletics",
    linkHref: "/downloads",
    linkLabel: "Sports Schedule (PDF)",
    coverImageUrl: null,
    coverImageStorageKey: null,
    coverImageAlt: null,
    displayOrder: 1,
    isPublished: true,
  },
  {
    title: "CBSE Pre-Board Examination Series (Classes X & XII)",
    description: "Comprehensive mock board examination adhering to CBSE standardized marking scheme and OMR answer sheets.",
    eventDate: "05 Jan 2026",
    isoDate: new Date("2026-01-05T10:00:00.000Z"),
    time: "10:00 AM – 1:15 PM",
    location: "Senior Secondary Examination Block",
    category: "CBSE Examination",
    linkHref: "/downloads",
    linkLabel: "Date Sheet & Instructions (PDF)",
    coverImageUrl: null,
    coverImageStorageKey: null,
    coverImageAlt: null,
    displayOrder: 2,
    isPublished: true,
  },
  {
    title: "Republic Day Patriotic Parade & Cultural Gala",
    description: "Flag hoisting by the Principal, NCC troop drill, patriotic songs, and distribution of student merit certificates.",
    eventDate: "26 Jan 2026",
    isoDate: new Date("2026-01-26T08:00:00.000Z"),
    time: "8:00 AM – 11:30 AM",
    location: "Main Campus Flagpole & Assembly Grounds",
    category: "National Celebration",
    linkHref: "/downloads",
    linkLabel: "Program Itinerary",
    coverImageUrl: null,
    coverImageStorageKey: null,
    coverImageAlt: null,
    displayOrder: 3,
    isPublished: true,
  },
];

async function seedGalleryAndEvents(client = prisma) {
  console.log("=== Seeding Gallery & Events ===");

  // 1. Seed Gallery Albums & Photos
  const existingAlbums = await client.galleryAlbum.count();
  if (existingAlbums > 0) {
    console.log(
      `[Seed] gallery_albums already has ${existingAlbums} records. Skipping to preserve existing data.`
    );
  } else {
    for (const albumData of GALLERY_ALBUMS_SEED) {
      const { photos, ...albumFields } = albumData;
      const album = await client.galleryAlbum.create({
        data: {
          ...albumFields,
          images: {
            create: photos,
          },
        },
      });
      console.log(`[Seed] Created album "${album.title}" with ${photos.length} photos.`);
    }
  }

  // 2. Seed School Events
  const existingEvents = await client.schoolEvent.count();
  if (existingEvents > 0) {
    console.log(
      `[Seed] school_events already has ${existingEvents} records. Skipping to preserve existing data.`
    );
  } else {
    const createdEvents = await client.schoolEvent.createMany({
      data: SCHOOL_EVENTS_SEED,
    });
    console.log(`[Seed] Successfully seeded ${createdEvents.count} school events.`);
  }
}

if (require.main === module) {
  seedGalleryAndEvents()
    .catch((e) => {
      console.error("[Seed] Error seeding gallery and events:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedGalleryAndEvents, GALLERY_ALBUMS_SEED, SCHOOL_EVENTS_SEED };
