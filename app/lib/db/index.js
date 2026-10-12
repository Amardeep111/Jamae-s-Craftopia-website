import { prisma, shouldUseMockData, testDatabaseConnection } from './client'
import { mockDb } from './mock'

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

    return prisma.product.findMany({
      where,
      take: filters.limit,
      include: {
        category: true,
      },
      orderBy: filters.featured ? { featured: 'desc' } : { createdAt: 'desc' },
    })
  },

  async getProductById(id) {
    if (shouldUseMockData()) {
      return mockDb.findProductById(id)
    }

    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    })
  },

  async getProductBySlug(slug) {
    if (shouldUseMockData()) {
      return mockDb.findProductById(slug)
    }

    return prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    })
  },

  // Categories
  async getCategories() {
    if (shouldUseMockData()) {
      return mockDb.findManyCategories()
    }

    return prisma.category.findMany({
      orderBy: { order: 'asc' },
    })
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

    return prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress: data.shippingAddress,
        status: data.status || 'PENDING',
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod || null,
        paymentStatus: data.paymentStatus || 'PAID',
        notes: data.notes,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            customization: item.customization,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
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
      },
    })
  },

  async getOrdersByEmail(email) {
    if (shouldUseMockData()) {
      return mockDb.getOrdersByEmail(email)
    }
    return prisma.order.findMany({
      where: { customerEmail: email },
      include: {
        items: { include: { product: true } },
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
