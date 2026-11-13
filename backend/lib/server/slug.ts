import type { Prisma } from "@prisma/client";

/**
 * Converts a raw string to a canonical URL slug.
 * Lowercase, alphanumeric characters and single hyphens only.
 */
export function slugify(text: string): string {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Strip diacritics
    .replace(/[^a-z0-9]+/g, "-") // Non-alphanumeric to hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens

  return normalized || "notice";
}

/**
 * Deterministically generates a unique slug for a notice.
 * If the base slug already exists, appends the next sequential integer suffix (-2, -3, etc.).
 *
 * @param db Prisma client or transaction client
 * @param title Notice title
 * @param excludeId Optional ID of notice being updated (to avoid self-collision)
 */
export async function generateDeterministicSlug(
  db: Prisma.TransactionClient,
  title: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = slugify(title);

  // Find all existing notices that have this base slug or a suffixed variant
  const existing = await db.notice.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: {
      slug: true,
    },
  });

  const existingSlugs = new Set(existing.map((n) => n.slug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  // Find existing numeric suffixes
  const regex = new RegExp(`^${baseSlug}-(\\d+)$`);
  let maxSuffix = 1;

  for (const item of existing) {
    if (item.slug === baseSlug) {
      if (maxSuffix < 1) maxSuffix = 1;
    } else {
      const match = item.slug.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSuffix) {
          maxSuffix = num;
        }
      }
    }
  }

  // Next sequential suffix
  const nextSuffix = maxSuffix + 1;
  let candidate = `${baseSlug}-${nextSuffix}`;

  // Edge-case safeguard: verify candidate doesn't collide
  let counter = nextSuffix;
  while (existingSlugs.has(candidate)) {
    counter++;
    candidate = `${baseSlug}-${counter}`;
  }

  return candidate;
}
