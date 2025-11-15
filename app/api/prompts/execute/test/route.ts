import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

/**
 * Test endpoint to verify Anthropic API connection
 * This is a diagnostic route to check if the API key is configured correctly
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          configured: false,
          error: 'ANTHROPIC_API_KEY not found in environment variables',
        },
        { status: 200 }
      )
    }

    // Test connection with a minimal request
    try {
      const anthropic = new Anthropic({
        apiKey: apiKey,
      })

      // Make a very small test request
      const message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307', // Using haiku for faster/cheaper test
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Say "OK"',
          },
        ],
      })

      return NextResponse.json({
        configured: true,
        connected: true,
        testResponse: message.content[0]?.type === 'text' ? message.content[0].text : 'No text response',
        model: message.model,
        apiKeyLength: apiKey.length,
        apiKeyPrefix: apiKey.substring(0, 10) + '...', // Show first 10 chars for verification
      })
    } catch (error: unknown) {
      if (error instanceof Anthropic.APIError) {
        return NextResponse.json(
          {
            configured: true,
            connected: false,
            error: error.message,
            status: error.status,
            apiKeyLength: apiKey.length,
            apiKeyPrefix: apiKey.substring(0, 10) + '...',
          },
          { status: 200 }
        )
      }
      throw error
    }
  } catch (error: unknown) {
    return NextResponse.json(
      {
        configured: false,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

