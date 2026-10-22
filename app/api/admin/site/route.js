import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/admin'
import { getSiteContent, saveSiteContent } from '@/lib/site'
import { prisma } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const session = await getAdminSession(request.cookies.get('jamaes_session')?.value, 'settings.view')
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 })
    }
    const data = getSiteContent()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Failed to get admin site settings:', error)
    return NextResponse.json({ success: false, error: 'Could not load site settings.' }, { status: 500 })
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
      return NextResponse.json({ success: false, error: 'Invalid settings payload.' }, { status: 400 })
    }

    const saved = saveSiteContent(body)

    // Keep storeSetting in sync with WhatsApp and store name if provided
    try {
      if (prisma?.storeSetting) {
        const updateData = {}
        if (body.name) updateData.merchantName = body.name
        if (body.whatsapp) {
          // extract digits from whatsapp link or number
          const digits = String(body.whatsapp).replace(/\D/g, '')
          if (digits) updateData.whatsappNumber = digits
        }
        if (Object.keys(updateData).length > 0) {
          await prisma.storeSetting.upsert({
            where: { id: 'main' },
            create: { id: 'main', ...updateData },
            update: updateData,
          }).catch(() => {})
        }
      }
    } catch {
      // Non-critical sync
    }

    return NextResponse.json({
      success: true,
      data: saved.data,
      message: 'Store contact & social settings updated successfully.',
    })
  } catch (error) {
    console.error('Failed to save admin site settings:', error)
    return NextResponse.json({ success: false, error: error.message || 'Could not update site settings.' }, { status: 500 })
  }
}
