import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { getAdminSession } from '@/lib/auth/admin'

export async function GET(request) {
  const session = await getAdminSession(request.cookies.get('jamaes_session')?.value, 'categories.view')
  if (!session) return NextResponse.json({ success: false, error: 'You do not have permission to view categories.' }, { status: 403 })
  try {
    const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Admin categories load failed:', error)
    return NextResponse.json({ success: false, error: 'Could not load categories.' }, { status: 500 })
  }
}

function normalizeString(value, maxLength) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed && trimmed.length <= maxLength ? trimmed : null
}

function normalizeSlug(value) {
  if (typeof value !== 'string') return null
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120)
  return slug ? slug : null
}

export async function PATCH(request) {
  const session = await getAdminSession(request.cookies.get('jamaes_session')?.value, 'categories.manage')
  if (!session) return NextResponse.json({ success: false, error: 'You do not have permission to edit categories.' }, { status: 403 })
  try {
    const body = await request.json()
    if (typeof body.id !== 'string') return NextResponse.json({ success: false, error: 'Category ID is required.' }, { status: 400 })

    const data = {}
    const name = normalizeString(body.name, 120)
    if (name === null && body.name !== undefined) return NextResponse.json({ success: false, error: 'Enter a valid category name (max 120 chars).' }, { status: 400 })
    if (name !== undefined && name !== null) data.name = name

    const description = body.description === undefined ? undefined : normalizeString(body.description, 2000)
    if (description === null && body.description !== undefined) return NextResponse.json({ success: false, error: 'Description must be under 2,000 characters.' }, { status: 400 })
    data.description = description

    const accent = body.accent === undefined ? undefined : (normalizeString(body.accent, 40) || null)
    data.accent = accent

    const image = body.image === undefined ? undefined : (normalizeString(body.image, 2000) || null)
    data.image = image

    if (body.slug !== undefined) {
      const slug = normalizeSlug(body.slug || body.name)
      if (!slug) return NextResponse.json({ success: false, error: 'Enter a valid URL slug.' }, { status: 400 })
      const conflict = await prisma.category.findUnique({ where: { slug }, select: { id: true } })
      if (conflict && conflict.id !== body.id) return NextResponse.json({ success: false, error: 'That category URL is already in use.' }, { status: 409 })
      data.slug = slug
    }

    if (body.order !== undefined) {
      const order = Number(body.order)
      if (!Number.isInteger(order) || order < 0) return NextResponse.json({ success: false, error: 'Order must be a non-negative whole number.' }, { status: 400 })
      data.order = order
    }

    if (body.published !== undefined) {
      if (typeof body.published !== 'boolean') return NextResponse.json({ success: false, error: 'Published must be true or false.' }, { status: 400 })
      data.published = body.published
    }

    if (body.hidden !== undefined) {
      if (typeof body.hidden !== 'boolean') return NextResponse.json({ success: false, error: 'Hidden must be true or false.' }, { status: 400 })
      data.hidden = body.hidden
    }

    if (!Object.keys(data).length) return NextResponse.json({ success: false, error: 'No category changes provided.' }, { status: 400 })

    const updated = await prisma.category.update({ where: { id: body.id }, data })
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Admin category update failed:', error)
    return NextResponse.json({ success: false, error: 'Could not save category changes.' }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getAdminSession(request.cookies.get('jamaes_session')?.value, 'categories.manage')
  if (!session) return NextResponse.json({ success: false, error: 'You do not have permission to create categories.' }, { status: 403 })
  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name || name.length > 120) return NextResponse.json({ success: false, error: 'Enter a valid category name (max 120 chars).' }, { status: 400 })
    const baseSlug = (typeof body.slug === 'string' && body.slug.trim() ? body.slug.trim() : name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120)
    if (!baseSlug) return NextResponse.json({ success: false, error: 'Enter a valid URL slug.' }, { status: 400 })
    let uniqueSlug = baseSlug
    let suffix = 2
    while (await prisma.category.findUnique({ where: { slug: uniqueSlug }, select: { id: true } })) uniqueSlug = `${baseSlug.slice(0, 110)}-${suffix++}`
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    if (description.length > 2000) return NextResponse.json({ success: false, error: 'Description too long.' }, { status: 400 })
    const accent = typeof body.accent === 'string' && body.accent.trim() ? body.accent.trim() : null
    const image = typeof body.image === 'string' && body.image.trim() ? body.image.trim() : null
    const order = Number(body.order)
    const published = body.published !== false
    const hidden = body.hidden === true
    const category = await prisma.category.create({ data: { name, slug: uniqueSlug, description: description || null, accent, image, published, hidden, order: Number.isInteger(order) && order >= 0 ? order : 0 } })
    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error) {
    console.error('Admin category creation failed:', error)
    return NextResponse.json({ success: false, error: 'Could not create category.' }, { status: 500 })
  }
}
