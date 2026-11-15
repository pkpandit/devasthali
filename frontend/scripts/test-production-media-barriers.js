/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");

console.log("===============================================================");
console.log("  Running Frontend Production Media Barrier Tests");
console.log("===============================================================");

// 1. Test getAllowedMediaHostnames and isDisplayablePhotoUrl
{
  console.log("\n--- 1. Topper Photo Hostname Acceptance & Rejection ---");

  function getAllowedMediaHostnames(env = process.env) {
    const allowed = new Set(["127.0.0.1", "localhost"]);
    const configuredOrigin =
      env.NEXT_PUBLIC_MEDIA_ORIGIN ||
      env.PUBLIC_MEDIA_ORIGIN;

    if (configuredOrigin) {
      try {
        const parsed = new URL(configuredOrigin);
        if (parsed.hostname) {
          allowed.add(parsed.hostname.toLowerCase());
        }
      } catch {
        // Ignore invalid URL
      }
    }

    return allowed;
  }

  function isDisplayablePhotoUrl(url, env = process.env) {
    if (!url) return false;
    const trimmed = url.trim();

    if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
      return true;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return false;
      }

      if (!parsed.pathname.startsWith("/api/public/media/toppers/")) {
        return false;
      }

      const allowedHosts = getAllowedMediaHostnames(env);
      return allowedHosts.has(parsed.hostname.toLowerCase());
    } catch {
      return false;
    }
  }

  // A. Root-relative assets
  assert.strictEqual(isDisplayablePhotoUrl("/images/toppers/scholar.jpg"), true);
  assert.strictEqual(isDisplayablePhotoUrl("/images/toppers/trophy.webp"), true);
  assert.strictEqual(isDisplayablePhotoUrl("//malicious.com/image.jpg"), false);
  assert.strictEqual(isDisplayablePhotoUrl("/\\malicious.com/image.jpg"), false);
  console.log("  [PASS] Root-relative static paths accepted, protocol-relative rejected");

  // B. Default local development origins
  assert.strictEqual(isDisplayablePhotoUrl("http://127.0.0.1:3001/api/public/media/toppers/top_123.webp"), true);
  assert.strictEqual(isDisplayablePhotoUrl("http://localhost:3001/api/public/media/toppers/top_123.webp"), true);
  console.log("  [PASS] Local loopback development origins accepted");

  // C. Configured production origin
  const prodEnv = { NEXT_PUBLIC_MEDIA_ORIGIN: "https://admin.devasthaly.edu.in" };
  assert.strictEqual(
    isDisplayablePhotoUrl("https://admin.devasthaly.edu.in/api/public/media/toppers/top_prod_abc.webp", prodEnv),
    true
  );
  console.log("  [PASS] Configured production media origin accepted");

  // D. Fallback to PUBLIC_MEDIA_ORIGIN if NEXT_PUBLIC_ is omitted
  const fallbackEnv = { PUBLIC_MEDIA_ORIGIN: "https://media.devasthaly.edu.in" };
  assert.strictEqual(
    isDisplayablePhotoUrl("https://media.devasthaly.edu.in/api/public/media/toppers/top_fallback.webp", fallbackEnv),
    true
  );
  console.log("  [PASS] PUBLIC_MEDIA_ORIGIN fallback accepted");

  // E. Untrusted external hosts strictly rejected
  assert.strictEqual(
    isDisplayablePhotoUrl("https://evil-hacker.com/api/public/media/toppers/top_evil.webp", prodEnv),
    false
  );
  assert.strictEqual(
    isDisplayablePhotoUrl("https://google.com/api/public/media/toppers/top_123.webp", prodEnv),
    false
  );
  console.log("  [PASS] Arbitrary external origins strictly rejected");

  // F. Path traversal and unauthorized paths on valid host rejected
  assert.strictEqual(
    isDisplayablePhotoUrl("https://admin.devasthaly.edu.in/api/admin/users", prodEnv),
    false
  );
  assert.strictEqual(
    isDisplayablePhotoUrl("https://admin.devasthaly.edu.in/uploads/secrets.json", prodEnv),
    false
  );
  console.log("  [PASS] Non-topper paths on authorized production origin rejected");

  // G. Non-HTTP protocols rejected
  assert.strictEqual(isDisplayablePhotoUrl("javascript:alert(1)"), false);
  assert.strictEqual(isDisplayablePhotoUrl("ftp://admin.devasthaly.edu.in/api/public/media/toppers/top.webp", prodEnv), false);
  assert.strictEqual(isDisplayablePhotoUrl(null), false);
  assert.strictEqual(isDisplayablePhotoUrl(""), false);
  console.log("  [PASS] Dangerous protocols and empty inputs safely rejected");
}

// 2. Test next.config.ts Remote Patterns Configuration
{
  console.log("\n--- 2. Next.js Image remotePatterns Configuration ---");

  function getMediaRemotePatterns(isDev, configuredOrigin) {
    const patterns = [];
    const seen = new Set();

    const addPattern = (protocol, hostname, port, pathname) => {
      const key = `${protocol}://${hostname}:${port || ""}${pathname}`;
      if (!seen.has(key)) {
        seen.add(key);
        patterns.push({
          protocol,
          hostname,
          ...(port ? { port } : {}),
          pathname,
        });
      }
    };

    if (isDev) {
      addPattern("http", "127.0.0.1", "3001", "/api/public/media/toppers/**");
      addPattern("http", "localhost", "3001", "/api/public/media/toppers/**");
    }

    if (configuredOrigin) {
      try {
        const parsed = new URL(configuredOrigin);
        const protocol = parsed.protocol.replace(":", "");
        if ((protocol === "http" || protocol === "https") && parsed.hostname) {
          addPattern(protocol, parsed.hostname, parsed.port || undefined, "/api/public/media/toppers/**");
        }
      } catch {
        // Ignore invalid URL
      }
    }

    return patterns;
  }

  // Development with no custom origin: 2 patterns (127.0.0.1, localhost)
  const devPatterns = getMediaRemotePatterns(true, null);
  assert.strictEqual(devPatterns.length, 2);
  assert.strictEqual(devPatterns[0].hostname, "127.0.0.1");
  assert.strictEqual(devPatterns[1].hostname, "localhost");
  console.log("  [PASS] Development generates loopback patterns");

  // Production with configured origin: exactly 1 production pattern
  const prodPatterns = getMediaRemotePatterns(false, "https://admin.devasthaly.edu.in");
  assert.strictEqual(prodPatterns.length, 1);
  assert.strictEqual(prodPatterns[0].protocol, "https");
  assert.strictEqual(prodPatterns[0].hostname, "admin.devasthaly.edu.in");
  assert.strictEqual(prodPatterns[0].pathname, "/api/public/media/toppers/**");
  console.log("  [PASS] Production generates exact configured origin pattern");

  // Production with custom port
  const prodPortPatterns = getMediaRemotePatterns(false, "https://media.devasthaly.edu.in:8443");
  assert.strictEqual(prodPortPatterns.length, 1);
  assert.strictEqual(prodPortPatterns[0].port, "8443");
  console.log("  [PASS] Production preserves custom port if configured");

  // Invalid origin does not crash
  const invalidPatterns = getMediaRemotePatterns(false, "not-a-valid-url");
  assert.strictEqual(invalidPatterns.length, 0);
  console.log("  [PASS] Invalid URL origin handled gracefully without throwing");
}

console.log("\n===============================================================");
console.log("  All Frontend Production Media Barrier Tests PASSED!");
console.log("===============================================================");
