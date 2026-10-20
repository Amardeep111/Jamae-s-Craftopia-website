import PageHeader from '@/components/layout/PageHeader'
import CouponList from '@/components/coupon/CouponList'

export const metadata = {
  title: 'Coupons | Jamae\'s Craftopia',
  description: 'Available coupons and discounts you can apply at checkout.',
}

export default function CouponsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Offers & discounts"
        title="Coupons you can use right now."
        description="Grab a code below and apply it in your cart or at checkout. Minimum cart values apply."
      />
      <CouponList />
    </>
  )
}
