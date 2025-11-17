import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUsageSummary } from '@/lib/utils/usage-checker'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

/**
 * GET /api/usage/summary
 * Returns current usage stats for the authenticated user
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const summary = await getUsageSummary(user.id)

    return NextResponse.json({
      storage: {
        current: summary.storage.current,
        limit: summary.storage.limit,
        remaining: summary.storage.remaining,
        percentUsed: summary.storage.percentUsed,
        nextTier: summary.storage.nextTier,
        nextTierLimit: summary.storage.nextTierLimit,
        addOnPrice: summary.storage.addOnPrice,
        addOnSize: summary.storage.addOnSize,
      },
      promptBuilder: {
        current: summary.promptBuilder.current,
        limit: summary.promptBuilder.limit,
        remaining: summary.promptBuilder.remaining,
        percentUsed: summary.promptBuilder.percentUsed,
        nextTier: summary.promptBuilder.nextTier,
        nextTierLimit: summary.promptBuilder.nextTierLimit,
        addOnPrice: summary.promptBuilder.addOnPrice,
        addOnSize: summary.promptBuilder.addOnSize,
      },
    })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('GET /api/usage/summary error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}
