// Test utilities for validating advanced enhancements
// This file provides test cases and validation functions for advanced enhancements

import { generateEnhancedPrompt } from './prompt-generation'
import { EnhancementGenerators } from '@/src/utils/enhancementGenerators' // Keep src/ for now as it's the source
import type { BasePromptConfig, VSEnhancement } from '@/lib/types/prompt-builder'
import type { AdvancedEnhancements } from '@/lib/types/enhancements'
import { DEFAULT_ADVANCED_ENHANCEMENTS } from '@/src/constants/enhancements' // Keep src/ for now as it's the source
import { DomainCategory, FrameworkType, VSDistributionType } from '@/lib/types/prompt-builder'

// Test configuration
export interface EnhancementTestConfig {
  name: string
  description: string
  baseConfig: BasePromptConfig
  vsEnhancement: VSEnhancement
  advancedEnhancements: AdvancedEnhancements
  expectedOutput?: {
    contains?: string[]
    notContains?: string[]
    minLength?: number
    maxLength?: number
  }
}

// Test results
export interface TestResult {
  testName: string
  passed: boolean
  errors: string[]
  warnings: string[]
  generatedPrompt?: string
  metadata?: any
}

// Base test configuration
const BASE_TEST_CONFIG: BasePromptConfig = {
  domain: DomainCategory.WRITING_CONTENT,
  framework: FrameworkType.ROLE_BASED,
  basePrompt: 'Write a blog post about artificial intelligence.',
  targetOutcome: 'A well-structured, engaging blog post',
  frameworkConfig: {
    roleBasedRole: 'Expert content writer',
  },
}

const BASE_VS_ENHANCEMENT: VSEnhancement = {
  enabled: false,
  numberOfResponses: 5,
  distributionType: VSDistributionType.BROAD_SPECTRUM,
  includeProbabilityReasoning: false,
  customConstraints: '',
  antiTypicalityEnabled: false,
}

