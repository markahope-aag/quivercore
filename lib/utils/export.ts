// Export utilities for prompts and templates

import type {
  BasePromptConfig,
  VSEnhancement,
  GeneratedPrompt,
  PromptTemplate,
  ExecutionResult,
} from '@/lib/types/prompt-builder'
import { parseVSResponse } from './api-client'

export type ExportFormat = 'json' | 'text' | 'markdown' | 'csv'

// Export as JSON (full configuration)
export function exportAsJSON(config: {
  baseConfig: BasePromptConfig
  vsEnhancement: VSEnhancement
  generatedPrompt?: GeneratedPrompt | null
}): string {
  return JSON.stringify(config, null, 2)
}

// Export as plain text (final prompt only)
export function exportAsText(generatedPrompt: GeneratedPrompt): string {
  return `${generatedPrompt.systemPrompt}\n\n---\n\n${generatedPrompt.finalPrompt}`
}

// Export as Markdown (formatted with metadata)
export function exportAsMarkdown(
  generatedPrompt: GeneratedPrompt,
  baseConfig: BasePromptConfig,
  vsEnhancement: VSEnhancement
): string {
  const lines: string[] = []

  lines.push('# Generated Prompt\n')
  lines.push(`**Generated:** ${new Date(generatedPrompt.metadata.timestamp).toLocaleString()}\n`)
  lines.push(`**Domain:** ${generatedPrompt.metadata.domain}`)
  lines.push(`**Framework:** ${generatedPrompt.metadata.framework}`)
  lines.push(`**VS Enhanced:** ${generatedPrompt.metadata.vsEnabled ? 'Yes' : 'No'}\n`)

  if (vsEnhancement.enabled) {
    lines.push('## VS Configuration\n')
    lines.push(`- **Distribution Type:** ${vsEnhancement.distributionType}`)
    lines.push(`- **Number of Responses:** ${vsEnhancement.numberOfResponses}`)
    lines.push(
      `- **Include Probability Reasoning:** ${vsEnhancement.includeProbabilityReasoning ? 'Yes' : 'No'}`
    )

    if (vsEnhancement.distributionType === 'rarity_hunt' && vsEnhancement.probabilityThreshold) {
      lines.push(`- **Probability Threshold:** ${vsEnhancement.probabilityThreshold}`)
    }

    if (
      vsEnhancement.distributionType === 'balanced_categories' &&
      vsEnhancement.dimensions &&
      vsEnhancement.dimensions.length > 0
    ) {
      lines.push(`- **Dimensions:** ${vsEnhancement.dimensions.join(', ')}`)
    }

    if (vsEnhancement.antiTypicalityEnabled) {
      lines.push(`- **Anti-Typicality:** Enabled`)
    }

    lines.push('')
  }

  lines.push('## System Prompt\n')
  lines.push('```')
  lines.push(generatedPrompt.systemPrompt)
  lines.push('```\n')

  lines.push('## User Prompt\n')
  lines.push('```')
  lines.push(generatedPrompt.finalPrompt)
  lines.push('```\n')

  if (baseConfig.targetOutcome) {
    lines.push('## Target Outcome\n')
    lines.push(baseConfig.targetOutcome)
    lines.push('')
  }

  return lines.join('\n')
}

// Export VS responses as CSV
export function exportVSResponsesAsCSV(executionResult: ExecutionResult): string {
  const parsed = parseVSResponse(executionResult.response)

  const headers = ['Index', 'Content', 'Probability', 'Rationale', 'Category']
  const rows: string[][] = [headers]

  parsed.responses.forEach((response, index) => {
    rows.push([
      (index + 1).toString(),
      `"${response.content.replace(/"/g, '""')}"`, // Escape quotes
      response.probability?.toString() || '',
      response.rationale ? `"${response.rationale.replace(/"/g, '""')}"` : '',
      response.category || '',
    ])
  })

  return rows.map((row) => row.join(',')).join('\n')
}

// Download file helper
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export template
export function exportTemplate(template: PromptTemplate): void {
  const content = JSON.stringify(template, null, 2)
  const filename = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`
  downloadFile(content, filename, 'application/json')
}

// Import template
export function importTemplate(jsonString: string): PromptTemplate | null {
  try {
    const template = JSON.parse(jsonString)

    // Validate template structure
    if (
      !template.name ||
      !template.config ||
      !template.vsEnhancement ||
      !template.id ||
      !template.createdAt
    ) {
      throw new Error('Invalid template structure')
    }

    return template as PromptTemplate
  } catch (error) {
    console.error('Failed to import template:', error)
    return null
  }
}

// Export functions for different formats
export function exportPrompt(
  format: ExportFormat,
  data: {
    generatedPrompt: GeneratedPrompt
    baseConfig: BasePromptConfig
    vsEnhancement: VSEnhancement
    executionResult?: ExecutionResult
  }
): void {
  let content: string
  let filename: string
  let mimeType: string

  const timestamp = new Date().toISOString().split('T')[0]

  switch (format) {
    case 'json':
      content = exportAsJSON({
        baseConfig: data.baseConfig,
        vsEnhancement: data.vsEnhancement,
        generatedPrompt: data.generatedPrompt,
      })
      filename = `prompt_${timestamp}.json`
      mimeType = 'application/json'
      break

    case 'text':
      content = exportAsText(data.generatedPrompt)
      filename = `prompt_${timestamp}.txt`
      mimeType = 'text/plain'
      break

    case 'markdown':
      content = exportAsMarkdown(data.generatedPrompt, data.baseConfig, data.vsEnhancement)
      filename = `prompt_${timestamp}.md`
      mimeType = 'text/markdown'
      break

    case 'csv':
      if (!data.executionResult) {
        throw new Error('Execution result required for CSV export')
      }
      content = exportVSResponsesAsCSV(data.executionResult)
      filename = `vs_responses_${timestamp}.csv`
      mimeType = 'text/csv'
      break

    default:
      throw new Error(`Unsupported export format: ${format}`)
  }

  downloadFile(content, filename, mimeType)
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)

    // Fallback method
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError)
      return false
    }
  }
}
