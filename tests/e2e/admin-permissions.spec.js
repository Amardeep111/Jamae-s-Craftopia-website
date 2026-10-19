import { test, expect } from '@playwright/test'

async function signIn(page, email, password) {
  await page.goto('/account/admin-login')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in to admin' }).click()
  await expect(page).toHaveURL(/\/admin$/)
}

async function encryptPasswordInBrowser(page, password) {
  return page.evaluate(async (value) => {
    const response = await fetch('/api/auth/password-key', { cache: 'no-store' })
    const { publicKey, kid } = await response.json()
    const key = await crypto.subtle.importKey('jwk', publicKey, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'])
    const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, new TextEncoder().encode(value))
    let binary = ''
    for (const byte of new Uint8Array(encrypted)) binary += String.fromCharCode(byte)
    return { v: 1, kid, ciphertext: btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '') }
  }, password)
}

test('superadmin provisions a limited admin and logout revokes the database session', async ({ page }) => {
  const email = `limited-admin-${Date.now()}@example.com`
  const password = 'TestPass123'
  await signIn(page, 'admin@example.com', 'Test@123')

  const cookie = (await page.context().cookies()).find((entry) => entry.name === 'jamaes_session')
  expect(cookie?.value).toMatch(/^enc\.v1\./)
  await page.getByRole('link', { name: 'Admin access', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Admin access' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Add an administrator' })).toBeVisible()

  const encryptedPassword = await encryptPasswordInBrowser(page, password)
  const createResponse = await page.request.post('/api/admin/admins', {
    data: { name: 'Limited Admin', email, encryptedPassword, permissions: ['dashboard.view'] },
  })
  expect(createResponse.status()).toBe(201)
  const createdAdmin = (await createResponse.json()).data

  const resetPassword = 'ResetAdmin234'
  const encryptedResetPassword = await encryptPasswordInBrowser(page, resetPassword)
  const resetResponse = await page.request.post('/api/admin/admins/password', { data: { userId: createdAdmin.id, encryptedPassword: encryptedResetPassword } })
  expect(resetResponse.ok()).toBeTruthy()

  await page.getByRole('button', { name: 'Log out of admin account' }).click()
  await expect(page).toHaveURL(/account\/admin-login/)
  const loggedOutResponse = await page.request.get('/api/auth/me')
  expect(loggedOutResponse.status()).toBe(401)

  await signIn(page, email, resetPassword)
  await expect(page.getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Orders', exact: true })).toHaveCount(0)
  expect((await page.request.get('/api/admin/dashboard')).status()).toBe(200)
  expect((await page.request.get('/api/admin/orders')).status()).toBe(403)
  expect((await page.request.get('/api/admin/admins')).status()).toBe(403)

  await page.getByRole('link', { name: 'My account', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'My account' })).toBeVisible()
  const [encryptedCurrent, encryptedNew] = await Promise.all([
    encryptPasswordInBrowser(page, resetPassword),
    encryptPasswordInBrowser(page, 'SelfChanged345'),
  ])
  const passwordResponse = await page.request.post('/api/account/password', { data: { currentPassword: encryptedCurrent, newPassword: encryptedNew } })
  expect(passwordResponse.status(), await passwordResponse.text()).toBe(202)
  const { challengeId } = await passwordResponse.json()
  const verifyResponse = await page.request.post('/api/account/password/verify', { data: { challengeId, otp: '246810' } })
  expect(verifyResponse.ok(), await verifyResponse.text()).toBeTruthy()

  await page.getByRole('button', { name: 'Log out of admin account' }).click()
  await expect(page).toHaveURL(/account\/admin-login/)
  await signIn(page, email, 'SelfChanged345')
  await page.getByRole('button', { name: 'Log out of admin account' }).click()
  await expect(page).toHaveURL(/account\/admin-login/)
  await signIn(page, 'admin@example.com', 'Test@123')
  const removeResponse = await page.request.delete('/api/admin/admins', { data: { userId: createdAdmin.id } })
  expect(removeResponse.ok()).toBeTruthy()
})
