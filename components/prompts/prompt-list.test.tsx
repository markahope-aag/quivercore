import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PromptList } from './prompt-list'
import { Prompt } from '@/lib/types/database'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

const mockPrompts: Prompt[] = [
  {
    id: '1',
    user_id: 'user-123',
    title: 'Prompt 1',
    content: 'Content 1',
    description: 'Description 1',
    tags: ['tag1'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    is_favorite: false,
    use_case: null,
    framework: null,
    enhancement_technique: null,
    usage_count: 0,
    type: null,
    category: null,
    variables: null,
    embedding: null,
  },
  {
    id: '2',
    user_id: 'user-123',
    title: 'Prompt 2',
    content: 'Content 2',
    description: 'Description 2',
    tags: ['tag2'],
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    is_favorite: false,
    use_case: null,
    framework: null,
    enhancement_technique: null,
    usage_count: 0,
    type: null,
    category: null,
    variables: null,
    embedding: null,
  },
]

describe('PromptList', () => {
  it('renders empty state when no prompts', () => {
    render(<PromptList initialPrompts={[]} />)
    
    expect(screen.getByText('No prompts yet')).toBeInTheDocument()
    expect(screen.getByText(/Get started by creating your first prompt/i)).toBeInTheDocument()
  })

  it('renders prompts in grid view by default', () => {
    render(<PromptList initialPrompts={mockPrompts} viewMode="grid" />)
    
    expect(screen.getByText('Prompt 1')).toBeInTheDocument()
    expect(screen.getByText('Prompt 2')).toBeInTheDocument()
  })

  it('renders prompts in list view', () => {
    render(<PromptList initialPrompts={mockPrompts} viewMode="list" />)
    
    expect(screen.getByText('Prompt 1')).toBeInTheDocument()
    expect(screen.getByText('Prompt 2')).toBeInTheDocument()
  })

  it('updates when initialPrompts change', () => {
    const { rerender } = render(<PromptList initialPrompts={mockPrompts} />)
    
    expect(screen.getByText('Prompt 1')).toBeInTheDocument()
    
    const newPrompts = [mockPrompts[0]]
    rerender(<PromptList initialPrompts={newPrompts} />)
    
    expect(screen.getByText('Prompt 1')).toBeInTheDocument()
    expect(screen.queryByText('Prompt 2')).not.toBeInTheDocument()
  })
})

