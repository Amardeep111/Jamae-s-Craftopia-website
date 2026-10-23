import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { verifySession } from '@/lib/auth/session'

export const runtime = 'nodejs'

async function getUser(request) {
  const session = await verifySession(request.cookies.get('jamaes_session')?.value)
  return session?.user || null
}

function responseItem(item) {
  const product = item.product
  const img = product.imageUrl || (Array.isArray(product.images) ? product.images[0] : null) || product.image || null
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.price,
    discountPercent: product.discountPercent,
    gstPercent: product.gstPercent,
    codFee: product.codFee,
    otherCharge: product.otherCharge,
    visual: product.visual || img,
    palette: product.palette,
    category: product.categoryId,
    image: img,
    imageUrl: img,
    stock: product.stock,
    published: product.published,
    availableForSale: product.availableForSale,
    unavailableStates: product.unavailableStates,
    unavailablePinCodes: product.unavailablePinCodes,
    allowedPaymentMethods: product.allowedPaymentMethods,
    quantity: item.quantity,
  }
}

export async function GET(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ success: false, error: 'Sign in to load your saved cart.' }, { status: 401 })
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true }, orderBy: { createdAt: 'asc' } } },
    })
    return NextResponse.json({ success: true, data: (cart?.items || []).map(responseItem) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Saved cart load failed:', error)
    return NextResponse.json({ success: false, error: 'Could not load your saved cart.' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ success: false, error: 'Sign in to save your cart.' }, { status: 401 })
    let body
    try { body = await request.json() } catch { return NextResponse.json({ success: false, error: 'Cart items are invalid.' }, { status: 400 }) }
    if (!Array.isArray(body.items) || body.items.length > 100) return NextResponse.json({ success: false, error: 'Cart items are invalid.' }, { status: 400 })

    const quantities = new Map()
    for (const item of body.items) {
      if (typeof item?.productId !== 'string' || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) continue
      quantities.set(item.productId, Math.min(99, (quantities.get(item.productId) || 0) + Number(item.quantity)))
    }
    const productIds = [...quantities.keys()]
    const products = productIds.length ? await prisma.product.findMany({ where: { id: { in: productIds }, published: true, availableForSale: true }, select: { id: true } }) : []
    const allowed = new Set(products.map((product) => product.id))
    const items = [...quantities].filter(([productId]) => allowed.has(productId)).map(([productId, quantity]) => ({ productId, quantity }))

    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
      select: { id: true },
    })

    if (items.length === 0) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
      return NextResponse.json({ success: true, data: [] })
    }

    // Batch delete & recreate using non-interactive array transaction (compatible with Supabase PgBouncer pooler)
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
      prisma.cartItem.createMany({ data: items.map((item) => ({ ...item, cartId: cart.id })) }),
    ])

    const savedItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: true },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ success: true, data: savedItems.map(responseItem) })
  } catch (error) {
    console.error('Saved cart update failed:', error)
    return NextResponse.json({ success: false, error: 'Could not save your cart.' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const user = await getUser(request)
    if (!user) return NextResponse.json({ success: true, data: [] })
    await prisma.cartItem.deleteMany({ where: { cart: { userId: user.id } } })
    return NextResponse.json({ success: true, data: [] })
  } catch (error) {
    console.error('Saved cart clear failed:', error)
    return NextResponse.json({ success: false, error: 'Could not clear your saved cart.' }, { status: 500 })
  }
}
