'use client'

import { useState, useEffect } from 'react'
import { PromptList } from '@/components/prompts/prompt-list'
import { PromptFilters } from '@/components/prompts/prompt-filters'
import { PaginationControls } from '@/components/prompts/pagination-controls'
import { motion } from 'framer-motion'
import { FileText, Plus, ChevronDown, Wand2, Edit3, Upload } from 'lucide-react'
import { Prompt } from '@/lib/types/database'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button-v2'

export default function PromptsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPrompts, setTotalPrompts] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [showNewPromptMenu, setShowNewPromptMenu] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  useEffect(() => {
    async function fetchPrompts() {
      setLoading(true)
      
      try {
        // Build query parameters
        const params = new URLSearchParams()
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
        params.set('page', String(page))
        params.set('limit', '20')

        const favorite = searchParams.get('favorite') === 'true'
        if (favorite) {
          params.set('favorite', 'true')
        }

        const useCase = searchParams.get('use_case')
        if (useCase) {
          params.set('use_case', useCase)
        }

        const framework = searchParams.get('framework')
        if (framework) {
          params.set('framework', framework)
        }

        const enhancementTechnique = searchParams.get('enhancement_technique')
        if (enhancementTechnique) {
          params.set('enhancement_technique', enhancementTechnique)
        }

        const tag = searchParams.get('tag')
        if (tag) {
          params.set('tag', tag)
        }

        // Fetch from API route with cache-busting if refresh param is present
        const refreshParam = searchParams.get('refresh')
        const fetchUrl = `/api/prompts?${params.toString()}${refreshParam ? `&_t=${refreshParam}` : ''}`
        const response = await fetch(fetchUrl, {
          cache: refreshParam ? 'no-store' : 'default',
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch prompts')
        }

        const result = await response.json()

        // Handle new paginated response format
        if (result.data && result.pagination) {
          setPrompts(result.data)
          setTotalPrompts(result.pagination.total)
          setTotalPages(result.pagination.totalPages)
          setCurrentPage(result.pagination.page)
        } else {
          // Fallback for old format (backward compatibility)
          const promptsArray = Array.isArray(result) ? result : result.data || []
          setPrompts(promptsArray)
          setTotalPrompts(promptsArray.length)
          setTotalPages(1)
          setCurrentPage(1)
        }
      } catch (error) {
        console.error('Error fetching prompts:', error)
        setPrompts([])
        setTotalPrompts(0)
        setTotalPages(0)
        setCurrentPage(1)
      } finally {
        setLoading(false)
      }
    }

    fetchPrompts()
  }, [searchParams, router])

  const viewMode = (searchParams.get('view') as 'grid' | 'list') || 'grid'
  const searchQuery = searchParams.get('q')

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="mb-8 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-12 dark:from-slate-900 dark:to-blue-950/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Prompt Library
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {totalPrompts} prompt{totalPrompts !== 1 ? 's' : ''} in your library
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          <div className="relative new-prompt-menu-container">
            <Button
              variant="default"
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600 hover:shadow-lg"
              onClick={() => setShowNewPromptMenu(!showNewPromptMenu)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Prompt
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>

            {showNewPromptMenu && (
              <div className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-slate-800">
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
        </div>
      </div>

      {/* Filters */}
      <PromptFilters />

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-500">Loading...</div>
        </div>
      ) : (
        <>
          <PromptList initialPrompts={prompts} viewMode={viewMode} />

          {totalPages > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalPrompts={totalPrompts}
              limit={20}
              hasNextPage={currentPage < totalPages}
              hasPrevPage={currentPage > 1}
            />
          )}
        </>
      )}

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
    </motion.div>
  )
}
