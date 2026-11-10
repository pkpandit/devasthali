import "server-only";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * In-memory sliding rate limiter.
 *
 * ARCHITECTURAL LIMITATIONS:
 * 1. Process Restart: In-memory counters reset when the server restarts or reloads.
 * 2. Multi-Instance: Counters are per-process and NOT shared across horizontal cluster
 *    workers or serverless functions. For distributed multi-instance production deployments,
 *    a shared key-value store (such as Redis or database-backed rate-limiting) is required.
 */
class InMemoryRateLimiter {
  private attempts = new Map<string, RateLimitRecord>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  public check(key: string): { allowed: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now >= record.resetAt) {
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (record.count >= this.maxAttempts) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      return { allowed: false, retryAfterSeconds };
    }

    return { allowed: true, retryAfterSeconds: 0 };
  }

  public recordFailure(key: string): void {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now >= record.resetAt) {
      this.attempts.set(key, { count: 1, resetAt: now + this.windowMs });
    } else {
      record.count += 1;
    }
  }

  public reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Distinct two-tier in-memory login throttler:
 * 1. Combined IP + Email tier: 5 failed attempts per 15 minutes (protects individual accounts from single-source brute force).
 * 2. IP tier: 25 failed attempts per 15 minutes (protects portal against credential-stuffing across many accounts from one IP).
 *
 * NOTE ON DISTRIBUTED PER-EMAIL ATTACKS:
 * Global per-email locking across all IPs is intentionally not enabled to prevent malicious actors
 * from easily orchestrating a distributed Denial-of-Service lockout against legitimate administrators.
 */
export class LoginThrottler {
  private combinedLimiter = new InMemoryRateLimiter(5, 15 * 60 * 1000); // 5 attempts per (IP, email)
  private ipLimiter = new InMemoryRateLimiter(25, 15 * 60 * 1000);       // 25 attempts per IP

  public check(
    clientIp: string,
    normalizedEmail: string
  ): { allowed: boolean; retryAfterSeconds: number; reason?: "IP_LIMIT" | "COMBINED_LIMIT" } {
    // 1. Check IP-wide limit
    const ipCheck = this.ipLimiter.check(clientIp);
    if (!ipCheck.allowed) {
      return {
        allowed: false,
        retryAfterSeconds: ipCheck.retryAfterSeconds,
        reason: "IP_LIMIT",
      };
    }

    // 2. Check combined (IP + Email) limit
    const combinedKey = `${clientIp}:${normalizedEmail}`;
    const combinedCheck = this.combinedLimiter.check(combinedKey);
    if (!combinedCheck.allowed) {
      return {
        allowed: false,
        retryAfterSeconds: combinedCheck.retryAfterSeconds,
        reason: "COMBINED_LIMIT",
      };
    }

    return { allowed: true, retryAfterSeconds: 0 };
  }

  public recordFailure(clientIp: string, normalizedEmail: string): void {
    this.ipLimiter.recordFailure(clientIp);
    this.combinedLimiter.recordFailure(`${clientIp}:${normalizedEmail}`);
  }

  public reset(clientIp: string, normalizedEmail: string): void {
    this.combinedLimiter.reset(`${clientIp}:${normalizedEmail}`);
  }
}

export const loginRateLimiter = new LoginThrottler();
