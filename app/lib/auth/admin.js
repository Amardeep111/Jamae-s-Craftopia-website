import { verifySession } from '@/lib/auth/session'
import { ADMIN_PERMISSION_IDS } from '@/lib/auth/permissions'

export const ADMIN_PERMISSIONS = ADMIN_PERMISSION_IDS
export const ADMIN_ROLES = new Set(['ADMIN', 'SUPERADMIN'])

export function hasAdminPermission(user, permission) {
  if (!user) return false
  if (!ADMIN_ROLES.has(user.role)) return false
  if (user.adminActive === false) return false
  if (user?.role === 'SUPERADMIN') return true
  if (user.role !== 'ADMIN') return false
  if (!permission) return true
  if (!Array.isArray(user.adminPermissions)) return false
  if (user.adminPermissions.includes(permission)) return true
  return permission.endsWith('.view') && user.adminPermissions.includes(`${permission.slice(0, -'.view'.length)}.manage`)
}

export async function getAdminSession(token, permission) {
  const session = await verifySession(token)
  return hasAdminPermission(session?.user, permission) ? session : null
}

export async function getSuperAdminSession(token) {
  const session = await verifySession(token)
  return session?.user?.role === 'SUPERADMIN' && session.user.adminActive !== false ? session : null
}
