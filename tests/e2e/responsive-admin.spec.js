import { test, expect } from '@playwright/test'

test('customer pages fit a narrow phone viewport without horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  for (const path of ['/', '/shop', '/shop/honey-bear', '/cart', '/account/login', '/contact']) {
    await page.goto(path)
    await expect(page.locator('body')).toBeVisible()
    const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }))
    expect(dimensions.scrollWidth, `${path} should not overflow horizontally`).toBeLessThanOrEqual(dimensions.width + 1)
  }
})

test('admin orders are filterable and admin can log out on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/account/admin-login?redirect=/admin')
  await page.getByLabel('Email address').fill('admin@example.com')
  await page.getByLabel('Password').fill('Test@123')
  await page.getByRole('button', { name: 'Sign in to admin' }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('button', { name: 'Log out of admin account' })).toBeVisible()
  await page.getByRole('link', { name: 'Orders', exact: true }).last().click()
  await expect(page.getByLabel('Customer')).toBeVisible()
  await expect(page.getByLabel('Order status')).toBeVisible()
  await expect(page.getByLabel('Payment status')).toBeVisible()
  const ordersResponse = await page.request.get('/api/admin/orders')
  const orders = (await ordersResponse.json()).data || []
  if (orders.length) {
    await page.getByLabel('Customer').selectOption(orders[0].customerEmail)
    await expect(page.getByRole('link', { name: orders[0].orderNumber })).toBeVisible()
    await page.getByRole('link', { name: orders[0].orderNumber }).click()
    await expect(page.getByRole('heading', { name: 'Customer and delivery' })).toBeVisible()
    const addressText = await page.getByText('Shipping address').locator('..').innerText()
    expect(addressText).not.toMatch(/cmv[a-z0-9]{10,}|202\d-\d\d-\d\dT/)
    const detailDimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }))
    expect(detailDimensions.scrollWidth).toBeLessThanOrEqual(detailDimensions.width + 1)
    await page.goto('/admin/orders')
  }
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1)
  for (const [path, heading] of [['/admin/products', 'Products'], ['/admin/users', 'Users'], ['/admin/coupons', 'Coupons'], ['/admin/settings', 'Payment settings']]) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    const pageDimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }))
    expect(pageDimensions.scrollWidth, `${path} should not overflow horizontally`).toBeLessThanOrEqual(pageDimensions.width + 1)
  }
  await page.getByRole('button', { name: 'Log out of admin account' }).click()
  await expect(page).toHaveURL(/account\/admin-login/)
})