// Individual Enhancement Tests
export const INDIVIDUAL_ENHANCEMENT_TESTS: EnhancementTestConfig[] = [
  // Role Enhancement - Expert
  {
    name: 'Role Enhancement - Expert',
    description: 'Test role enhancement with expert type',
    baseConfig: BASE_TEST_CONFIG,
    vsEnhancement: BASE_VS_ENHANCEMENT,
    advancedEnhancements: {
      ...DEFAULT_ADVANCED_ENHANCEMENTS,
      roleEnhancement: {
        enabled: true,
        expertiseLevel: 'expert',
        domainSpecialty: 'AI and Machine Learning',
        authorityLevel: 'advisory',
      },
    },
    expectedOutput: {
      contains: ['ROLE', 'highly experienced professional', 'AI and Machine Learning'],
    },
  },

  // Role Enhancement - Persona
  {
    name: 'Role Enhancement - Persona',
    description: 'Test role enhancement with persona type',
    baseConfig: BASE_TEST_CONFIG,
    vsEnhancement: BASE_VS_ENHANCEMENT,
    advancedEnhancements: {
      ...DEFAULT_ADVANCED_ENHANCEMENTS,
      roleEnhancement: {
        enabled: true,
        expertiseLevel: 'expert',
        domainSpecialty: 'Tech journalism',
        authorityLevel: 'advisory',
        experienceYears: 10,
        contextSetting: 'Tech journalist with 10 years of experience',
      },
    },
    expectedOutput: {
      contains: ['ROLE', 'Tech journalist', '10 years'],
    },
  },

  // Format Controller - JSON
  {
    name: 'Format Controller - JSON',
    description: 'Test format controller with JSON output',
    baseConfig: BASE_TEST_CONFIG,
    vsEnhancement: BASE_VS_ENHANCEMENT,
    advancedEnhancements: {
      ...DEFAULT_ADVANCED_ENHANCEMENTS,
      formatControl: {
        enabled: true,
        structure: 'json',
        styleGuide: 'technical',
        lengthSpec: { type: 'word-count' },
      },
    },
    expectedOutput: {
      contains: ['FORMAT', 'JSON', 'format'],
    },
  },

  // Format Control - Markdown
  {
    name: 'Format Control - Markdown',
    description: 'Test format control with Markdown output',
    baseConfig: BASE_TEST_CONFIG,
    vsEnhancement: BASE_VS_ENHANCEMENT,
    advancedEnhancements: {
      ...DEFAULT_ADVANCED_ENHANCEMENTS,
      formatControl: {
        enabled: true,
        structure: 'paragraphs',
        styleGuide: 'formal',
        lengthSpec: { type: 'word-count' },
      },
    },
    expectedOutput: {
      contains: ['FORMAT', 'paragraphs'],
    },
  },

  // Smart Constraints - Length
  {
    name: 'Smart Constraints - Length',
    description: 'Test smart constraints with length requirements',
    baseConfig: BASE_TEST_CONFIG,
    vsEnhancement: BASE_VS_ENHANCEMENT,
    advancedEnhancements: {
      ...DEFAULT_ADVANCED_ENHANCEMENTS,
      smartConstraints: {
        enabled: true,
        positiveConstraints: ['Minimum 500 words', 'Maximum 1000 words'],
        negativeConstraints: [],
        boundaryConditions: ['Word count between 500-1000'],
        qualityGates: [],
      },
    },
    expectedOutput: {
      contains: ['MUST INCLUDE', '500', '1000', 'words'],
    },
  },

  // Smart Constraints - Tone
  {
    name: 'Smart Constraints - Tone',
    description: 'Test smart constraints with tone requirements',
    baseConfig: BASE_TEST_CONFIG,
    vsEnhancement: BASE_VS_ENHANCEMENT,
    advancedEnhancements: {
      ...DEFAULT_ADVANCED_ENHANCEMENTS,
      smartConstraints: {
        enabled: true,
        positiveConstraints: ['professional tone', 'engaging style', 'informative content'],
        negativeConstraints: [],
        boundaryConditions: [],
        qualityGates: [],
      },
    },
    expectedOutput: {
      contains: ['MUST INCLUDE', 'professional', 'engaging', 'informative'],
    },
  },

  // Smart Constraints - Audience
  {
    name: 'Smart Constraints - Audience',
    description: 'Test smart constraints with audience targeting',
    baseConfig: BASE_TEST_CONFIG,
    vsEnhancement: BASE_VS_ENHANCEMENT,
    advancedEnhancements: {
      ...DEFAULT_ADVANCED_ENHANCEMENTS,
      smartConstraints: {
        enabled: true,
        positiveConstraints: ['Target audience: Technical professionals with basic AI knowledge'],
        negativeConstraints: [],
        boundaryConditions: [],
        qualityGates: [],
      },
    },
    expectedOutput: {
      contains: ['MUST INCLUDE', 'Technical professionals'],
    },
  },

  // Reasoning Scaffolds - Analysis
  {
    name: 'Reasoning Scaffolds - Analysis',
    description: 'Test reasoning scaffolds with analysis framework',
    baseConfig: BASE_TEST_CONFIG,
    vsEnhancement: BASE_VS_ENHANCEMENT,
    advancedEnhancements: {
      ...DEFAULT_ADVANCED_ENHANCEMENTS,
      reasoningScaffolds: {
        enabled: true,
        showWork: true,
        stepByStep: true,
        exploreAlternatives: false,
        confidenceScoring: false,
        reasoningStyle: 'analytical',
      },
    },
    expectedOutput: {
      contains: ['REASONING', 'analytical', 'step-by-step'],
    },
  },

  // Reasoning Scaffold - Decision
  {
    name: 'Reasoning Scaffold - Decision',
    description: 'Test reasoning scaffold with decision matrix',
    baseConfig: BASE_TEST_CONFIG,
    vsEnhancement: BASE_VS_ENHANCEMENT,
    advancedEnhancements: {
      ...DEFAULT_ADVANCED_ENHANCEMENTS,
      reasoningScaffolds: {
        enabled: true,
        showWork: true,
        stepByStep: true,
        exploreAlternatives: true,
        confidenceScoring: true,
        reasoningStyle: 'logical',
      },
    },
    expectedOutput: {
      contains: ['REASONING', 'logical', 'alternatives'],
    },
  },

  // Conversation Flow - Iterative
  {
    name: 'Conversation Flow - Iterative',
    description: 'Test conversation flow with iterative type',
    baseConfig: BASE_TEST_CONFIG,
    vsEnhancement: BASE_VS_ENHANCEMENT,
    advancedEnhancements: {
      ...DEFAULT_ADVANCED_ENHANCEMENTS,
      conversationFlow: {
        enabled: true,
        contextPreservation: true,
        followUpTemplates: ['This is part of a series of blog posts'],
        clarificationProtocols: false,
        iterationImprovement: true,
      },
    },
    expectedOutput: {
      contains: ['CONVERSATION', 'context', 'previous'],
    },
  },

  // Conversation Flow - Clarifying
  {
    name: 'Conversation Flow - Clarifying',
    description: 'Test conversation flow with clarifying type',
    baseConfig: BASE_TEST_CONFIG,
    vsEnhancement: BASE_VS_ENHANCEMENT,
    advancedEnhancements: {
      ...DEFAULT_ADVANCED_ENHANCEMENTS,
      conversationFlow: {
        enabled: true,
        contextPreservation: true,
        followUpTemplates: [],
        clarificationProtocols: true,
        iterationImprovement: false,
      },
    },
    expectedOutput: {
      contains: ['CONVERSATION', 'clarifying', 'ambiguous'],
    },
  },
]

