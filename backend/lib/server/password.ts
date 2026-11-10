import "server-only";
import { hash, verify, type Options } from "@node-rs/argon2";
import { AUTH_POLICY, isPasswordWithinByteLimit } from "@/lib/validation/password-policy";

/**
 * OWASP Recommended Argon2id Parameters:
 * - memoryCost: 19456 KiB (19 MiB)
 * - timeCost: 2 iterations
 * - parallelism: 1 thread
 * - outputLen: 32 bytes
 */
const ARGON2_OPTIONS: Options = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

/**
 * Authentic, pre-computed Argon2id hash used to equalize verification latency
 * during login attempts for non-existent user accounts, mitigating timing attacks.
 */
export const DUMMY_ARGON2_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$b2b/IzF0xvHLC+jFEKdN7g$4ryw1ZgPpPlZpyVP6lnbP3UMf1PpUEZJl7fKQRYVH+g";

export class PasswordValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordValidationError";
  }
}

/**
 * Hashes a plaintext password using Argon2id.
 * Plaintext passwords and hashes are never logged.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  if (typeof plaintext !== "string" || plaintext.length === 0) {
    throw new PasswordValidationError("Password cannot be empty.");
  }

  if (!isPasswordWithinByteLimit(plaintext)) {
    throw new PasswordValidationError(
      `Password length exceeds maximum allowed limit (${AUTH_POLICY.PASSWORD_MAX_BYTES} bytes).`
    );
  }

  return hash(plaintext, ARGON2_OPTIONS);
}

/**
 * Verifies a plaintext password against an Argon2id hash using constant-time comparison.
 */
export async function verifyPassword(
  plaintext: string,
  hashedPassword: string
): Promise<boolean> {
  if (
    typeof plaintext !== "string" ||
    plaintext.length === 0 ||
    typeof hashedPassword !== "string" ||
    hashedPassword.length === 0
  ) {
    return false;
  }

  if (!isPasswordWithinByteLimit(plaintext)) {
    return false;
  }

  try {
    return await verify(hashedPassword, plaintext);
  } catch {
    // If the hash is malformed or corrupted, verification fails safely
    return false;
  }
}
