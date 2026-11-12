import { z } from "zod";

export const publicTopperSchema = z.object({
  studentName: z.string().min(1),
  scorePercent: z.number().min(0).max(100),
  grade: z.string().min(1),
  stream: z.string().nullable().optional(),
  academicYear: z.string().min(1),
  achievement: z.string().min(1),
  photoUrl: z.string().nullable().optional(),
  isFeatured: z.boolean(),
});

export const publicToppersArraySchema = z.array(publicTopperSchema);

export type PublicTopper = z.infer<typeof publicTopperSchema>;

export interface GetPublicToppersResult {
  success: boolean;
  toppers: PublicTopper[];
  isError: boolean;
}

/**
 * Resolves the backend origin strictly for server-side fetches.
 * - In development: defaults to http://127.0.0.1:3001 if BACKEND_INTERNAL_URL is not set.
 * - In production: requires an explicit BACKEND_INTERNAL_URL and will not fall back to loopback.
 */
export function getBackendOrigin(): string | null {
  const envUrl = process.env.BACKEND_INTERNAL_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:3001";
  }

  return null;
}

/**
 * Fetches published board examination toppers from the backend service.
 * Executed strictly server-side in Server Components.
 */
export async function getPublicToppers(): Promise<GetPublicToppersResult> {
  const backendOrigin = getBackendOrigin();

  if (!backendOrigin) {
    console.error(
      "[toppers-api] BACKEND_INTERNAL_URL is not configured in production environment. Public showcase unavailable."
    );
    return {
      success: false,
      toppers: [],
      isError: true,
    };
  }

  const endpoint = `${backendOrigin}/api/public/toppers`;

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4000), // 4-second bounded timeout
    });

    if (!res.ok) {
      console.error(`[toppers-api] Backend returned non-200 HTTP status: ${res.status}`);
      return {
        success: false,
        toppers: [],
        isError: true,
      };
    }

    const json = await res.json();
    const parseResult = publicToppersArraySchema.safeParse(json);

    if (!parseResult.success) {
      console.error(
        "[toppers-api] Invalid payload schema received from backend toppers endpoint"
      );
      return {
        success: false,
        toppers: [],
        isError: true,
      };
    }

    return {
      success: true,
      toppers: parseResult.data,
      isError: false,
    };
  } catch (err: unknown) {
    const errorName = err instanceof Error ? err.name : "UnknownError";
    console.error(`[toppers-api] Failed to connect to backend toppers service: ${errorName}`);
    return {
      success: false,
      toppers: [],
      isError: true,
    };
  }
}
