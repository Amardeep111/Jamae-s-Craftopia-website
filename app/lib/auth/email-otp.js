import { createHmac, randomBytes } from 'node:crypto'

const localOtpSecret = randomBytes(32).toString('hex')

export function hashEmailOtp(email, code) {
  const secret = process.env.AUTH_SECRET || (process.env.NODE_ENV === 'production' ? '' : localOtpSecret)
  if (!secret) throw new Error('AUTH_SECRET must be configured to verify email codes.')
  return createHmac('sha256', secret).update(`${email}:${code}`).digest('hex')
}
