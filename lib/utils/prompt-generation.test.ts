import { describe, it, expect } from 'vitest'
import { generateEnhancedPrompt } from './prompt-generation'
import { DomainCategory, FrameworkType, VSDistributionType } from '@/lib/types/prompt-builder'
import type { BasePromptConfig, VSEnhancement } from '@/lib/types/prompt-builder'
import type { AdvancedEnhancements } from '@/src/types/index'
import { DEFAULT_ADVANCED_ENHANCEMENTS } from '@/src/constants/enhancements'

describe('Prompt Generation', () => {
  const baseConfig: BasePromptConfig = {
    domain: DomainCategory.WRITING_CONTENT,
    framework: FrameworkType.ROLE_BASED,
    basePrompt: 'Write a blog post about AI',
    targetOutcome: 'A well-structured blog post',
    frameworkConfig: {
      roleBasedRole: 'Expert content writer',
    },
  }

  const vsEnhancement: VSEnhancement = {
    enabled: false,
    numberOfResponses: 5,
    distributionType: VSDistributionType.BROAD_SPECTRUM,
    includeProbabilityReasoning: false,
    customConstraints: '',
    antiTypicalityEnabled: false,
  }

  describe('Basic Prompt Generation', () => {
    it('should generate prompt without enhancements', () => {
      const result = generateEnhancedPrompt(baseConfig, vsEnhancement)

      expect(result).toBeDefined()
      expect(result.finalPrompt).toContain('Write a blog post about AI')
      expect(result.systemPrompt).toBeDefined()
      expect(result.metadata).toBeDefined()
    })

    it('should include target outcome when provided', () => {
      const result = generateEnhancedPrompt(baseConfig, vsEnhancement)

      expect(result.finalPrompt).toContain('Target outcome')
      expect(result.finalPrompt).toContain('well-structured blog post')
    })
  })

  describe('Advanced Enhancements Integration', () => {
    it('should include role enhancement in prompt', () => {
      const enhancements: AdvancedEnhancements = {
        ...DEFAULT_ADVANCED_ENHANCEMENTS,
        roleEnhancement: {
          enabled: true,
          expertiseLevel: 'expert',
          domainSpecialty: 'AI Technology',
          authorityLevel: 'advisory',
        },
      }

      const result = generateEnhancedPrompt(baseConfig, vsEnhancement, enhancements)

      expect(result.finalPrompt).toContain('expert')
      expect(result.finalPrompt).toContain('AI Technology')
    })

    it('should include format controller in prompt', () => {
      const enhancements: AdvancedEnhancements = {
        ...DEFAULT_ADVANCED_ENHANCEMENTS,
        formatControl: {
          enabled: true,
          structure: 'paragraphs',
          styleGuide: 'formal',
          lengthSpec: { type: 'word-count' },
        },
      }

      const result = generateEnhancedPrompt(baseConfig, vsEnhancement, enhancements)

      expect(result.finalPrompt).toContain('Markdown')
    })

    it('should include smart constraints in prompt', () => {
      const enhancements: AdvancedEnhancements = {
        ...DEFAULT_ADVANCED_ENHANCEMENTS,
        smartConstraints: {
          enabled: true,
          positiveConstraints: ['Minimum 500 words', 'Maximum 1000 words'],
          negativeConstraints: [],
          boundaryConditions: ['Word count between 500-1000'],
          qualityGates: [],
        },
      }

      const result = generateEnhancedPrompt(baseConfig, vsEnhancement, enhancements)

      expect(result.finalPrompt).toContain('500')
      expect(result.finalPrompt).toContain('1000')
      expect(result.finalPrompt).toContain('words')
    })

    it('should include all enhancements when enabled', () => {
      const enhancements: AdvancedEnhancements = {
        roleEnhancement: {
          enabled: true,
          expertiseLevel: 'expert',
          domainSpecialty: 'Content Writing',
          authorityLevel: 'advisory',
        },
        formatControl: {
          enabled: true,
          structure: 'json',
          styleGuide: 'technical',
          lengthSpec: { type: 'word-count', min: 300, max: 500 },
        },
        smartConstraints: {
          enabled: true,
          positiveConstraints: ['professional tone'],
          negativeConstraints: [],
          boundaryConditions: ['Word count between 300-500'],
          qualityGates: [],
        },
        reasoningScaffolds: {
          enabled: true,
          showWork: true,
          stepByStep: true,
          exploreAlternatives: false,
          confidenceScoring: false,
          reasoningStyle: 'analytical',
        },
        conversationFlow: {
          enabled: true,
          contextPreservation: true,
          followUpTemplates: [],
          clarificationProtocols: false,
          iterationImprovement: false,
        },
      }

      const result = generateEnhancedPrompt(baseConfig, vsEnhancement, enhancements)

      expect(result.finalPrompt).toContain('expert')
      expect(result.finalPrompt).toContain('Content Writing')
      expect(result.finalPrompt).toContain('JSON')
      expect(result.finalPrompt).toContain('300')
      expect(result.finalPrompt).toContain('500')
      expect(result.finalPrompt).toContain('professional')
      expect(result.finalPrompt).toContain('analytical')
    })
  })

  describe('Metadata', () => {
    it('should include correct metadata', () => {
      const result = generateEnhancedPrompt(baseConfig, vsEnhancement)

      expect(result.metadata.domain).toBe('Writing & Content')
      expect(result.metadata.framework).toBe('Role-Based')
      expect(result.metadata.vsEnabled).toBe(false)
      expect(result.metadata.timestamp).toBeDefined()
    })
  })
})

