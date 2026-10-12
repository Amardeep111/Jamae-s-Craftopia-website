/**
 * Cart store backed by localStorage.
 * Keeps the full cart state here so Navbar, product pages, and the cart page all share the same source of truth.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const CART_EVENT = 'jamaes:cart:change'

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CART_EVENT))
  }
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem(product, quantity = 1) {
        const items = get().items
        const key = product.id
        const existing = items.find((i) => i.id === key)
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === key ? { ...i, quantity: i.quantity + quantity } : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                id: product.id,
                name: product.name,
                price: product.price,
                visual: product.visual,
                palette: product.palette,
                category: product.category,
                quantity,
              },
            ],
          })
        }
        notifyChange()
      },

      removeItem(id) {
        set({ items: get().items.filter((i) => i.id !== id) })
        notifyChange()
      },

      updateQuantity(id, quantity) {
        if (quantity < 1) {
          get().removeItem(id)
          return
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        })
        notifyChange()
      },

      clear() {
        set({ items: [] })
        notifyChange()
      },

      totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      totalPrice() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },
    }),
    {
      name: 'jamaes:cart',
    }
  )
)
