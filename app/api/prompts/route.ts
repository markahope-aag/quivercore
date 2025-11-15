import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/openai/client'
import { generateSearchableText, extractVariables } from '@/lib/utils/prompt'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { sanitizeInput, sanitizeStringArray } from '@/lib/utils/sanitize'
import { unstable_cache } from 'next/cache'

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

    let query = supabase
      .from('prompts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

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

    // Create cache key based on user and filters
    const cacheKey = `prompts:${user.id}:${favorite || ''}:${useCase || ''}:${framework || ''}:${enhancementTechnique || ''}:${tag || ''}`
    
    // Use Next.js cache for read operations (30 seconds TTL)
    const getCachedPrompts = unstable_cache(
      async () => {
        const { data, error } = await query
        if (error) {
          throw error
        }
        return data || []
      },
      [cacheKey],
      {
        revalidate: 30, // Cache for 30 seconds
        tags: [`prompts:${user.id}`], // Tag for cache invalidation
      }
    )

    try {
      const data = await getCachedPrompts()
      return NextResponse.json(data, {
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

    const body = await request.json()
    
    // Sanitize all user inputs
    const title = sanitizeInput(body.title || '', 500)
    const content = sanitizeInput(body.content || '', 50000)
    const use_case = body.use_case ? sanitizeInput(body.use_case, 200) : null
    const framework = body.framework ? sanitizeInput(body.framework, 200) : null
    const enhancement_technique = body.enhancement_technique ? sanitizeInput(body.enhancement_technique, 200) : null
    const description = body.description ? sanitizeInput(body.description, 2000) : null
    const tags = body.tags ? sanitizeStringArray(Array.isArray(body.tags) ? body.tags : body.tags.split(',').map((t: string) => t.trim()), 100) : []
    
    // Validate required fields after sanitization
    if (!title || title.length === 0) {
      throw new ApplicationError('Title is required', ErrorCodes.VALIDATION_ERROR, 400)
    }
    if (!content || content.length === 0) {
      throw new ApplicationError('Content is required', ErrorCodes.VALIDATION_ERROR, 400)
    }

    // Extract variables from content
    const variables = extractVariables(content)
    const variablesObj = variables.reduce((acc, v) => {
      acc[v] = ''
      return acc
    }, {} as Record<string, string>)

    // Generate embedding for semantic search
    const searchableText = generateSearchableText(title, content, description, tags)
    let embedding: number[] | null = null

    try {
      embedding = await generateEmbedding(searchableText)
    } catch (error) {
      logger.warn('Failed to generate embedding, continuing without it', error)
      // Continue without embedding - user can still use keyword search
    }

    // Create prompt
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .insert({
        user_id: user.id,
        title,
        content,
        use_case: use_case || null,
        framework: framework || null,
        enhancement_technique: enhancement_technique || null,
        tags: tags || [],
        description: description || null,
        variables: Object.keys(variablesObj).length > 0 ? variablesObj : null,
        embedding: embedding || null,
      })
      .select()
      .single()

    if (promptError) {
      logger.error('Supabase insert error in POST /api/prompts', promptError)
      throw new ApplicationError(
        'Failed to create prompt',
        ErrorCodes.DATABASE_ERROR,
        500,
        promptError
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

