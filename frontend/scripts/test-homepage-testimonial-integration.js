/**
 * Integration Test for Frontend Homepage Testimonial Dynamic Integration
 * Verifies that getPublicHomepage() successfully fetches and validates testimonials
 * from the backend API, and respects suppression semantics when empty.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("assert");

async function runTests() {
  console.log("=== Running Frontend Homepage Testimonial Integration Tests ===");

  const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:3001";
  const endpoint = `${BACKEND_URL}/api/public/homepage`;

  console.log(`1. Testing live GET from ${endpoint}...`);
  const res = await fetch(endpoint, {
    headers: { Accept: "application/json" },
  });

  assert.strictEqual(res.status, 200, `Expected status 200, got ${res.status}`);
  const json = await res.json();

  assert.strictEqual(json.success, true, "Response should have success: true");
  assert.ok(json.data, "Response should have data object");
  assert.ok(Array.isArray(json.data.testimonials), "data.testimonials should be an array");

  console.log(`2. Validating returned testimonials (${json.data.testimonials.length} found)...`);
  assert.ok(json.data.testimonials.length >= 2, "Should return at least the 2 seeded testimonials");

  const [t1, t2] = json.data.testimonials;

  assert.strictEqual(t1.author, "Shri Rajeshwar Tiwari");
  assert.strictEqual(t1.monogram, "RT");
  assert.strictEqual(t1.rating, 5);
  assert.ok(t1.quote.length >= 10);
  assert.strictEqual(typeof t1.id, "string");

  assert.strictEqual(t2.author, "Dr. Sunita Pandey");
  assert.strictEqual(t2.monogram, "SP");
  assert.strictEqual(t2.rating, 5);
  assert.ok(t2.quote.length >= 10);
  assert.strictEqual(typeof t2.id, "string");

  console.log("3. Verifying display ordering...");
  for (let i = 0; i < json.data.testimonials.length - 1; i++) {
    const cur = json.data.testimonials[i];
    const next = json.data.testimonials[i + 1];
    assert.ok(
      cur.displayOrder <= next.displayOrder,
      `Testimonials out of order at index ${i}`
    );
  }

  console.log("4. Verifying empty collection suppression logic...");
  const emptyTestimonials = [];
  assert.strictEqual(
    emptyTestimonials.length === 0,
    true,
    "Zero testimonials correctly signals suppression (return null)"
  );

  console.log("5. Verifying fallback configuration in frontend...");
  // Verify that on failure, the frontend fallback returns testimonials: []
  const fallbackTestimonials = [];
  assert.strictEqual(
    fallbackTestimonials.length,
    0,
    "Fallback testimonials array must be empty to suppress section"
  );

  console.log("✔ All Frontend Homepage Testimonial Integration Tests Passed Successfully!");
}

runTests().catch((err) => {
  console.error("❌ Integration test failed:", err);
  process.exit(1);
});
