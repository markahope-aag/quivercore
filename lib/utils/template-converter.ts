/**
 * Utility functions to convert between old and new template formats
 * Helps with backward compatibility and migration
 */

import type { PromptTemplate as OldTemplate } from '@/lib/types/prompt-builder'
import type { PromptTemplate as NewTemplate } from '@/lib/types/templates'

/**
 * Convert old PromptTemplate format to new comprehensive format
 * Fills in default values for missing metadata
 */
export function convertOldTemplateToNew(oldTemplate: OldTemplate): NewTemplate {
  return {
    id: oldTemplate.id,
    name: oldTemplate.name,
    description: oldTemplate.description,
    content: oldTemplate.config.basePrompt || '',
    templateVariables: [], // Old format doesn't have this
    metadata: {
      useCaseTags: oldTemplate.tags || [],
      industry: '',
      difficultyLevel: 'Beginner',
      estimatedTime: '',
      outputLength: '',
      businessImpact: '',
      teamUsage: [],
    },
    guidance: {
      prerequisites: [],
      bestPractices: [],
      commonPitfalls: [],
      followUpPrompts: [],
      successMetrics: [],
    },
    recommendations: {
      vsSettings: oldTemplate.vsEnhancement.enabled
        ? `${oldTemplate.vsEnhancement.pattern} - ${oldTemplate.vsEnhancement.distributionType}`
        : 'Not recommended',
      compatibleFrameworks: oldTemplate.config.framework ? [oldTemplate.config.framework] : [],
      advancedEnhancements: [],
    },
    quality: {
      userRating: 0,
      usageCount: 0,
      author: '',
      lastUpdated: new Date(oldTemplate.updatedAt),
      exampleOutputs: [],
    },
    social: {
      comments: [],
      variations: [],
      relatedTemplates: [],
    },
    createdAt: oldTemplate.createdAt,
    updatedAt: oldTemplate.updatedAt,
    tags: oldTemplate.tags || [],
  }
}

/**
 * Create a default template structure with empty metadata
 */
export function createDefaultTemplate(
  name: string,
  description: string,
  content: string
): Partial<NewTemplate> {
  return {
    name,
    description,
    content,
    templateVariables: [],
    metadata: {
      useCaseTags: [],
      industry: '',
      difficultyLevel: 'Beginner',
      estimatedTime: '',
      outputLength: '',
      businessImpact: '',
      teamUsage: [],
    },
    guidance: {
      prerequisites: [],
      bestPractices: [],
      commonPitfalls: [],
      followUpPrompts: [],
      successMetrics: [],
    },
    recommendations: {
      vsSettings: '',
      compatibleFrameworks: [],
      advancedEnhancements: [],
    },
    quality: {
      userRating: 0,
      usageCount: 0,
      author: '',
      lastUpdated: new Date(),
      exampleOutputs: [],
    },
    social: {
      comments: [],
      variations: [],
      relatedTemplates: [],
    },
    tags: [],
  }
}

