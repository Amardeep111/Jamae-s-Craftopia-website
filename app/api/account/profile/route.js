import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { verifySession } from '@/lib/auth/session'

export async function PATCH(request) {
  const session = await verifySession(request.cookies.get('jamaes_session')?.value)
  if (!session?.user) return NextResponse.json({ success: false, error: 'Please sign in to update your profile.' }, { status: 401 })

  let body
  try { body = await request.json() } catch { return NextResponse.json({ success: false, error: 'A valid profile is required.' }, { status: 400 }) }
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const phone = typeof body?.phone === 'string' ? body.phone.replace(/\D/g, '') : ''
  if (name.length < 2 || name.length > 100) return NextResponse.json({ success: false, error: 'Name must be between 2 and 100 characters.' }, { status: 400 })
  if (phone && (phone.length < 10 || phone.length > 15)) return NextResponse.json({ success: false, error: 'Enter a valid phone number with 10–15 digits.' }, { status: 400 })

  const user = await prisma.user.update({ where: { id: session.user.id }, data: { name, phone: phone || null }, select: { id: true, email: true, name: true, phone: true } })
  return NextResponse.json({ success: true, data: user })
}
