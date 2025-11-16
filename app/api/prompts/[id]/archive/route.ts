import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { withQueryPerformance } from '@/lib/utils/query-performance'

export async function PATCH(
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
    const { archived } = await request.json()

    // Update the prompt's archived status with performance monitoring
    const data = await withQueryPerformance(
      'PATCH /api/prompts/[id]/archive',
      'update',
      'prompts',
      async () => {
        const { data, error } = await supabase
          .from('prompts')
          .update({ archived, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', user.id) // Ensure user owns this prompt
          .select('id, title, archived, updated_at')
          .single()

        if (error) {
          logger.error('Error updating prompt:', error)
          throw new ApplicationError(
            error.message || 'Failed to update prompt',
            ErrorCodes.DATABASE_ERROR,
            500,
            error
          )
        }

        if (!data) {
          throw new ApplicationError('Prompt not found', ErrorCodes.NOT_FOUND, 404)
        }

        return data
      }
    )

    return NextResponse.json(data)
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('PATCH /api/prompts/[id]/archive error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}
