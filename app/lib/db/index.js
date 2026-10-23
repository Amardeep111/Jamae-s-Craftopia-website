import { prisma, shouldUseMockData, testDatabaseConnection } from './client.js'
import { mockDb } from './mock.js'

// Universal database abstraction layer
export const db = {
  // Products
  async getProducts(filters = {}) {
    if (shouldUseMockData()) {
      return mockDb.findManyProducts(filters)
    }

    const where = {}
    if (filters.categoryId) where.categoryId = filters.categoryId
    if (filters.featured !== undefined) where.featured = filters.featured
    if (filters.published !== undefined) where.published = filters.published
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { short: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    try {
      return await prisma.product.findMany({
        where: {
          ...where,
          category: where.categoryId ? { hidden: false, published: true } : undefined,
        },
        take: filters.limit,
        skip: filters.skip,
        include: {
          category: true,
        },
        orderBy: filters.featured ? { featured: 'desc' } : { createdAt: 'desc' },
      })
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Prisma query failed, falling back to mockDb:', err.message)
        return mockDb.findManyProducts(filters)
      }
      throw err
    }
  },

  async countProducts(filters = {}) {
    if (shouldUseMockData()) {
      const all = await mockDb.findManyProducts({ ...filters, limit: undefined, skip: undefined })
      return all.length
    }

    const where = {}
    if (filters.categoryId) where.categoryId = filters.categoryId
    if (filters.featured !== undefined) where.featured = filters.featured
    if (filters.published !== undefined) where.published = filters.published
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { short: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    try {
      return await prisma.product.count({
        where: {
          ...where,
          category: where.categoryId ? { hidden: false, published: true } : undefined,
        },
      })
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        const all = await mockDb.findManyProducts({ ...filters, limit: undefined, skip: undefined })
        return all.length
      }
      throw err
    }
  },

  async getProductById(id) {
    if (shouldUseMockData()) {
      return mockDb.findProductById(id)
    }

    try {
      return await prisma.product.findUnique({
        where: { id },
        include: { category: true },
      })
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        return mockDb.findProductById(id)
      }
      throw err
    }
  },

  async getProductBySlug(slug) {
    if (shouldUseMockData()) {
      return mockDb.findProductById(slug)
    }

    try {
      return await prisma.product.findUnique({
        where: { slug },
        include: { category: true },
      })
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        return mockDb.findProductById(slug)
      }
      throw err
    }
  },

  // Categories
  async getCategories() {
    if (shouldUseMockData()) {
      return mockDb.findManyCategories()
    }

    try {
      return await prisma.category.findMany({
        where: { hidden: false, published: true },
        orderBy: { order: 'asc' },
      })
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        return mockDb.findManyCategories()
      }
      throw err
    }
  },

  async getCategoryById(id) {
    if (shouldUseMockData()) {
      return mockDb.findCategoryById(id)
    }

    return prisma.category.findUnique({
      where: { id },
    })
  },

  // Orders
  async createOrder(data) {
    if (shouldUseMockData()) {
      return mockDb.createOrder(data)
    }

    return prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        const reserved = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        })
        if (!reserved.count) throw new Error(`Insufficient stock for ${item.productName || 'an item'}.`)
      }

      return tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          customerName: data.customerName,
          userId: data.userId,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          shippingAddress: data.shippingAddress,
          status: data.status || 'PENDING',
          totalAmount: data.totalAmount,
          subtotal: data.subtotal,
          discount: data.discount || 0,
          shipping: data.shipping || 0,
          fee: data.fee || 0,
          paymentMethod: data.paymentMethod || null,
          paymentStatus: data.paymentStatus || 'PENDING',
          paymentReference: data.paymentReference || null,
          notes: data.notes,
          paymentLogs: {
            create: [
              {
                amount: data.totalAmount,
                status: data.paymentStatus || 'PENDING',
                method: data.paymentMethod || null,
                utr: data.paymentReference || null,
                provider: data.paymentMethod === 'Cash on Delivery' ? 'COD' : 'UPI',
                providerReference: data.paymentReference || null,
              },
            ],
          },
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              gstPercent: item.gstPercent || 0,
              gstAmount: item.gstAmount || 0,
              codFee: item.codFee || 0,
              otherCharge: item.otherCharge || 0,
              customization: item.customization,
            })),
          },
        },
        include: { items: { include: { product: true } }, paymentLogs: { orderBy: { createdAt: 'desc' } } },
      })
    })
  },

  async getOrderByNumber(orderNumber) {
    if (shouldUseMockData()) {
      return mockDb.getOrderByNumber(orderNumber)
    }

    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        paymentLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  },

  async getOrderById(id) {
    if (shouldUseMockData()) {
      return mockDb.getOrderById(id)
    }
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        paymentLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })
  },

  async getOrdersByEmail(email) {
    if (!email) return []
    if (shouldUseMockData()) {
      return mockDb.getOrdersByEmail(email)
    }
    return prisma.order.findMany({
      where: { customerEmail: email },
      include: {
        items: { include: { product: true } },
        paymentLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getOrdersByUserId(userId) {
    if (!userId) return []
    if (shouldUseMockData()) {
      return mockDb
        .getAllOrders()
        .filter((o) => o?.shippingAddress?.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    return []
  },

  async updateOrderStatus(id, patch) {
    if (shouldUseMockData()) {
      return mockDb.updateOrderStatus(id, patch)
    }
    return prisma.order.update({
      where: { id },
      data: patch,
      include: {
        items: { include: { product: true } },
      },
    })
  },

  async getCouponByCode(code) {
    if (shouldUseMockData()) return null
    return prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } })
  },

  async recordCouponUsage({ couponId, userId }) {
    if (shouldUseMockData()) return { id: `usage_${Date.now()}` }
    return prisma.couponUsage.create({
      data: { couponId, userId: userId || null, used: true },
    })
  },

  // Coupon Usage
  async getCouponUsage(couponId, userId) {
    if (shouldUseMockData()) {
      return null
    }
    return prisma.couponUsage.findFirst({
      where: {
        couponId,
        userId: userId || null,
      },
    })
  },

  async incrementCouponUse(couponId, userId) {
    if (shouldUseMockData()) {
      return { id: `usage_${Date.now()}` }
    }
    await prisma.$transaction(async (tx) => {
      await tx.coupon.update({
        where: { id: couponId },
        data: { currentUses: { increment: 1 } },
      })
      await tx.couponUsage.create({
        data: {
          couponId,
          userId: userId || null,
          used: true,
        },
      })
    })
    return { success: true }
  },

  // Custom Requests
  async createCustomRequest(data) {
    if (shouldUseMockData()) {
      return mockDb.createCustomRequest(data)
    }

    return prisma.customRequest.create({
      data,
    })
  },

  // Contact Messages
  async createContactMessage(data) {
    if (shouldUseMockData()) {
      return mockDb.createContactMessage(data)
    }

    return prisma.contactMessage.create({
      data,
    })
  },
}

export { prisma, shouldUseMockData, testDatabaseConnection }
