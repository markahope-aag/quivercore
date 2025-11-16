import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt, validateApiKeyFormat, maskApiKey } from '@/lib/utils/encryption'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

/**
 * GET /api/user/api-keys
 * Get user's saved API keys (masked)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const { data, error } = await supabase
      .from('user_api_keys')
      .select('provider, encrypted_key, created_at, updated_at')
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to fetch API keys', error)
      throw new ApplicationError('Failed to fetch API keys', ErrorCodes.DATABASE_ERROR, 500, error)
    }

    // Return masked keys for display
    const maskedKeys = data.map(row => {
      try {
        const decryptedKey = decrypt(row.encrypted_key)
        return {
          provider: row.provider,
          masked_key: maskApiKey(decryptedKey),
          created_at: row.created_at,
          updated_at: row.updated_at,
        }
      } catch (error) {
        logger.error(`Failed to decrypt API key for provider ${row.provider}`, error)
        return {
          provider: row.provider,
          masked_key: '***error***',
          created_at: row.created_at,
          updated_at: row.updated_at,
        }
      }
    })

    return NextResponse.json({ keys: maskedKeys })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('GET /api/user/api-keys error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

/**
 * POST /api/user/api-keys
 * Save or update an API key
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const body = await request.json()
    const { provider, api_key } = body

    // Validate input
    if (!provider || !['openai', 'anthropic'].includes(provider)) {
      throw new ApplicationError(
        'Invalid provider. Must be "openai" or "anthropic"',
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }

    if (!api_key || typeof api_key !== 'string') {
      throw new ApplicationError(
        'API key is required',
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }

    // Validate API key format
    if (!validateApiKeyFormat(provider, api_key)) {
      throw new ApplicationError(
        `Invalid API key format for ${provider}`,
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }

    // Encrypt the API key
    const encryptedKey = encrypt(api_key)

    // Upsert the key (insert or update if exists)
    const { error } = await supabase
      .from('user_api_keys')
      .upsert({
        user_id: user.id,
        provider,
        encrypted_key: encryptedKey,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider'
      })

    if (error) {
      logger.error('Failed to save API key', error)
      throw new ApplicationError('Failed to save API key', ErrorCodes.DATABASE_ERROR, 500, error)
    }

    return NextResponse.json({
      success: true,
      message: `${provider} API key saved successfully`,
      masked_key: maskApiKey(api_key),
    })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('POST /api/user/api-keys error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

/**
 * DELETE /api/user/api-keys
 * Delete an API key
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (!provider || !['openai', 'anthropic'].includes(provider)) {
      throw new ApplicationError(
        'Invalid provider. Must be "openai" or "anthropic"',
        ErrorCodes.VALIDATION_ERROR,
        400
      )
    }

    const { error } = await supabase
      .from('user_api_keys')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider)

    if (error) {
      logger.error('Failed to delete API key', error)
      throw new ApplicationError('Failed to delete API key', ErrorCodes.DATABASE_ERROR, 500, error)
    }

    return NextResponse.json({
      success: true,
      message: `${provider} API key deleted successfully`,
    })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('DELETE /api/user/api-keys error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}
