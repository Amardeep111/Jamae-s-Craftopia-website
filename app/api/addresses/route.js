import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { verifySession } from '@/lib/auth/session'

function parseAddress(body) {
  const source = body?.address || body || {}
  const required = ['fullName', 'mobileNumber', 'houseFlatBuilding', 'areaStreet', 'city', 'state', 'pinCode']
  const errors = {}
  for (const field of required) {
    if (typeof source[field] !== 'string' || !source[field].trim()) errors[field] = 'This field is required.'
  }
  if (source.mobileNumber && !/^\+?[\d\s().-]{10,16}$/.test(source.mobileNumber.trim())) errors.mobileNumber = 'Enter a valid phone number.'
  if (source.pinCode && !/^\d{6}$/.test(source.pinCode.trim())) errors.pinCode = 'Enter a valid 6-digit PIN code.'
  if (Object.keys(errors).length) return { errors }

  return {
    data: {
      fullName: source.fullName.trim(),
      mobileNumber: source.mobileNumber.trim(),
      houseFlatBuilding: source.houseFlatBuilding.trim(),
      areaStreet: source.areaStreet.trim(),
      landmark: source.landmark?.trim() || null,
      city: source.city.trim(),
      state: source.state.trim(),
      pinCode: source.pinCode.trim(),
      addressType: source.addressType || 'home',
      isDefault: Boolean(source.isDefault),
    },
  }
}

async function readJson(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

async function authenticatedUser(request) {
  const session = await verifySession(request.cookies.get('jamaes_session')?.value)
  return session?.user || null
}

export async function GET(request) {
  try {
    const user = await authenticatedUser(request)
    if (!user) return NextResponse.json({ success: false, error: 'Please sign in to view saved addresses.' }, { status: 401 })
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    })
    return NextResponse.json({ success: true, data: addresses })
  } catch (error) {
    console.error('Failed to get addresses:', error)
    return NextResponse.json({ success: false, error: 'Could not load addresses.' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await authenticatedUser(request)
    if (!user) return NextResponse.json({ success: false, error: 'Please sign in to save an address.' }, { status: 401 })
    const body = await readJson(request)
    if (!body || typeof body !== 'object') return NextResponse.json({ success: false, error: 'A valid address payload is required.' }, { status: 400 })
    const parsed = parseAddress(body)
    if (parsed.errors) return NextResponse.json({ success: false, errors: parsed.errors }, { status: 400 })

    let makeDefault = parsed.data.isDefault
    if (!makeDefault) {
      const existing = await prisma.address.findFirst({
        where: { userId: user.id },
        select: { id: true },
      })
      if (!existing) makeDefault = true
    }

    if (makeDefault) {
      const [, address] = await prisma.$transaction([
        prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
        prisma.address.create({ data: { ...parsed.data, isDefault: true, userId: user.id } }),
      ])
      return NextResponse.json({ success: true, data: address }, { status: 201 })
    } else {
      const address = await prisma.address.create({
        data: { ...parsed.data, isDefault: false, userId: user.id },
      })
      return NextResponse.json({ success: true, data: address }, { status: 201 })
    }
  } catch (error) {
    console.error('Failed to create address:', error)
    return NextResponse.json({ success: false, error: 'Could not save address. Please try again.' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const user = await authenticatedUser(request)
    if (!user) return NextResponse.json({ success: false, error: 'Please sign in to update an address.' }, { status: 401 })
    const body = await readJson(request)
    if (!body || typeof body !== 'object') return NextResponse.json({ success: false, error: 'A valid address payload is required.' }, { status: 400 })
    if (!body?.id) return NextResponse.json({ success: false, error: 'Address ID is required.' }, { status: 400 })
    const parsed = parseAddress(body)
    if (parsed.errors) return NextResponse.json({ success: false, errors: parsed.errors }, { status: 400 })
    const owned = await prisma.address.findFirst({
      where: { id: body.id, userId: user.id },
      select: { id: true },
    })
    if (!owned) return NextResponse.json({ success: false, error: 'Address not found.' }, { status: 404 })

    if (parsed.data.isDefault) {
      const [, address] = await prisma.$transaction([
        prisma.address.updateMany({ where: { userId: user.id, id: { not: body.id } }, data: { isDefault: false } }),
        prisma.address.update({ where: { id: body.id }, data: parsed.data }),
      ])
      return NextResponse.json({ success: true, data: address })
    } else {
      const address = await prisma.address.update({
        where: { id: body.id },
        data: parsed.data,
      })
      return NextResponse.json({ success: true, data: address })
    }
  } catch (error) {
    console.error('Failed to update address:', error)
    return NextResponse.json({ success: false, error: 'Could not update address. Please try again.' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const user = await authenticatedUser(request)
    if (!user) return NextResponse.json({ success: false, error: 'Please sign in to remove an address.' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'Address ID is required.' }, { status: 400 })
    const address = await prisma.address.findFirst({
      where: { id, userId: user.id },
      select: { id: true, isDefault: true },
    })
    if (!address) return NextResponse.json({ success: false, error: 'Address not found.' }, { status: 404 })

    if (address.isDefault) {
      const next = await prisma.address.findFirst({
        where: { userId: user.id, id: { not: address.id } },
        orderBy: { updatedAt: 'desc' },
        select: { id: true },
      })
      if (next) {
        await prisma.$transaction([
          prisma.address.delete({ where: { id: address.id } }),
          prisma.address.update({ where: { id: next.id }, data: { isDefault: true } }),
        ])
        return NextResponse.json({ success: true })
      }
    }
    await prisma.address.delete({ where: { id: address.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete address:', error)
    return NextResponse.json({ success: false, error: 'Could not delete address.' }, { status: 500 })
  }
}
