import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const cookie = request.cookies.get('jamaes_session')
    if (!cookie || !cookie.value) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }
    return NextResponse.json({
      success: true,
      data: { email: cookie.value, isLoggedIn: true },
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to check auth' }, { status: 500 })
  }
}
