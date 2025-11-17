import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { withQueryPerformance } from '@/lib/utils/query-performance'
import { getUserPlanTier } from '@/lib/utils/subscriptions'
import { hasAvailableStorage, incrementStorageUsage } from '@/lib/usage/usage-tracking'
import { PLAN_STORAGE_LIMITS } from '@/lib/constants/billing-config'

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

    // Check user's plan tier and storage limits
    const planTier = await getUserPlanTier(user.id)
    const storageLimit = PLAN_STORAGE_LIMITS[planTier]

    // Check if duplicating would exceed storage limit
    const { available, currentCount } = await hasAvailableStorage(user.id, planTier, 1)

    if (!available) {
      return NextResponse.json(
        {
          error: 'Storage limit exceeded',
          code: 'STORAGE_LIMIT_EXCEEDED',
          current: currentCount,
          limit: storageLimit,
          planTier,
          message: `Cannot duplicate prompt. You have ${currentCount}/${storageLimit} prompts stored. Upgrade your plan to add more prompts.`,
          upgradeRequired: true,
        },
        { status: 402 } // 402 Payment Required
      )
    }

    // Fetch the original prompt with specific fields
    const original = await withQueryPerformance(
      'POST /api/prompts/[id]/duplicate (fetch)',
      'select',
      'prompts',
      async () => {
        const { data, error } = await supabase
          .from('prompts')
          .select('id, title, content, description, use_case, framework, enhancement_technique, tags, variables, type, category')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()

        if (error || !data) {
          throw new ApplicationError('Prompt not found', ErrorCodes.NOT_FOUND, 404)
        }
        return data
      }
    )

    // Create duplicate with modified title
    const duplicateTitle = `${original.title} (Copy)`

    const duplicate = await withQueryPerformance(
      'POST /api/prompts/[id]/duplicate (create)',
      'insert',
      'prompts',
      async () => {
        const { data, error } = await supabase
          .from('prompts')
          .insert({
            user_id: user.id,
            title: duplicateTitle,
            content: original.content,
            description: original.description,
            use_case: original.use_case,
            framework: original.framework,
            enhancement_technique: original.enhancement_technique,
            type: original.type,
            category: original.category,
            tags: original.tags,
            variables: original.variables,
            // Reset usage stats for duplicate
            usage_count: 0,
            is_favorite: false,
            archived: false,
            last_used_at: null,
          })
          .select('id, title, content, description, tags, use_case, framework, enhancement_technique, created_at')
          .single()

        if (error) {
          logger.error('Error creating duplicate:', error)
          throw new ApplicationError(
            error.message || 'Failed to create duplicate',
            ErrorCodes.DATABASE_ERROR,
            500,
            error
          )
        }
        return data
      }
    )

    // Increment storage usage after successful duplication
    await incrementStorageUsage(user.id, planTier, 1)

    return NextResponse.json(duplicate)
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('POST /api/prompts/[id]/duplicate error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}
