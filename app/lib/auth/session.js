/**
 * Secure session management with JWT-like tokens.
 * Sessions are stored in the database with expiration.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import { prisma } from '../db/client'

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function sessionCookieKey() {
  const configuredSecret = process.env.SESSION_COOKIE_SECRET || process.env.AUTH_SECRET
  if (process.env.NODE_ENV === 'production' && (!configuredSecret || configuredSecret.length < 32)) {
    throw new Error('SESSION_COOKIE_SECRET or AUTH_SECRET must be at least 32 characters in production.')
  }
  const secret = configuredSecret || 'development-only-session-cookie-secret'
  return createHash('sha256').update(secret).digest()
}

export function encryptSessionCookie(token) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', sessionCookieKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `enc.v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${ciphertext.toString('base64url')}`
}

function decryptSessionCookie(value) {
  if (typeof value !== 'string' || !value.startsWith('enc.v1.')) return value || null
  try {
    const [, , ivValue, tagValue, ciphertextValue] = value.split('.')
    if (!ivValue || !tagValue || !ciphertextValue) return null
    const decipher = createDecipheriv('aes-256-gcm', sessionCookieKey(), Buffer.from(ivValue, 'base64url'))
    decipher.setAuthTag(Buffer.from(tagValue, 'base64url'))
    return Buffer.concat([decipher.update(Buffer.from(ciphertextValue, 'base64url')), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}

export function generateToken() {
  return randomBytes(32).toString('hex')
}

export async function createSession(userId) {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  
  const session = await prisma.session.create({
    data: { userId, token, expiresAt },
  })
  
  return { token, expiresAt }
}

export async function verifySession(token) {
  if (!token || !prisma) return null
  try {
    const sessionToken = decryptSessionCookie(token)
    if (!sessionToken) return null
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    })
    if (!session || session.revokedAt || session.expiresAt < new Date() || session.user.active === false) return null
    return session
  } catch {
    return null
  }
}

export async function invalidateSession(token) {
  if (!token) return false
  const sessionToken = decryptSessionCookie(token)
  if (!sessionToken) return false
  return prisma.session.updateMany({ where: { token: sessionToken, revokedAt: null }, data: { revokedAt: new Date() } }).then(r => r.count > 0)
}

export async function invalidateAllSessions(userId) {
  return prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }).then(r => r.count > 0)
}

export function parseSessionCookie(cookie) {
  if (!cookie) return null
  // Expecting format: jamaes_session=<token>
  const match = cookie.match(/jamaes_session=([^;]+)/)
  return match ? match[1] : null
}
