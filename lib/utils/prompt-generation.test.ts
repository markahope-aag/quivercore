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
          type: 'expert',
          expertise: 'AI Technology',
        },
      }

      const result = generateEnhancedPrompt(baseConfig, vsEnhancement, enhancements)

      expect(result.finalPrompt).toContain('expert')
      expect(result.finalPrompt).toContain('AI Technology')
    })

    it('should include format controller in prompt', () => {
      const enhancements: AdvancedEnhancements = {
        ...DEFAULT_ADVANCED_ENHANCEMENTS,
        formatController: {
          enabled: true,
          type: 'markdown',
        },
      }

      const result = generateEnhancedPrompt(baseConfig, vsEnhancement, enhancements)

      expect(result.finalPrompt).toContain('Markdown')
    })

    it('should include smart constraints in prompt', () => {
      const enhancements: AdvancedEnhancements = {
        ...DEFAULT_ADVANCED_ENHANCEMENTS,
        smartConstraints: {
          ...DEFAULT_ADVANCED_ENHANCEMENTS.smartConstraints,
          length: {
            enabled: true,
            min: 500,
            max: 1000,
            unit: 'words',
          },
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
          type: 'expert',
          expertise: 'Content Writing',
        },
        formatController: {
          enabled: true,
          type: 'structured',
          structuredFormat: 'json',
        },
        smartConstraints: {
          length: {
            enabled: true,
            min: 300,
            max: 500,
            unit: 'words',
          },
          tone: {
            enabled: true,
            tones: ['professional'],
          },
          audience: {
            enabled: false,
            target: '',
          },
          exclusions: {
            enabled: false,
            items: [],
          },
          requirements: {
            enabled: false,
            items: [],
          },
          complexity: {
            enabled: false,
            level: 'moderate',
          },
        },
        reasoningScaffold: {
          enabled: true,
          type: 'analysis',
          showWorking: true,
        },
        conversationFlow: {
          type: 'single',
          allowClarification: false,
        },
      }

      const result = generateEnhancedPrompt(baseConfig, vsEnhancement, enhancements)

      expect(result.finalPrompt).toContain('expert')
      expect(result.finalPrompt).toContain('Content Writing')
      expect(result.finalPrompt).toContain('JSON')
      expect(result.finalPrompt).toContain('300')
      expect(result.finalPrompt).toContain('500')
      expect(result.finalPrompt).toContain('professional')
      expect(result.finalPrompt).toContain('analytical framework')
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

