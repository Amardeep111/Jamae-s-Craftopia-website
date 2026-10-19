import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmailBestEffort, sendEmail, sendSupportNotification } from '@/lib/notification/email'
import { enforceAuthRateLimit } from '@/lib/auth/rate-limit'
import { verifySession } from '@/lib/auth/session'

export const runtime = 'nodejs'

function isValidReferenceImageUrl(value) {
  if (typeof value !== 'string' || value.length > 2000) return false
  if (/^\/uploads\/jamaes-craftopia\/custom-requests\/[a-zA-Z0-9-]+\.(?:jpg|png|webp)$/.test(value)) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'res.cloudinary.com'
  } catch {
    return false
  }
}

export async function POST(request) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: 'The request form could not be read. Please review it and try again.' }, { status: 400 })
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ success: false, error: 'Please complete the request form.' }, { status: 400 })
    const session = await verifySession(request.cookies.get('jamaes_session')?.value)
    if (!session?.user || session.user.role !== 'CUSTOMER') return NextResponse.json({ success: false, error: 'Sign in to send a custom request.' }, { status: 401 })
    const rateLimit = await enforceAuthRateLimit(request, { scope: 'custom-request', identity: session.user.id, ipLimit: 5, identityLimit: 3, windowMs: 60 * 60 * 1000, blockMs: 60 * 60 * 1000 })
    if (rateLimit.limited) return NextResponse.json({ success: false, error: 'Too many custom requests were sent. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } })

    const errors = {}
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const contact = session.user.email
    const idea = typeof body.idea === 'string' ? body.idea.trim() : ''
    const details = typeof body.details === 'string' ? body.details.trim() : ''
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
    if (name.length < 2 || name.length > 100) errors.name = 'Enter a name between 2 and 100 characters.'
    if (!emailValid) errors.contact = 'Your account must have a valid email address for request updates.'
    if (idea.length < 3 || idea.length > 120) errors.idea = 'Describe your idea in 3 to 120 characters.'
    if (details.length < 10 || details.length > 1200) errors.details = 'Add 10 to 1,200 characters of detail.'
    if (typeof body.category !== 'string' || !['crochet-toys', 'flowers', 'personalized', 'accessories', 'keychains', 'clothes'].includes(body.category)) errors.category = 'Choose a valid category.'
    if (typeof body.colors === 'string' && body.colors.trim().length > 100) errors.colors = 'Keep colour preferences under 100 characters.'
    if (typeof body.occasion === 'string' && body.occasion.trim().length > 100) errors.occasion = 'Keep the occasion under 100 characters.'
    const validBudgets = ['Under ₹500', '₹500 – ₹1,500', '₹1,500 – ₹3,000', '₹3,000+', "Let's decide together"]
    if (body.budget && !validBudgets.includes(body.budget)) errors.budget = 'Choose one of the listed budget ranges.'
    const referenceImages = body.referenceImages ?? []
    if (!Array.isArray(referenceImages) || referenceImages.length > 3 || referenceImages.some((url) => !isValidReferenceImageUrl(url))) {
      errors.referenceImages = 'Upload up to 3 valid reference images.'
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      )
    }

    const customRequest = await db.createCustomRequest({
      name: body.name.trim(),
      contact,
      idea,
      category: body.category,
      colors: typeof body.colors === 'string' ? body.colors.trim() || null : null,
      budget: typeof body.budget === 'string' ? body.budget || null : null,
      occasion: typeof body.occasion === 'string' ? body.occasion.trim() || null : null,
      details,
      referenceImages,
      userId: session.user.id,
    })

    const referenceLinks = referenceImages.length ? `\nReference images:\n${referenceImages.join('\n')}` : '\nReference images: none'
    await Promise.all([
      sendEmailBestEffort(() => sendEmail({ to: session.user.email, subject: "We received your custom order request | Jamae's Craftopia", text: `Thank you, ${name}. We received your custom order idea and will review it soon. We will email you when a decision or price quote is ready.` }), 'custom-request-receipt'),
      sendEmailBestEffort(() => sendSupportNotification({ subject: `New custom order request from ${name}`, text: `Name: ${name}\nContact: ${contact}\nIdea: ${idea}\nCategory: ${body.category}\nColours: ${body.colors || ''}\nOccasion: ${body.occasion || ''}\nBudget: ${body.budget || ''}\nDetails: ${details}${referenceLinks}` }), 'custom-request-support'),
    ])

    return NextResponse.json({
      success: true,
      message: 'Custom request received! We will review and get back to you soon.',
      data: { id: customRequest.id },
    })
  } catch (error) {
    console.error('Error creating custom request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit request' },
      { status: 500 }
    )
  }
}
