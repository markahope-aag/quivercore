// LocalStorage utilities for Prompt Builder

import type {
  PromptTemplate,
  BasePromptConfig,
  VSEnhancement,
  ExecutionResult,
} from '@/lib/types/prompt-builder'

export interface UserSettings {
  defaultDomain?: string
  defaultFramework?: string
  autoSaveDrafts: boolean
  showVSWarnings: boolean
  apiKey?: string
}

export interface UsageMetrics {
  totalExecutions: number
  totalTokensUsed: number
  executionsByModel: Record<string, number>
  lastExecutionDate?: string
}

export interface DraftConfiguration {
  id: string
  baseConfig: BasePromptConfig
  vsEnhancement: VSEnhancement
  savedAt: string
}

const STORAGE_KEYS = {
  TEMPLATES: 'promptBuilder_templates',
  DRAFT: 'promptBuilder_draft',
  PREFERENCES: 'promptBuilder_preferences',
  USAGE: 'promptBuilder_usage',
} as const

// Template Management
export function saveTemplate(template: PromptTemplate): void {
  try {
    const templates = getTemplates()
    const existingIndex = templates.findIndex((t) => t.id === template.id)

    if (existingIndex >= 0) {
      templates[existingIndex] = { ...template, updatedAt: new Date().toISOString() }
    } else {
      templates.unshift(template)
    }

    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates))
  } catch (error) {
    console.error('Failed to save template:', error)
    throw new Error('Failed to save template to localStorage')
  }
}

export function getTemplates(): PromptTemplate[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Failed to load templates:', error)
    return []
  }
}

export function getTemplateById(id: string): PromptTemplate | null {
  const templates = getTemplates()
  return templates.find((t) => t.id === id) || null
}

export function deleteTemplate(id: string): void {
  try {
    const templates = getTemplates()
    const filtered = templates.filter((t) => t.id !== id)
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to delete template:', error)
    throw new Error('Failed to delete template')
  }
}

export function getTemplatesByDomain(domain: string): PromptTemplate[] {
  const templates = getTemplates()
  return templates.filter((t) => t.config.domain === domain)
}

export function searchTemplates(query: string): PromptTemplate[] {
  const templates = getTemplates()
  const lowerQuery = query.toLowerCase()

  return templates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}

// Draft Management
export function saveDraft(baseConfig: BasePromptConfig, vsEnhancement: VSEnhancement): void {
  try {
    const draft: DraftConfiguration = {
      id: crypto.randomUUID(),
      baseConfig,
      vsEnhancement,
      savedAt: new Date().toISOString(),
    }

    localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft))
  } catch (error) {
    console.error('Failed to save draft:', error)
  }
}

export function getDraft(): DraftConfiguration | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DRAFT)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to load draft:', error)
    return null
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DRAFT)
  } catch (error) {
    console.error('Failed to clear draft:', error)
  }
}

// User Preferences
export function savePreferences(preferences: Partial<UserSettings>): void {
  try {
    const current = getPreferences()
    const updated = { ...current, ...preferences }
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save preferences:', error)
  }
}

export function getPreferences(): UserSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES)
    return data
      ? JSON.parse(data)
      : {
          autoSaveDrafts: true,
          showVSWarnings: true,
        }
  } catch (error) {
    console.error('Failed to load preferences:', error)
    return {
      autoSaveDrafts: true,
      showVSWarnings: true,
    }
  }
}

// Usage Metrics
export function trackExecution(result: ExecutionResult): void {
  try {
    const metrics = getUsageMetrics()

    metrics.totalExecutions += 1
    metrics.lastExecutionDate = result.timestamp

    if (result.tokensUsed) {
      metrics.totalTokensUsed += result.tokensUsed.total || 0
    }

    metrics.executionsByModel[result.model] = (metrics.executionsByModel[result.model] || 0) + 1

    localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(metrics))
  } catch (error) {
    console.error('Failed to track execution:', error)
  }
}

export function getUsageMetrics(): UsageMetrics {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USAGE)
    return data
      ? JSON.parse(data)
      : {
          totalExecutions: 0,
          totalTokensUsed: 0,
          executionsByModel: {},
        }
  } catch (error) {
    console.error('Failed to load usage metrics:', error)
    return {
      totalExecutions: 0,
      totalTokensUsed: 0,
      executionsByModel: {},
    }
  }
}

export function resetUsageMetrics(): void {
  try {
    const emptyMetrics: UsageMetrics = {
      totalExecutions: 0,
      totalTokensUsed: 0,
      executionsByModel: {},
    }
    localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(emptyMetrics))
  } catch (error) {
    console.error('Failed to reset metrics:', error)
  }
}

// Validation
export function validateStorageQuota(): { available: boolean; used: number; total: number } {
  try {
    const test = 'storage_test'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)

    let used = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length
      }
    }

    // Typical localStorage limit is 5MB (5 * 1024 * 1024 bytes)
    const total = 5 * 1024 * 1024

    return {
      available: used < total * 0.9, // Warn if over 90%
      used,
      total,
    }
  } catch (error) {
    return {
      available: false,
      used: 0,
      total: 0,
    }
  }
}

// Export all data for backup
export function exportAllData(): string {
  return JSON.stringify(
    {
      templates: getTemplates(),
      draft: getDraft(),
      preferences: getPreferences(),
      usage: getUsageMetrics(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  )
}

// Import data from backup
export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString)

    if (data.templates) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(data.templates))
    }
    if (data.draft) {
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(data.draft))
    }
    if (data.preferences) {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.preferences))
    }
    if (data.usage) {
      localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(data.usage))
    }

    return true
  } catch (error) {
    console.error('Failed to import data:', error)
    return false
  }
}
