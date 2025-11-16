/**
 * Comprehensive Template Metadata Types
 * Extended template structure with rich metadata, guidance, and social features
 */

export interface TemplateVariable {
  name: string
  description: string
  example?: string
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object'
}

export interface TemplateMetadata {
  useCaseTags: string[]
  industry: string
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedTime: string
  outputLength: string
  businessImpact: string
  teamUsage: string[]
}

export interface TemplateGuidance {
  prerequisites: string[]
  bestPractices: string[]
  commonPitfalls: string[]
  followUpPrompts: string[]
  successMetrics: string[]
}

export interface TemplateRecommendations {
  vsSettings: string
  compatibleFrameworks: string[]
  advancedEnhancements: string[]
}

export interface TemplateQuality {
  userRating: number
  usageCount: number
  author: string
  lastUpdated: Date
  exampleOutputs?: string[]
}

export interface TemplateComment {
  id: string
  userId: string
  userName: string
  content: string
  rating: number
  createdAt: Date
  updatedAt?: Date
}

export interface TemplateSocial {
  comments: TemplateComment[]
  variations: string[] // IDs of related templates
  relatedTemplates: string[] // IDs of related templates
}

export interface PromptTemplate {
  // Existing fields
  id: string
  name: string
  description: string
  content: string
  templateVariables: TemplateVariable[]
  
  // NEW METADATA FIELDS
  metadata: TemplateMetadata
  
  // USAGE GUIDANCE
  guidance: TemplateGuidance
  
  // ENHANCEMENT RECOMMENDATIONS
  recommendations: TemplateRecommendations
  
  // QUALITY INDICATORS
  quality: TemplateQuality
  
  // COLLABORATIVE FEATURES
  social: TemplateSocial
  
  // Additional fields
  promptId?: string // Link to prompts table
  userId?: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

// Database representation (matches Supabase schema)
export interface TemplateMetadataRow {
  id: string
  prompt_id: string
  user_id: string
  use_case_tags: string[]
  industry: string | null
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced' | null
  estimated_time: string | null
  output_length: string | null
  business_impact: string | null
  team_usage: string[]
  prerequisites: string[]
  best_practices: string[]
  common_pitfalls: string[]
  follow_up_prompts: string[]
  success_metrics: string[]
  vs_settings: string | null
  compatible_frameworks: string[]
  advanced_enhancements: string[]
  user_rating: number
  usage_count: number
  author: string | null
  example_outputs: string[]
  variations: string[]
  related_templates: string[]
  created_at: string
  updated_at: string
}

export interface TemplateCommentRow {
  id: string
  template_metadata_id: string
  user_id: string
  user_name: string
  content: string
  rating: number
  created_at: string
  updated_at: string
}

// Helper function to convert database row to template metadata
export function templateMetadataRowToMetadata(row: TemplateMetadataRow): {
  metadata: TemplateMetadata
  guidance: TemplateGuidance
  recommendations: TemplateRecommendations
  quality: TemplateQuality
  social: Omit<TemplateSocial, 'comments'>
} {
  return {
    metadata: {
      useCaseTags: row.use_case_tags || [],
      industry: row.industry || '',
      difficultyLevel: row.difficulty_level || 'Beginner',
      estimatedTime: row.estimated_time || '',
      outputLength: row.output_length || '',
      businessImpact: row.business_impact || '',
      teamUsage: row.team_usage || [],
    },
    guidance: {
      prerequisites: row.prerequisites || [],
      bestPractices: row.best_practices || [],
      commonPitfalls: row.common_pitfalls || [],
      followUpPrompts: row.follow_up_prompts || [],
      successMetrics: row.success_metrics || [],
    },
    recommendations: {
      vsSettings: row.vs_settings || '',
      compatibleFrameworks: row.compatible_frameworks || [],
      advancedEnhancements: row.advanced_enhancements || [],
    },
    quality: {
      userRating: Number(row.user_rating) || 0,
      usageCount: row.usage_count || 0,
      author: row.author || '',
      lastUpdated: new Date(row.updated_at),
      exampleOutputs: row.example_outputs || [],
    },
    social: {
      variations: row.variations || [],
      relatedTemplates: row.related_templates || [],
    },
  }
}

// Helper function to convert comment row to comment
export function templateCommentRowToComment(row: TemplateCommentRow): TemplateComment {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    content: row.content,
    rating: row.rating,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  }
}

