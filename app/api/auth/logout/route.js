/**
 * POST /api/auth/logout
 *
 * Invalidates the server-side session and clears the cookie.
 * Supports single logout and logout-everywhere for the user.
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { verifySession, invalidateSession, invalidateAllSessions } from '@/lib/auth/session'

export async function POST(request) {
  try {
    const body = await request.json()
    const { everywhere } = body || {}
    const cookie = request.cookies.get('jamaes_session')
    const token = cookie?.value

    if (!token) {
      // No active session - still return success to clear any client state
      const response = NextResponse.json({ success: true, message: 'Logged out.' })
      response.cookies.set('jamaes_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      })
      return response
    }

    // Verify session to support logout-everywhere, and always revoke the current
    // token in the database even if the session has expired or was already revoked.
    const session = await verifySession(token)

    if (everywhere && session) await invalidateAllSessions(session.userId)
    else await invalidateSession(token)

    const response = NextResponse.json({
      success: true,
      message: everywhere ? 'Logged out of all devices.' : 'Logged out.'
    })

    response.cookies.set('jamaes_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ success: false, error: 'Logout failed.' }, { status: 500 })
  }
}
