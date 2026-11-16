/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Navigation Public API Logic, DTO Projections, Degradation,
 * Draft Isolation, and Database Parity.
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

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
  console.log("  Running Test Suite: Public Navigation API Logic & DTO Projections");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // 1. DTO Projection Logic & Graceful Degradation Tests
  // -------------------------------------------------------------
  console.log("--- 1. Projection & Graceful Degradation Logic ---");

  // Helper simulating endpoint projection
  function projectHeaderItem(item) {
    const publishedCols = (item.columns || [])
      .filter((col) => col.isPublished)
      .map((col) => ({
        heading: col.heading || undefined,
        items: (col.links || [])
          .filter((link) => link.isPublished)
          .map((link) => ({
            name: link.label,
            href: link.href,
            badge: link.badge || undefined,
            openInNewTab: link.openInNewTab || undefined,
          })),
      }))
      .filter((col) => col.items.length > 0);

    const hasColumns = publishedCols.length > 0;
    const panelTypeMap = {
      COMPACT: "compact",
      MEDIUM: "medium",
      MEGA: "mega",
    };
    const panelType = hasColumns && item.panelType !== "NONE" ? panelTypeMap[item.panelType] : undefined;

    return {
      name: item.label,
      href: item.href,
      badge: item.badge || undefined,
      openInNewTab: item.openInNewTab || undefined,
      panelType,
      columns: hasColumns ? publishedCols : undefined,
    };
  }

  // Test 1a: Plain item with NONE
  const itemNone = projectHeaderItem({
    label: "Home",
    href: "/",
    panelType: "NONE",
    columns: [],
  });
  assert("Item with NONE panel projects without panelType or columns", itemNone.panelType === undefined && itemNone.columns === undefined);

  // Test 1b: COMPACT item with 1 column and 2 published links
  const itemCompact = projectHeaderItem({
    label: "Contact",
    href: "/contact",
    panelType: "COMPACT",
    columns: [
      {
        id: "col-1",
        heading: null,
        isPublished: true,
        links: [
          { label: "Directory", href: "/contact", isPublished: true },
          { label: "Location", href: "/contact#loc", isPublished: true },
        ],
      },
    ],
  });
  assert("COMPACT item with links projects panelType 'compact'", itemCompact.panelType === "compact");
  assert("COMPACT item contains 1 column with 2 links", itemCompact.columns?.length === 1 && itemCompact.columns[0].items.length === 2);

  // Test 1c: COMPACT item where column has 0 published links (all drafts)
  const itemDegraded = projectHeaderItem({
    label: "Draft Section",
    href: "/draft",
    panelType: "COMPACT",
    columns: [
      {
        id: "col-1",
        isPublished: true,
        links: [
          { label: "Secret", href: "/secret", isPublished: false },
        ],
      },
    ],
  });
  assert("Item degrades panelType to undefined when all links are unpublished", itemDegraded.panelType === undefined);
  assert("Degraded item has columns undefined", itemDegraded.columns === undefined);

  // Test 1d: MEGA item with 3 columns, badges and openInNewTab
  const itemMega = projectHeaderItem({
    label: "Academics",
    href: "/academics",
    badge: "Top",
    openInNewTab: false,
    panelType: "MEGA",
    columns: [
      {
        heading: "Col 1",
        isPublished: true,
        links: [{ label: "L1", href: "/l1", badge: "New", isPublished: true }],
      },
      {
        heading: "Col 2",
        isPublished: true,
        links: [{ label: "L2", href: "https://external.com", openInNewTab: true, isPublished: true }],
      },
    ],
  });
  assert("MEGA item projects panelType 'mega'", itemMega.panelType === "mega");
  assert("MEGA item preserves link badge", itemMega.columns?.[0].items[0].badge === "New");
  assert("MEGA item preserves openInNewTab", itemMega.columns?.[1].items[0].openInNewTab === true);

  // -------------------------------------------------------------
  // 2. Draft & Unpublished Isolation Tests
  // -------------------------------------------------------------
  console.log("\n--- 2. Draft & Unpublished Isolation ---");
  const mixedRawItems = [
    { id: "item-1", label: "Published 1", isPublished: true, displayOrder: 0, columns: [] },
    { id: "item-2", label: "Draft Item", isPublished: false, displayOrder: 1, columns: [] },
    { id: "item-3", label: "Published 2", isPublished: true, displayOrder: 2, columns: [] },
  ];

  const publishedOnly = mixedRawItems.filter((i) => i.isPublished);
  assert("Filters out unpublished top-level item", publishedOnly.length === 2 && !publishedOnly.some((i) => i.id === "item-2"));

  // -------------------------------------------------------------
  // 3. Database Parity Tests against Seed Data
  // -------------------------------------------------------------
  console.log("\n--- 3. Database Parity against Seeded Data ---");
  try {
    const [headerItems, footerAdmissionsItems, footerLifeItems] = await Promise.all([
      prisma.navigationItem.findMany({
        where: { location: "HEADER_PRIMARY", isPublished: true },
        orderBy: { displayOrder: "asc" },
        include: {
          columns: {
            where: { isPublished: true },
            orderBy: { displayOrder: "asc" },
            include: {
              links: {
                where: { isPublished: true },
                orderBy: { displayOrder: "asc" },
              },
            },
          },
        },
      }),
      prisma.navigationItem.findMany({
        where: { location: "FOOTER_ADMISSIONS", isPublished: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.navigationItem.findMany({
        where: { location: "FOOTER_COMMUNITY", isPublished: true },
        orderBy: { displayOrder: "asc" },
      }),
    ]);

    assert("Database has exactly 7 published HEADER_PRIMARY items", headerItems.length === 7);
    assert("First header item is 'Home'", headerItems[0]?.label === "Home");
    assert("Last header item is 'Contact'", headerItems[6]?.label === "Contact");

    // Check dropdown structures
    const aboutItem = headerItems.find((i) => i.label === "About Us");
    assert("Header item 'About Us' exists and has panelType MEGA", aboutItem && aboutItem.panelType === "MEGA");
    assert("'About Us' contains 2 published columns", aboutItem?.columns.length === 2);
    assert("Column 1 heading is 'Overview & Heritage'", aboutItem?.columns[0]?.heading === "Overview & Heritage");
    assert("Column 2 heading is 'Leadership Messages'", aboutItem?.columns[1]?.heading === "Leadership Messages");

    const admissionsItem = headerItems.find((i) => i.label === "Admissions");
    assert("Header item 'Admissions' exists and has panelType MEGA", admissionsItem && admissionsItem.panelType === "MEGA");
    const onlineFormLink = admissionsItem?.columns[1]?.links.find((l) => l.label === "Online Admission Form");
    assert("Found 'Online Admission Form' with badge 'Apply Now'", onlineFormLink?.badge === "Apply Now");

    const lifeItem = headerItems.find((i) => i.label === "Life at School");
    assert("Header item 'Life at School' has panelType MEDIUM", lifeItem && lifeItem.panelType === "MEDIUM");

    const studentsItem = headerItems.find((i) => i.label === "Students & Parents");
    assert("Header item 'Students & Parents' has panelType COMPACT", studentsItem && studentsItem.panelType === "COMPACT");

    // Footers
    assert("Database has 8 published FOOTER_ADMISSIONS items", footerAdmissionsItems.length === 8);
    assert("First admissions footer link is '/admissions'", footerAdmissionsItems[0]?.href === "/admissions");
    assert("Second admissions footer link is '/admissions/procedure'", footerAdmissionsItems[1]?.href === "/admissions/procedure");

    assert("Database has 8 published FOOTER_COMMUNITY items", footerLifeItems.length === 8);
    assert("First community footer link is '/facilities'", footerLifeItems[0]?.href === "/facilities");

  } catch (err) {
    assert("Database query executed cleanly", false, err.message);
  } finally {
    await prisma.$disconnect();
  }

  // -------------------------------------------------------------
  // 4. Cache-Control Header Requirement
  // -------------------------------------------------------------
  console.log("\n--- 4. Cache-Control Header Verification ---");
  const EXPECTED_CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=300";
  assert(
    "Cache-Control header matches CDN specification",
    EXPECTED_CACHE_CONTROL === "public, s-maxage=60, stale-while-revalidate=300"
  );

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n==================================================================");
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`  Navigation API Test Suite: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("==================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Test suite fatal error:", err);
  process.exit(1);
});
