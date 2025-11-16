import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/openai/client'
import { generateSearchableText, extractVariables } from '@/lib/utils/prompt'
import { handleError, ErrorCodes, ApplicationError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { sanitizeInput, sanitizeStringArray } from '@/lib/utils/sanitize'
import { unstable_cache } from 'next/cache'
import { withQueryPerformance } from '@/lib/utils/query-performance'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const { id } = await params

    // Validate ID format
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ApplicationError('Invalid prompt ID', ErrorCodes.VALIDATION_ERROR, 400)
    }

    // Create cache key based on user and prompt ID
    const cacheKey = `prompt:${user.id}:${id.trim()}`
    
    // Use Next.js cache for read operations (60 seconds TTL for individual prompts)
    const getCachedPrompt = unstable_cache(
      async () => {
        const { data, error } = await supabase
          .from('prompts')
          .select('id, title, content, description, tags, created_at, updated_at, is_favorite, use_case, framework, enhancement_technique')
          .eq('id', id.trim())
          .eq('user_id', user.id)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            throw new ApplicationError('Prompt not found', ErrorCodes.NOT_FOUND, 404)
          }
          throw error
        }

        if (!data) {
          throw new ApplicationError('Prompt not found', ErrorCodes.NOT_FOUND, 404)
        }

        return data
      },
      [cacheKey],
      {
        revalidate: 60, // Cache for 60 seconds
        tags: [`prompt:${user.id}:${id.trim()}`, `prompts:${user.id}`], // Tags for cache invalidation
      }
    )

    try {
      const data = await getCachedPrompt()
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
        },
      })
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error
      }
      logger.error('Supabase query error in GET /api/prompts/[id]', error)
      throw new ApplicationError(
        'Failed to fetch prompt',
        ErrorCodes.DATABASE_ERROR,
        500,
        error
      )
    }
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('GET /api/prompts/[id] error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const { id } = await params

    // Validate ID format
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ApplicationError('Invalid prompt ID', ErrorCodes.VALIDATION_ERROR, 400)
    }

    const body = await request.json()
    
    // Sanitize all user inputs
    const title = body.title !== undefined ? sanitizeInput(body.title, 500) : undefined
    const content = body.content !== undefined ? sanitizeInput(body.content, 50000) : undefined
    const use_case = body.use_case !== undefined ? (body.use_case ? sanitizeInput(body.use_case, 200) : null) : undefined
    const framework = body.framework !== undefined ? (body.framework ? sanitizeInput(body.framework, 200) : null) : undefined
    const enhancement_technique = body.enhancement_technique !== undefined ? (body.enhancement_technique ? sanitizeInput(body.enhancement_technique, 200) : null) : undefined
    const description = body.description !== undefined ? (body.description ? sanitizeInput(body.description, 2000) : null) : undefined
    const tags = body.tags !== undefined ? (body.tags ? sanitizeStringArray(Array.isArray(body.tags) ? body.tags : body.tags.split(',').map((t: string) => t.trim()), 100) : []) : undefined
    const is_favorite = body.is_favorite !== undefined ? Boolean(body.is_favorite) : undefined

    // Get current prompt to save version
    const { data: currentPrompt } = await supabase
      .from('prompts')
      .select('content, title, description, tags')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    // Get latest version number
    const { data: versions } = await supabase
      .from('prompt_versions')
      .select('version_number')
      .eq('prompt_id', id)
      .order('version_number', { ascending: false })
      .limit(1)

    const nextVersion = versions && versions.length > 0 
      ? versions[0].version_number + 1 
      : 1

    // Save previous version if content changed
    if (currentPrompt && content && content !== currentPrompt.content) {
      await supabase.from('prompt_versions').insert({
        prompt_id: id,
        content: currentPrompt.content,
        version_number: nextVersion - 1,
      })
    }

    // Extract variables from content
    const variables = extractVariables(content || currentPrompt?.content || '')
    const variablesObj = variables.reduce((acc, v) => {
      acc[v] = ''
      return acc
    }, {} as Record<string, string>)

    // Generate new embedding if content changed
    let embedding: number[] | null = null
    if (content || title || description || tags) {
      const searchableText = generateSearchableText(
        title || currentPrompt?.title || '',
        content || currentPrompt?.content || '',
        description,
        tags
      )
      try {
        embedding = await generateEmbedding(searchableText)
      } catch (error) {
        logger.warn('Failed to generate embedding, continuing without it', error)
      }
    }

    // Update prompt
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (use_case !== undefined) updateData.use_case = use_case
    if (framework !== undefined) updateData.framework = framework
    if (enhancement_technique !== undefined) updateData.enhancement_technique = enhancement_technique
    if (tags !== undefined) updateData.tags = tags
    if (description !== undefined) updateData.description = description
    if (is_favorite !== undefined) updateData.is_favorite = is_favorite
    if (embedding) updateData.embedding = embedding
    if (Object.keys(variablesObj).length > 0) {
      updateData.variables = variablesObj
    } else if (variables.length === 0) {
      updateData.variables = null
    }

    const data = await withQueryPerformance(
      'PATCH /api/prompts/[id]',
      'update',
      'prompts',
      async () => {
        const { data, error } = await supabase
          .from('prompts')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', user.id)
          .select('id, title, content, description, tags, use_case, framework, enhancement_technique, is_favorite, variables, created_at, updated_at')
          .single()

        if (error) {
          logger.error('Supabase update error in PATCH /api/prompts/[id]', error)
          throw new ApplicationError(
            'Failed to update prompt',
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

    // Invalidate cache after updating prompt
    // Note: In Next.js 13+, we'd use revalidateTag here
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store', // Don't cache write operations
      },
    })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('PATCH /api/prompts/[id] error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new ApplicationError('Unauthorized', ErrorCodes.UNAUTHORIZED, 401)
    }

    const { id } = await params

    // Validate ID format
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ApplicationError('Invalid prompt ID', ErrorCodes.VALIDATION_ERROR, 400)
    }

    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id.trim())
      .eq('user_id', user.id)

    if (error) {
      logger.error('Supabase delete error in DELETE /api/prompts/[id]', error)
      throw new ApplicationError(
        'Failed to delete prompt',
        ErrorCodes.DATABASE_ERROR,
        500,
        error
      )
    }

    // Invalidate cache after deleting prompt
    
    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store', // Don't cache write operations
      },
    })
  } catch (error: unknown) {
    const appError = handleError(error)
    logger.error('DELETE /api/prompts/[id] error', appError)
    return NextResponse.json(
      { error: appError.message, code: appError.code },
      { status: appError.statusCode || 500 }
    )
  }
}

