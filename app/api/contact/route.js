import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmailBestEffort, sendEmail, sendSupportNotification } from '@/lib/notification/email'

const contactSchema = {
  name: (val) => typeof val === 'string' && val.trim().length > 0,
  email: (val) => typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  message: (val) => typeof val === 'string' && val.trim().length > 0,
}

export async function POST(request) {
  try {
    const body = await request.json()

    // Validate
    const errors = {}
    for (const [field, validator] of Object.entries(contactSchema)) {
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

    const message = await db.createContactMessage({
      name: body.name.trim(),
      email: body.email.trim(),
      message: body.message.trim(),
    })

    await Promise.all([
      sendEmailBestEffort(() => sendEmail({ to: body.email.trim(), subject: "We received your message | Jamae's Craftopia", text: 'Thank you for contacting Jamae\'s Craftopia. We received your message and will get back to you soon.' }), 'contact-receipt'),
      sendEmailBestEffort(() => sendSupportNotification({ subject: `New contact message from ${body.name.trim()}`, text: `From: ${body.name.trim()} <${body.email.trim()}>\n\n${body.message.trim()}`, replyTo: body.email.trim() }), 'contact-support'),
    ])

    return NextResponse.json({
      success: true,
      message: 'Message received. We will get back to you soon!',
      data: { id: message.id },
    })
  } catch (error) {
    console.error('Error creating contact message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
