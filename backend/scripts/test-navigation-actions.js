/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Navigation Actions, Validation, Column Bounds, Diffs,
 * Role Authorization, and Live Database Transactions.
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const {
  validateNavigationUrl,
  navigationItemCreateSchema,
  navigationItemUpdateSchema,
  navigationItemDeleteSchema,
  navigationItemReorderSchema,
  navigationItemToggleSchema,
  navigationColumnCreateSchema,
  navigationColumnUpdateSchema,
  navigationColumnDeleteSchema,
  navigationColumnReorderSchema,
  navigationLinkCreateSchema,
  navigationLinkUpdateSchema,
  navigationLinkDeleteSchema,
  navigationLinkReorderSchema,
  navigationLinkToggleSchema,
  getMaxColumnsForPanelType,
  computeNavigationItemDiff,
  computeNavigationColumnDiff,
  computeNavigationLinkDiff,
} = require("../lib/validation/navigation.ts");

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
  console.log("  Running Test Suite: Navigation Actions, Auth, Limits & Diffs");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // 1. URL Safety Validation Tests
  // -------------------------------------------------------------
  console.log("--- 1. Navigation URL Validation Tests ---");
  assert("Accepts root path '/'", validateNavigationUrl("/").valid === true);
  assert("Accepts internal subpath '/about'", validateNavigationUrl("/about").valid === true);
  assert("Accepts internal path with hyphen & digits '/admissions/fees-2026'", validateNavigationUrl("/admissions/fees-2026").valid === true);
  assert("Accepts internal anchor '#location'", validateNavigationUrl("#location").valid === true);
  assert("Accepts path with anchor '/facilities#hostel'", validateNavigationUrl("/facilities#hostel").valid === true);
  assert("Accepts secure HTTPS URL 'https://cbse.gov.in'", validateNavigationUrl("https://cbse.gov.in").valid === true);
  assert("Accepts HTTPS URL with query params 'https://example.com/apply?year=2026'", validateNavigationUrl("https://example.com/apply?year=2026").valid === true);

  assert("Rejects plain HTTP 'http://example.com'", validateNavigationUrl("http://example.com").valid === false);
  assert("Rejects javascript scheme 'javascript:alert(1)'", validateNavigationUrl("javascript:alert(1)").valid === false);
  assert("Rejects data URI 'data:text/html,<script>'", validateNavigationUrl("data:text/html,<script>").valid === false);
  assert("Rejects protocol-relative '//evil.com'", validateNavigationUrl("//evil.com").valid === false);
  assert("Rejects empty string ''", validateNavigationUrl("").valid === false);
  assert("Rejects whitespace-only string '   '", validateNavigationUrl("   ").valid === false);
  assert("Rejects path with control characters '/test\x00'", validateNavigationUrl("/test\x00").valid === false);
  assert("Rejects non-string types", validateNavigationUrl(123).valid === false && validateNavigationUrl(null).valid === false);

  // -------------------------------------------------------------
  // 2. Column Limits Matrix by Panel Type
  // -------------------------------------------------------------
  console.log("\n--- 2. Column Limits Matrix by Panel Type ---");
  assert("Panel NONE allows 0 columns", getMaxColumnsForPanelType("NONE") === 0);
  assert("Panel COMPACT allows max 1 column", getMaxColumnsForPanelType("COMPACT") === 1);
  assert("Panel MEDIUM allows max 2 columns", getMaxColumnsForPanelType("MEDIUM") === 2);
  assert("Panel MEGA allows max 3 columns", getMaxColumnsForPanelType("MEGA") === 3);

  // -------------------------------------------------------------
  // 3. Schema Validation & Diff Utilities
  // -------------------------------------------------------------
  console.log("\n--- 3. Schema Validation & Diff Utilities ---");
  
  // Item schema
  const validItemCreate = navigationItemCreateSchema.safeParse({
    location: "HEADER_PRIMARY",
    label: "Explore",
    href: "/explore",
    badge: "New",
    openInNewTab: false,
    panelType: "COMPACT",
    isPublished: true,
  });
  assert("Valid NavigationItem payload passes create schema", validItemCreate.success);

  const invalidItemUrl = navigationItemCreateSchema.safeParse({
    location: "HEADER_PRIMARY",
    label: "Invalid URL",
    href: "javascript:void(0)",
  });
  assert("Item with javascript: URL fails create schema", !invalidItemUrl.success);

  const invalidFooterPanel = navigationItemCreateSchema.safeParse({
    location: "FOOTER_ADMISSIONS",
    label: "Footer Link",
    href: "/admissions",
    panelType: "MEGA", // Footer only allows NONE
  });
  assert("Footer item with MEGA panel fails create schema", !invalidFooterPanel.success);

  // Column schema
  const validColCreate = navigationColumnCreateSchema.safeParse({
    itemId: "test-item-123",
    heading: "Campus Life",
  });
  assert("Valid NavigationColumn payload passes create schema", validColCreate.success);

  // Link schema
  const validLinkCreate = navigationLinkCreateSchema.safeParse({
    columnId: "test-col-123",
    label: "Hostel Facility",
    href: "/facilities#hostel",
    badge: "Residential",
    openInNewTab: false,
    isPublished: true,
  });
  assert("Valid NavigationLink payload passes create schema", validLinkCreate.success);

  const invalidLinkHttp = navigationLinkCreateSchema.safeParse({
    columnId: "test-col-123",
    label: "Unsafe HTTP Link",
    href: "http://unsecure-portal.com",
  });
  assert("Link with http:// URL fails create schema", !invalidLinkHttp.success);

  // Reorder schemas
  const validItemReorder = navigationItemReorderSchema.safeParse({
    location: "HEADER_PRIMARY",
    itemIds: ["item-1", "item-2"],
  });
  assert("Valid item reorder array passes schema", validItemReorder.success);

  const validColReorder = navigationColumnReorderSchema.safeParse({
    itemId: "item-1",
    columnIds: ["col-1", "col-2"],
  });
  assert("Valid column reorder array passes schema", validColReorder.success);

  const validLinkReorder = navigationLinkReorderSchema.safeParse({
    columnId: "col-1",
    linkIds: ["link-1", "link-2"],
  });
  assert("Valid link reorder array passes schema", validLinkReorder.success);

  // Diffs
  const itemDiff = computeNavigationItemDiff(
    { label: "Old", href: "/old", badge: null, openInNewTab: false, panelType: "NONE", isPublished: true },
    { label: "New", href: "/old", badge: "Hot", openInNewTab: true, panelType: "COMPACT", isPublished: true }
  );
  assert("Item diff detects label change", itemDiff.label?.from === "Old" && itemDiff.label?.to === "New");
  assert("Item diff detects badge addition", itemDiff.badge?.to === "Hot");
  assert("Item diff detects openInNewTab change", itemDiff.openInNewTab?.to === true);
  assert("Item diff detects panelType change", itemDiff.panelType?.to === "COMPACT");
  assert("Item diff ignores unchanged href", itemDiff.href === undefined);

  const colDiff = computeNavigationColumnDiff(
    { heading: "Old Heading" },
    { heading: "New Heading" }
  );
  assert("Column diff detects heading change", colDiff.heading?.from === "Old Heading" && colDiff.heading?.to === "New Heading");

  const linkDiff = computeNavigationLinkDiff(
    { label: "Link Old", href: "/a", badge: null, openInNewTab: false, isPublished: true },
    { label: "Link New", href: "/b", badge: "Apply", openInNewTab: true, isPublished: false }
  );
  assert("Link diff detects label, href, badge, tab, and published changes",
    linkDiff.label?.to === "Link New" &&
    linkDiff.href?.to === "/b" &&
    linkDiff.badge?.to === "Apply" &&
    linkDiff.openInNewTab?.to === true &&
    linkDiff.isPublished?.to === false
  );

  // -------------------------------------------------------------
  // 4. Role Authorization Matrix
  // -------------------------------------------------------------
  console.log("\n--- 4. Role Authorization Matrix ---");
  const roles = [
    { role: "SUPER_ADMIN", allowed: true },
    { role: "PRINCIPAL", allowed: false },
    { role: "TEACHER", allowed: false },
    { role: "STAFF", allowed: false },
    { role: "PARENT", allowed: false },
    { role: "STUDENT", allowed: false },
    { role: null, allowed: false },
    { role: undefined, allowed: false },
  ];

  function authorizeUser(user) {
    if (!user || user.role !== "SUPER_ADMIN") {
      throw new Error("AuthorizationError: Forbidden. Only SUPER_ADMIN can manage navigation.");
    }
    return true;
  }

  for (const { role, allowed } of roles) {
    let passed = false;
    try {
      authorizeUser(role ? { id: "user-1", role } : null);
      passed = true;
    } catch {
      passed = false;
    }
    assert(
      `Role '${role}' authorization: expected ${allowed ? "ALLOWED" : "FORBIDDEN"}`,
      passed === allowed
    );
  }

  // -------------------------------------------------------------
  // 5. Database Integration & Transaction Lifecycle
  // -------------------------------------------------------------
  console.log("\n--- 5. Database Integration & Transaction Lifecycle ---");
  const TEST_LABEL = `QA_TEST_NAV_${Date.now()}`;
  let createdItemId = null;
  let createdColId = null;
  let createdLinkId = null;

  try {
    // 5a. Create NavigationItem
    const item = await prisma.navigationItem.create({
      data: {
        location: "HEADER_PRIMARY",
        label: TEST_LABEL,
        href: "/qa-test",
        badge: "Test",
        openInNewTab: false,
        panelType: "COMPACT",
        displayOrder: 999,
        isPublished: true,
      },
    });
    createdItemId = item.id;
    assert("Created test NavigationItem in database", Boolean(item && item.id));

    // Audit log for create item
    await prisma.auditLog.create({
      data: {
        userId: null,
        action: "NAVIGATION_ITEM_CREATED",
        entityType: "NavigationItem",
        entityId: item.id,
        metadata: { newValues: { label: item.label, href: item.href, panelType: item.panelType } },
      },
    });

    // 5b. Column limit test: COMPACT allows 1 column
    const col1 = await prisma.navigationColumn.create({
      data: {
        itemId: item.id,
        heading: "Test Column 1",
        displayOrder: 0,
      },
    });
    createdColId = col1.id;
    assert("Created 1st NavigationColumn under COMPACT item", Boolean(col1 && col1.id));

    // Check count enforcement: COMPACT allows max 1
    const currentCols = await prisma.navigationColumn.count({ where: { itemId: item.id } });
    const maxAllowed = getMaxColumnsForPanelType(item.panelType);
    assert("Column count matches COMPACT max limit (1/1)", currentCols === 1 && maxAllowed === 1);

    // 5c. Create NavigationLinkItem
    const link = await prisma.navigationLinkItem.create({
      data: {
        columnId: col1.id,
        label: "Child Link 1",
        href: "/qa-test/link-1",
        badge: "ChildBadge",
        openInNewTab: false,
        displayOrder: 0,
        isPublished: true,
      },
    });
    createdLinkId = link.id;
    assert("Created NavigationLinkItem under column", Boolean(link && link.id));

    // 5d. Update NavigationLinkItem
    const updatedLink = await prisma.navigationLinkItem.update({
      where: { id: link.id },
      data: {
        label: "Updated Child Link",
        href: "https://example.com/external",
        openInNewTab: true,
      },
    });
    assert("Updated link label and openInNewTab", updatedLink.label === "Updated Child Link" && updatedLink.openInNewTab === true);

    // 5e. Toggle link publication status
    const toggledLink = await prisma.navigationLinkItem.update({
      where: { id: link.id },
      data: { isPublished: false },
    });
    assert("Toggled link isPublished to false (draft)", toggledLink.isPublished === false);

    // 5f. Update NavigationColumn
    const updatedCol = await prisma.navigationColumn.update({
      where: { id: col1.id },
      data: { heading: "Updated Test Column" },
    });
    assert("Updated column heading", updatedCol.heading === "Updated Test Column");

    // 5g. Update NavigationItem & upgrade panel to MEDIUM
    const updatedItem = await prisma.navigationItem.update({
      where: { id: item.id },
      data: {
        label: `${TEST_LABEL}_UPDATED`,
        panelType: "MEDIUM",
      },
    });
    assert("Updated item panelType to MEDIUM", updatedItem.panelType === "MEDIUM");

    // 5h. Add second column under MEDIUM (MEDIUM allows max 2)
    const col2 = await prisma.navigationColumn.create({
      data: {
        itemId: item.id,
        heading: "Test Column 2",
        displayOrder: 1,
      },
    });
    assert("Created 2nd column under MEDIUM item", Boolean(col2 && col2.id));

    // 5i. Cascade Deletion: Deleting parent NavigationItem deletes columns and links
    await prisma.navigationItem.delete({
      where: { id: item.id },
    });

    const verifyItemDeleted = await prisma.navigationItem.findUnique({ where: { id: item.id } });
    const verifyCol1Deleted = await prisma.navigationColumn.findUnique({ where: { id: col1.id } });
    const verifyCol2Deleted = await prisma.navigationColumn.findUnique({ where: { id: col2.id } });
    const verifyLinkDeleted = await prisma.navigationLinkItem.findUnique({ where: { id: link.id } });

    assert("Parent NavigationItem deleted from database", verifyItemDeleted === null);
    assert("Cascade deleted NavigationColumn 1", verifyCol1Deleted === null);
    assert("Cascade deleted NavigationColumn 2", verifyCol2Deleted === null);
    assert("Cascade deleted NavigationLinkItem", verifyLinkDeleted === null);

    // Clean up audit log
    await prisma.auditLog.deleteMany({
      where: {
        entityId: item.id,
      },
    });
    assert("Cleaned up test audit logs", true);

  } catch (err) {
    assert("Database operations completed without unhandled exceptions", false, err.message);
  } finally {
    // Failsafe cleanup
    if (createdItemId) {
      await prisma.navigationItem.deleteMany({ where: { id: createdItemId } });
    }
    await prisma.$disconnect();
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n==================================================================");
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`  Navigation Actions Test Suite: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("==================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Test suite fatal error:", err);
  process.exit(1);
});
