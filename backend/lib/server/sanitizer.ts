/**
 * Server-side Rich-Text HTML Sanitizer
 * 
 * Enforces a strict allowlist of semantic formatting tags and attributes
 * for school notices and circulars. Strips all scripts, iframes, styles,
 * dangerous URI schemes (javascript:, data:), and event handlers.
 */

// Permitted formatting tags
const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
  "span",
  "a",
]);

// Self-closing tags that do not require closing pair
const SELF_CLOSING_TAGS = new Set(["br", "hr"]);

/**
 * Validates whether an href attribute contains a safe destination.
 */
function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  // Strictly reject dangerous schemes
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:") ||
    lower.startsWith("//") // Reject protocol-relative
  ) {
    return false;
  }

  // Allow root-relative paths
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  // Allow mailto:
  if (lower.startsWith("mailto:")) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed.slice(7));
  }

  // Allow standard http/https URLs
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Strips dangerous HTML and normalizes rich-text input to safe markup.
 */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html || typeof html !== "string") return "";

  let sanitized = html;

  // 1. Remove dangerous blocks completely (including content between tags)
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  sanitized = sanitized.replace(/<embed\b[^>]*>/gi, "");
  sanitized = sanitized.replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, "");
  sanitized = sanitized.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "");

  // 2. Parse and filter tags
  const tagRegex = /<\/?([a-zA-Z0-9]+)([^>]*)>/gi;

  sanitized = sanitized.replace(tagRegex, (_match, tagNameRaw, attrString) => {
    const tagName = tagNameRaw.toLowerCase();

    // If tag is not in allowlist, strip the tag but keep interior text
    if (!ALLOWED_TAGS.has(tagName)) {
      return "";
    }

    const isClosing = _match.startsWith("</");
    if (isClosing) {
      return SELF_CLOSING_TAGS.has(tagName) ? "" : `</${tagName}>`;
    }

    // For self-closing tags without attributes
    if (SELF_CLOSING_TAGS.has(tagName)) {
      return `<${tagName} />`;
    }

    // Special handling for <a> tags: allow only safe href, force noopener/noreferrer
    if (tagName === "a") {
      const hrefMatch = attrString.match(/href=(["'])(.*?)\1/i) || attrString.match(/href=([^\s>]+)/i);
      const rawHref = hrefMatch ? hrefMatch[2] || hrefMatch[1] : "";

      if (rawHref && isSafeHref(rawHref)) {
        // Escape quotes in href for safe attribute embedding
        const cleanHref = rawHref.replace(/"/g, "&quot;");
        return `<a href="${cleanHref}" target="_blank" rel="noopener noreferrer">`;
      }
      // If href is missing or unsafe, strip the <a> wrapper
      return "";
    }

    // For other allowed tags, strip all attributes (including on* event handlers, class, style)
    return `<${tagName}>`;
  });

  return sanitized.trim();
}
