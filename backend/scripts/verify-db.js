/* eslint-disable @typescript-eslint/no-require-imports */
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: ".env" });

async function verifyDatabase() {
  const prisma = new PrismaClient();
  try {
    console.log("--> Testing database connection (SELECT 1)...");
    const ping = await prisma.$queryRawUnsafe("SELECT 1 as connected");
    console.log("--> Connection status: SUCCESS", ping);

    const meta = await prisma.$queryRawUnsafe(
      "SELECT current_database() as database, current_schema() as schema, version() as version"
    );
    console.log("--> Database details:", meta[0]);

    const tables = await prisma.$queryRawUnsafe(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() ORDER BY table_name"
    );
    const tableNames = tables.map((t) => t.table_name);
    console.log(`--> Existing tables in schema (${tableNames.length}):`, tableNames);

    const hasMigrations = tableNames.includes("_prisma_migrations");
    console.log("--> Migration history table (_prisma_migrations) present:", hasMigrations);

    if (hasMigrations) {
      const migrationRows = await prisma.$queryRawUnsafe(
        "SELECT id, migration_name, finished_at, rolled_back_at, applied_steps_count FROM _prisma_migrations ORDER BY started_at"
      );
      console.log("--> Applied migrations in _prisma_migrations:", migrationRows);
    }

    // Check enums
    const enums = await prisma.$queryRawUnsafe(`
      SELECT t.typname, array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      GROUP BY t.typname
      ORDER BY t.typname
    `);
    console.log("--> Enum types present:", enums);

    // Check row counts for application tables
    const userCount = await prisma.user.count();
    const sessionCount = await prisma.session.count();
    const auditLogCount = await prisma.auditLog.count();
    const topperCount = await prisma.boardResultTopper.count();
    console.log("--> Application table row counts:", {
      users: userCount,
      sessions: sessionCount,
      audit_logs: auditLogCount,
      board_result_toppers: topperCount,
    });

    // Check indexes
    const indexes = await prisma.$queryRawUnsafe(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = current_schema() AND tablename NOT LIKE 'pg_%'
      ORDER BY tablename, indexname
    `);
    console.log(`--> Indexes present (${indexes.length}):`, indexes);

    // Check foreign keys
    const foreignKeys = await prisma.$queryRawUnsafe(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
        AND rc.constraint_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = current_schema()
      ORDER BY tc.table_name, tc.constraint_name
    `);
    console.log("--> Foreign keys present:", foreignKeys);
  } catch (err) {
    console.error("[FATAL ERROR] Database verification failed:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  verifyDatabase();
}

module.exports = { verifyDatabase };
