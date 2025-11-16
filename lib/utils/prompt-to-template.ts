/**
 * Utility to convert Prompt to PromptTemplate format for metadata form
 */

import type { Prompt } from '@/lib/types/database'
import type { PromptTemplate } from '@/lib/types/templates'

export function promptToTemplate(prompt: Prompt, metadata?: any): PromptTemplate {
  // Convert variables to template variables format
  const templateVariables = prompt.variables
    ? Object.entries(prompt.variables).map(([name, value]) => ({
        name,
        description: typeof value === 'string' ? value : '',
        example: typeof value === 'string' ? value : undefined,
        required: false,
        type: 'string' as const,
      }))
    : []

  // Default metadata structure
  const defaultMetadata = {
    useCaseTags: [],
    industry: '',
    difficultyLevel: 'Beginner' as const,
    estimatedTime: '',
    outputLength: '',
    businessImpact: '',
    teamUsage: [],
  }

  const defaultGuidance = {
    prerequisites: [],
    bestPractices: [],
    commonPitfalls: [],
    followUpPrompts: [],
    successMetrics: [],
  }

  const defaultRecommendations = {
    vsSettings: '',
    compatibleFrameworks: [],
    advancedEnhancements: [],
  }

  const defaultQuality = {
    userRating: 0,
    usageCount: prompt.usage_count || 0,
    author: '',
    lastUpdated: new Date(prompt.updated_at),
    exampleOutputs: [],
  }

  const defaultSocial = {
    comments: [],
    variations: [],
    relatedTemplates: [],
  }

  // Merge with existing metadata if available
  return {
    id: prompt.id,
    name: prompt.title,
    description: prompt.description || '',
    content: prompt.content,
    templateVariables,
    metadata: metadata?.metadata || defaultMetadata,
    guidance: metadata?.guidance || defaultGuidance,
    recommendations: metadata?.recommendations || defaultRecommendations,
    quality: metadata?.quality || defaultQuality,
    social: metadata?.social || defaultSocial,
    promptId: prompt.id,
    userId: prompt.user_id,
    createdAt: prompt.created_at,
    updatedAt: prompt.updated_at,
    tags: prompt.tags || [],
  }
}

