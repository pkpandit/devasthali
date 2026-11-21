/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Milestone 13: Contact & Campus Information Integration Test Suite
 */
const assert = require("node:assert");
const path = require("node:path");
const fs = require("node:fs");
const { execSync } = require("node:child_process");

const distPath = path.resolve(__dirname, "../dist_test_frontend_profile.js");

try {
  execSync(
    "npx esbuild lib/api/profile.ts --bundle --platform=node --outfile=dist_test_frontend_profile.js",
    { cwd: path.resolve(__dirname, ".."), stdio: "pipe" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

async function runTests() {
  console.log("=== Running Milestone 13 Contact Integration Tests ===\n");
  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err.message}`);
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err.message}`);
    }
  }

  try {
    const {
      publicSiteProfileSchema,
      STATIC_FALLBACK_SITE_PROFILE,
      STATIC_FALLBACK_DIRECTORY_ENTRIES,
      isValidGoogleMapsEmbedUrl,
      getPublicSiteProfile,
      getPublicCampusDirectory,
    } = require("../dist_test_frontend_profile");

    // 1. Test helper functions
    test("isValidGoogleMapsEmbedUrl approves valid HTTPS Google Maps embed link", () => {
      const valid = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14371.74567283457";
      assert.strictEqual(isValidGoogleMapsEmbedUrl(valid), true);
    });

    test("isValidGoogleMapsEmbedUrl approves maps.google.com with output=embed", () => {
      const valid = "https://maps.google.com/maps?output=embed&q=Devasthaly+Vidyapeeth";
      assert.strictEqual(isValidGoogleMapsEmbedUrl(valid), true);
    });

    test("isValidGoogleMapsEmbedUrl rejects non-Google domain", () => {
      const invalid = "https://evil-maps.attacker.com/maps/embed?pb=!1m18";
      assert.strictEqual(isValidGoogleMapsEmbedUrl(invalid), false);
    });

    test("isValidGoogleMapsEmbedUrl rejects javascript: scheme", () => {
      const invalid = "javascript:alert('XSS')";
      assert.strictEqual(isValidGoogleMapsEmbedUrl(invalid), false);
    });

    test("isValidGoogleMapsEmbedUrl rejects insecure HTTP scheme", () => {
      const invalid = "http://www.google.com/maps/embed?pb=!1m18";
      assert.strictEqual(isValidGoogleMapsEmbedUrl(invalid), false);
    });

    test("isValidGoogleMapsEmbedUrl handles null, undefined, and empty string safely", () => {
      assert.strictEqual(isValidGoogleMapsEmbedUrl(null), false);
      assert.strictEqual(isValidGoogleMapsEmbedUrl(undefined), false);
      assert.strictEqual(isValidGoogleMapsEmbedUrl(""), false);
    });

    // 2. Test STATIC_FALLBACK_SITE_PROFILE structure
    test("STATIC_FALLBACK_SITE_PROFILE contains valid location object", () => {
      assert.ok(STATIC_FALLBACK_SITE_PROFILE.location);
      assert.ok(STATIC_FALLBACK_SITE_PROFILE.location.mapEmbedUrl);
      assert.ok(STATIC_FALLBACK_SITE_PROFILE.location.mapDirectionsUrl);
      assert.ok(STATIC_FALLBACK_SITE_PROFILE.location.directionsOverview);
      assert.ok(STATIC_FALLBACK_SITE_PROFILE.location.visitorGuidelines);
    });

    test("STATIC_FALLBACK_SITE_PROFILE contains emergency phone numbers", () => {
      assert.strictEqual(STATIC_FALLBACK_SITE_PROFILE.contacts.emergencyMedicalPhone, "9415805530");
      assert.strictEqual(STATIC_FALLBACK_SITE_PROFILE.contacts.emergencySecurityPhone, "6307798158");
    });

    test("STATIC_FALLBACK_SITE_PROFILE parses successfully against publicSiteProfileSchema", () => {
      const parsed = publicSiteProfileSchema.safeParse(STATIC_FALLBACK_SITE_PROFILE);
      assert.strictEqual(parsed.success, true);
    });

    // 3. Test schema parsing with location and emergency numbers
    test("publicSiteProfileSchema validates valid site profile payload with location", () => {
      const payload = {
        schoolName: "Devasthaly Vidyapeeth",
        tagline: "Empowering Minds, Enriching Lives",
        affiliationNo: "2132386",
        schoolCode: "70119",
        establishedYear: 1988,
        legacyYearsText: "37+ Years of Academic Excellence",
        schoolType: "Co-Educational Day & Residential",
        medium: "English",
        gradesOffered: "L.K.G. to XII (Science, Commerce, Humanities)",
        address: {
          campus: "Devasthaly Vidyapeeth Campus, Chilkahar",
          tehsil: "Rasra",
          district: "Ballia",
          state: "Uttar Pradesh",
          pinCode: "277123",
          landmark: "Near Chilkahar Bus Stop, Ballia-Rasra Highway",
        },
        location: {
          mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14371.745",
          mapDirectionsUrl: "https://maps.google.com/?q=Devasthaly+Vidyapeeth",
          directionsOverview: "Direct auto-rickshaws available from Ballia railway station (22 km).",
          visitorGuidelines: "Report to the main security gate for entry passes.",
        },
        contacts: {
          primaryPhone: "+91 9415805530",
          admissionsPhone: "+91 6307798158",
          receptionPhone: "+91 9415805530",
          hostelWardenPhone: "+91 9415805530",
          whatsappNumber: "+91 9415805530",
          email: "principaldvp@gmail.com",
          officeEmail: "info@devasthaly.com",
          workingHours: "Mon–Sat: 8:00 AM – 2:30 PM",
          emergencyMedicalPhone: "9415805530",
          emergencySecurityPhone: "6307798158",
        },
        social: {
          facebook: "https://facebook.com/devasthaly",
          youtube: null,
          instagram: null,
        },
        copyrightText: "© 2026 Devasthaly Vidyapeeth",
      };

      const parsed = publicSiteProfileSchema.safeParse(payload);
      assert.strictEqual(parsed.success, true);
      assert.strictEqual(parsed.data.location.mapEmbedUrl, payload.location.mapEmbedUrl);
      assert.strictEqual(parsed.data.contacts.emergencyMedicalPhone, "9415805530");
      assert.strictEqual(parsed.data.contacts.emergencySecurityPhone, "6307798158");
    });

    // 4. Cache Hygiene & Tag Alignment Verification
    const profileSource = fs.readFileSync(path.resolve(__dirname, "../lib/api/profile.ts"), "utf8");

    test("profile.ts registers canonical tags and no-store for development", () => {
      assert.ok(profileSource.includes('"use cache";'), "profile.ts must declare 'use cache'");
      assert.ok(profileSource.includes('tags: ["profile"]'), "profile.ts must register canonical 'profile' tag");
      assert.ok(profileSource.includes('tags: ["directory"]'), "profile.ts must register canonical 'directory' tag");
      assert.ok(profileSource.includes('cache: "no-store"'), "profile.ts must configure cache: 'no-store' in dev");
      assert.ok(profileSource.includes("revalidate: 60"), "profile.ts must configure revalidate: 60 in prod");
      assert.ok(!profileSource.includes('tags: ["contact"]'), "profile.ts must not reference unused 'contact' tag");
    });

    // 5. Fallback integrity when fetch is disconnected
    await testAsync("getPublicSiteProfile preserves static fallback on network error", async () => {
      const origEnv = process.env.BACKEND_INTERNAL_URL;
      process.env.BACKEND_INTERNAL_URL = "http://127.0.0.1:59999"; // Non-existent port
      try {
        const profile = await getPublicSiteProfile();
        assert.ok(profile);
        assert.strictEqual(profile.schoolName, STATIC_FALLBACK_SITE_PROFILE.schoolName);
        assert.strictEqual(profile.contacts.emergencyMedicalPhone, "9415805530");
      } finally {
        if (origEnv) {
          process.env.BACKEND_INTERNAL_URL = origEnv;
        } else {
          delete process.env.BACKEND_INTERNAL_URL;
        }
      }
    });

    await testAsync("getPublicCampusDirectory preserves static fallback on network error", async () => {
      const origEnv = process.env.BACKEND_INTERNAL_URL;
      process.env.BACKEND_INTERNAL_URL = "http://127.0.0.1:59999"; // Non-existent port
      try {
        const directory = await getPublicCampusDirectory();
        assert.ok(Array.isArray(directory));
        assert.strictEqual(directory.length, STATIC_FALLBACK_DIRECTORY_ENTRIES.length);
      } finally {
        if (origEnv) {
          process.env.BACKEND_INTERNAL_URL = origEnv;
        } else {
          delete process.env.BACKEND_INTERNAL_URL;
        }
      }
    });

    console.log(`\nResults: ${passed}/${total} tests passed.\n`);
    if (passed !== total) {
      process.exit(1);
    }
  } finally {
    if (fs.existsSync(distPath)) {
      fs.unlinkSync(distPath);
    }
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
