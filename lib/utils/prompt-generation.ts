// Utility functions for generating enhanced prompts

import type {
  BasePromptConfig,
  VSEnhancement,
  GeneratedPrompt,
} from '@/lib/types/prompt-builder'
import { generateVSInstructions, getVSFormat } from './vs-enhancement'
import { generateFrameworkPrompt } from './framework-templates'

export function generateEnhancedPrompt(
  baseConfig: BasePromptConfig,
  vsEnhancement: VSEnhancement
): GeneratedPrompt {
  // Generate VS enhancement instructions
  const vsInstructions = vsEnhancement.enabled ? generateVSInstructions(vsEnhancement) : ''

  // Add format instructions if VS is enabled
  let vsEnhancementText = ''
  if (vsEnhancement.enabled) {
    const format = getVSFormat(vsEnhancement.distributionType, vsEnhancement.includeProbabilityReasoning)
    vsEnhancementText = `${vsInstructions}\n\nFormat each response as:\n${format}`
  }

  // Generate the final prompt using framework template
  const finalPrompt = baseConfig.framework
    ? generateFrameworkPrompt(
        baseConfig.framework,
        baseConfig.frameworkConfig,
        baseConfig.basePrompt,
        vsEnhancementText
      )
    : `${baseConfig.basePrompt}\n\n${vsEnhancementText}`

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

export function exportPromptConfig(config: {
  baseConfig: BasePromptConfig
  vsEnhancement: VSEnhancement
  generatedPrompt: GeneratedPrompt | null
}): string {
  return JSON.stringify(config, null, 2)
}

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
