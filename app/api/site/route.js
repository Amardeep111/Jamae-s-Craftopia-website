import { NextResponse } from 'next/server'
import { getSiteContent } from '@/lib/site'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getSiteContent()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to get site content:', error)
    return NextResponse.json({ success: false, error: 'Could not load site information.' }, { status: 500 })
  }
}
