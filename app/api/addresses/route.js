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
  const user = await authenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Please sign in to view saved addresses.' }, { status: 401 })
  const addresses = await prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }] })
  return NextResponse.json({ success: true, data: addresses })
}

export async function POST(request) {
  const user = await authenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Please sign in to save an address.' }, { status: 401 })
  const body = await readJson(request)
  if (!body || typeof body !== 'object') return NextResponse.json({ success: false, error: 'A valid address payload is required.' }, { status: 400 })
  const parsed = parseAddress(body)
  if (parsed.errors) return NextResponse.json({ success: false, errors: parsed.errors }, { status: 400 })

  const existingCount = await prisma.address.count({ where: { userId: user.id } })
  const makeDefault = parsed.data.isDefault || existingCount === 0
  const address = await prisma.$transaction(async (tx) => {
    if (makeDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } })
    return tx.address.create({ data: { ...parsed.data, isDefault: makeDefault, userId: user.id } })
  })
  return NextResponse.json({ success: true, data: address }, { status: 201 })
}

export async function PATCH(request) {
  const user = await authenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Please sign in to update an address.' }, { status: 401 })
  const body = await readJson(request)
  if (!body || typeof body !== 'object') return NextResponse.json({ success: false, error: 'A valid address payload is required.' }, { status: 400 })
  if (!body?.id) return NextResponse.json({ success: false, error: 'Address ID is required.' }, { status: 400 })
  const parsed = parseAddress(body)
  if (parsed.errors) return NextResponse.json({ success: false, errors: parsed.errors }, { status: 400 })
  const owned = await prisma.address.findFirst({ where: { id: body.id, userId: user.id } })
  if (!owned) return NextResponse.json({ success: false, error: 'Address not found.' }, { status: 404 })

  const address = await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) await tx.address.updateMany({ where: { userId: user.id, id: { not: body.id } }, data: { isDefault: false } })
    return tx.address.update({ where: { id: body.id }, data: parsed.data })
  })
  return NextResponse.json({ success: true, data: address })
}

export async function DELETE(request) {
  const user = await authenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, error: 'Please sign in to remove an address.' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ success: false, error: 'Address ID is required.' }, { status: 400 })
  const address = await prisma.address.findFirst({ where: { id, userId: user.id } })
  if (!address) return NextResponse.json({ success: false, error: 'Address not found.' }, { status: 404 })
  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id: address.id } })
    if (address.isDefault) {
      const next = await tx.address.findFirst({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' } })
      if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } })
    }
  })
  return NextResponse.json({ success: true })
}
