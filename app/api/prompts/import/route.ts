import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PromptSource } from '@/lib/types/database'

interface ImportPromptData {
  title: string
  content: string
  description?: string
  use_case?: string
  framework?: string
  enhancement_technique?: string
  tags?: string[]
  variables?: Record<string, string>
}

interface ImportRequest {
  prompts: ImportPromptData[]
  source?: PromptSource
  is_template?: boolean
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server configuration error. Missing Supabase credentials.' },
        { status: 500 }
      )
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    })

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in and try again.' },
        { status: 401 }
      )
    }

    const body: ImportRequest = await request.json()
    const { prompts, source = 'third-party', is_template = false } = body

    // Validate input
    if (!prompts) {
      return NextResponse.json(
        { error: 'Missing required field: "prompts". The request body must include a prompts array.' },
        { status: 400 }
      )
    }

    if (!Array.isArray(prompts)) {
      return NextResponse.json(
        { error: `Invalid data type: "prompts" must be an array, not ${typeof prompts}` },
        { status: 400 }
      )
    }

    if (prompts.length === 0) {
      return NextResponse.json(
        { error: 'Empty prompts array. Please provide at least one prompt to import.' },
        { status: 400 }
      )
    }

    if (prompts.length > 100) {
      return NextResponse.json(
        { error: `Too many prompts: ${prompts.length}. Maximum allowed is 100 per import. Please split into multiple imports.` },
        { status: 400 }
      )
    }

    // Detailed validation for each prompt
    const validationErrors: string[] = []
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i]
      const itemLabel = `Item #${i + 1}${prompt.title ? ` ("${prompt.title}")` : ''}`

      if (!prompt.title && !prompt.content) {
        validationErrors.push(`${itemLabel}: Missing both "title" and "content" fields`)
        continue
      }

      if (!prompt.title) {
        validationErrors.push(`${itemLabel}: Missing required field "title"`)
      }

      if (!prompt.content) {
        validationErrors.push(`${itemLabel}: Missing required field "content"`)
      }

      if (prompt.title && typeof prompt.title !== 'string') {
        validationErrors.push(`${itemLabel}: "title" must be a string, not ${typeof prompt.title}`)
      }

      if (prompt.content && typeof prompt.content !== 'string') {
        validationErrors.push(`${itemLabel}: "content" must be a string, not ${typeof prompt.content}`)
      }

      if (prompt.title && prompt.title.length > 500) {
        validationErrors.push(`${itemLabel}: Title is too long (${prompt.title.length} characters). Maximum is 500.`)
      }

      if (prompt.content && prompt.content.length > 50000) {
        validationErrors.push(`${itemLabel}: Content is too long (${prompt.content.length} characters). Maximum is 50,000.`)
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationErrors.slice(0, 10),
          totalErrors: validationErrors.length,
          message:
            validationErrors.length > 10
              ? `Showing first 10 of ${validationErrors.length} validation errors. Please fix these issues and try again.`
              : 'Please fix these issues and try again.',
        },
        { status: 400 }
      )
    }

    // Prepare prompts for insertion
    const promptsToInsert = prompts.map((prompt) => ({
      user_id: user.id,
      title: prompt.title.substring(0, 500), // Truncate if needed
      content: prompt.content.substring(0, 50000), // Truncate if needed
      description: prompt.description?.substring(0, 1000) || null,
      use_case: prompt.use_case?.substring(0, 100) || null,
      framework: prompt.framework?.substring(0, 100) || null,
      enhancement_technique: prompt.enhancement_technique?.substring(0, 200) || null,
      tags: Array.isArray(prompt.tags) ? prompt.tags.slice(0, 20) : null,
      variables: prompt.variables || null,
      source,
      is_template: is_template || (prompt.variables && Object.keys(prompt.variables).length > 0) || false,
      builder_config: null,
      usage_count: 0,
      is_favorite: false,
      archived: false,
      last_used_at: null,
    }))

    // Insert all prompts in a single query
    const { data, error } = await supabase.from('prompts').insert(promptsToInsert).select()

    if (error) {
      console.error('Database error:', error)

      // Provide more specific database error messages
      if (error.code === '23505') {
        // Unique constraint violation
        return NextResponse.json(
          { error: 'Duplicate entry detected. One or more prompts may already exist in your library.' },
          { status: 409 }
        )
      }

      if (error.code === '23503') {
        // Foreign key violation
        return NextResponse.json(
          { error: 'Database reference error. Please contact support.' },
          { status: 500 }
        )
      }

      if (error.message.includes('permission')) {
        return NextResponse.json(
          { error: 'Permission denied. Please check your account permissions.' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        {
          error: 'Database error while importing prompts',
          details: error.message,
          hint: error.hint || 'Please try again or contact support if the issue persists.',
        },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Import succeeded but no data was returned. Please refresh the page.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imported: data.length,
      prompts: data,
      message: `Successfully imported ${data.length} ${is_template ? 'template' : 'prompt'}${data.length !== 1 ? 's' : ''}`,
    })
  } catch (error) {
    console.error('Import error:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body. Please check your data format.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'An unexpected error occurred during import. Please try again.',
      },
      { status: 500 }
    )
  }
}
