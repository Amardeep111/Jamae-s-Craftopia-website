import { verifyEmailTransport } from '../app/lib/notification/email.js'
import nextEnv from '@next/env'

nextEnv.loadEnvConfig(process.cwd())

try {
  const result = await verifyEmailTransport()
  if (!result.configured) {
    console.error('Gmail email is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local.')
    process.exitCode = 1
  } else {
    console.log('Gmail SMTP connection verified.')
  }
} catch (error) {
  console.error('Gmail SMTP verification failed:', error.message)
  process.exitCode = 1
}
