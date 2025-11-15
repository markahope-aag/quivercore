import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/utils/api-client', () => ({
  executePrompt: vi.fn(),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

vi.mock('@/lib/utils/sanitize', () => ({
  sanitizeInput: vi.fn((input: string) => input),
}))

describe('/api/prompts/execute', () => {
  const mockUser = { id: 'user-123' }
  const mockSupabase = {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser } })),
    },
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = 'test-api-key'
    
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    
    const { executePrompt } = await import('@/lib/utils/api-client')
    vi.mocked(executePrompt).mockResolvedValue({
      response: 'Test response',
      model: 'claude-3-sonnet-20240229',
      tokensUsed: { input: 10, output: 20 },
    })
  })

  it('returns 401 when user is not authenticated', async () => {
    const unauthenticatedSupabase = {
      ...mockSupabase,
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: null } })),
      },
    }
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(unauthenticatedSupabase as any)

    const request = new NextRequest('http://localhost/api/prompts/execute', {
      method: 'POST',
      body: JSON.stringify({
        promptText: 'Test prompt',
        systemPrompt: 'Test system',
      }),
    })
    
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when promptText is missing', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest('http://localhost/api/prompts/execute', {
      method: 'POST',
      body: JSON.stringify({
        systemPrompt: 'Test system',
      }),
    })
    
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Prompt text is required')
  })

  it('returns 500 when API key is not configured', async () => {
    const originalKey = process.env.ANTHROPIC_API_KEY
    delete process.env.ANTHROPIC_API_KEY
    
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new NextRequest('http://localhost/api/prompts/execute', {
      method: 'POST',
      body: JSON.stringify({
        promptText: 'Test prompt',
        systemPrompt: 'Test system',
      }),
    })
    
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('API key')
    
    // Restore for other tests
    if (originalKey) {
      process.env.ANTHROPIC_API_KEY = originalKey
    } else {
      process.env.ANTHROPIC_API_KEY = 'test-api-key'
    }
  })

  it('sanitizes input to prevent injection', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    
    const { sanitizeInput } = await import('@/lib/utils/sanitize')
    vi.mocked(sanitizeInput).mockImplementation((input: string, maxLength: number) => {
      return input.slice(0, maxLength)
    })

    const maliciousInput = '<script>alert("xss")</script>'.repeat(1000)
    const request = new NextRequest('http://localhost/api/prompts/execute', {
      method: 'POST',
      body: JSON.stringify({
        promptText: maliciousInput,
        systemPrompt: 'Test system',
      }),
    })
    
    const response = await POST(request)
    
    // Should sanitize and truncate, not throw error
    expect(response.status).toBe(200)
    expect(sanitizeInput).toHaveBeenCalled()
  })
})

