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
          <Button variant="secondary" size="sm" onClick={handleCopy} className="border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700">
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="secondary" size="sm" asChild className="border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700">
            <Link href={`/prompts/${prompt.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
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
    </div>
  )
}

