import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3001',
    browserName: 'chromium',
    launchOptions: {
      executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable',
      args: ['--no-sandbox'],
    },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: './node_modules/.bin/next dev --turbopack -p 3001',
    env: { ...process.env, PLAYWRIGHT_TEST: 'true', EMAIL_OTP_TEST_CODE: '246810' },
    url: 'http://localhost:3001/api/health',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
