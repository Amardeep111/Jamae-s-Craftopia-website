// Shared order status metadata used by all order pages (success, list, detail).
// Statuses flow: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED.
// CANCELLED is a terminal off-flow state.

import { CheckCircle2, Package, Truck, AlertCircle, Clock } from 'lucide-react'

export const STATUS_META = {
  PENDING:    { label: 'Pending payment', icon: Clock,        color: 'text-muted',   dot: 'bg-muted',   bg: 'bg-muted/15',   desc: 'Awaiting payment confirmation.' },
  CONFIRMED:  { label: 'Confirmed',       icon: CheckCircle2, color: 'text-sage',    dot: 'bg-sage',    bg: 'bg-sage/15',    desc: 'Your order has been placed.' },
  PROCESSING: { label: 'Being crafted',   icon: Package,      color: 'text-bloom',   dot: 'bg-bloom',   bg: 'bg-bloom/15',   desc: 'Our artisans are preparing it.' },
  SHIPPED:    { label: 'Shipped',         icon: Truck,        color: 'text-plum',    dot: 'bg-plum',    bg: 'bg-plum/15',    desc: 'On its way to you.' },
  DELIVERED:  { label: 'Delivered',       icon: CheckCircle2, color: 'text-sage',    dot: 'bg-sage',    bg: 'bg-sage/15',    desc: 'Enjoy your piece!' },
  CANCELLED:  { label: 'Cancelled',       icon: AlertCircle,  color: 'text-bloom',   dot: 'bg-bloom',   bg: 'bg-bloom/15',   desc: 'This order was cancelled.' },
}

export const STATUS_FLOW = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export function getFlowIndex(status) {
  if (status === 'CANCELLED' || status === 'PENDING') return -1
  return STATUS_FLOW.indexOf(status)
}

export function getStatusMeta(status) {
  return STATUS_META[status] || { label: status, color: 'text-muted', dot: 'bg-muted', bg: 'bg-muted/15', icon: Clock, desc: 'Unknown status.' }
}
