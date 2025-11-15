import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from './route'
import { ApplicationError, ErrorCodes } from '@/lib/utils/error-handler'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/openai/client', () => ({
  generateEmbedding: vi.fn(() => Promise.resolve([0.1, 0.2, 0.3])),
}))

vi.mock('@/lib/utils/prompt', () => ({
  generateSearchableText: vi.fn((title, content) => `${title} ${content}`),
  extractVariables: vi.fn(() => []),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn) => fn),
}))

describe('/api/prompts', () => {
  const mockUser = { id: 'user-123' }
  const mockSupabase = {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            contains: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  describe('GET', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } })

      const request = new NextRequest('http://localhost/api/prompts')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns prompts for authenticated user', async () => {
      const mockPrompts = [
        { id: '1', title: 'Test Prompt', user_id: 'user-123' },
        { id: '2', title: 'Another Prompt', user_id: 'user-123' },
      ]

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockPrompts, error: null })),
          })),
        })),
      })) as any

      const request = new NextRequest('http://localhost/api/prompts')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })

    it('applies favorite filter when provided', async () => {
      const eqCalls: Array<[string, unknown]> = []
      const queryBuilder = {
        eq: vi.fn((key: string, value: unknown) => {
          eqCalls.push([key, value])
          return queryBuilder
        }),
        order: vi.fn(() => queryBuilder),
        range: vi.fn(() => queryBuilder),
      }

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => queryBuilder),
      })) as any

      // Mock unstable_cache to execute the function directly
      const { unstable_cache } = await import('next/cache')
      vi.mocked(unstable_cache).mockImplementation((fn) => {
        return async () => {
          return await fn()
        }
      })

      const request = new NextRequest('http://localhost/api/prompts?favorite=true')
      await GET(request)

      // Check that is_favorite was called with true
      const favoriteCall = eqCalls.find(call => call[0] === 'is_favorite')
      expect(favoriteCall).toBeDefined()
      expect(favoriteCall?.[1]).toBe(true)
    })
  })

  describe('POST', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } })

      const request = new NextRequest('http://localhost/api/prompts', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test', content: 'Content' }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 400 when title is missing', async () => {
      const request = new NextRequest('http://localhost/api/prompts', {
        method: 'POST',
        body: JSON.stringify({ content: 'Content only' }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Title is required')
    })

    it('returns 400 when content is missing', async () => {
      const request = new NextRequest('http://localhost/api/prompts', {
        method: 'POST',
        body: JSON.stringify({ title: 'Title only' }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Content is required')
    })

    it('creates prompt successfully', async () => {
      const mockPrompt = {
        id: 'new-prompt',
        title: 'New Prompt',
        content: 'Content',
        user_id: 'user-123',
      }

      mockSupabase.from = vi.fn((table) => {
        if (table === 'prompts') {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockPrompt, error: null })),
              })),
            })),
          }
        }
        return {
          insert: vi.fn(() => Promise.resolve({ error: null })),
        }
      }) as any

      const request = new NextRequest('http://localhost/api/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Prompt',
          content: 'Content',
        }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBe('new-prompt')
    })
  })
})

