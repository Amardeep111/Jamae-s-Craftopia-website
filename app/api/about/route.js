import { NextResponse } from 'next/server'
import { getAboutContent } from '@/lib/about'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = getAboutContent()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to get about content:', error)
    return NextResponse.json({ success: false, error: 'Could not load about page content.' }, { status: 500 })
  }
}

