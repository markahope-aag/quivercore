/**
 * Utility functions for generating enhanced prompts
 * 
 * Provides functions for combining base prompts with various enhancement techniques
 * including VS (Verbalized Sampling), advanced enhancements, and framework templates.
 * 
 * @module lib/utils/prompt-generation
 */

import type {
  BasePromptConfig,
  VSEnhancement,
  GeneratedPrompt,
} from '@/lib/types/prompt-builder'
import { generateVSInstructions, getVSFormat } from './vs-enhancement'
import { generateFrameworkPrompt } from './framework-templates'
import type { AdvancedEnhancements } from '@/lib/types/enhancements'
import { EnhancementGenerators } from '@/src/utils/enhancementGenerators' // Keep src/ for now as it's the source

/**
 * Generates an enhanced prompt by combining base prompt, VS enhancement, and advanced enhancements.
 * 
 * @param baseConfig - Base prompt configuration including domain, framework, and base prompt text
 * @param vsEnhancement - VS (Verbalized Sampling) enhancement configuration
 * @param advancedEnhancements - Optional advanced enhancements (role, format, constraints, etc.)
 * @returns Generated prompt with final prompt text, system prompt, and metadata
 * 
 * @example
 * ```typescript
 * const result = generateEnhancedPrompt(
 *   {
 *     domain: 'Writing & Content',
 *     framework: 'Role-Based',
 *     basePrompt: 'Write a blog post',
 *     frameworkConfig: { role: 'Professional writer' }
 *   },
 *   { enabled: true, distributionType: 'broad-spectrum' },
 *   { roleEnhancement: { enabled: true, expertiseLevel: 'expert' } }
 * )
 * ```
 */
export function generateEnhancedPrompt(
  baseConfig: BasePromptConfig,
  vsEnhancement: VSEnhancement,
  advancedEnhancements?: AdvancedEnhancements
): GeneratedPrompt {
  // Generate VS enhancement instructions
  const vsInstructions = vsEnhancement.enabled ? generateVSInstructions(vsEnhancement) : ''

  // Add format instructions if VS is enabled
  let vsEnhancementText = ''
  if (vsEnhancement.enabled) {
    const format = getVSFormat(vsEnhancement.distributionType, vsEnhancement.includeProbabilityReasoning)
    vsEnhancementText = `${vsInstructions}\n\nFormat each response as:\n${format}`
  }

  // Generate advanced enhancements if provided
  let advancedEnhancementText = ''
  if (advancedEnhancements) {
    const sections: string[] = []
    if (advancedEnhancements.roleEnhancement?.enabled) {
      sections.push(EnhancementGenerators.generateRoleEnhancement(advancedEnhancements.roleEnhancement))
    }
    if (advancedEnhancements.formatControl?.enabled) {
      sections.push(EnhancementGenerators.generateFormatControl(advancedEnhancements.formatControl))
    }
    if (advancedEnhancements.smartConstraints?.enabled) {
      sections.push(EnhancementGenerators.generateSmartConstraints(advancedEnhancements.smartConstraints))
    }
    if (advancedEnhancements.reasoningScaffolds?.enabled) {
      sections.push(EnhancementGenerators.generateReasoningScaffolds(advancedEnhancements.reasoningScaffolds))
    }
    if (advancedEnhancements.conversationFlow?.enabled) {
      sections.push(EnhancementGenerators.generateConversationFlow(advancedEnhancements.conversationFlow))
    }
    advancedEnhancementText = sections.filter((s) => s.trim()).join('\n\n')
  }

  // Combine VS enhancement and advanced enhancements
  let enhancementText = ''
  if (vsEnhancementText && advancedEnhancementText) {
    enhancementText = `${vsEnhancementText}\n\n${advancedEnhancementText}`
  } else if (vsEnhancementText) {
    enhancementText = vsEnhancementText
  } else if (advancedEnhancementText) {
    enhancementText = advancedEnhancementText
  }

  // Generate the final prompt using framework template
  const finalPrompt = baseConfig.framework
    ? generateFrameworkPrompt(
        baseConfig.framework,
        baseConfig.frameworkConfig,
        baseConfig.basePrompt,
        enhancementText
      )
    : enhancementText
      ? `${baseConfig.basePrompt}\n\n${enhancementText}`
      : baseConfig.basePrompt

  // Add target outcome if provided
  let enhancedPrompt = finalPrompt
  if (baseConfig.targetOutcome) {
    enhancedPrompt = `${finalPrompt}\n\nTarget outcome: ${baseConfig.targetOutcome}`
  }

  return {
    finalPrompt: enhancedPrompt.trim(),
    systemPrompt: generateDefaultSystemPrompt(baseConfig.domain),
    metadata: {
      domain: baseConfig.domain || 'General',
      framework: baseConfig.framework || 'None',
      vsEnabled: vsEnhancement.enabled,
      timestamp: new Date().toISOString(),
    },
  }
}

