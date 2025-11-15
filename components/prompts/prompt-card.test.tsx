import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PromptCard } from './prompt-card'
import { Prompt } from '@/lib/types/database'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock fetch
global.fetch = vi.fn()

const mockPrompt: Prompt = {
  id: 'test-id',
  user_id: 'user-123',
  title: 'Test Prompt',
  content: 'Test content',
  description: 'Test description',
  tags: ['tag1', 'tag2'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_favorite: false,
  use_case: 'Writing & Content',
  framework: 'Role-Based',
  enhancement_technique: 'Chain-of-Thought',
  usage_count: 0,
  type: null,
  category: null,
  variables: null,
  embedding: null,
}

describe('PromptCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders prompt title and description', () => {
    render(<PromptCard prompt={mockPrompt} />)
    
    expect(screen.getByText('Test Prompt')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders tags when present', () => {
    render(<PromptCard prompt={mockPrompt} />)
    
    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
  })

  it('handles missing description gracefully', () => {
    const promptWithoutDesc = { ...mockPrompt, description: null }
    render(<PromptCard prompt={promptWithoutDesc} />)
    
    expect(screen.getByText('Test Prompt')).toBeInTheDocument()
    expect(screen.getByText('No description')).toBeInTheDocument()
  })

  it('handles missing tags gracefully', () => {
    const promptWithoutTags = { ...mockPrompt, tags: null }
    render(<PromptCard prompt={promptWithoutTags} />)
    
    expect(screen.getByText('Test Prompt')).toBeInTheDocument()
  })

  it('toggles favorite status', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })
    global.fetch = mockFetch
    global.confirm = vi.fn(() => true)

    render(<PromptCard prompt={mockPrompt} />)
    
    // Find the favorite button by finding the Star icon's parent button
    const buttons = screen.getAllByRole('button')
    const favoriteButton = buttons.find(btn => btn.querySelector('svg'))
    expect(favoriteButton).toBeInTheDocument()
    
    if (favoriteButton) {
      fireEvent.click(favoriteButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/prompts/test-id'),
          expect.objectContaining({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
          })
        )
      })
    }
  })

  it('handles delete action', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })
    global.fetch = mockFetch
    global.confirm = vi.fn(() => true)

    render(<PromptCard prompt={mockPrompt} />)
    
    // Find the dropdown menu trigger (three dots button)
    const menuButton = screen.getByText('⋮').closest('button')
    expect(menuButton).toBeInTheDocument()
    
    if (menuButton) {
      fireEvent.click(menuButton)
      
      // Wait for menu to open and find delete option
      await waitFor(() => {
        const deleteOption = screen.getByText(/delete/i)
        if (deleteOption) {
          fireEvent.click(deleteOption)
        }
      })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/prompts/test-id'),
          expect.objectContaining({
            method: 'DELETE',
          })
        )
      })
    }
  })

  it('displays favorite icon when prompt is favorited', () => {
    const favoritedPrompt = { ...mockPrompt, is_favorite: true }
    render(<PromptCard prompt={favoritedPrompt} />)
    
    // Check that the star icon exists (favorited prompts have filled star)
    const starIcon = document.querySelector('svg.lucide-star')
    expect(starIcon).toBeInTheDocument()
  })
})

