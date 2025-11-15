// Framework templates with VS integration

import type { FrameworkConfig } from '@/lib/types/prompt-builder'

export const FRAMEWORK_TEMPLATES = {
  'Role-Based': (config: FrameworkConfig, basePrompt: string, vsEnhancement: string) => {
    const role = config.roleExpertise || 'an expert assistant'
    return `You are ${role}.

${basePrompt}

${vsEnhancement}`
  },

  'Chain-of-Thought': (config: FrameworkConfig, basePrompt: string, vsEnhancement: string) => {
    let structure = ''
    if (config.reasoningStructure === 'step-by-step') {
      structure = 'Think through this step-by-step, showing your reasoning process.'
    } else if (config.reasoningStructure === 'pros-cons') {
      structure = 'Analyze the pros and cons of different approaches before concluding.'
    } else if (config.reasoningStructure === 'first-principles') {
      structure = 'Break this down to first principles and build your reasoning from the ground up.'
    } else if (config.customReasoningStructure) {
      structure = config.customReasoningStructure
    }

    return `${basePrompt}

${structure}

${vsEnhancement}`
  },

  'Few-Shot': (config: FrameworkConfig, basePrompt: string, vsEnhancement: string) => {
    const examples = config.examples || []
    const examplesText = examples
      .map((ex, idx) => `Example ${idx + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}`)
      .join('\n\n')

    return `Here are examples to guide your response:

${examplesText}

Now, please respond to the following:
${basePrompt}

${vsEnhancement}`
  },

  'Template/Fill-in': (config: FrameworkConfig, basePrompt: string, vsEnhancement: string) => {
    const variables = config.templateVariables || {}
    let prompt = basePrompt

    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    })

    return `${prompt}

${vsEnhancement}`
  },

  'Constraint-Based': (config: FrameworkConfig, basePrompt: string, vsEnhancement: string) => {
    const constraints = config.constraints || []
    const constraintsText = constraints.map((c, idx) => `${idx + 1}. ${c}`).join('\n')

    return `${basePrompt}

Please adhere to these constraints:
${constraintsText}

${vsEnhancement}`
  },

  'Iterative/Multi-Turn': (
    config: FrameworkConfig,
    basePrompt: string,
    vsEnhancement: string
  ) => {
    return `${basePrompt}

This is part of an iterative conversation. Build upon previous context and be prepared for follow-up questions.

${vsEnhancement}`
  },

  Comparative: (config: FrameworkConfig, basePrompt: string, vsEnhancement: string) => {
    return `${basePrompt}

Please compare and contrast the different options or approaches. Highlight key differences, trade-offs, and provide a recommendation based on the criteria.

${vsEnhancement}`
  },

  Generative: (config: FrameworkConfig, basePrompt: string, vsEnhancement: string) => {
    return `${basePrompt}

Generate creative, original content that goes beyond typical examples.

${vsEnhancement}`
  },

  Analytical: (config: FrameworkConfig, basePrompt: string, vsEnhancement: string) => {
    return `${basePrompt}

Provide a thorough analysis by breaking down the components, examining relationships, and identifying patterns or insights.

${vsEnhancement}`
  },

  Transformation: (config: FrameworkConfig, basePrompt: string, vsEnhancement: string) => {
    return `${basePrompt}

Transform the content according to the specified format, style, or structure while preserving core meaning.

${vsEnhancement}`
  },
}

export function generateFrameworkPrompt(
  framework: string,
  config: FrameworkConfig,
  basePrompt: string,
  vsEnhancement: string
): string {
  const template = FRAMEWORK_TEMPLATES[framework as keyof typeof FRAMEWORK_TEMPLATES]

  if (template) {
    return template(config, basePrompt, vsEnhancement)
  }

  // Fallback if framework not found
  return `${basePrompt}\n\n${vsEnhancement}`
}

export function getFrameworkConfigFields(framework: string): string[] {
  const fields: Record<string, string[]> = {
    'Role-Based': ['roleExpertise'],
    'Few-Shot': ['examples'],
    'Chain-of-Thought': ['reasoningStructure', 'customReasoningStructure'],
    'Template/Fill-in': ['templateVariables'],
    'Constraint-Based': ['constraints'],
  }

  return fields[framework] || []
}
