import { createHash, createPrivateKey, createPublicKey, privateDecrypt, constants } from 'node:crypto'

function getPrivateKey() {
  const encoded = process.env.PASSWORD_ENCRYPTION_PRIVATE_KEY
  if (!encoded) throw new Error('Password encryption is not configured.')
  try {
    return createPrivateKey({ key: Buffer.from(encoded, 'base64'), format: 'der', type: 'pkcs8' })
  } catch {
    throw new Error('Password encryption key configuration is invalid.')
  }
}

export function getPasswordEncryptionPublicKey() {
  const privateKey = getPrivateKey()
  const publicKey = createPublicKey(privateKey)
  const der = publicKey.export({ format: 'der', type: 'spki' })
  return {
    kid: createHash('sha256').update(der).digest('hex').slice(0, 24),
    publicKey: publicKey.export({ format: 'jwk' }),
  }
}

export function decryptPassword(envelope) {
  if (!envelope || envelope.v !== 1 || typeof envelope.kid !== 'string' || typeof envelope.ciphertext !== 'string' || envelope.ciphertext.length > 2048) {
    throw new Error('Encrypted password is missing or invalid.')
  }
  const privateKey = getPrivateKey()
  const der = createPublicKey(privateKey).export({ format: 'der', type: 'spki' })
  const expectedKid = createHash('sha256').update(der).digest('hex').slice(0, 24)
  if (envelope.kid !== expectedKid) throw new Error('Password encryption key has changed. Please retry.')
  try {
    return privateDecrypt({ key: privateKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(envelope.ciphertext, 'base64url')).toString('utf8')
  } catch {
    throw new Error('Could not decrypt password. Please retry.')
  }
}
