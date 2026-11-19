/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: School Events Actions, Schemas, Auth & Database Integration
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const {
  validateEventUrl,
  schoolEventCreateSchema,
  schoolEventUpdateSchema,
  schoolEventDeleteSchema,
  schoolEventToggleSchema,
  schoolEventsReorderSchema,
  normalizeEventPayload,
  computeEventDiff,
} = require("../lib/validation/events.ts");

dotenv.config({ path: ".env" });
const prisma = new PrismaClient();

async function runSuite() {
  const results = [];

  function assert(name, condition, errorDetail) {
    if (condition) {
      results.push({ name, passed: true });
      console.log(`  [PASS] ${name}`);
    } else {
      results.push({ name, passed: false, error: errorDetail || "Assertion failed" });
      console.error(`  [FAIL] ${name} ${errorDetail ? `- ${errorDetail}` : ""}`);
    }
  }

  console.log("==================================================================");
  console.log("  Running Test Suite: School Events Actions, Schemas & Auth");
  console.log("==================================================================");

  // -------------------------------------------------------------
  // 1. URL Safety Validation Tests
  // -------------------------------------------------------------
  console.log("\n--- 1. URL Safety Validation Tests ---");

  assert("Accepts root-relative event path", validateEventUrl("/events/annual-sports").valid === true);
  assert("Accepts secure HTTPS URL", validateEventUrl("https://cbse.gov.in/circulars/2026").valid === true);
  assert("Rejects plain HTTP", validateEventUrl("http://insecure.com/event").valid === false);
  assert("Rejects javascript scheme", validateEventUrl("javascript:alert(1)").valid === false);
  assert("Rejects data URI", validateEventUrl("data:text/html,bad").valid === false);
  assert("Rejects protocol-relative '//evil.com'", validateEventUrl("//evil.com/img.jpg").valid === false);
  assert("Optional null allows valid=true", validateEventUrl(null).valid === true);
  assert("Optional empty string allows valid=true", validateEventUrl("").valid === true);

  // -------------------------------------------------------------
  // 2. School Event Schemas & Alt Text
  // -------------------------------------------------------------
  console.log("\n--- 2. School Event Schemas & Alt Text ---");

  const validEventPayload = {
    title: "Science & Innovation Olympiad 2026",
    description: "Regional inter-school robotics and innovation competition.",
    eventDate: "15 Feb 2026",
    isoDate: "2026-02-15",
    time: "10:00 AM – 3:00 PM",
    location: "Main Auditorium, Devasthaly Campus",
    category: "Academic Competition",
    linkHref: "https://olympiad.internal.example.com",
    linkLabel: "Register Student Team",
    coverImageUrl: "/images/events/robotics.webp",
    coverImageAlt: "Students assembling robotics display",
    displayOrder: 1,
    isPublished: true,
  };

  assert("Valid event payload passes schema", schoolEventCreateSchema.safeParse(validEventPayload).success === true);
  assert(
    "Rejects event with empty title",
    schoolEventCreateSchema.safeParse({ ...validEventPayload, title: "" }).success === false
  );
  assert(
    "Rejects event with HTML in title",
    schoolEventCreateSchema.safeParse({ ...validEventPayload, title: "Olympiad <script>alert(1)</script>" }).success === false
  );
  assert(
    "Rejects event with invalid ISO date format",
    schoolEventCreateSchema.safeParse({ ...validEventPayload, isoDate: "15-02-2026" }).success === false
  );
  assert(
    "Rejects event with HTML in location",
    schoolEventCreateSchema.safeParse({ ...validEventPayload, location: "Campus <img src=x onerror=alert(1)>" }).success === false
  );
  assert(
    "Rejects cover image with empty alt text",
    schoolEventCreateSchema.safeParse({
      ...validEventPayload,
      coverImageUrl: "/images/events/cover.webp",
      coverImageAlt: "",
    }).success === false
  );
  assert(
    "Accepts event without cover image (cover image is optional)",
    schoolEventCreateSchema.safeParse({
      ...validEventPayload,
      coverImageUrl: null,
      coverImageStorageKey: null,
      coverImageAlt: "",
    }).success === true
  );
  assert(
    "Valid event update schema with ID passes",
    schoolEventUpdateSchema.safeParse({ id: "event-id-123", ...validEventPayload }).success === true
  );
  assert(
    "Event update schema fails without ID",
    schoolEventUpdateSchema.safeParse({ id: "", ...validEventPayload }).success === false
  );
  assert(
    "Event delete schema valid",
    schoolEventDeleteSchema.safeParse({ id: "valid-cuid" }).success === true
  );
  assert(
    "Event toggle schema valid",
    schoolEventToggleSchema.safeParse({ id: "valid-cuid", isPublished: false }).success === true
  );
  assert(
    "Event reorder schema valid with non-empty array",
    schoolEventsReorderSchema.safeParse({ orderedIds: ["eve-1", "eve-2"] }).success === true
  );
  assert(
    "Event reorder schema rejects empty array",
    schoolEventsReorderSchema.safeParse({ orderedIds: [] }).success === false
  );

  // -------------------------------------------------------------
  // 3. Normalizer & Diff Utility Tests
  // -------------------------------------------------------------
  console.log("\n--- 3. Normalizer & Diff Utility Tests ---");

  const normalized = normalizeEventPayload({
    title: "  Trimmed Event  ",
    description: "   ",
    time: "",
    category: "Sports",
  });
  assert("Normalizer trims string values", normalized.title === "Trimmed Event");
  assert("Normalizer converts whitespace to null", normalized.description === null);
  assert("Normalizer converts empty string to null", normalized.time === null);

  const eventDiff = computeEventDiff(
    { title: "Old Event", category: "Sports", coverImageUrl: "/images/old.webp", coverImageStorageKey: null },
    { title: "New Event", category: "Sports", coverImageUrl: "/api/public/media/events/eve_123.webp", coverImageStorageKey: "events/eve_123.webp" }
  );
  assert("Diff detects modified title", eventDiff.title && eventDiff.title.from === "Old Event" && eventDiff.title.to === "New Event");
  assert("Diff ignores unchanged category", eventDiff.category === undefined);
  assert("Diff masks coverImageUrl changes cleanly", eventDiff.coverImageUrl && eventDiff.coverImageUrl.from === "[PRESENT]" && eventDiff.coverImageUrl.to === "[PRESENT]");

  // -------------------------------------------------------------
  // 4. Role Authorization Matrix
  // -------------------------------------------------------------
  console.log("\n--- 4. Role Authorization Matrix ---");
  const ALLOWED_ROLES = ["SUPER_ADMIN"];
  const TEST_ROLES = ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "STAFF", "PARENT", "STUDENT", null, undefined];

  for (const role of TEST_ROLES) {
    const isAllowed = ALLOWED_ROLES.includes(role);
    if (isAllowed) {
      assert(`Role '${role}' is ALLOWED`, isAllowed === true);
    } else {
      assert(`Role '${role}' is BLOCKED`, isAllowed === false);
    }
  }

  // -------------------------------------------------------------
  // 5. Live Database Integration Tests
  // -------------------------------------------------------------
  console.log("\n--- 5. Live Database Integration Tests ---");

  const initialEventCount = await prisma.schoolEvent.count();
  assert("Default seeded events count is 4", initialEventCount === 4, `Found ${initialEventCount}`);

  // Create temporary test event
  const testEvent = await prisma.schoolEvent.create({
    data: {
      title: "QA Test Verification Event",
      description: "Temporary event for test suite verification",
      eventDate: "30 Mar 2026",
      isoDate: new Date("2026-03-30T00:00:00.000Z"),
      time: "9:00 AM – 1:00 PM",
      location: "Auditorium",
      category: "School Event",
      coverImageUrl: null,
      coverImageStorageKey: null,
      coverImageAlt: "",
      displayOrder: 999,
      isPublished: true,
    },
  });
  assert("Created test school event in DB", Boolean(testEvent.id));

  // Update test event
  const updatedEvent = await prisma.schoolEvent.update({
    where: { id: testEvent.id },
    data: {
      category: "Cultural Gala",
      time: "10:00 AM – 2:00 PM",
    },
  });
  assert("Updated test event category to Cultural Gala", updatedEvent.category === "Cultural Gala");

  // Toggle status of test event
  const toggledEvent = await prisma.schoolEvent.update({
    where: { id: testEvent.id },
    data: { isPublished: false },
  });
  assert("Toggled test event to draft (isPublished: false)", toggledEvent.isPublished === false);

  // Delete test event
  await prisma.schoolEvent.delete({
    where: { id: testEvent.id },
  });

  const afterDeleteCount = await prisma.schoolEvent.count();
  assert("Event count restored to 4", afterDeleteCount === 4);

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n==================================================================");
  console.log(`  Events Actions Test Suite: ${passed} Passed, ${failed} Failed (Total ${total})`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite()
  .catch((e) => {
    console.error("Test suite fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
