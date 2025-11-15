import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PromptFilters } from './prompt-filters'
import { Prompt } from '@/lib/types/database'

// Mock next/navigation
const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}))

const mockPrompts: Prompt[] = [
  {
    id: '1',
    user_id: 'user-123',
    title: 'Prompt 1',
    content: 'Content 1',
    description: 'Description 1',
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
  },
]

describe('PromptFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.delete('use_case')
    mockSearchParams.delete('framework')
    mockSearchParams.delete('enhancement_technique')
    mockSearchParams.delete('tag')
    mockSearchParams.delete('q')
    mockSearchParams.delete('favorite')
    mockSearchParams.delete('view')
  })

  it('renders search input', () => {
    render(<PromptFilters prompts={mockPrompts} />)
    
    const searchInput = screen.getByPlaceholderText(/search prompts/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('renders filter dropdowns', () => {
    render(<PromptFilters prompts={mockPrompts} />)
    
    expect(screen.getByText(/all use cases/i)).toBeInTheDocument()
    expect(screen.getByText(/all frameworks/i)).toBeInTheDocument()
    expect(screen.getByText(/all techniques/i)).toBeInTheDocument()
  })

  it('updates URL when search is submitted', async () => {
    render(<PromptFilters prompts={mockPrompts} />)
    
    const searchInput = screen.getByPlaceholderText(/search prompts/i)
    fireEvent.change(searchInput, { target: { value: 'test query' } })
    fireEvent.submit(searchInput.closest('form')!)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('q=test+query')
      )
    })
  })

  it('clears filters when clear button is clicked', async () => {
    mockSearchParams.set('use_case', 'Writing & Content')
    mockSearchParams.set('q', 'test')
    
    render(<PromptFilters prompts={mockPrompts} />)
    
    const clearButton = screen.getByText(/clear filters/i)
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/prompts')
    })
  })

  it('toggles view mode', async () => {
    render(<PromptFilters prompts={mockPrompts} />)
    
    const listViewButton = screen.getByTitle(/list view/i)
    fireEvent.click(listViewButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('view=list')
      )
    })
  })

  it('displays active filter badges', () => {
    mockSearchParams.set('use_case', 'Writing & Content')
    mockSearchParams.set('tag', 'tag1')
    
    render(<PromptFilters prompts={mockPrompts} />)
    
    expect(screen.getByText(/use case: writing & content/i)).toBeInTheDocument()
    expect(screen.getByText(/tag: tag1/i)).toBeInTheDocument()
  })
})

