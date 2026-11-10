/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Controlled Local CLI for Provisioning the First SUPER_ADMIN
 *
 * Security Requirements:
 * 1. Strictly local execution only — no network/public endpoint.
 * 2. Passwords are typed interactively without terminal echo (masked).
 * 3. Never accepts passwords from command-line arguments, environment variables, or config files.
 * 4. Normalizes email (trim + lowercase) via shared Zod validation rules.
 * 5. Uses Argon2id via @node-rs/argon2 matching server password utilities.
 * 6. Explicit duplicate check prevents silent overwriting or accidental role changes.
 * 7. Hard initial bootstrap guard: refuses execution if ANY SUPER_ADMIN account exists.
 * 8. Comprehensive Zod schema validation applied to name, email, password length/bytes, and confirmation.
 *
 * NOTE: Preparing this script is authorized; executing it is deferred until explicit user approval.
 */

const readline = require("node:readline");
const { Writable } = require("node:stream");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const { hash } = require("@node-rs/argon2");
const {
  provisioningNameSchema: nameSchema,
  emailSchema,
  provisioningPasswordSchema: passwordSchema,
  provisioningInputSchema,
} = require("../lib/validation/auth.ts");

dotenv.config({ path: ".env" });

const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

function askPassword(query) {
  return new Promise((resolve) => {
    let muted = false;
    const mutableStdout = new Writable({
      write(chunk, encoding, callback) {
        if (!muted) {
          process.stdout.write(chunk, encoding);
        }
        callback();
      },
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true,
    });

    process.stdout.write(query);
    muted = true;

    rl.question("", (ans) => {
      rl.close();
      process.stdout.write("\n");
      resolve(ans);
    });
  });
}

async function provisionSuperAdmin() {
  const prisma = new PrismaClient();

  try {
    console.log("==================================================");
    console.log("  Devasthaly Vidyapeeth — Initial Super Admin Setup");
    console.log("==================================================\n");

    // 1. Initial bootstrap guard: Refuse execution if any SUPER_ADMIN already exists
    const existingSuperAdminCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN" },
    });

    if (existingSuperAdminCount > 0) {
      console.error(
        `[ERROR] Bootstrap refused: A SUPER_ADMIN account already exists in the database ` +
          `(${existingSuperAdminCount} found).\n` +
          `This provisioning script is strictly restricted to initial bootstrapping.\n` +
          `Additional administrators must be created through authenticated administrative workflows.`
      );
      process.exitCode = 1;
      return;
    }

    // 2. Full Name with Zod validation
    const rawName = await askQuestion("Enter Administrator Full Name: ");
    const nameResult = nameSchema.safeParse(rawName);
    if (!nameResult.success) {
      console.error(`[ERROR] ${nameResult.error.issues[0].message}`);
      process.exitCode = 1;
      return;
    }
    const name = nameResult.data;

    // 3. Email Address with Zod validation and normalization
    const rawEmail = await askQuestion("Enter Official Email Address: ");
    const emailResult = emailSchema.safeParse(rawEmail);
    if (!emailResult.success) {
      console.error(`[ERROR] ${emailResult.error.issues[0].message}`);
      process.exitCode = 1;
      return;
    }
    const email = emailResult.data;

    // 4. Duplicate Check
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.error(
        `[ERROR] User with email '${email}' already exists. Silent overwrite is forbidden.`
      );
      process.exitCode = 1;
      return;
    }

    // 5. Password Prompt (without terminal echo) with Zod validation
    const password = await askPassword(
      "Enter Password (minimum 12 characters, masked): "
    );
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      console.error(`[ERROR] ${passwordResult.error.issues[0].message}`);
      process.exitCode = 1;
      return;
    }

    const confirmPassword = await askPassword("Confirm Password (masked): ");

    // Full schema validation including confirmation match
    const fullValidation = provisioningInputSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!fullValidation.success) {
      console.error(`[ERROR] ${fullValidation.error.issues[0].message}`);
      process.exitCode = 1;
      return;
    }

    // 6. Hash Password via Argon2id (matching password.ts OWASP parameters)
    console.log("\nHashing password using Argon2id...");
    const passwordHash = await hash(password, ARGON2_OPTIONS);

    // 7. Atomic Transaction: Create User + Audit Log
    console.log("Writing administrator record to database...");
    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "SUPER_ADMIN",
          isActive: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: createdUser.id,
          action: "AUTH_USER_PROVISIONED",
          entityType: "User",
          entityId: createdUser.id,
          metadata: {
            role: "SUPER_ADMIN",
            method: "LOCAL_CLI_BOOTSTRAP",
          },
        },
      });

      return createdUser;
    });

    console.log("\n==================================================");
    console.log("  SUPER_ADMIN Successfully Provisioned!");
    console.log("==================================================");
    console.log(`  User ID: ${newUser.id}`);
    console.log(`  Name:    ${newUser.name}`);
    console.log(`  Email:   ${newUser.email}`);
    console.log(`  Role:    ${newUser.role}`);
    console.log(`  Active:  ${newUser.isActive}`);
    console.log("==================================================\n");
    console.log("You can now sign in at: http://127.0.0.1:3001/login\n");
  } catch (err) {
    console.error("[FATAL ERROR] Provisioning failed:", err.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  provisionSuperAdmin();
}

module.exports = {
  provisionSuperAdmin,
  nameSchema,
  emailSchema,
  passwordSchema,
  provisioningInputSchema,
};
