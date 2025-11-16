/**
 * Encryption utilities for sensitive data like API keys
 * Uses AES-256-GCM encryption with a server-side secret
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const TAG_POSITION = SALT_LENGTH + IV_LENGTH
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH

/**
 * Get encryption key from environment variable
 * In production, this should be a secure random string stored in environment variables
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET

  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is not set')
  }

  // Derive a 256-bit key from the secret
  return crypto.scryptSync(secret, 'salt', 32)
}

/**
 * Encrypt a string value
 * @param text The plaintext to encrypt
 * @returns The encrypted text as a hex string
 */
export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const salt = crypto.randomBytes(SALT_LENGTH)

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ])

    const tag = cipher.getAuthTag()

    // Combine salt + iv + tag + encrypted for storage
    return Buffer.concat([salt, iv, tag, encrypted]).toString('hex')
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt an encrypted string
 * @param encryptedHex The encrypted hex string
 * @returns The decrypted plaintext
 */
export function decrypt(encryptedHex: string): string {
  try {
    const key = getEncryptionKey()
    const data = Buffer.from(encryptedHex, 'hex')

    // Extract components
    const salt = data.subarray(0, SALT_LENGTH)
    const iv = data.subarray(SALT_LENGTH, TAG_POSITION)
    const tag = data.subarray(TAG_POSITION, ENCRYPTED_POSITION)
    const encrypted = data.subarray(ENCRYPTED_POSITION)

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ])

    return decrypted.toString('utf8')
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Validate that an API key has a reasonable format
 * @param provider The API provider (openai, anthropic)
 * @param apiKey The API key to validate
 * @returns True if valid format
 */
export function validateApiKeyFormat(provider: string, apiKey: string): boolean {
  if (!apiKey || apiKey.trim().length === 0) {
    return false
  }

  switch (provider) {
    case 'openai':
      // OpenAI keys start with 'sk-' and are ~50 chars
      return apiKey.startsWith('sk-') && apiKey.length > 20
    case 'anthropic':
      // Anthropic keys start with 'sk-ant-' and are ~100+ chars
      return apiKey.startsWith('sk-ant-') && apiKey.length > 20
    default:
      return false
  }
}

/**
 * Mask an API key for display (show first/last few chars)
 * @param apiKey The API key to mask
 * @returns Masked version like "sk-...xyz"
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 10) {
    return '***'
  }

  const start = apiKey.substring(0, 7)
  const end = apiKey.substring(apiKey.length - 4)
  return `${start}...${end}`
}
