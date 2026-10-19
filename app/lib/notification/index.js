/**
 * Notification provider abstraction.
 * Supports WhatsApp fallback, email, and future providers.
 */
class NotificationProvider {
  constructor(name, capabilities) {
    this.name = name
    this.capabilities = capabilities
  }

  async send(template, recipient, data) {
    throw new Error('send() must be implemented by provider')
  }

  async checkCapability(capability) {
    return this.capabilities.includes(capability)
  }
}

export class WhatsAppManualProvider extends NotificationProvider {
  constructor() {
    super('whatsapp-manual', [
      'order-confirmation',
      'payment-pending',
      'payment-confirmed',
      'shipping-update',
    ])
  }

  async send(template, recipient, data) {
    switch (template) {
      case 'order-confirmation':
        return this.sendOrderConfirmation(recipient, data)
      case 'payment-pending':
        return this.sendPaymentPending(recipient, data)
      case 'payment-confirmed':
        return this.sendPaymentConfirmed(recipient, data)
      default:
        throw new Error(`Template ${template} not supported by WhatsApp manual provider`)
    }
  }

  sendOrderConfirmation(recipient, data) {
    const { orderNumber, totalAmount, items } = data
    const totalInr = (totalAmount / 100).toFixed(2)
    
    const message = encodeURIComponent(
      `🎁 Jamae's Craftopia Order Confirmation\n\n` +
      `Order: ${orderNumber}\n` +
      `Total: ₹${totalInr}\n\n` +
      `Items:\n${items.map(i => `• ${i.name} (Qty: ${i.quantity})`).join('\n')}\n\n` +
      `Payment pending — please share the transaction screenshot or UTR once done.`
    )

    const whatsappNumber = process.env.WHATSAPP_CONTACT_NUMBER || ''
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`

    return {
      success: true,
      provider: this.name,
      template,
      data: { whatsappLink, message: decodeURIComponent(message) },
      manual: true,
      instructions: 'Click the WhatsApp link to send the prefilled message manually.',
    }
  }

  sendPaymentPending(recipient, data) {
    const { orderNumber, amount, upiUri, merchantVpa } = data
    const amountInr = (amount / 100).toFixed(2)
    
    const message = encodeURIComponent(
      `💸 Jamae's Craftopia Payment Instructions\n\n` +
      `Order: ${orderNumber}\n` +
      `Amount: ₹${amountInr}\n` +
      `UPI ID: ${merchantVpa}\n\n` +
      `Please pay to ${merchantVpa} and reply with the screenshot or UTR.\n` +
      `Or use this UPI link: ${upiUri}`
    )

    const whatsappNumber = process.env.WHATSAPP_CONTACT_NUMBER || ''
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`

    return {
      success: true,
      provider: this.name,
      template,
      data: { whatsappLink, message: decodeURIComponent(message) },
      manual: true,
    }
  }

  sendPaymentConfirmed(recipient, data) {
    const { orderNumber } = data
    
    const message = encodeURIComponent(
      `✅ Jamae's Craftopia Payment Confirmed\n\n` +
      `Order: ${orderNumber}\n\n` +
      `Thank you! Your payment has been verified. We'll start crafting your handmade pieces now.\n` +
      `We'll share tracking details when your order ships.`
    )

    const whatsappNumber = process.env.WHATSAPP_CONTACT_NUMBER || ''
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`

    return {
      success: true,
      provider: this.name,
      template,
      data: { whatsappLink, message: decodeURIComponent(message) },
      manual: true,
    }
  }
}

export class TestNotificationProvider extends NotificationProvider {
  constructor() {
    super('test', [
      'order-confirmation',
      'payment-pending',
      'payment-confirmed',
      'shipping-update',
    ])
    this.sentLogs = []
  }

  async send(template, recipient, data) {
    const log = { template, recipient, data, timestamp: new Date() }
    this.sentLogs.push(log)

    return {
      success: true,
      provider: this.name,
      template,
      data,
      manual: false,
      testMode: true,
      logId: log.timestamp.getTime(),
    }
  }

  getLogs() {
    return this.sentLogs
  }
}

const PROVIDER_MAP = {
  'whatsapp-manual': WhatsAppManualProvider,
  'test': TestNotificationProvider,
}

export function getNotificationProvider(name = process.env.NOTIFICATION_PROVIDER || 'whatsapp-manual') {
  const ProviderClass = PROVIDER_MAP[name]
  if (!ProviderClass) {
    throw new Error(`Notification provider "${name}" not found.`)
  }
  return new ProviderClass()
}

export const availableProviders = Object.keys(PROVIDER_MAP)
