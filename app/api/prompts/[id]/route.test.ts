import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, PATCH, DELETE } from './route'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn, keys, options) => {
    // Return the function directly, but wrapped to handle errors
    return async (...args: any[]) => {
      try {
        return await fn(...args)
      } catch (error) {
        throw error
      }
    }
  }),
}))

describe('/api/prompts/[id]', () => {
  const mockUser = { id: 'user-123' }
  const mockPrompt = {
    id: 'prompt-123',
    title: 'Test Prompt',
    content: 'Test Content',
    user_id: 'user-123',
  }

  const mockSupabase = {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockPrompt, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockPrompt, error: null })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
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

      const request = new NextRequest('http://localhost/api/prompts/prompt-123')
      const response = await GET(request, { params: Promise.resolve({ id: 'prompt-123' }) })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 400 when ID is invalid', async () => {
      const request = new NextRequest('http://localhost/api/prompts/')
      const response = await GET(request, { params: Promise.resolve({ id: '' }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid prompt ID')
    })

    it('returns prompt when found', async () => {
      // Reset the mock to ensure fresh state
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockPrompt, error: null })),
          })),
        })),
      })) as any

      const request = new NextRequest('http://localhost/api/prompts/prompt-123')
      const response = await GET(request, { params: Promise.resolve({ id: 'prompt-123' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe('prompt-123')
      expect(data.title).toBe('Test Prompt')
    })

    it('returns 404 when prompt not found', async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' },
              })
            ),
          })),
        })),
      })) as any

      const request = new NextRequest('http://localhost/api/prompts/nonexistent')
      const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('Prompt not found')
    })
  })

  describe('PATCH', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } })

      const request = new NextRequest('http://localhost/api/prompts/prompt-123', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      })
      const response = await PATCH(request, { params: Promise.resolve({ id: 'prompt-123' }) })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('updates prompt successfully', async () => {
      const updatedPrompt = { ...mockPrompt, title: 'Updated Title' }
      
      // Mock sanitizeInput to return the input as-is
      vi.doMock('@/lib/utils/sanitize', () => ({
        sanitizeInput: vi.fn((input: string) => input),
        sanitizeStringArray: vi.fn((arr: string[]) => arr),
      }))
      
      mockSupabase.from = vi.fn((table) => {
        if (table === 'prompts') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: { ...mockPrompt, content: 'Test Content' }, error: null })),
              })),
            })),
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(() => Promise.resolve({ data: updatedPrompt, error: null })),
                })),
              })),
            })),
          }
        }
        if (table === 'prompt_versions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
                })),
              })),
            })),
            insert: vi.fn(() => Promise.resolve({ error: null })),
          }
        }
        return {}
      }) as any

      const request = new NextRequest('http://localhost/api/prompts/prompt-123', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated Title' }),
      })
      const response = await PATCH(request, { params: Promise.resolve({ id: 'prompt-123' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.title).toBe('Updated Title')
    })
  })

  describe('DELETE', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } })

      const request = new NextRequest('http://localhost/api/prompts/prompt-123', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'prompt-123' }) })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('deletes prompt successfully', async () => {
      // Ensure the delete mock is properly set up
      mockSupabase.from = vi.fn(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      })) as any

      const request = new NextRequest('http://localhost/api/prompts/prompt-123', {
        method: 'DELETE',
      })
      const response = await DELETE(request, { params: Promise.resolve({ id: 'prompt-123' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})

