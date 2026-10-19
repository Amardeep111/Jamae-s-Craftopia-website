/**
// DB-ready: replace attempts Map with Prisma LoginAttempt table when production
 * Rate limiter / account lockout / forgot-password helper
 * Simple in-memory (upgrade to Redis/DB for production)
 */

const attempts = new Map(); // key -> { count, lastAttemptTime, lockedUntil }
const FORGOT_LIMIT = 3;        // max forgot attempts per hour
const FORGOT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 min lock after 5 failed logins
const MAX_LOGIN_ATTEMPTS = 5;

export function recordFailedLogin(key) {
  const now = Date.now();
  const record = attempts.get(key) || { count: 0, lastAttemptTime: now, lockedUntil: 0 };
  record.count += 1;
  record.lastAttemptTime = now;
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
  attempts.set(key, record);
  return {
    locked: record.count >= MAX_LOGIN_ATTEMPTS,
    lockedUntil: record.lockedUntil,
    attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - record.count),
  };
}

export function isLocked(key) {
  const record = attempts.get(key);
  if (!record) return false;
  if (record.lockedUntil && Date.now() < record.lockedUntil) return true;
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    // Lock expired — reset
    record.count = 0;
    record.lockedUntil = 0;
    attempts.set(key, record);
  }
  return false;
}

export function resetAttempts(key) {
  attempts.delete(key);
}

export function getForgotStatus(email) {
  const key = `forgot:${email}`;
  const record = attempts.get(key) || { count: 0, lastAttemptTime: 0, lockedUntil: 0 };
  const now = Date.now();
  // Reset if window has passed
  if (record.lastAttemptTime && (now - record.lastAttemptTime) > FORGOT_WINDOW_MS) {
    record.count = 0;
    record.lockedUntil = 0;
    attempts.set(key, record);
    return { allowed: true, remaining: FORGOT_LIMIT };
  }
  if (record.lockedUntil && now < record.lockedUntil) {
    return { allowed: false, remaining: 0, lockedUntil: record.lockedUntil };
  }
  return { allowed: record.count < FORGOT_LIMIT, remaining: Math.max(0, FORGOT_LIMIT - record.count), lockedUntil: record.lockedUntil };
}

export function recordForgotAttempt(email) {
  const key = `forgot:${email}`;
  const status = getForgotStatus(email);
  if (!status.allowed) return status;
  const record = attempts.get(key) || { count: 0, lastAttemptTime: 0, lockedUntil: 0 };
  record.count += 1;
  record.lastAttemptTime = Date.now();
  if (record.count >= FORGOT_LIMIT) {
    record.lockedUntil = record.lastAttemptTime + FORGOT_WINDOW_MS;
  }
  attempts.set(key, record);
  return { allowed: false, remaining: Math.max(0, FORGOT_LIMIT - record.count), lockedUntil: record.lockedUntil };
}
