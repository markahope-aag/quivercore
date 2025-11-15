/**
 * Type definitions for advanced prompt enhancements
 * 
 * These types define the structure for various enhancement techniques
 * that can be applied to AI prompts to improve their quality and effectiveness.
 * 
 * @module lib/types/enhancements
 */

export interface AdvancedEnhancements {
  roleEnhancement?: RoleEnhancement
  formatControl?: FormatControl
  smartConstraints?: SmartConstraints
  reasoningScaffolds?: ReasoningScaffolds
  conversationFlow?: ConversationFlow
}

export interface RoleEnhancement {
  enabled: boolean
  expertiseLevel: 'novice' | 'intermediate' | 'expert' | 'world-class'
  domainSpecialty: string
  experienceYears?: number
  contextSetting?: string
  authorityLevel: 'advisory' | 'authoritative' | 'definitive'
}

export interface FormatControl {
  enabled: boolean
  structure: 'bullet-points' | 'numbered-list' | 'paragraphs' | 'json' | 'table' | 'custom'
  lengthSpec: {
    type: 'word-count' | 'sentence-count' | 'paragraph-count'
    min?: number
    max?: number
    target?: number
  }
  styleGuide: 'formal' | 'conversational' | 'technical' | 'creative' | 'academic'
  customFormat?: string
}

export interface SmartConstraints {
  enabled: boolean
  positiveConstraints: string[]
  negativeConstraints: string[]
  boundaryConditions: string[]
  qualityGates: string[]
}

export interface ReasoningScaffolds {
  enabled: boolean
  showWork: boolean
  stepByStep: boolean
  exploreAlternatives: boolean
  confidenceScoring: boolean
  reasoningStyle: 'logical' | 'creative' | 'analytical' | 'practical'
}

export interface ConversationFlow {
  enabled: boolean
  contextPreservation: boolean
  followUpTemplates: string[]
  clarificationProtocols: boolean
  iterationImprovement: boolean
}

