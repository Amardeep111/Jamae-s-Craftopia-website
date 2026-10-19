/**
 * Secure password hashing using bcrypt.
 * Never store plaintext passwords.
 */
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

export async function hashPassword(plain) {
  if (!plain || typeof plain !== 'string') {
    throw new Error('Password must be a non-empty string')
  }
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function verifyPassword(plain, hash) {
  if (!plain || !hash) return false
  return bcrypt.compare(plain, hash)
}

export function validatePassword(plain) {
  const errors = []
  if (!plain || typeof plain !== 'string') {
    errors.push('Password is required.')
    return errors
  }
  if (plain.length < 8) errors.push('Password must be at least 8 characters.')
  if (plain.length > 128) errors.push('Password is too long.')
  if (!/[A-Z]/.test(plain)) errors.push('Include at least one uppercase letter.')
  if (!/[a-z]/.test(plain)) errors.push('Include at least one lowercase letter.')
  if (!/[0-9]/.test(plain)) errors.push('Include at least one number.')
  return errors
}