function getFrameworkInstructions(framework: string): string {
  const instructions: Record<string, string> = {
    'Role-Based': 'Please assume the role described below and respond accordingly.',
    'Chain-of-Thought': 'Please show your reasoning step-by-step before providing your final answer.',
    'Template/Fill-in': 'Please follow the template structure provided.',
    'Constraint-Based': 'Please strictly adhere to all constraints listed.',
    'Comparative': 'Please compare and contrast the options presented, then provide your recommendation.',
    'Analytical': 'Please break down and analyze the content systematically.',
    'Transformation': 'Please transform the content according to the specifications.',
    'Generative': 'Please generate original content based on the requirements.',
  }

  return instructions[framework] || ''
}

function generateDefaultSystemPrompt(domain: string): string {
  const systemPrompts: Record<string, string> = {
    'Writing & Content': 'You are an expert writer and content creator with a keen eye for clarity, engagement, and style.',
    'Business & Strategy': 'You are a strategic business consultant with deep expertise in business analysis and planning.',
    'Code & Development': 'You are an experienced software engineer with expertise in writing clean, efficient, and well-documented code.',
    'Data & Analysis': 'You are a data analyst with strong analytical skills and expertise in interpreting complex datasets.',
    'Research & Learning': 'You are a knowledgeable researcher skilled at finding, synthesizing, and explaining complex information.',
    'Marketing & Sales': 'You are a marketing professional with expertise in persuasive communication and customer engagement.',
    'Creative & Design': 'You are a creative professional with a strong eye for design, aesthetics, and innovative thinking.',
    'Communication': 'You are a communication expert skilled at clear, effective, and audience-appropriate messaging.',
  }

  return systemPrompts[domain] || 'You are a helpful AI assistant.'
}


/**
 * Validates a prompt configuration and returns any validation errors.
 * 
 * @param baseConfig - Base prompt configuration to validate
 * @returns Object mapping field names to error messages (empty if valid)
 * 
 * @example
 * ```typescript
 * const errors = validatePromptConfig({
 *   basePrompt: '',
 *   framework: 'Few-Shot',
 *   frameworkConfig: { fewShotExamples: [] }
 * })
 * // Returns: { basePrompt: 'Base prompt is required', examples: 'Few-Shot framework requires at least one example' }
 * ```
 */
export function validatePromptConfig(baseConfig: BasePromptConfig): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!baseConfig.basePrompt || baseConfig.basePrompt.trim().length === 0) {
    errors.basePrompt = 'Base prompt is required'
  }

  if (baseConfig.basePrompt && baseConfig.basePrompt.length > 10000) {
    errors.basePrompt = 'Base prompt must be less than 10,000 characters'
  }

  if (baseConfig.framework === 'Few-Shot' && (!baseConfig.frameworkConfig.fewShotExamples || baseConfig.frameworkConfig.fewShotExamples.length === 0)) {
    errors.examples = 'Few-Shot framework requires at least one example'
  }

  return errors
}

/**
 * Exports a prompt configuration to JSON string for saving/sharing.
 * 
 * @param config - Prompt configuration object to export
 * @returns JSON string representation of the configuration
 * 
 * @example
 * ```typescript
 * const json = exportPromptConfig({
 *   baseConfig: { ... },
 *   vsEnhancement: { ... },
 *   generatedPrompt: { ... }
 * })
 * localStorage.setItem('savedPrompt', json)
 * ```
 */
export function exportPromptConfig(config: {
  baseConfig: BasePromptConfig
  vsEnhancement: VSEnhancement
  generatedPrompt: GeneratedPrompt | null
}): string {
  return JSON.stringify(config, null, 2)
}

/**
 * Imports a prompt configuration from a JSON string.
 * 
 * @param jsonString - JSON string representation of the configuration
 * @returns Parsed configuration object or null if invalid
 * 
 * @example
 * ```typescript
 * const json = localStorage.getItem('savedPrompt')
 * const config = importPromptConfig(json)
 * if (config) {
 *   // Use the imported configuration
 * }
 * ```
 */
export function importPromptConfig(jsonString: string): {
  baseConfig: BasePromptConfig
  vsEnhancement: VSEnhancement
} | null {
  try {
    const config = JSON.parse(jsonString)
    if (config.baseConfig && config.vsEnhancement) {
      return {
        baseConfig: config.baseConfig,
        vsEnhancement: config.vsEnhancement,
      }
    }
    return null
  } catch {
    return null
  }
}
