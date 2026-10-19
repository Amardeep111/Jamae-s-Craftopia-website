import { products as mockProducts, getProductById, getProductsByCategory, getFeaturedProducts, formatPrice } from '@/data/products'
import { categories as mockCategories } from '@/data/categories'
import { testimonials as mockTestimonials } from '@/data/testimonials'

// In-memory order store (mock-only; lost on server restart)
const orderStore = new Map()
const orderIndexByNumber = new Map()
const orderIndexByEmail = new Map()
const orderIndexById = new Map()

function indexOrder(order) {
  orderIndexByNumber.set(order.orderNumber, order.id)
  orderIndexById.set(order.id, order.orderNumber)
  if (order.customerEmail) {
    const list = orderIndexByEmail.get(order.customerEmail) || []
    list.push(order.id)
    orderIndexByEmail.set(order.customerEmail, list)
  }
}

function newOrderNumber() {
  // JM-20260831-AB12CD — readable, dated, monotonic-ish
  const date = new Date()
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `JM-${ymd}-${rand}`
}

// Mock database responses that match Prisma schema structure
export const mockDb = {
  // Products
  async findManyProducts(filters = {}) {
    let results = mockProducts

    if (filters.categoryId) {
      results = results.filter(p => p.category === filters.categoryId)
    }

    if (filters.featured !== undefined) {
      results = results.filter(p => p.featured === filters.featured)
    }

    if (filters.published !== undefined) {
      results = results.filter(p => true) // All mock products are published
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.short.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      )
    }

    if (filters.limit) {
      results = results.slice(0, filters.limit)
    }

    return results.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.id,
      categoryId: p.category,
      price: p.price,
      featured: p.featured,
      short: p.short,
      description: p.description,
      materials: p.materials,
      care: p.care,
      customization: p.customization,
      visual: p.visual,
      palette: p.palette,
      images: p.images || [],
      stock: 100,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  },

  async findProductById(id) {
    const product = getProductById(id)
    if (!product) return null

    return {
      id: product.id,
      name: product.name,
      slug: product.id,
      categoryId: product.category,
      price: product.price,
      featured: product.featured,
      short: product.short,
      description: product.description,
      materials: product.materials,
      care: product.care,
      customization: product.customization,
      visual: product.visual,
      palette: product.palette,
      images: product.images || [],
      stock: 100,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },

  // Categories
  async findManyCategories() {
    return mockCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || null,
      accent: c.accent || null,
      image: c.image || null,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  },

  async findCategoryById(id) {
    const category = mockCategories.find((c) => c.id === id)
    if (!category) return null

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || null,
      accent: category.accent || null,
      image: category.image || null,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },

  // Orders (mock, in-memory)
  async createOrder(data) {
    const orderNumber = newOrderNumber()
    const id = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    // Hydrate items with product snapshot so we can render even if product is renamed later.
    const items = (data.items || []).map((it) => {
      const product = getProductById(it.productId)
      return {
        id: `oi_${Math.random().toString(36).slice(2, 10)}`,
        productId: it.productId,
        productName: product?.name || it.productName || 'Item',
        productImage: product?.images?.[0] || null,
        unitPrice: Number(it.unitPrice ?? product?.price ?? 0),
        gstPercent: Number(it.gstPercent || 0),
        gstAmount: Number(it.gstAmount || 0),
        codFee: Number(it.codFee || 0),
        otherCharge: Number(it.otherCharge || 0),
        quantity: Number(it.quantity || 1),
        lineTotal: Number(it.unitPrice ?? product?.price ?? 0) * Number(it.quantity || 1),
      }
    })

    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0)
    const total = Number(data.totalAmount ?? subtotal)

    const now = new Date()
    const order = {
      id,
      orderNumber,
      customerName: data.customerName || '',
      userId: data.userId || null,
      customerEmail: data.customerEmail || '',
      customerPhone: data.customerPhone || null,
      shippingAddress: data.shippingAddress || null,
      items,
      subtotal,
      shipping: Number(data.shipping || 0),
      discount: Number(data.discount || 0),
      fee: Number(data.fee || 0),
      totalAmount: total,
      paymentMethod: data.paymentMethod || null,
      paymentStatus: data.paymentStatus || 'COD_PENDING_COLLECTION',
      paymentReference: data.paymentReference || null,
      status: data.status || 'CONFIRMED',
      notes: data.notes || null,
      trackingNumber: null,
      shippingPartner: null,
      estimatedDelivery: null,
      createdAt: now,
      updatedAt: now,
    }

    orderStore.set(id, order)
    indexOrder(order)
    return order
  },

  async getOrderById(id) {
    const order = orderStore.get(id)
    return order || null
  },

  async getOrderByNumber(orderNumber) {
    const id = orderIndexByNumber.get(orderNumber)
    if (!id) return null
    return orderStore.get(id) || null
  },

  async getOrdersByEmail(email) {
    if (!email) return []
    const ids = orderIndexByEmail.get(email) || []
    return ids.map((id) => orderStore.get(id)).filter(Boolean)
  },

  getAllOrders() {
    return Array.from(orderStore.values())
  },

  async updateOrderStatus(id, patch) {
    const order = orderStore.get(id)
    if (!order) return null
    const updated = {
      ...order,
      ...patch,
      updatedAt: new Date(),
    }
    orderStore.set(id, updated)
    return updated
  },

  // Custom requests (mock)
  async createCustomRequest(data) {
    return {
      id: `req_${Date.now()}`,
      userId: data.userId || null,
      name: data.name,
      contact: data.contact,
      idea: data.idea,
      category: data.category || null,
      colors: data.colors || null,
      budget: data.budget || null,
      occasion: data.occasion || null,
      details: data.details,
      referenceImages: data.referenceImages || [],
      quotedPrice: data.quotedPrice || null,
      status: 'NEW',
      adminNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },

  // Contact messages (mock)
  async createContactMessage(data) {
    return {
      id: `msg_${Date.now()}`,
      name: data.name,
      email: data.email,
      message: data.message,
      read: false,
      replied: false,
      createdAt: new Date(),
    }
  },

  // Testimonials (read-only mock)
  async findManyTestimonials() {
    return mockTestimonials.map((t) => ({
      id: t.id.toString(),
      name: t.name,
      place: t.place,
      quote: t.quote,
      rating: t.rating,
      createdAt: new Date(),
    }))
  },
}
