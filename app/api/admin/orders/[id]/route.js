import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { getAdminSession } from '@/lib/auth/admin'

export async function GET(request, { params }) {
  const session = await getAdminSession(request.cookies.get('jamaes_session')?.value, 'orders.view')
  if (!session) return NextResponse.json({ success: false, error: 'You do not have permission to view order details.' }, { status: 403 })
  const { id } = await params
  try {
    const data = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        items: { include: { product: true } },
        refundRequests: { orderBy: { createdAt: 'desc' } },
        paymentLogs: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!data) return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Admin order detail request failed:', error)
    return NextResponse.json({ success: false, error: 'Could not load order details.' }, { status: 500 })
  }
}
