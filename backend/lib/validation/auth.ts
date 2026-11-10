import { z } from "zod";

export const AUTH_POLICY = {
  EMAIL_MAX_LENGTH: 255,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PASSWORD_LOGIN_MIN_LENGTH: 1,
  PASSWORD_PROVISION_MIN_LENGTH: 12,
  PASSWORD_MAX_BYTES: 256,
} as const;

/**
 * Universal browser- and server-safe UTF-8 byte length calculator.
 * Does not import Node.js Buffer, ensuring safe importing in Client Components.
 */
export function getUtf8ByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * Validates that a string does not exceed the maximum allowed UTF-8 byte limit (256 bytes).
 */
export function isPasswordWithinByteLimit(password: string): boolean {
  return getUtf8ByteLength(password) <= AUTH_POLICY.PASSWORD_MAX_BYTES;
}

/**
 * Shared email schema:
 * - Trims and lowercases input consistently
 * - Enforces maximum length of 255 characters
 * - Validates standard email structure
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email address is required.")
  .max(
    AUTH_POLICY.EMAIL_MAX_LENGTH,
    `Email address must not exceed ${AUTH_POLICY.EMAIL_MAX_LENGTH} characters.`
  )
  .email("Please enter a valid email address.");

/**
 * Login password schema:
 * - Requires non-empty string
 * - Enforces maximum 256-byte limit
 * - NEVER trims, lowercases, or modifies password content
 */
export const loginPasswordSchema = z
  .string()
  .min(
    AUTH_POLICY.PASSWORD_LOGIN_MIN_LENGTH,
    "Password is required."
  )
  .refine(isPasswordWithinByteLimit, {
    message: `Password exceeds maximum allowed limit (${AUTH_POLICY.PASSWORD_MAX_BYTES} bytes).`,
  });

/**
 * Login input schema for Server Action validation.
 */
export const loginInputSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
  returnUrl: z.string().optional().nullable(),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

/**
 * Provisioning name schema.
 */
export const provisioningNameSchema = z
  .string()
  .trim()
  .min(
    AUTH_POLICY.NAME_MIN_LENGTH,
    `Name must be at least ${AUTH_POLICY.NAME_MIN_LENGTH} characters.`
  )
  .max(
    AUTH_POLICY.NAME_MAX_LENGTH,
    `Name must not exceed ${AUTH_POLICY.NAME_MAX_LENGTH} characters.`
  );

/**
 * Provisioning password schema:
 * - Requires minimum 12 characters
 * - Enforces maximum 256-byte limit
 * - NEVER transforms password content
 */
export const provisioningPasswordSchema = z
  .string()
  .min(
    AUTH_POLICY.PASSWORD_PROVISION_MIN_LENGTH,
    `Password must be at least ${AUTH_POLICY.PASSWORD_PROVISION_MIN_LENGTH} characters.`
  )
  .refine(isPasswordWithinByteLimit, {
    message: `Password exceeds maximum allowed limit (${AUTH_POLICY.PASSWORD_MAX_BYTES} bytes).`,
  });

/**
 * Provisioning input schema:
 * - Validates name, email, password, and exact confirmation match.
 */
export const provisioningInputSchema = z
  .object({
    name: provisioningNameSchema,
    email: emailSchema,
    password: provisioningPasswordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ProvisioningInput = z.infer<typeof provisioningInputSchema>;
