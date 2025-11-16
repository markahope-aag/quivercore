import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { withQueryPerformance } from '@/lib/utils/query-performance'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const { id } = await params

    // Try RPC first, fall back to direct update
    try {
      const result = await withQueryPerformance(
        'POST /api/prompts/[id]/use (RPC)',
        'rpc',
        'prompts',
        async () => {
          const { data, error } = await supabase.rpc('increment_prompt_usage', {
            prompt_id: id,
            user_id: user.id,
          })

          if (error) throw error
          return data
        }
      )

      return NextResponse.json({ success: true, data: result })
    } catch (rpcError) {
      // If RPC doesn't exist, fall back to direct update
      logger.warn('RPC function not found, using direct update', rpcError)

      const prompt = await withQueryPerformance(
        'POST /api/prompts/[id]/use (fetch)',
        'select',
        'prompts',
        async () => {
          const { data, error } = await supabase
            .from('prompts')
            .select('usage_count')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

          if (error || !data) {
            throw new ApplicationError('Prompt not found', ErrorCodes.NOT_FOUND, 404)
          }
          return data
        }
      )

      const updated = await withQueryPerformance(
        'POST /api/prompts/[id]/use (update)',
        'update',
        'prompts',
        async () => {
          const { data, error } = await supabase
            .from('prompts')
            .update({
              usage_count: (prompt.usage_count || 0) + 1,
              last_used_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select('id, usage_count, last_used_at, updated_at')
            .single()

          if (error) {
            logger.error('Error updating prompt usage:', error)
            throw new ApplicationError(
              error.message || 'Failed to update prompt usage',
              ErrorCodes.DATABASE_ERROR,
              500,
              error
            )
          }
          return data
        }
      )

      return NextResponse.json(updated)
    }
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('POST /api/prompts/[id]/use error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}
