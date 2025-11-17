import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/openai/client'
import { generateSearchableText, extractVariables } from '@/lib/utils/prompt'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { sanitizeInput, sanitizeStringArray } from '@/lib/utils/sanitize'
import { unstable_cache } from 'next/cache'
import { withQueryPerformance } from '@/lib/utils/query-performance'
import { checkUsageLimit } from '@/lib/utils/usage-checker'
import { hasAvailablePrompts, incrementPromptUsage, getOrCreateUsageTracking } from '@/lib/usage/usage-tracking'
import { getOverageRate } from '@/lib/constants/overage-pricing'
import type { PlanTier } from '@/lib/constants/billing-config'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const favorite = searchParams.get('favorite')
    const useCase = searchParams.get('use_case')
    const framework = searchParams.get('framework')
    const enhancementTechnique = searchParams.get('enhancement_technique')
    const tag = searchParams.get('tag')
    
    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = (page - 1) * limit

    // Build query with specific fields (not select *)
    let query = supabase
      .from('prompts')
      .select('id, title, content, description, tags, use_case, framework, enhancement_technique, is_favorite, usage_count, last_used_at, is_template, builder_config, created_at, updated_at, archived', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1) // Pagination

    if (favorite === 'true') {
      query = query.eq('is_favorite', true)
    }

    if (useCase) {
      query = query.eq('use_case', useCase)
    }

    if (framework) {
      query = query.eq('framework', framework)
    }

    if (enhancementTechnique) {
      query = query.eq('enhancement_technique', enhancementTechnique)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    // Create cache key based on user, filters, and pagination
    const cacheKey = `prompts:${user.id}:${favorite || ''}:${useCase || ''}:${framework || ''}:${enhancementTechnique || ''}:${tag || ''}:${page}:${limit}`
    
    // Use Next.js cache for read operations (30 seconds TTL)
    const getCachedPrompts = unstable_cache(
      async () => {
        return await withQueryPerformance(
          'GET /api/prompts',
          'select',
          'prompts',
          async () => {
            const { data, error, count } = await query
            if (error) {
              throw error
            }
            return { data: data || [], count: count || 0 }
          }
        )
      },
      [cacheKey],
      {
        revalidate: 30, // Cache for 30 seconds
        tags: [`prompts:${user.id}`], // Tag for cache invalidation
      }
    )

    try {
      const { data, count } = await getCachedPrompts()
      const totalPages = Math.ceil((count || 0) / limit)
      
      return NextResponse.json({
        data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      }, {
        headers: {
          'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
        },
      })
    } catch (error) {
      logger.error('Supabase query error in GET /api/prompts', error)
      throw new ApplicationError(
        'Failed to fetch prompts',
        ErrorCodes.DATABASE_ERROR,
        500,
        error
      )
    }
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('GET /api/prompts error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    // Get user's subscription to determine plan tier
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan_id, subscription_plans(name)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    // Default to explorer if no active subscription (free tier)
    const planData = subscription?.subscription_plans
    const plan = Array.isArray(planData) ? planData[0] : planData
    const planTier: PlanTier = (plan?.name?.toLowerCase() as PlanTier) || 'explorer'

    // CHECK PROMPT USAGE LIMIT BEFORE CREATING
    const { remaining, wouldBeOverage } = await hasAvailablePrompts(user.id, planTier, 1)

    // Show modal on FIRST overage to inform user
    const usage = await getOrCreateUsageTracking(user.id, planTier)
    const isFirstOverage = usage && usage.promptsUsed === usage.promptsLimit

    if (isFirstOverage) {
      const overageRate = getOverageRate(planTier)

      return NextResponse.json(
        {
          error: 'Monthly prompt limit reached',
          code: 'PROMPT_LIMIT_REACHED',
          limit: usage.promptsLimit,
          current: usage.promptsUsed,
          planTier,
          overageOptions: {
            overageRate,
            overageAmount: overageRate,
            promptCount: 1,
          },
          upgradeOptions: {
            nextTier: planTier === 'explorer' ? 'researcher' : planTier === 'researcher' ? 'strategist' : null,
            nextTierLimit: planTier === 'explorer' ? 150 : planTier === 'researcher' ? 500 : null,
          },
        },
        { status: 402 } // 402 Payment Required
      )
    }

    // After first overage, allow continued creation (will be billed at month's end)

    // CHECK STORAGE LIMIT BEFORE CREATING
    const storageCheck = await checkUsageLimit({
      userId: user.id,
      feature: 'storage',
    })

    if (!storageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Storage limit reached',
          code: 'STORAGE_LIMIT_REACHED',
          limit: storageCheck.limit,
          current: storageCheck.current,
          upgradeOptions: {
            nextTier: storageCheck.nextTier,
            nextTierLimit: storageCheck.nextTierLimit,
            addOnAvailable: storageCheck.addOnsAvailable,
            addOnPrice: storageCheck.addOnPrice,
            addOnSize: storageCheck.addOnSize,
          },
        },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Sanitize all user inputs
    const title = sanitizeInput(body.title || '', 500)
    const content = sanitizeInput(body.content || '', 50000)
    const use_case = body.use_case ? sanitizeInput(body.use_case, 200) : null
    const framework = body.framework ? sanitizeInput(body.framework, 200) : null
    const enhancement_technique = body.enhancement_technique ? sanitizeInput(body.enhancement_technique, 200) : null
    const description = body.description ? sanitizeInput(body.description, 2000) : null
    const tags = body.tags ? sanitizeStringArray(Array.isArray(body.tags) ? body.tags : body.tags.split(',').map((t: string) => t.trim()), 100) : []
    const is_template = body.is_template === true
    const builder_config = body.builder_config || null
    
    // Validate required fields after sanitization
    if (!title || title.length === 0) {
      throw new ApplicationError('Title is required', ErrorCodes.VALIDATION_ERROR, 400)
    }
    if (!content || content.length === 0) {
      throw new ApplicationError('Content is required', ErrorCodes.VALIDATION_ERROR, 400)
    }

    // Use provided variables or extract from content
    let variablesObj: Record<string, string> | null = null
    if (body.variables && typeof body.variables === 'object') {
      // Use provided variables (with default/example values)
      variablesObj = body.variables as Record<string, string>
    } else {
      // Extract variables from content and create empty object
      const variables = extractVariables(content)
      variablesObj = variables.reduce((acc, v) => {
        acc[v] = ''
        return acc
      }, {} as Record<string, string>)
      // Only set if there are variables
      if (Object.keys(variablesObj).length === 0) {
        variablesObj = null
      }
    }

    // Generate embedding for semantic search
    const searchableText = generateSearchableText(title, content, description, tags)
    let embedding: number[] | null = null

    try {
      embedding = await generateEmbedding(searchableText)
    } catch (error) {
      logger.warn('Failed to generate embedding, continuing without it', error)
      // Continue without embedding - user can still use keyword search
    }

    // Create prompt with performance monitoring
    const prompt = await withQueryPerformance(
      'POST /api/prompts',
      'insert',
      'prompts',
      async () => {
        const { data, error } = await supabase
          .from('prompts')
          .insert({
            user_id: user.id,
            title,
            content,
            is_template,
            builder_config,
            use_case: use_case || null,
            framework: framework || null,
            enhancement_technique: enhancement_technique || null,
            tags: tags || [],
            description: description || null,
            variables: variablesObj,
            embedding: embedding || null,
          })
          .select('id, title, content, description, tags, use_case, framework, enhancement_technique, variables, is_template, builder_config, created_at, updated_at')
          .single()
        
        if (error) {
          logger.error('Supabase insert error in POST /api/prompts', error)
          throw new ApplicationError(
            'Failed to create prompt',
            ErrorCodes.DATABASE_ERROR,
            500,
            error
          )
        }
        
        return data
      }
    )

    if (!prompt) {
      throw new ApplicationError(
        'Failed to create prompt',
        ErrorCodes.DATABASE_ERROR,
        500
      )
    }

    // Create initial version
    const { error: versionError } = await supabase.from('prompt_versions').insert({
      prompt_id: prompt.id,
      content,
      version_number: 1,
    })

    if (versionError) {
      logger.warn('Failed to create initial version', versionError)
      // Don't fail the request if version creation fails
    }

    // INCREMENT PROMPT USAGE COUNT
    const { success, isOverage, currentUsage } = await incrementPromptUsage(user.id, planTier, 1)

    if (!success) {
      logger.warn('Failed to increment prompt usage', { userId: user.id, planTier })
      // Don't fail the request if usage tracking fails
    }

    logger.debug('Prompt created and usage incremented', {
      userId: user.id,
      promptId: prompt.id,
      planTier,
      currentUsage,
      isOverage,
    })

    // Invalidate cache after creating new prompt
    // Note: In Next.js 13+, we'd use revalidateTag, but for now we rely on TTL

    return NextResponse.json(prompt, {
      status: 201,
      headers: {
        'Cache-Control': 'no-store', // Don't cache write operations
      },
    })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('POST /api/prompts error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

