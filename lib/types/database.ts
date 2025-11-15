export type PromptType = 'ai_prompt' | 'email_template' | 'snippet' | 'other'

export interface Prompt {
  id: string
  user_id: string
  title: string
  content: string
  type: PromptType
  category: string | null
  tags: string[] | null
  description: string | null
  variables: Record<string, any> | null
  embedding: number[] | null
  usage_count: number
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface PromptVersion {
  id: string
  prompt_id: string
  content: string
  version_number: number
  created_at: string
}

export interface PromptTest {
  id: string
  prompt_id: string
  test_input: Record<string, any> | null
  response: string
  model: string
  created_at: string
}

