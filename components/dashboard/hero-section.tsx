'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
import { Plus, Sparkles, FileText, TrendingUp, Crown, ChevronDown, Wand2, Edit3, Upload } from 'lucide-react'
import Link from 'next/link'

interface HeroSectionProps {
  stats: {
    totalPrompts?: number
    promptsThisMonth?: number
    mostUsedPrompt?: { id: string; title: string; usage_count: number } | null
    subscription?: {
      status: string
      subscription_plans: { display_name: string } | null
    } | null
  } | null
}

export function HeroSection({ stats }: HeroSectionProps) {
  const [showNewPromptMenu, setShowNewPromptMenu] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showNewPromptMenu && !target.closest('.new-prompt-menu-container')) {
        setShowNewPromptMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNewPromptMenu])

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Welcome back! 👋
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Here's what's happening.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Assets</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats?.totalPrompts || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">This Month</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats?.promptsThisMonth || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Most Used</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {stats?.mostUsedPrompt?.title || 'None yet'}
                </p>
                {stats?.mostUsedPrompt && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stats.mostUsedPrompt.usage_count} uses
                  </p>
                )}
              </div>
              <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Plan</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {stats?.subscription?.subscription_plans?.display_name || 'Free'}
                  </p>
                  {stats?.subscription?.status === 'trialing' && (
                    <Badge variant="outline" className="text-xs">Trial</Badge>
                  )}
                </div>
                <Link href="/pricing" className="mt-2 block">
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    Upgrade
                  </Button>
                </Link>
              </div>
              <Crown className="h-8 w-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-wrap gap-3">
        <div className="relative new-prompt-menu-container">
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600 hover:shadow-lg"
            onClick={() => setShowNewPromptMenu(!showNewPromptMenu)}
          >
            <Plus className="h-5 w-5" />
            Create New Asset
            <ChevronDown className="h-4 w-4" />
          </Button>

          {showNewPromptMenu && (
            <div className="absolute left-0 z-10 mt-2 w-64 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-slate-800">
              <div className="py-1">
                <Link
                  href="/builder"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  onClick={() => setShowNewPromptMenu(false)}
                >
                  <Wand2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="font-medium">Use Builder</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Create with AI frameworks & enhancements
                    </div>
                  </div>
                </Link>

                <Link
                  href="/prompts/new"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  onClick={() => setShowNewPromptMenu(false)}
                >
                  <Edit3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <div className="font-medium">Create Manually</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Write or paste your own prompt
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => {
                    setShowNewPromptMenu(false)
                    setShowImportDialog(true)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Upload className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <div className="font-medium">Import Template</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Import from JSON or CSV format
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
        <Link href="/builder">
          <Button size="lg" variant="outline" className="gap-2">
            <Sparkles className="h-5 w-5" />
            Open Builder
          </Button>
        </Link>
        <Link href="/prompts">
          <Button size="lg" variant="outline" className="gap-2">
            <FileText className="h-5 w-5" />
            My Assets
          </Button>
        </Link>
      </div>

      {/* Import Template Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Import Prompt Template</h3>
              <button
                onClick={() => setShowImportDialog(false)}
                className="text-slate-400 hover:text-slate-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Use these templates to import prompts from other sources. Copy and fill in the template, then paste into the manual creation form.
            </p>

            <div className="space-y-4">
              {/* JSON Template */}
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">JSON Format</h4>
                <div className="rounded-md bg-slate-900 p-4">
                  <pre className="text-xs text-slate-100 overflow-x-auto">
{`{
  "title": "Your prompt title",
  "content": "Your prompt content goes here",
  "description": "Brief description of what this prompt does",
  "use_case": "Content Creation",
  "framework": "Chain-of-Thought",
  "enhancement_technique": "VS: broad_spectrum",
  "tags": ["tag1", "tag2", "tag3"]
}`}
                  </pre>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`{
  "title": "Your prompt title",
  "content": "Your prompt content goes here",
  "description": "Brief description of what this prompt does",
  "use_case": "Content Creation",
  "framework": "Chain-of-Thought",
  "enhancement_technique": "VS: broad_spectrum",
  "tags": ["tag1", "tag2", "tag3"]
}`)
                    alert('JSON template copied to clipboard!')
                  }}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Copy JSON Template
                </button>
              </div>

              {/* CSV Template */}
              <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">CSV Format</h4>
                <div className="rounded-md bg-slate-900 p-4">
                  <pre className="text-xs text-slate-100 overflow-x-auto">
{`title,content,description,use_case,framework,enhancement_technique,tags
"Your prompt title","Your prompt content","Brief description","Content Creation","Chain-of-Thought","VS: broad_spectrum","tag1,tag2,tag3"`}
                  </pre>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`title,content,description,use_case,framework,enhancement_technique,tags
"Your prompt title","Your prompt content","Brief description","Content Creation","Chain-of-Thought","VS: broad_spectrum","tag1,tag2,tag3"`)
                    alert('CSV template copied to clipboard!')
                  }}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Copy CSV Template
                </button>
              </div>

              {/* Field Reference */}
              <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Field Reference</h4>
                <dl className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
                  <div className="flex gap-2">
                    <dt className="font-medium min-w-[140px]">title:</dt>
                    <dd>Required - Name of your prompt</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-medium min-w-[140px]">content:</dt>
                    <dd>Required - The actual prompt text</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-medium min-w-[140px]">description:</dt>
                    <dd>Optional - What the prompt does</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-medium min-w-[140px]">use_case:</dt>
                    <dd>Optional - Domain (e.g., Content Creation, Code, Business)</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-medium min-w-[140px]">framework:</dt>
                    <dd>Optional - Framework type (e.g., Chain-of-Thought, Few-Shot)</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-medium min-w-[140px]">enhancement_technique:</dt>
                    <dd>Optional - Enhancement used (e.g., VS: broad_spectrum)</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-medium min-w-[140px]">tags:</dt>
                    <dd>Optional - Comma-separated keywords</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  <strong>Note:</strong> After copying a template, go to "Create Manually" to paste and edit the content before saving.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowImportDialog(false)}
                className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
