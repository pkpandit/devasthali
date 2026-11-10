/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
      email: true,
    },
  });

  const sanitizedUsers = users.map((u) => ({
    idPrefix: u.id.slice(0, 8) + "...",
    role: u.role,
    isActive: u.isActive,
    emailDomain: u.email.includes("@") ? u.email.split("@")[1] : "unknown",
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
  }));

  const now = new Date();
  const sessions = await prisma.session.findMany({
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  const sanitizedSessions = sessions.map((s) => ({
    idPrefix: s.id.slice(0, 8) + "...",
    userIdPrefix: s.userId.slice(0, 8) + "...",
    createdAt: s.createdAt.toISOString(),
    expiresAt: s.expiresAt.toISOString(),
    isExpired: s.expiresAt < now,
    remainingMinutes: Math.round((s.expiresAt.getTime() - now.getTime()) / 60000),
  }));

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      action: true,
      entityType: true,
      createdAt: true,
      metadata: true,
    },
  });

  const sanitizedLogs = auditLogs.map((l) => ({
    idPrefix: l.id.slice(0, 8) + "...",
    action: l.action,
    entityType: l.entityType,
    createdAt: l.createdAt.toISOString(),
    metadata: l.metadata,
  }));

  console.log("=== USERS ===");
  console.log(JSON.stringify(sanitizedUsers, null, 2));
  console.log("\n=== SESSIONS ===");
  console.log(JSON.stringify(sanitizedSessions, null, 2));
  console.log("\n=== AUDIT_LOGS ===");
  console.log(JSON.stringify(sanitizedLogs, null, 2));

  await prisma.$disconnect();
}

check().catch((err) => {
  console.error("Error inspecting database:", err);
  process.exit(1);
});
