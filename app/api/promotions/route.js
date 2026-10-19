import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await prisma.product.findMany({ where: { published: true, OR: [{ discountPercent: { gt: 0 } }, { gstPercent: { gt: 0 } }, { codFee: { gt: 0 } }, { otherCharge: { gt: 0 } }] }, select: { id: true, discountPercent: true, gstPercent: true, codFee: true, otherCharge: true } })
    return NextResponse.json({ success: true, data: products }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ success: false, error: 'Could not load current offers.' }, { status: 500 })
  }
}