// Combination Tests
export const COMBINATION_TESTS: EnhancementTestConfig[] = [
  // Role + Format
  {
    name: 'Role + Format Combination',
    description: 'Test combining role enhancement with format controller',
    baseConfig: BASE_TEST_CONFIG,
    vsEnhancement: BASE_VS_ENHANCEMENT,
    advancedEnhancements: {
      ...DEFAULT_ADVANCED_ENHANCEMENTS,
      roleEnhancement: {
        enabled: true,
        expertiseLevel: 'expert',
        domainSpecialty: 'Content Marketing',
        authorityLevel: 'advisory',
      },
      formatControl: {
        enabled: true,
        structure: 'paragraphs',
        styleGuide: 'conversational',
        lengthSpec: { type: 'word-count' },
      },
    },
    expectedOutput: {
      contains: ['ROLE', 'Content Marketing', 'FORMAT', 'paragraphs'],
    },
  },

  // Constraints + Reasoning
  {
    name: 'Constraints + Reasoning Combination',
    description: 'Test combining smart constraints with reasoning scaffold',
    baseConfig: BASE_TEST_CONFIG,
    vsEnhancement: BASE_VS_ENHANCEMENT,
    advancedEnhancements: {
      ...DEFAULT_ADVANCED_ENHANCEMENTS,
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
    },
    expectedOutput: {
      contains: ['MUST INCLUDE', '300', '500', 'words', 'REASONING', 'analytical', 'professional'],
    },
  },

  // All Enhancements
  {
    name: 'All Enhancements Combined',
    description: 'Test with all enhancement types enabled',
    baseConfig: BASE_TEST_CONFIG,
    vsEnhancement: BASE_VS_ENHANCEMENT,
    advancedEnhancements: {
      roleEnhancement: {
        enabled: true,
        expertiseLevel: 'expert',
        domainSpecialty: 'AI Technology',
        authorityLevel: 'advisory',
      },
      formatControl: {
        enabled: true,
        structure: 'json',
        styleGuide: 'technical',
        lengthSpec: { type: 'word-count', min: 400, max: 600 },
      },
      smartConstraints: {
        enabled: true,
        positiveConstraints: ['informative', 'engaging'],
        negativeConstraints: [],
        boundaryConditions: ['Word count between 400-600', 'General audience'],
        qualityGates: [],
      },
      reasoningScaffolds: {
        enabled: true,
        showWork: true,
        stepByStep: true,
        exploreAlternatives: true,
        confidenceScoring: true,
        reasoningStyle: 'analytical',
      },
      conversationFlow: {
        enabled: true,
        contextPreservation: true,
        followUpTemplates: ['Educational content'],
        clarificationProtocols: false,
        iterationImprovement: true,
      },
    },
    expectedOutput: {
      contains: [
        'ROLE',
        'AI Technology',
        'FORMAT',
        'JSON',
        'MUST INCLUDE',
        'informative',
        'engaging',
        'REASONING',
        'analytical',
        'CONVERSATION',
      ],
    },
  },
]

