import { test, expect } from '@playwright/test'
import { constants, createPublicKey, publicEncrypt } from 'node:crypto'

async function encryptPassword(request, password) {
  const response = await request.get('/api/auth/password-key')
  const { publicKey, kid } = await response.json()
  const ciphertext = publicEncrypt({ key: createPublicKey({ key: publicKey, format: 'jwk' }), padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(password)).toString('base64url')
  return { v: 1, kid, ciphertext }
}

async function signInAsAdmin(page) {
  await page.goto('/account/admin-login?redirect=/admin')
  await page.getByLabel('Email address').fill('admin@example.com')
  await page.getByLabel('Password').fill('Test@123')
  await page.getByRole('button', { name: 'Sign in to admin' }).click()
  await expect(page).toHaveURL(/\/admin$/)
}

test('admin pages require an admin session', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/account\/admin-login/)
  await expect(page.getByRole('heading', { name: 'Admin sign in' })).toBeVisible()
  await expect(page.getByRole('contentinfo')).toHaveCount(0)
})

test('admin sign-in opens the separate admin interface', async ({ page }) => {
  await page.goto('/account/admin-login')
  await page.getByLabel('Email address').fill('admin@example.com')
  await page.getByLabel('Password').fill('Test@123')
  await page.getByRole('button', { name: 'Sign in to admin' }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByRole('contentinfo')).toHaveCount(0)
})

test('customer accounts cannot sign in to the admin portal', async ({ page }) => {
  await page.goto('/account/admin-login')
  await page.getByLabel('Email address').fill('test@example.com')
  await page.getByLabel('Password').fill('Test@123')
  await page.getByRole('button', { name: 'Sign in to admin' }).click()
  await expect(page.locator('p[role="alert"]')).toContainText(/does not have administrator access|account is inactive/)
  await expect(page).toHaveURL(/account\/admin-login/)
})

test('repeated password sign-in failures are throttled', async ({ request }) => {
  const email = `throttle-${Date.now()}@example.com`
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    const encryptedPassword = await encryptPassword(request, 'WrongPassword123')
    const response = await request.post('/api/auth/login', { headers: { 'x-real-ip': `198.51.100.${Math.floor(Math.random() * 200) + 1}` }, data: { email, encryptedPassword, adminOnly: true } })
    if (attempt < 8) expect(response.status()).toBe(401)
    else {
      expect(response.status()).toBe(429)
      expect(response.headers()['retry-after']).toBeTruthy()
    }
  }
})

