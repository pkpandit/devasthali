import { z } from "zod";

export const publicTopperSchema = z.object({
  id: z.string().optional(),
  studentName: z.string().min(1),
  scorePercent: z.number().min(0).max(100),
  grade: z.string().min(1),
  stream: z.string().nullable().optional(),
  academicYear: z.string().min(1),
  achievement: z.string().min(1),
  photoUrl: z.string().nullable().optional(),
  photoAlt: z.string().default(""),
  displayOrder: z.number().default(0),
  isFeatured: z.boolean(),
});

export const publicToppersArraySchema = z.array(publicTopperSchema);

export type PublicTopper = z.infer<typeof publicTopperSchema>;

export interface GetPublicToppersResult {
  success: boolean;
  toppers: PublicTopper[];
  isError: boolean;
  isFallback: boolean;
}

/**
 * Static Emergency Fallback for Board Toppers.
 * Preserves the canonical 4 board toppers used during network outages or validation failures.
 */
export const STATIC_FALLBACK_TOPPERS: PublicTopper[] = [
  {
    id: "static-1",
    studentName: "Priya Singh",
    scorePercent: 98.4,
    grade: "Class XII",
    stream: "Science (PCM)",
    academicYear: "2024",
    achievement: "District Rank 1 | Currently pursuing B.Tech at IIT Roorkee",
    photoUrl: "/images/academics/toppers/topper-priya.jpg",
    photoAlt: "Priya Singh - Class XII CBSE Topper",
    displayOrder: 0,
    isFeatured: true,
  },
  {
    id: "static-2",
    studentName: "Aman Kumar Verma",
    scorePercent: 97.8,
    grade: "Class X",
    stream: null,
    academicYear: "2024",
    achievement: "School Topper & 100/100 in Mathematics & Science",
    photoUrl: "/images/academics/toppers/topper-aman.jpg",
    photoAlt: "Aman Kumar Verma - Class X CBSE Topper",
    displayOrder: 1,
    isFeatured: true,
  },
  {
    id: "static-3",
    studentName: "Shweta Tiwari",
    scorePercent: 97.2,
    grade: "Class XII",
    stream: "Commerce",
    academicYear: "2024",
    achievement: "Qualified CUET with 99.8th percentile | SRCC New Delhi",
    photoUrl: "/images/academics/toppers/topper-shweta.jpg",
    photoAlt: "Shweta Tiwari - Class XII CBSE Topper",
    displayOrder: 2,
    isFeatured: true,
  },
  {
    id: "static-4",
    studentName: "Rohan Upadhyay",
    scorePercent: 96.6,
    grade: "Class XII",
    stream: "Science (PCB)",
    academicYear: "2023",
    achievement: "Cleared NEET UG in First Attempt (AIR 1420)",
    photoUrl: "/images/academics/toppers/topper-rohan.jpg",
    photoAlt: "Rohan Upadhyay - Class XII CBSE Topper",
    displayOrder: 3,
    isFeatured: true,
  },
];

/**
 * Resolves the backend origin strictly for server-side fetches.
 * - In development: defaults to http://127.0.0.1:3001 if BACKEND_INTERNAL_URL is not set.
 * - In production: checks BACKEND_INTERNAL_URL then NEXT_PUBLIC_BACKEND_URL.
 */
export function getBackendOrigin(): string | null {
  if (process.env.BACKEND_INTERNAL_URL) {
    return process.env.BACKEND_INTERNAL_URL.replace(/\/+$/, "");
  }

  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://127.0.0.1:3001";
  }

  return null;
}

/**
 * Fetches published board examination toppers from the backend service.
 * Executed strictly server-side in Server Components.
 *
 * Caching Policy:
 * - Development: cache: "no-store"
 * - Production: next: { revalidate: 60, tags: ["toppers"] }
 *
 * Authoritative Empty-Array Behavior:
 * - When the backend returns an empty array of published toppers ([]),
 *   it is authoritative: success: true, toppers: [], isError: false, isFallback: false.
 * - Fallback to STATIC_FALLBACK_TOPPERS is activated strictly on network failure,
 *   HTTP error, or Zod schema validation failure.
 */
export async function getPublicToppers(): Promise<GetPublicToppersResult> {
  "use cache";
  const backendOrigin = getBackendOrigin();

  if (!backendOrigin) {
    console.warn(
      "[toppers-api] BACKEND_INTERNAL_URL is not configured in production environment. Using static fallback."
    );
    return {
      success: false,
      toppers: STATIC_FALLBACK_TOPPERS,
      isError: true,
      isFallback: true,
    };
  }

  const endpoint = `${backendOrigin}/api/public/toppers`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      method: "GET",
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["toppers"] } }),
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4000), // 4-second bounded timeout
    });

    if (!res.ok) {
      console.warn(
        `[toppers-api] Backend returned non-200 HTTP status: ${res.status}. Using static fallback.`
      );
      return {
        success: false,
        toppers: STATIC_FALLBACK_TOPPERS,
        isError: true,
        isFallback: true,
      };
    }

    const json = await res.json();
    const parseResult = publicToppersArraySchema.safeParse(json);

    if (!parseResult.success) {
      console.warn(
        "[toppers-api] Invalid payload schema received from backend toppers endpoint. Using static fallback.",
        parseResult.error.issues
      );
      return {
        success: false,
        toppers: STATIC_FALLBACK_TOPPERS,
        isError: true,
        isFallback: true,
      };
    }

    return {
      success: true,
      toppers: parseResult.data,
      isError: false,
      isFallback: false,
    };
  } catch (err: unknown) {
    const errorName = err instanceof Error ? err.name : "UnknownError";
    console.warn(
      `[toppers-api] Failed to connect to backend toppers service: ${errorName}. Using static fallback.`
    );
    return {
      success: false,
      toppers: STATIC_FALLBACK_TOPPERS,
      isError: true,
      isFallback: true,
    };
  }
}