// Validation Functions
export function validateTestResult(
  config: EnhancementTestConfig,
  result: { finalPrompt: string; systemPrompt: string; metadata: any }
): TestResult {
  const errors: string[] = []
  const warnings: string[] = []
  let passed = true

  // Check expected output
  if (config.expectedOutput) {
    const { contains, notContains, minLength, maxLength } = config.expectedOutput
    const fullPrompt = `${result.systemPrompt}\n\n${result.finalPrompt}`.toLowerCase()

    // Check for required strings
    if (contains) {
      for (const str of contains) {
        if (!fullPrompt.includes(str.toLowerCase())) {
          errors.push(`Expected prompt to contain "${str}" but it was not found`)
          passed = false
        }
      }
    }

    // Check for excluded strings
    if (notContains) {
      for (const str of notContains) {
        if (fullPrompt.includes(str.toLowerCase())) {
          errors.push(`Expected prompt NOT to contain "${str}" but it was found`)
          passed = false
        }
      }
    }

    // Check length constraints
    if (minLength && result.finalPrompt.length < minLength) {
      warnings.push(`Prompt length (${result.finalPrompt.length}) is below minimum (${minLength})`)
    }

    if (maxLength && result.finalPrompt.length > maxLength) {
      warnings.push(`Prompt length (${result.finalPrompt.length}) exceeds maximum (${maxLength})`)
    }
  }

  // Validate that enhancements are actually included
  const sections: string[] = []
  if (config.advancedEnhancements.roleEnhancement?.enabled) {
    sections.push(EnhancementGenerators.generateRoleEnhancement(config.advancedEnhancements.roleEnhancement))
  }
  if (config.advancedEnhancements.formatControl?.enabled) {
    sections.push(EnhancementGenerators.generateFormatControl(config.advancedEnhancements.formatControl))
  }
  if (config.advancedEnhancements.smartConstraints?.enabled) {
    sections.push(EnhancementGenerators.generateSmartConstraints(config.advancedEnhancements.smartConstraints))
  }
  if (config.advancedEnhancements.reasoningScaffolds?.enabled) {
    sections.push(EnhancementGenerators.generateReasoningScaffolds(config.advancedEnhancements.reasoningScaffolds))
  }
  if (config.advancedEnhancements.conversationFlow?.enabled) {
    sections.push(EnhancementGenerators.generateConversationFlow(config.advancedEnhancements.conversationFlow))
  }
  const enhancementText = sections.filter((s: string) => s.trim()).join('\n\n')
  if (enhancementText && !result.finalPrompt.includes(enhancementText)) {
    // Check if at least some parts are included (for partial matches)
    const hasSomeEnhancements = enhancementText
      .split('\n\n')
      .some((section: string) => section.trim() && result.finalPrompt.includes(section.trim()))
    
    if (!hasSomeEnhancements) {
      warnings.push('Advanced enhancement instructions may not be fully integrated')
    }
  }

  return {
    testName: config.name,
    passed,
    errors,
    warnings,
    generatedPrompt: result.finalPrompt,
    metadata: result.metadata,
  }
}

// Run a single test
export function runTest(config: EnhancementTestConfig): TestResult {
  try {
    const result = generateEnhancedPrompt(
      config.baseConfig,
      config.vsEnhancement,
      config.advancedEnhancements
    )

    return validateTestResult(config, result)
  } catch (error: any) {
    return {
      testName: config.name,
      passed: false,
      errors: [`Test failed with error: ${error.message}`],
      warnings: [],
    }
  }
}

// Run all individual tests
export function runAllIndividualTests(): TestResult[] {
  return INDIVIDUAL_ENHANCEMENT_TESTS.map(runTest)
}

// Run all combination tests
export function runAllCombinationTests(): TestResult[] {
  return COMBINATION_TESTS.map(runTest)
}

// Run all tests
export function runAllTests(): {
  individual: TestResult[]
  combinations: TestResult[]
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
  }
} {
  const individual = runAllIndividualTests()
  const combinations = runAllCombinationTests()
  const all = [...individual, ...combinations]

  const summary = {
    total: all.length,
    passed: all.filter((t) => t.passed).length,
    failed: all.filter((t) => !t.passed).length,
    warnings: all.reduce((sum, t) => sum + t.warnings.length, 0),
  }

  return { individual, combinations, summary }
}

