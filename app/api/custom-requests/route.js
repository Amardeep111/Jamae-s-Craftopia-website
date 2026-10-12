import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const customRequestSchema = {
  name: (val) => typeof val === 'string' && val.trim().length > 0,
  contact: (val) => typeof val === 'string' && val.trim().length > 0,
  idea: (val) => typeof val === 'string' && val.trim().length > 0,
  details: (val) => typeof val === 'string' && val.trim().length > 0,
}

export async function POST(request) {
  try {
    const body = await request.json()

    // Validate required fields
    const errors = {}
    for (const [field, validator] of Object.entries(customRequestSchema)) {
      if (!validator(body[field])) {
        errors[field] = `Invalid ${field}`
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      )
    }

    const request = await db.createCustomRequest({
      name: body.name.trim(),
      contact: body.contact.trim(),
      idea: body.idea.trim(),
      category: body.category || null,
      colors: body.colors || null,
      budget: body.budget || null,
      occasion: body.occasion || null,
      details: body.details.trim(),
    })

    return NextResponse.json({
      success: true,
      message: 'Custom request received! We will review and get back to you soon.',
      data: { id: request.id },
    })
  } catch (error) {
    console.error('Error creating custom request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit request' },
      { status: 500 }
    )
  }
}
