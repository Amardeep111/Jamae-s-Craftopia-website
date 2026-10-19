import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/session'

export async function GET(request) {
  try {
    const session = await verifySession(request.cookies.get('jamaes_session')?.value)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }
    return NextResponse.json({
      success: true,
      data: { userId: session.user.id, email: session.user.email, name: session.user.name, phone: session.user.phone, role: session.user.role, isLoggedIn: true },
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to check auth' }, { status: 500 })
  }
}