// Quality validation
export function validatePromptQuality(prompt: string): {
  score: number
  issues: string[]
  strengths: string[]
} {
  const issues: string[] = []
  const strengths: string[] = []
  let score = 100

  // Check length
  if (prompt.length < 50) {
    issues.push('Prompt is too short (less than 50 characters)')
    score -= 20
  } else if (prompt.length > 5000) {
    issues.push('Prompt is very long (over 5000 characters)')
    score -= 10
  } else {
    strengths.push('Prompt length is appropriate')
  }

  // Check for clarity indicators
  const clarityIndicators = ['please', 'should', 'must', 'ensure', 'include']
  const hasClarity = clarityIndicators.some((indicator) =>
    prompt.toLowerCase().includes(indicator)
  )
  if (hasClarity) {
    strengths.push('Prompt uses clear directive language')
  } else {
    issues.push('Prompt may benefit from clearer directive language')
    score -= 5
  }

  // Check for structure
  const hasStructure = prompt.includes('\n') || prompt.includes('•') || prompt.includes('-')
  if (hasStructure) {
    strengths.push('Prompt has good structure')
  } else {
    issues.push('Prompt may benefit from better structure')
    score -= 5
  }

  // Check for specific instructions
  const hasInstructions = prompt.toLowerCase().includes('format') || 
                          prompt.toLowerCase().includes('include') ||
                          prompt.toLowerCase().includes('avoid')
  if (hasInstructions) {
    strengths.push('Prompt includes specific instructions')
  }

  // Check for role/context
  const hasRole = prompt.toLowerCase().includes('you are') || 
                  prompt.toLowerCase().includes('assume') ||
                  prompt.toLowerCase().includes('role')
  if (hasRole) {
    strengths.push('Prompt includes role/context information')
  }

  score = Math.max(0, Math.min(100, score))

  return { score, issues, strengths }
}

// Complete flow test
export function testCompleteFlow(
  basePrompt: string,
  enhancements: AdvancedEnhancements,
  vsEnhancement?: VSEnhancement
): {
  success: boolean
  steps: Array<{ step: string; success: boolean; message: string }>
  finalPrompt?: string
  quality?: { score: number; issues: string[]; strengths: string[] }
} {
  const steps: Array<{ step: string; success: boolean; message: string }> = []

  try {
    // Step 1: Validate base prompt
    if (!basePrompt || basePrompt.trim().length === 0) {
      return {
        success: false,
        steps: [{ step: 'Validate base prompt', success: false, message: 'Base prompt is empty' }],
      }
    }
    steps.push({ step: 'Validate base prompt', success: true, message: 'Base prompt is valid' })

    // Step 2: Generate enhancements
    const sections: string[] = []
    if (enhancements.roleEnhancement?.enabled) {
      sections.push(EnhancementGenerators.generateRoleEnhancement(enhancements.roleEnhancement))
    }
    if (enhancements.formatControl?.enabled) {
      sections.push(EnhancementGenerators.generateFormatControl(enhancements.formatControl))
    }
    if (enhancements.smartConstraints?.enabled) {
      sections.push(EnhancementGenerators.generateSmartConstraints(enhancements.smartConstraints))
    }
    if (enhancements.reasoningScaffolds?.enabled) {
      sections.push(EnhancementGenerators.generateReasoningScaffolds(enhancements.reasoningScaffolds))
    }
    if (enhancements.conversationFlow?.enabled) {
      sections.push(EnhancementGenerators.generateConversationFlow(enhancements.conversationFlow))
    }
    const enhancementText = sections.filter((s: string) => s.trim()).join('\n\n')
    if (enhancementText) {
      steps.push({
        step: 'Generate advanced enhancements',
        success: true,
        message: `Generated ${enhancementText.split('\n\n').length} enhancement sections`,
      })
    } else {
      steps.push({
        step: 'Generate advanced enhancements',
        success: true,
        message: 'No enhancements enabled',
      })
    }

    // Step 3: Generate final prompt
    const baseConfig: BasePromptConfig = {
      domain: DomainCategory.WRITING_CONTENT,
      framework: FrameworkType.ROLE_BASED,
      basePrompt,
      targetOutcome: '',
      frameworkConfig: {},
    }

    const vs = vsEnhancement || BASE_VS_ENHANCEMENT
    const result = generateEnhancedPrompt(baseConfig, vs, enhancements)

    steps.push({
      step: 'Generate final prompt',
      success: true,
      message: `Generated prompt with ${result.finalPrompt.length} characters`,
    })

    // Step 4: Validate quality
    const quality = validatePromptQuality(result.finalPrompt)
    steps.push({
      step: 'Validate prompt quality',
      success: quality.score >= 70,
      message: `Quality score: ${quality.score}/100`,
    })

    return {
      success: true,
      steps,
      finalPrompt: result.finalPrompt,
      quality,
    }
  } catch (error: any) {
    steps.push({
      step: 'Error occurred',
      success: false,
      message: error.message || 'Unknown error',
    })
    return { success: false, steps }
  }
}

// Export test runner for browser console
if (typeof window !== 'undefined') {
  ;(window as any).runEnhancementTests = runAllTests
  ;(window as any).testCompleteFlow = testCompleteFlow
  ;(window as any).validatePromptQuality = validatePromptQuality
}

