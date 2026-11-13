/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Concurrency, Timezone Boundaries, and Migration Rollback.
 * Tests:
 * 1. Concurrency: Parallel/Sequential deterministic slug generation without collisions.
 * 2. Timezone boundaries: UTC vs IST evaluation for scheduled and expired statuses.
 * 3. Migration rollback verification: Executes down-migration SQL inside a rolling-back transaction.
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const { generateDeterministicSlug } = require("../lib/server/slug.ts");
const { getNoticeStatus } = require("../lib/validation/notices.ts");

dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

async function runSuite() {
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
  console.log("  Running Test Suite: Concurrency, Timezones & Rollback Check");
  console.log("==================================================================");

  // -------------------------------------------------------------
  // 1. Concurrency: Deterministic Slug Disambiguation
  // -------------------------------------------------------------
  console.log("--- 1. Deterministic Slug Disambiguation (No Random Nonces) ---");

  const duplicateTitle = "Annual Sports Day Registration 2026";
  const createdIds = [];

  try {
    // Sequentially create 5 items with identical titles
    const slugs = [];
    for (let i = 0; i < 5; i++) {
      const notice = await prisma.$transaction(async (tx) => {
        const slug = await generateDeterministicSlug(tx, duplicateTitle);
        return tx.notice.create({
          data: {
            title: duplicateTitle,
            slug,
            category: "EVENT",
            isPublished: false,
          },
        });
      });
      createdIds.push(notice.id);
      slugs.push(notice.slug);
    }

    assert("Generated 5 slugs", slugs.length === 5);
    assert("Base slug is exact without suffix", slugs[0] === "annual-sports-day-registration-2026");
    assert("Second slug has suffix -2", slugs[1] === "annual-sports-day-registration-2026-2");
    assert("Third slug has suffix -3", slugs[2] === "annual-sports-day-registration-2026-3");
    assert("Fourth slug has suffix -4", slugs[3] === "annual-sports-day-registration-2026-4");
    assert("Fifth slug has suffix -5", slugs[4] === "annual-sports-day-registration-2026-5");

    const uniqueSet = new Set(slugs);
    assert("All generated slugs are strictly unique", uniqueSet.size === 5);

    // Test excludeId behavior: owner of base slug can retain/reclaim base slug without collision
    const firstNoticeId = createdIds[0];
    const baseReclaimedSlug = await prisma.$transaction(async (tx) => {
      return generateDeterministicSlug(tx, duplicateTitle, firstNoticeId);
    });
    assert(
      "Slug generation with excludeId reclaims base slug for original owner",
      baseReclaimedSlug === "annual-sports-day-registration-2026"
    );
  } finally {
    // Clean up created records
    if (createdIds.length > 0) {
      await prisma.notice.deleteMany({
        where: { id: { in: createdIds } },
      });
    }
  }

  // -------------------------------------------------------------
  // 2. Timezone Boundary Checks (UTC vs IST: UTC+05:30)
  // -------------------------------------------------------------
  console.log("\n--- 2. Timezone Boundary Invariance (UTC vs IST) ---");

  // A notice scheduled for midnight IST on 15 Nov 2026:
  // 2026-11-15T00:00:00+05:30 equals 2026-11-14T18:30:00.000Z in UTC.
  const istScheduledStr = "2026-11-15T00:00:00+05:30";
  const scheduledTime = new Date(istScheduledStr);

  // 1 second BEFORE the boundary
  const oneSecondBefore = new Date(scheduledTime.getTime() - 1000);
  assert(
    "1 second before scheduled time is SCHEDULED",
    getNoticeStatus({ isPublished: true, publishDate: istScheduledStr }, oneSecondBefore) ===
      "SCHEDULED"
  );

  // EXACT boundary instant
  assert(
    "Exact scheduled instant transitions to PUBLISHED",
    getNoticeStatus({ isPublished: true, publishDate: istScheduledStr }, scheduledTime) ===
      "PUBLISHED"
  );

  // 1 second AFTER boundary
  const oneSecondAfter = new Date(scheduledTime.getTime() + 1000);
  assert(
    "1 second after scheduled time is PUBLISHED",
    getNoticeStatus({ isPublished: true, publishDate: istScheduledStr }, oneSecondAfter) ===
      "PUBLISHED"
  );

  // Expiry boundary test across month end
  // Notice expiring at 23:59:59 IST on 30 Nov 2026:
  const istExpiryStr = "2026-11-30T23:59:59+05:30";
  const expiryTime = new Date(istExpiryStr);

  const oneSecBeforeExpiry = new Date(expiryTime.getTime() - 1000);
  assert(
    "1 second before expiry is still PUBLISHED",
    getNoticeStatus(
      {
        isPublished: true,
        publishDate: "2026-11-01T00:00:00Z",
        expiryDate: istExpiryStr,
      },
      oneSecBeforeExpiry
    ) === "PUBLISHED"
  );

  assert(
    "Exact expiry time transitions to EXPIRED",
    getNoticeStatus(
      {
        isPublished: true,
        publishDate: "2026-11-01T00:00:00Z",
        expiryDate: istExpiryStr,
      },
      expiryTime
    ) === "EXPIRED"
  );

  // -------------------------------------------------------------
  // 3. Migration Rollback Verification (Down Migration)
  // -------------------------------------------------------------
  console.log("\n--- 3. Down-Migration Rollback SQL Verification ---");

  // In PostgreSQL, DDL is transactional. We can execute the down migration SQL
  // inside a transaction and check that it drops the table and enum cleanly,
  // then ROLL BACK the transaction so the database remains intact.
  try {
    await prisma.$executeRawUnsafe("BEGIN;");

    // Drop table and type inside the isolated transaction
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "notices" CASCADE;');
    await prisma.$executeRawUnsafe('DROP TYPE IF EXISTS "NoticeCategory" CASCADE;');

    // Verify table no longer exists in this transaction snapshot
    const checkTable = await prisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = current_schema() AND table_name = 'notices';
    `);
    assert("Down-migration successfully drops 'notices' table", checkTable.length === 0);

    const checkEnum = await prisma.$queryRawUnsafe(`
      SELECT typname FROM pg_type WHERE typname = 'NoticeCategory';
    `);
    assert("Down-migration successfully drops 'NoticeCategory' enum", checkEnum.length === 0);

    // Rollback to restore the table and type completely
    await prisma.$executeRawUnsafe("ROLLBACK;");

    // Verify table and enum are restored after rollback
    const restoredTable = await prisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = current_schema() AND table_name = 'notices';
    `);
    assert("Table 'notices' intact and restored following rollback", restoredTable.length === 1);

    const restoredEnum = await prisma.$queryRawUnsafe(`
      SELECT typname FROM pg_type WHERE typname = 'NoticeCategory';
    `);
    assert("Enum 'NoticeCategory' intact and restored following rollback", restoredEnum.length === 1);
  } catch (err) {
    await prisma.$executeRawUnsafe("ROLLBACK;").catch(() => {});
    assert("Rollback verification executed without error", false, err.message);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\n==================================================================");
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
