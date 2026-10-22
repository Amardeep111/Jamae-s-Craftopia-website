'use client'

import { useEffect, useRef } from 'react'
import { useCartStore } from '@/lib/cart'
import { useUserStore } from '@/lib/user'
import { fetchCurrentUser } from '@/lib/auth/client'

function mergeCartItems(savedItems, guestItems) {
  const merged = new Map(savedItems.map((item) => [item.id, { ...item }]))
  for (const item of guestItems) {
    const current = merged.get(item.id)
    if (current) current.quantity = Math.min(99, Number(current.quantity || 0) + Number(item.quantity || 0))
    else merged.set(item.id, { ...item, quantity: Math.min(99, Number(item.quantity || 1)) })
  }
  return [...merged.values()]
}

export default function CartSync() {
  const userId = useUserStore((state) => state.userId)
  const readyUserId = useRef(null)
  const initializedUserId = useRef(null)

  useEffect(() => {
    let alive = true
    fetchCurrentUser().then((auth) => {
      if (!alive) return
      if (!auth.authenticated || !auth.user) {
        if (useUserStore.getState().userId) {
          useUserStore.getState().logout()
          useCartStore.getState().replaceItems([])
          useCartStore.getState().setOwnerUserId(null)
        }
        return
      }
      if (auth.user?.userId) {
        useUserStore.getState().login({ ...auth.user, userId: auth.user.userId })
      }
    }).catch(() => {})
    return () => { alive = false }
  }, [])

  useEffect(() => {
    let active = true
    if (!userId) {
      readyUserId.current = null
      // Only wipe cart if user explicitly logged out (session invalid), not on navigation
      if (initializedUserId.current && !useUserStore.getState().userId) {
        useCartStore.getState().replaceItems([])
        useCartStore.getState().setOwnerUserId(null)
        initializedUserId.current = null
      }
      return () => { active = false }
    }

    readyUserId.current = null
    const localCart = useCartStore.getState()
    const ownerUserId = localCart.ownerUserId
    const guestItems = ownerUserId ? [] : localCart.items

    async function initialize() {
      try {
        const response = await fetch('/api/cart', { cache: 'no-store' })
        const result = await response.json()
        if (!response.ok || !result.success) throw new Error(result.error || 'Saved cart unavailable')
        if (!active) return
        const items = ownerUserId === userId ? result.data : mergeCartItems(result.data, guestItems)
        useCartStore.getState().replaceItems(items)
        useCartStore.getState().setOwnerUserId(userId)
        initializedUserId.current = userId
        readyUserId.current = userId
        if (ownerUserId !== userId) {
          const savedResponse = await fetch('/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: items.map((item) => ({ productId: item.id, quantity: item.quantity })) }) })
          const savedResult = await savedResponse.json().catch(() => ({}))
          if (active && savedResponse.ok && savedResult.success) useCartStore.getState().replaceItems(savedResult.data)
        }
      } catch {
        // Keep the local cart usable if the saved-cart service is temporarily unavailable.
      }
    }
    initialize()
    return () => { active = false }
  }, [userId])

  useEffect(() => {
    let timer
    const unsubscribe = useCartStore.subscribe((state, previous) => {
      const owner = readyUserId.current
      if (!owner || state.items === previous.items) return
      clearTimeout(timer)
      const items = state.items.map(({ id, quantity }) => ({ productId: id, quantity }))
      timer = setTimeout(() => {
        if (readyUserId.current !== owner) return
        fetch('/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) }).catch(() => {})
      }, 350)
    })
    return () => { clearTimeout(timer); unsubscribe() }
  }, [])

  return null
}
