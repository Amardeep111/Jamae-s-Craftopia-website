import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/admin'
import { getAboutContent, saveAboutContent } from '@/lib/about'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const session = await getAdminSession(request.cookies.get('jamaes_session')?.value, 'settings.view')
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }
    const data = await getAboutContent()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to get admin about content:', error)
    return NextResponse.json({ success: false, error: 'Could not load about page content.' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const session = await getAdminSession(request.cookies.get('jamaes_session')?.value, 'settings.manage')
    if (!session) {
      return NextResponse.json({ success: false, error: 'You do not have permission to modify store settings.' }, { status: 403 })
    }
    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid content payload.' }, { status: 400 })
    }

    const saved = await saveAboutContent(body)
    return NextResponse.json({ success: true, data: saved.data, message: 'About page content updated successfully.' })
  } catch (error) {
    console.error('Failed to save admin about content:', error)
    return NextResponse.json({ success: false, error: error.message || 'Could not update about page content.' }, { status: 500 })
  }
}

