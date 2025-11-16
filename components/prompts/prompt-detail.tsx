'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star, Edit, Trash2, Copy, TestTube, History, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Separator } from '@/components/ui/separator'
import { Prompt } from '@/lib/types/database'
import { format } from 'date-fns'
import { TestPanel } from './test-panel'
import { VersionHistory } from './version-history'
import { sanitizeForDisplay } from '@/lib/utils/sanitize'
import { TemplateMetadataForm } from '@/components/templates/template-metadata-form'
import { promptToTemplate } from '@/lib/utils/prompt-to-template'

interface PromptDetailProps {
  prompt: Prompt
}

export function PromptDetail({ prompt }: PromptDetailProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(prompt.is_favorite)
  const [showTestPanel, setShowTestPanel] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showMetadataForm, setShowMetadataForm] = useState(false)
  const [showUsePromptModal, setShowUsePromptModal] = useState(false)
  const [showVariableInput, setShowVariableInput] = useState(false)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [enhancedPrompt, setEnhancedPrompt] = useState('')
  const [templateData, setTemplateData] = useState(() => promptToTemplate(prompt))
  const [metadataLoaded, setMetadataLoaded] = useState(false)

  // Load existing metadata if available
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await fetch(`/api/templates/${prompt.id}/metadata`)
        if (response.ok) {
          const metadata = await response.json()
          // Convert metadata row to template format
          const converted = promptToTemplate(prompt, {
            metadata: {
              useCaseTags: metadata.use_case_tags || [],
              industry: metadata.industry || '',
              difficultyLevel: metadata.difficulty_level || 'Beginner',
              estimatedTime: metadata.estimated_time || '',
              outputLength: metadata.output_length || '',
              businessImpact: metadata.business_impact || '',
              teamUsage: metadata.team_usage || [],
            },
            guidance: {
              prerequisites: metadata.prerequisites || [],
              bestPractices: metadata.best_practices || [],
              commonPitfalls: metadata.common_pitfalls || [],
              followUpPrompts: metadata.follow_up_prompts || [],
              successMetrics: metadata.success_metrics || [],
            },
            recommendations: {
              vsSettings: metadata.vs_settings || '',
              compatibleFrameworks: metadata.compatible_frameworks || [],
              advancedEnhancements: metadata.advanced_enhancements || [],
            },
            quality: {
              userRating: metadata.user_rating || 0,
              usageCount: metadata.usage_count || 0,
              author: metadata.author || '',
              lastUpdated: new Date(metadata.updated_at),
              exampleOutputs: metadata.example_outputs || [],
            },
            social: {
              comments: [],
              variations: metadata.variations || [],
              relatedTemplates: metadata.related_templates || [],
            },
          })
          setTemplateData(converted)
        }
      } catch (error) {
        console.error('Failed to load metadata:', error)
      } finally {
        setMetadataLoaded(true)
      }
    }

    loadMetadata()
  }, [prompt])

  const handleToggleFavorite = async () => {
    const newFavorite = !isFavorite
    setIsFavorite(newFavorite)

    try {
      await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: newFavorite }),
      })
    } catch (error) {
      setIsFavorite(!newFavorite)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return
    }

    try {
      await fetch(`/api/prompts/${prompt.id}`, {
        method: 'DELETE',
      })
      router.push('/prompts')
    } catch (error) {
      console.error('Failed to delete prompt:', error)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content)
  }

  const handleUsePrompt = async () => {
    // Check if prompt has variables
    const variablePattern = /\{\{([^}]+)\}\}/g
    const matches = Array.from(prompt.content.matchAll(variablePattern))
    const variables = [...new Set(matches.map(m => m[1].trim()))]

    if (variables.length > 0) {
      // Initialize variable values if needed
      const initialValues: Record<string, string> = {}
      variables.forEach(v => {
        initialValues[v] = variableValues[v] || ''
      })
      setVariableValues(initialValues)
      setShowVariableInput(true)
      setShowUsePromptModal(true)
      return
    }

    // No variables, proceed directly
    generateEnhancedPrompt(prompt.content)
  }

  const generateEnhancedPrompt = (contentWithVariables: string) => {
    // Build the enhanced prompt with framework and enhancement instructions
    let fullPrompt = contentWithVariables
    let systemInstructions = ''

    // Add framework-specific instructions
    if (prompt.framework) {
      switch (prompt.framework.toLowerCase()) {
        case 'chain-of-thought':
          systemInstructions += 'Use chain-of-thought reasoning. Break down your thinking step-by-step before providing the final answer.\n\n'
          break
        case 'few-shot':
          systemInstructions += 'Follow the pattern from the examples provided in the prompt.\n\n'
          break
        case 'role-based':
          systemInstructions += 'Adopt the role and expertise level specified in the prompt.\n\n'
          break
        case 'constraint-based':
          systemInstructions += 'Strictly adhere to all constraints and requirements specified.\n\n'
          break
        case 'iterative/multi-turn':
          systemInstructions += 'Engage in iterative refinement. Ask clarifying questions if needed.\n\n'
          break
        case 'comparative':
          systemInstructions += 'Provide comparative analysis highlighting similarities and differences.\n\n'
          break
        case 'analytical':
          systemInstructions += 'Provide deep analytical insights with supporting evidence.\n\n'
          break
        case 'transformation':
          systemInstructions += 'Transform the input according to the specified format or structure.\n\n'
          break
      }
    }

    // Add enhancement technique instructions
    if (prompt.enhancement_technique) {
      const technique = prompt.enhancement_technique.toLowerCase()

      if (technique.includes('vs:') || technique.includes('verbalized sampling')) {
        const vsType = technique.includes('broad_spectrum') ? 'broad spectrum (mix of common to rare)' :
                       technique.includes('rarity_hunt') ? 'rarity hunt (unconventional only)' :
                       technique.includes('balanced') ? 'balanced categories' : 'verbalized sampling'

        systemInstructions += `Use Verbalized Sampling with ${vsType} distribution. Provide multiple diverse responses with probability reasoning.\n\n`
      }

      if (technique.includes('role enhancement')) {
        systemInstructions += 'Apply role enhancement with specified expertise level.\n\n'
      }

      if (technique.includes('format control')) {
        systemInstructions += 'Follow the specified format and structure requirements.\n\n'
      }

      if (technique.includes('smart constraints')) {
        systemInstructions += 'Apply smart constraints - include required elements and avoid specified items.\n\n'
      }

      if (technique.includes('reasoning scaffolds')) {
        systemInstructions += 'Show your reasoning process and explore alternatives.\n\n'
      }
    }

    // Combine system instructions with prompt content
    const enhanced = systemInstructions
      ? `SYSTEM INSTRUCTIONS:\n${systemInstructions}---\n\nPROMPT:\n${fullPrompt}`
      : fullPrompt

    setEnhancedPrompt(enhanced)
    setShowVariableInput(false)
    setShowUsePromptModal(true)

    // Track usage
    trackUsage()
  }

  const trackUsage = async () => {
    try {
      await fetch(`/api/prompts/${prompt.id}/use`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('Failed to track usage:', error)
    }
  }

  const handleVariableSubmit = () => {
    // Replace variables in content with user values
    let contentWithValues = prompt.content
    Object.entries(variableValues).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
      contentWithValues = contentWithValues.replace(regex, value)
    })

    // Generate enhanced prompt with replaced variables
    generateEnhancedPrompt(contentWithValues)
  }

  const handleCopyEnhanced = () => {
    navigator.clipboard.writeText(enhancedPrompt)
    alert('Enhanced prompt copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{sanitizeForDisplay(prompt.title)}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className="hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Star
                className={`h-5 w-5 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400'}`}
              />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-400">
            {prompt.use_case && (
              <Badge variant="secondary" className="border-2 border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {sanitizeForDisplay(prompt.use_case)}
              </Badge>
            )}
            {prompt.framework && (
              <Badge variant="default" className="bg-blue-50 text-blue-700 border-2 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30">
                {sanitizeForDisplay(prompt.framework)}
              </Badge>
            )}
            {prompt.enhancement_technique && (
              <Badge variant="secondary" className="border-2 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                {sanitizeForDisplay(prompt.enhancement_technique)}
              </Badge>
            )}
            <span className="text-sm">
              Used {prompt.usage_count} time{prompt.usage_count !== 1 ? 's' : ''}
            </span>
            <span className="text-sm">
              • Created {format(new Date(prompt.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {prompt.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs border-2 border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700">
                  {sanitizeForDisplay(tag)}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleUsePrompt}
            className="bg-blue-600 text-white hover:bg-blue-700 w-36"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy to Use
          </Button>
          <Button variant="secondary" size="sm" asChild className="border-2 border-slate-400 bg-slate-600 text-white hover:bg-slate-700 dark:border-slate-500 dark:bg-slate-600 dark:hover:bg-slate-500 w-36">
            <Link href={`/prompts/${prompt.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} className="w-36">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {prompt.description && (
        <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400">{sanitizeForDisplay(prompt.description)}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-mono text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 max-h-[450px] overflow-y-auto">
              {sanitizeForDisplay(prompt.content)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {prompt.variables && Object.keys(prompt.variables).length > 0 && (
        <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Template Variables</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              These variables can be replaced when testing the prompt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.keys(prompt.variables).map((variable) => (
                <Badge key={variable} variant="secondary" className="border-2 border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700">
                  {`{{${variable}}}`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Metadata Section */}
      <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Template Metadata</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Add rich metadata to improve discoverability and provide usage guidance
              </CardDescription>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowMetadataForm(!showMetadataForm)}
              className="border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              {showMetadataForm ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Metadata
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showMetadataForm && metadataLoaded && (
          <CardContent>
            <TemplateMetadataForm
              template={templateData}
              onSave={() => {
                // Refresh metadata after save
                router.refresh()
              }}
            />
          </CardContent>
        )}
      </Card>

      <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Test Prompt</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Test this prompt with AI models
              </CardDescription>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowTestPanel(!showTestPanel)}
              className="border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              {showTestPanel ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Show Test Panel
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showTestPanel && (
          <CardContent>
            <TestPanel prompt={prompt} />
          </CardContent>
        )}
      </Card>

      <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Version History</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                View and restore previous versions
              </CardDescription>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className="border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              {showVersionHistory ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <History className="mr-2 h-4 w-4" />
                  Show History
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showVersionHistory && (
          <CardContent>
            <VersionHistory promptId={prompt.id} />
          </CardContent>
        )}
      </Card>

      {/* Use Prompt Modal */}
      {showUsePromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-3xl rounded-lg bg-white p-6 dark:bg-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {showVariableInput
                  ? 'Fill in Variable Values'
                  : (prompt.framework || prompt.enhancement_technique ? 'Enhanced Prompt (Ready to Use)' : 'Use Prompt')}
              </h3>
              <button
                onClick={() => {
                  setShowUsePromptModal(false)
                  setShowVariableInput(false)
                }}
                className="text-slate-400 hover:text-slate-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {showVariableInput ? (
              /* Variable Input Form */
              <div className="space-y-4">
                <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    This prompt contains variables that need values. Please fill in the fields below before using the prompt.
                  </p>
                </div>

                <div className="space-y-3">
                  {Object.keys(variableValues).map((variable) => (
                    <div key={variable}>
                      <label
                        htmlFor={`var-${variable}`}
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        {variable}
                      </label>
                      <input
                        type="text"
                        id={`var-${variable}`}
                        value={variableValues[variable]}
                        onChange={(e) =>
                          setVariableValues({
                            ...variableValues,
                            [variable]: e.target.value,
                          })
                        }
                        placeholder={`Enter value for ${variable}`}
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <button
                    onClick={handleVariableSubmit}
                    disabled={Object.values(variableValues).some(v => !v.trim())}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => {
                      setShowUsePromptModal(false)
                      setShowVariableInput(false)
                    }}
                    className="rounded-md bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Enhanced Prompt Display */
              <div>

            {(prompt.framework || prompt.enhancement_technique) && (
              <div className="mb-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Applied Enhancements:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {prompt.framework && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800/50 dark:text-blue-200">
                      Framework: {prompt.framework}
                    </span>
                  )}
                  {prompt.enhancement_technique && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-800/50 dark:text-emerald-200">
                      {prompt.enhancement_technique}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-blue-700 dark:text-blue-400">
                  This prompt has been configured with the enhancements shown above. Copy the enhanced version below to use with any AI tool.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {prompt.framework || prompt.enhancement_technique ? 'Enhanced Prompt:' : 'Prompt:'}
                </label>
                <div className="rounded-md bg-slate-900 p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-slate-100 whitespace-pre-wrap font-mono">
                    {enhancedPrompt}
                  </pre>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyEnhanced}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => setShowUsePromptModal(false)}
                  className="rounded-md bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                >
                  Close
                </button>
              </div>

              <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  <strong>Tip:</strong> Copy this enhanced prompt and paste it into ChatGPT, Claude, or any other AI tool.
                  The system instructions ensure the AI follows the configured framework and enhancements.
                </p>
              </div>
            </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

