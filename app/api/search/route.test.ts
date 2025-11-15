import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'
import { ApplicationError, ErrorCodes } from '@/lib/utils/error-handler'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/openai/client', () => ({
  generateEmbedding: vi.fn(() => Promise.resolve([0.1, 0.2, 0.3])),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

describe('/api/search', () => {
  const mockUser = { id: 'user-123' }
  const mockSupabase = {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          or: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
      })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
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

    const request = new NextRequest('http://localhost/api/search?q=test')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when query is missing', async () => {
    const request = new NextRequest('http://localhost/api/search')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Query parameter is required')
  })

  it('performs keyword search', async () => {
    const mockResults = [
      { id: '1', title: 'Test Prompt', content: 'Test content' },
    ]
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          or: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: mockResults, error: null })),
            })),
          })),
        })),
      })),
    }))
    
    const searchSupabase = {
      ...mockSupabase,
      from: mockFrom,
    }
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(searchSupabase as any)

    const request = new NextRequest('http://localhost/api/search?q=test&type=keyword')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(mockFrom).toHaveBeenCalledWith('prompts')
  })

  it('sanitizes query input', async () => {
    const longQuery = 'a'.repeat(1000)
    const request = new NextRequest(`http://localhost/api/search?q=${longQuery}`)
    const response = await GET(request)
    
    // Should not throw error, query should be truncated
    expect(response.status).toBe(200)
  })

  it('handles semantic search errors gracefully', async () => {
    const { generateEmbedding } = await import('@/lib/openai/client')
    vi.mocked(generateEmbedding).mockRejectedValueOnce(new Error('Embedding failed'))

    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          or: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
      })),
    }))
    
    const searchSupabase = {
      ...mockSupabase,
      from: mockFrom,
    }
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(searchSupabase as any)

    const request = new NextRequest('http://localhost/api/search?q=test&type=semantic')
    const response = await GET(request)
    
    // Should fall back to keyword search
    expect(response.status).toBe(200)
  })
})

