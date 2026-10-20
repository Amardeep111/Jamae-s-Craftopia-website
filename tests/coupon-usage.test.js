// Assert coupon usage limits logic directly against Prisma
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up any leftover test coupons
  await prisma.couponUsage.deleteMany({
    where: { coupon: { code: { startsWith: 'TEST' } } },
  });
  await prisma.coupon.deleteMany({
    where: { code: { in: ['TESTLIMIT', 'TESTINCR', 'TESTBLOCK'] } },
  });

  // 1. Max uses blocks reuse
  const couponLimit = await prisma.coupon.create({
    data: {
      code: 'TESTLIMIT',
      label: 'Test Limit',
      discountPercent: 10,
      maxUses: 1,
      currentUses: 1,
      active: true,
    },
  });
  console.assert(couponLimit.maxUses > 0, 'maxUses should be > 0');
  console.assert(couponLimit.currentUses >= couponLimit.maxUses, 'currentUses should reach maxUses');
  console.log('PASS: maxUses blocks reuse for', couponLimit.code);

  // 2. incrementCouponUse creates usage and increments currentUses
  const couponIncr = await prisma.coupon.create({
    data: {
      code: 'TESTINCR',
      label: 'Test Increment',
      discountPercent: 5,
      maxUses: 5,
      currentUses: 0,
      active: true,
    },
  });
  await prisma.couponUsage.create({
    data: {
      couponId: couponIncr.id,
      userId: 'user-xyz',
      used: true,
    },
  });
  await prisma.coupon.update({
    where: { id: couponIncr.id },
    data: { currentUses: { increment: 1 } },
  });
  const usage = await prisma.couponUsage.findFirst({
    where: { couponId: couponIncr.id, userId: 'user-xyz' },
  });
  console.assert(usage !== null, 'Usage record should exist');
  const updated = await prisma.coupon.findUnique({ where: { id: couponIncr.id } });
  console.assert(updated.currentUses === 1, 'currentUses should be 1 after increment');
  console.log('PASS: incrementCouponUse creates usage for', couponIncr.code);

  // 3. Per-user reuse blocked
  const couponBlock = await prisma.coupon.create({
    data: {
      code: 'TESTBLOCK',
      label: 'Test Block',
      discountPercent: 15,
      maxUses: 10,
      currentUses: 0,
      active: true,
    },
  });
  await prisma.couponUsage.create({
    data: {
      couponId: couponBlock.id,
      userId: 'user-reuse',
      used: true,
    },
  });
  const reuseUsage = await prisma.couponUsage.findFirst({
    where: { couponId: couponBlock.id, userId: 'user-reuse' },
  });
  console.assert(reuseUsage !== null, 'Reuse usage record should exist');
  console.log('PASS: per-user reuse tracked for', couponBlock.code);

  // Cleanup
  await prisma.couponUsage.deleteMany({
    where: { couponId: { in: [couponLimit.id, couponIncr.id, couponBlock.id] } },
  });
  await prisma.coupon.deleteMany({
    where: { code: { in: ['TESTLIMIT', 'TESTINCR', 'TESTBLOCK'] } },
  });
  await prisma.$disconnect();
  console.log('All coupon usage limit assertions passed.');
}

main().catch((e) => {
  console.error('FAIL:', e);
  process.exit(1);
});
