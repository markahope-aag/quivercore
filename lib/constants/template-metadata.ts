/**
 * Template Metadata Constants
 * 
 * Predefined options for dropdown fields to ensure consistency
 * and enable effective filtering/searching
 */

export const INDUSTRY_OPTIONS = [
  'General Business',
  'SaaS',
  'Healthcare',
  'Education',
  'Finance',
  'Marketing',
  'Legal',
  'HR',
  'Manufacturing',
  'Retail',
  'Other',
] as const

export const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
] as const

export const USE_CASE_TAG_OPTIONS = [
  'Strategy',
  'Analysis',
  'Creative',
  'Planning',
  'Research',
  'Documentation',
  'Training',
  'Assessment',
  'Brainstorming',
  'Decision Making',
] as const

export const TEAM_USAGE_OPTIONS = [
  'Product Managers',
  'Marketing Teams',
  'Consultants',
  'Executives',
  'Engineers',
  'Designers',
  'Sales Teams',
  'HR Teams',
  'Legal Teams',
] as const

export const FRAMEWORK_OPTIONS = [
  'Role-Based',
  'Chain-of-Thought',
  'Few-Shot',
  'Analytical',
  'Generative',
  'Comparative',
  'Template-Fill',
  'Constraint-Based',
] as const

export const VS_SETTINGS_OPTIONS = [
  'Broad Spectrum recommended',
  'Rarity Hunt ideal for innovation',
  'Balanced Categories for comprehensive coverage',
  'Not applicable',
] as const

export type Industry = typeof INDUSTRY_OPTIONS[number]
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]
export type UseCaseTag = typeof USE_CASE_TAG_OPTIONS[number]
export type TeamUsage = typeof TEAM_USAGE_OPTIONS[number]
export type Framework = typeof FRAMEWORK_OPTIONS[number]
export type VSSetting = typeof VS_SETTINGS_OPTIONS[number]