test('admin can review dashboard, orders, products, users, and manage coupons', async ({ page }) => {
  await signInAsAdmin(page)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  for (const [label, path, heading] of [['Orders', '/admin/orders', 'Orders'], ['Products', '/admin/products', 'Products'], ['Customers', '/admin/users', 'Users'], ['Coupons', '/admin/coupons', 'Coupons'], ['Payment settings', '/admin/settings', 'Payment settings']]) {
    await page.getByRole('link', { name: label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(path.replaceAll('/', '\\/')))
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    if (label === 'Customers') {
      const customerRow = page.getByRole('row').filter({ hasText: 'test@example.com' })
      await expect(customerRow).toBeVisible()
      const customersBefore = await page.request.get('/api/admin/users')
      const testCustomer = (await customersBefore.json()).data.find((user) => user.email === 'test@example.com')
      if (testCustomer.active === false) {
        await page.request.patch('/api/admin/users', { data: { id: testCustomer.id, active: true } })
      }
      const deactivateResponse = await page.request.patch('/api/admin/users', { data: { id: testCustomer.id, active: false } })
      expect(deactivateResponse.ok(), await deactivateResponse.text()).toBeTruthy()
      await page.reload()
      await expect(customerRow).toContainText('Inactive')
      const inactiveUserList = await page.request.get('/api/admin/users')
      const inactiveCustomer = (await inactiveUserList.json()).data.find((user) => user.email === 'test@example.com')
      expect(inactiveCustomer.active).toBe(false)
      const inactiveLoginResponse = await page.request.post('/api/auth/login', {
        data: { email: 'test@example.com', encryptedPassword: await encryptPassword(page.request, 'Test@123') },
      })
      expect(inactiveLoginResponse.status()).toBe(403)
      const activateResponse = await page.request.patch('/api/admin/users', { data: { id: testCustomer.id, active: true } })
      expect(activateResponse.ok()).toBeTruthy()
      await page.reload()
      await expect(customerRow).toContainText('Active')
    }
    if (label === 'Payment settings') {
      await expect(page.getByRole('button', { name: 'Save settings' })).toBeVisible()
      const vpa = page.getByLabel('Merchant UPI ID')
      const merchantName = page.getByLabel('Merchant name')
      const whatsapp = page.getByLabel('WhatsApp number, including country code')
      const original = { vpa: await vpa.inputValue(), merchantName: await merchantName.inputValue(), whatsapp: await whatsapp.inputValue() }
      await vpa.fill('testmerchant@bank')
      await merchantName.fill('Local Payment Test')
      await whatsapp.fill('919876543210')
      await page.getByRole('button', { name: 'Save settings' }).click()
      await expect(page.getByRole('status')).toContainText('Payment settings saved')
      const upiDetails = await page.request.get('/api/payment/upi-details')
      expect((await upiDetails.json()).data.vpa).toBe('testmerchant@bank')
      await vpa.fill(original.vpa || 'testmerchant@bank')
      await merchantName.fill(original.merchantName || "Jamae's Craftopia")
      await whatsapp.fill(original.whatsapp)
      if (!original.vpa) await vpa.fill('business@bank')
      await page.getByRole('button', { name: 'Save settings' }).click()
      await expect(page.getByRole('status')).toContainText('Payment settings saved')
      if (!original.vpa) {
        const response = await page.request.patch('/api/admin/settings', { data: { merchantVpa: '', merchantName: "Jamae's Craftopia", whatsappNumber: '' } })
        expect(response.ok()).toBeTruthy()
      }
    }
    if (label === 'Products') {
      const row = page.getByRole('row').filter({ hasText: 'Honey Bear' })
      await row.getByLabel('discountPercent for Honey Bear').fill('10')
      await row.getByLabel('gstPercent for Honey Bear').fill('5')
      await row.getByLabel('codFee for Honey Bear').fill('7')
      await row.getByLabel('otherCharge for Honey Bear').fill('3')
      await row.getByRole('button', { name: 'Save' }).click()
      await expect(page.getByRole('status')).toContainText('Honey Bear saved')
      const productsResponse = await page.request.get('/api/admin/products')
      const honeyBear = (await productsResponse.json()).data.find((product) => product.id === 'honey-bear')
      expect(honeyBear.discountPercent).toBe(10)
      expect(honeyBear.gstPercent).toBe(5)
      expect(honeyBear.codFee).toBe(7)
      expect(honeyBear.otherCharge).toBe(3)
      const validation = await page.request.post('/api/cart/validate', { data: { items: [{ productId: honeyBear.id, quantity: 2 }] } })
      const item = (await validation.json()).data.items[0]
      expect(item.discountPercent).toBe(10)
      expect(item.gstPercent).toBe(5)
      expect(item.codFee).toBe(7)
      expect(item.otherCharge).toBe(3)
      await page.request.patch('/api/admin/products', { data: { id: honeyBear.id, discountPercent: 0, gstPercent: 0, codFee: 0, otherCharge: 0 } })
    }
  }
  await page.getByRole('link', { name: 'Coupons', exact: true }).click()
  await expect(page.getByRole('table').getByText('CRAFT10', { exact: true })).toBeVisible()
  const couponCode = `E2E${Date.now().toString().slice(-6)}`
  const couponLabel = `Browser test offer ${Date.now()}`
  await page.getByLabel('Code').fill(couponCode)
  await page.getByLabel('Label').fill(couponLabel)
  await page.getByLabel('Discount %').fill('12')
  await page.getByRole('button', { name: 'Create coupon' }).click()
  await expect(page.getByRole('table').getByText(couponLabel, { exact: true })).toBeVisible()
  await expect(page.getByRole('table').getByText(couponCode, { exact: true })).toBeVisible()
  const validation = await page.request.post('/api/coupons/validate', { data: { code: couponCode, subtotal: 1000 } })
  expect(validation.ok()).toBeTruthy()
  expect((await validation.json()).data.discount).toBe(0.12)
})
