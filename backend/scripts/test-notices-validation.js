/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Synthetic validation test suite for Notices & Circulars.
 * Tests:
 * 1. Rich-text HTML sanitization (XSS attacks, event handlers, iframe, style, script, link attributes)
 * 2. Tightened document-link validation (traversal, protocols, extensions, credentials)
 * 3. Computed lifecycle statuses (DRAFT, SCHEDULED, PUBLISHED, EXPIRED)
 * 4. Zod schemas (createNoticeSchema, updateNoticeSchema, deleteNoticeSchema, toggleNoticeStatusSchema)
 */

const {
  getNoticeStatus,
  documentLinkSchema,
  createNoticeSchema,
  updateNoticeSchema,
  deleteNoticeSchema,
  toggleNoticeStatusSchema,
} = require("../lib/validation/notices.ts");

const { sanitizeRichText } = require("../lib/server/sanitizer.ts");

function runSuite() {
  const results = [];

  function assert(name, condition, details = "") {
    results.push({ name, passed: Boolean(condition), details });
    if (!condition) {
      console.error(`  [FAIL] ${name}: ${details}`);
    } else {
      console.log(`  [PASS] ${name}`);
    }
  }

  console.log("==================================================================");
  console.log("  Running Synthetic Test Suite: Notices Validation & Sanitization");
  console.log("==================================================================\n");

  // -----------------------------------------------------------------
  // 1. Rich-Text HTML Sanitization Tests
  // -----------------------------------------------------------------
  console.log("--- 1. Rich-Text HTML Sanitizer (XSS & Tag Allowlist) ---");

  // Basic markup preserved
  const basicHtml = "<p>This is a <strong>bold</strong> announcement with an <em>italic</em> note.</p>";
  assert("Preserves safe semantic tags (p, strong, em)", sanitizeRichText(basicHtml) === basicHtml);

  // Script tags stripped
  const scriptAttack = "<p>Hello</p><script>alert('XSS')</script>";
  assert(
    "Strips <script> tags completely",
    sanitizeRichText(scriptAttack) === "<p>Hello</p>"
  );

  // Iframe, object, embed stripped
  const embedAttack = "<p>Notice</p><iframe src=\"https://malicious.com\"></iframe><object data=\"bad\"></object>";
  assert(
    "Strips <iframe> and <object> tags",
    sanitizeRichText(embedAttack) === "<p>Notice</p>"
  );

  // Inline event handlers stripped
  const eventHandlerAttack = '<p onclick="alert(1)" onmouseover="stealCookies()">Click me</p>';
  const sanitizedEvent = sanitizeRichText(eventHandlerAttack);
  assert(
    "Strips on* event handlers (onclick, onmouseover)",
    !sanitizedEvent.includes("onclick") &&
      !sanitizedEvent.includes("onmouseover") &&
      sanitizedEvent.includes("<p>Click me</p>")
  );

  // Style tags stripped
  const styleAttack = "<style>body { display: none; }</style><p>Content</p>";
  assert(
    "Strips <style> tags",
    sanitizeRichText(styleAttack) === "<p>Content</p>"
  );

  // Link rewriting: ensures target="_blank" and rel="noopener noreferrer"
  const plainLink = '<p>Read the <a href="https://example.com/doc.pdf">circular here</a></p>';
  const sanitizedLink = sanitizeRichText(plainLink);
  assert(
    "Rewrites links with target='_blank' and rel='noopener noreferrer'",
    sanitizedLink.includes('target="_blank"') &&
      sanitizedLink.includes('rel="noopener noreferrer"') &&
      sanitizedLink.includes('href="https://example.com/doc.pdf"')
  );

  // Javascript: link stripped
  const jsLink = '<p><a href="javascript:alert(1)">Click for free gift</a></p>';
  const sanitizedJsLink = sanitizeRichText(jsLink);
  assert(
    "Strips javascript: pseudo-protocols in links",
    !sanitizedJsLink.includes("javascript:")
  );

  // Nested / Malformed tags
  const malformed = "<<SCRIPT>alert(\"XSS\");//<</SCRIPT>";
  assert("Neutralizes malformed script tags", !sanitizeRichText(malformed).includes("alert("));

  // -----------------------------------------------------------------
  // 2. Document Link Validation Tests
  // -----------------------------------------------------------------
  console.log("\n--- 2. Tightened Document Link Schema ---");

  // Valid root-relative links
  assert(
    "Accepts valid root-relative PDF link",
    documentLinkSchema.safeParse("/documents/circulars/2026-exam.pdf").success
  );
  assert(
    "Accepts valid root-relative DOCX link",
    documentLinkSchema.safeParse("/documents/admissions/form-2026.docx").success
  );

  // Valid external HTTPS links
  assert(
    "Accepts secure external HTTPS link with PDF",
    documentLinkSchema.safeParse("https://cbse.gov.in/circulars/circular-101.pdf").success
  );

  // Rejections
  assert(
    "Rejects protocol-relative link (//evil.com/doc.pdf)",
    !documentLinkSchema.safeParse("//evil.com/doc.pdf").success
  );
  assert(
    "Rejects directory traversal with ..",
    !documentLinkSchema.safeParse("/documents/../../etc/passwd.pdf").success
  );
  assert(
    "Rejects encoded directory traversal (%2e%2e)",
    !documentLinkSchema.safeParse("/documents/%2e%2e/passwd.pdf").success
  );
  assert(
    "Rejects plain HTTP insecure link",
    !documentLinkSchema.safeParse("http://cbse.gov.in/circular.pdf").success
  );
  assert(
    "Rejects HTTPS link with embedded credentials",
    !documentLinkSchema.safeParse("https://admin:pass@cbse.gov.in/circular.pdf").success
  );
  assert(
    "Rejects dangerous javascript: protocol",
    !documentLinkSchema.safeParse("javascript:alert(1)").success
  );
  assert(
    "Rejects data: URI scheme",
    !documentLinkSchema.safeParse("data:application/pdf;base64,bad").success
  );
  assert(
    "Rejects executable extension (.exe)",
    !documentLinkSchema.safeParse("/documents/run.exe").success
  );
  assert(
    "Rejects script extension (.js)",
    !documentLinkSchema.safeParse("/documents/run.js").success
  );
  assert(
    "Accepts null / empty link",
    documentLinkSchema.safeParse(null).success &&
      documentLinkSchema.safeParse("").success &&
      documentLinkSchema.safeParse(undefined).success
  );

  // -------------------------------------------------------------
  // 3. Computed Status Logic Tests
  // -------------------------------------------------------------
  console.log("\n--- 3. Computed Status Rules (getNoticeStatus) ---");

  const now = new Date("2026-11-13T12:00:00Z");
  const pastDate = new Date("2026-11-01T10:00:00Z");
  const futureDate = new Date("2026-11-20T10:00:00Z");

  // Rule 1: DRAFT when isPublished is false
  assert(
    "Status is DRAFT when isPublished is false (even with past publishDate)",
    getNoticeStatus({ isPublished: false, publishDate: pastDate }, now) === "DRAFT"
  );
  assert(
    "Status is DRAFT when isPublished is false (even with future publishDate)",
    getNoticeStatus({ isPublished: false, publishDate: futureDate }, now) === "DRAFT"
  );

  // Rule 2: SCHEDULED when isPublished is true but publishDate is in future
  assert(
    "Status is SCHEDULED when isPublished is true and publishDate > now",
    getNoticeStatus({ isPublished: true, publishDate: futureDate }, now) === "SCHEDULED"
  );

  // Rule 3: PUBLISHED when isPublished is true, publishDate <= now, and no expiryDate
  assert(
    "Status is PUBLISHED when publishDate <= now and expiryDate is null",
    getNoticeStatus({ isPublished: true, publishDate: pastDate, expiryDate: null }, now) === "PUBLISHED"
  );

  // Rule 4: PUBLISHED when publishDate <= now and expiryDate is in the future
  assert(
    "Status is PUBLISHED when publishDate <= now and expiryDate > now",
    getNoticeStatus(
      { isPublished: true, publishDate: pastDate, expiryDate: futureDate },
      now
    ) === "PUBLISHED"
  );

  // Rule 5: EXPIRED when isPublished is true and expiryDate <= now
  assert(
    "Status is EXPIRED when expiryDate <= now",
    getNoticeStatus(
      { isPublished: true, publishDate: pastDate, expiryDate: pastDate },
      now
    ) === "EXPIRED"
  );

  // -------------------------------------------------------------
  // 4. Schema Boundary Tests (Zod)
  // -------------------------------------------------------------
  console.log("\n--- 4. Zod Schemas Validation (create, update, delete, toggle) ---");

  const validNoticePayload = {
    title: "Mid-Term Examination 2026-27 Schedule",
    category: "EXAMINATION",
    summary: "Detailed schedule for Class IX to XII mid-term exams.",
    content: "<p>The examinations will commence from 25 November 2026.</p>",
    isUrgent: true,
    isPublished: true,
    fileUrl: "/documents/exams/midterm-schedule-2026.pdf",
    fileSize: "1.2 MB",
    publishDate: "2026-11-13T09:00:00Z",
    expiryDate: "2026-12-15T09:00:00Z",
    displayOrder: 1,
  };

  const parsedValid = createNoticeSchema.safeParse(validNoticePayload);
  assert("Valid createNoticePayload parses successfully", parsedValid.success);

  // Short title (< 3 chars)
  assert(
    "Rejects short title (< 3 characters)",
    !createNoticeSchema.safeParse({ ...validNoticePayload, title: "AB" }).success
  );

  // Invalid category
  assert(
    "Rejects invalid category",
    !createNoticeSchema.safeParse({ ...validNoticePayload, category: "SPORTS" }).success
  );

  // Expiry date <= publishDate
  assert(
    "Rejects expiryDate earlier than or equal to publishDate",
    !createNoticeSchema.safeParse({
      ...validNoticePayload,
      publishDate: "2026-11-20T00:00:00Z",
      expiryDate: "2026-11-15T00:00:00Z",
    }).success
  );

  // updateNoticeSchema requires ID
  assert(
    "updateNoticeSchema accepts payload with valid ID",
    updateNoticeSchema.safeParse({ ...validNoticePayload, id: "cuid12345" }).success
  );
  assert(
    "updateNoticeSchema rejects payload without ID",
    !updateNoticeSchema.safeParse(validNoticePayload).success
  );

  // deleteNoticeSchema
  assert(
    "deleteNoticeSchema accepts valid ID",
    deleteNoticeSchema.safeParse({ id: "notice_123" }).success
  );
  assert(
    "deleteNoticeSchema rejects empty ID",
    !deleteNoticeSchema.safeParse({ id: "" }).success
  );

  // toggleNoticeStatusSchema
  assert(
    "toggleNoticeStatusSchema accepts valid payload",
    toggleNoticeStatusSchema.safeParse({ id: "notice_123", isPublished: true }).success
  );
  assert(
    "toggleNoticeStatusSchema rejects non-boolean isPublished",
    !toggleNoticeStatusSchema.safeParse({ id: "notice_123", isPublished: "yes" }).success
  );

  console.log("==================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`  Tests completed: ${passed}/${total} passed (${failed} failed)`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite();
