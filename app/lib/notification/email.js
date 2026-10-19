import nodemailer from 'nodemailer'
import { getAppUrl } from '@/lib/app-url'

let transporter

function getTransporter() {
  const user = process.env.GMAIL_USER?.trim()
  const password = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '')
  if (!user || !password) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass: password },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    })
  }
  return transporter
}

export function isEmailConfigured() {
  return Boolean(process.env.GMAIL_USER?.trim() && process.env.GMAIL_APP_PASSWORD?.trim())
}

export async function sendEmail({ to, subject, text, html, replyTo }) {
  const client = getTransporter()
  if (!client) throw new Error('Email delivery is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.')
  const from = process.env.EMAIL_FROM?.trim() || `Jamae's Craftopia <${process.env.GMAIL_USER.trim()}>`
  return client.sendMail({ from, to, subject, text, html, ...(replyTo ? { replyTo } : {}) })
}

export async function verifyEmailTransport() {
  const client = getTransporter()
  if (!client) return { configured: false, verified: false }
  await client.verify()
  return { configured: true, verified: true }
}

export async function sendEmailBestEffort(message, eventName = 'notification') {
  try {
    if (!isEmailConfigured()) {
      console.warn(`[email:${eventName}] skipped: Gmail SMTP is not configured`)
      return false
    }
    await (typeof message === 'function' ? message() : sendEmail(message))
    return true
  } catch (error) {
    // The underlying transaction has already committed. A temporary mail outage
    // must not turn a successful order or account change into an apparent failure.
    console.error(`[email:${eventName}] delivery failed:`, error?.message || 'unknown error')
    return false
  }
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
}

function emailShell(title, content) {
  return `<div style="font-family:Arial,sans-serif;color:#503947;line-height:1.6;max-width:600px;margin:auto;padding:24px"><h1 style="font-size:24px">${escapeHtml(title)}</h1>${content}<p style="color:#806f77;font-size:13px;margin-top:32px">Jamae's Craftopia</p></div>`
}

export async function sendSignupVerificationEmail(email, code) {
  if (process.env.PLAYWRIGHT_TEST === 'true' && code === process.env.EMAIL_OTP_TEST_CODE) {
    console.info(`[test-email-otp] ${email}: ${code}`)
    return { accepted: true, testMode: true }
  }
  return sendEmail({
    to: email,
    subject: "Verify your Jamae's Craftopia account",
    text: `Your verification code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
    html: emailShell('Verify your email', `<p>Use this code to finish creating your account:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${escapeHtml(code)}</p><p>This code expires in 10 minutes.</p>`),
  })
}

export async function sendOrderPlacedEmail(order) {
  const amount = (Number(order.totalAmount || 0) / 100).toFixed(2)
  const items = (order.items || []).map((item) => `${item.product?.name || item.productName || 'Item'} × ${item.quantity}`).join('\n')
  const appUrl = getAppUrl()
  const link = appUrl ? `${appUrl.replace(/\/$/, '')}/orders/me` : ''
  const text = `Hi ${order.customerName},\n\nWe received order ${order.orderNumber} for ₹${amount}.\n\n${items}\n\nPayment: ${order.paymentStatus === 'COD_PENDING_COLLECTION' ? 'Cash on delivery' : order.paymentStatus}\n${link ? `View your order: ${link}` : ''}`
  const itemHtml = (order.items || []).map((item) => `<li>${escapeHtml(item.product?.name || item.productName || 'Item')} × ${escapeHtml(item.quantity)}</li>`).join('')
  return sendEmail({ to: order.customerEmail, subject: `Order ${order.orderNumber} received`, text, html: emailShell('Thank you for your order', `<p>Hi ${escapeHtml(order.customerName)}, we received your order <strong>${escapeHtml(order.orderNumber)}</strong>.</p><ul>${itemHtml}</ul><p>Total: <strong>₹${amount}</strong></p><p>Payment: ${escapeHtml(order.paymentStatus === 'COD_PENDING_COLLECTION' ? 'Cash on delivery' : order.paymentStatus)}</p>${link ? `<p><a href="${escapeHtml(link)}">View your order</a></p>` : ''}`) })
}

export async function sendOrderUpdateEmail({ email, name, orderNumber, status, paymentStatus, trackingNumber }) {
  if (!email) return false
  const appUrl = getAppUrl()
  const link = appUrl ? `${appUrl.replace(/\/$/, '')}/orders/me` : ''
  const lines = [`Order ${orderNumber} has been updated.`, status ? `Order status: ${status}` : '', paymentStatus ? `Payment/refund status: ${paymentStatus}` : '', trackingNumber ? `Tracking number: ${trackingNumber}` : '', link ? `View your order: ${link}` : ''].filter(Boolean)
  return sendEmail({ to: email, subject: `Update for order ${orderNumber}`, text: `Hi ${name || 'there'},\n\n${lines.join('\n')}`, html: emailShell('Your order has been updated', `<p>Hi ${escapeHtml(name || 'there')},</p><p>Order <strong>${escapeHtml(orderNumber)}</strong> has an update.</p><ul>${[status && `Order status: ${status}`, paymentStatus && `Payment/refund status: ${paymentStatus}`, trackingNumber && `Tracking number: ${trackingNumber}`].filter(Boolean).map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>${link ? `<p><a href="${escapeHtml(link)}">View your order</a></p>` : ''}`) })
}

export async function sendPasswordChangedEmail(email, name) {
  return sendEmail({ to: email, subject: "Your Jamae's Craftopia password was changed", text: `Hi ${name || 'there'}, your account password was changed. If you did not make this change, contact us immediately.`, html: emailShell('Password changed', `<p>Hi ${escapeHtml(name || 'there')},</p><p>Your account password was changed.</p><p>If you did not make this change, contact us immediately.</p>`) })
}

export async function sendSupportNotification({ subject, text, replyTo }) {
  const to = process.env.SUPPORT_EMAIL?.trim()
  if (!to) return false
  return sendEmail({ to, subject, text, replyTo })
}
