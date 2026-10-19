import { createHash } from 'node:crypto'
import { prisma } from '@/lib/db/client'

const HOUR = 60 * 60 * 1000

function digest(value) {
  return createHash('sha256').update(String(value)).digest('hex')
}

function clientIp(request) {
  return request.headers.get('x-real-ip')?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
}

async function incrementBucket(key, limit, windowMs, blockMs) {
  const now = new Date()
  const current = await prisma.authRateLimit.findUnique({ where: { key } })
  if (current?.blockedUntil && current.blockedUntil > now) {
    return { limited: true, retryAfter: Math.max(1, Math.ceil((current.blockedUntil.getTime() - now.getTime()) / 1000)) }
  }

  const windowExpired = !current || current.windowStartedAt.getTime() <= now.getTime() - windowMs
  const attempts = windowExpired ? 1 : current.attempts + 1
  const blockedUntil = attempts >= limit ? new Date(now.getTime() + blockMs) : null
  const data = { attempts, windowStartedAt: windowExpired ? now : current.windowStartedAt, blockedUntil }
  await prisma.authRateLimit.upsert({
    where: { key },
    create: { key, ...data },
    update: data,
  })

  if (Math.random() < 0.01) {
    prisma.authRateLimit.deleteMany({ where: { updatedAt: { lt: new Date(now.getTime() - 24 * HOUR) } } }).catch(() => {})
  }
  return blockedUntil ? { limited: true, retryAfter: Math.ceil(blockMs / 1000) } : { limited: false, retryAfter: 0 }
}

/** Persistent per-IP and per-identity fixed-window throttling for auth endpoints. */
export async function enforceAuthRateLimit(request, { scope, identity = '', ipLimit, identityLimit, windowMs, blockMs = windowMs }) {
  const ip = clientIp(request)
  const buckets = [{ value: `ip:${ip}`, limit: ipLimit }]
  if (identity && identityLimit) buckets.push({ value: `identity:${identity.toLowerCase()}`, limit: identityLimit })

  let retryAfter = 0
  for (const bucket of buckets) {
    const key = digest(`${scope}:${bucket.value}`)
    const result = await incrementBucket(key, bucket.limit, windowMs, blockMs)
    if (result.limited) retryAfter = Math.max(retryAfter, result.retryAfter)
  }
  return retryAfter ? { limited: true, retryAfter } : { limited: false, retryAfter: 0 }
}

export async function resetAuthRateLimit(request, { scope, identity = '' }) {
  const values = [`ip:${clientIp(request)}`]
  if (identity) values.push(`identity:${identity.toLowerCase()}`)
  const keys = values.map((value) => digest(`${scope}:${value}`))
  await prisma.authRateLimit.deleteMany({ where: { key: { in: keys } } })
}
