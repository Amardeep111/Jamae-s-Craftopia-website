import { generateKeyPairSync } from 'node:crypto'

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'der' },
  privateKeyEncoding: { type: 'pkcs8', format: 'der' },
})

console.log(`PASSWORD_ENCRYPTION_PRIVATE_KEY="${privateKey.toString('base64')}"`)
console.error('Store this value as a server-only secret. Do not add it to NEXT_PUBLIC_* variables or commit it.')
