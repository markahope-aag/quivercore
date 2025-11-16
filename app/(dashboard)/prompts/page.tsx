'use client'

import { useState, useEffect } from 'react'
import { PromptList } from '@/components/prompts/prompt-list'
import { PromptFilters } from '@/components/prompts/prompt-filters'
import { PaginationControls } from '@/components/prompts/pagination-controls'
import { motion } from 'framer-motion'
import { FileText, Plus, ChevronDown, Wand2, Edit3, Upload, FileCode } from 'lucide-react'
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
                Library
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {(() => {
                const promptCount = prompts.filter(p => !p.variables || Object.keys(p.variables).length === 0).length
                const templateCount = prompts.filter(p => p.variables && Object.keys(p.variables).length > 0).length

                if (promptCount === 0 && templateCount === 0) {
                  return 'Your library is empty'
                } else if (promptCount > 0 && templateCount > 0) {
                  return `${promptCount} prompt${promptCount !== 1 ? 's' : ''} and ${templateCount} template${templateCount !== 1 ? 's' : ''} in your library`
                } else if (promptCount > 0) {
                  return `${promptCount} prompt${promptCount !== 1 ? 's' : ''} in your library`
                } else {
                  return `${templateCount} template${templateCount !== 1 ? 's' : ''} in your library`
                }
              })()}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/builder">
              <Button
                variant="default"
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600 hover:shadow-lg"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Use Builder
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setShowNewPromptMenu(!showNewPromptMenu)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      {showNewPromptMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                What would you like to create?
              </h2>
              <div className="space-y-3">
                <Link
                  href="/prompts/new"
                  onClick={() => setShowNewPromptMenu(false)}
                  className="block p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <Edit3 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Prompt</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Create a specific, ready-to-use prompt without variables
                      </div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/prompts/new?template=true"
                  onClick={() => setShowNewPromptMenu(false)}
                  className="block p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <FileCode className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Template</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Create a reusable template with variables like {`{{topic}}`}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowNewPromptMenu(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                What are you importing?
              </h2>
              <div className="space-y-3">
                <Link
                  href="/prompts/import"
                  onClick={() => setShowImportDialog(false)}
                  className="block p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <Edit3 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Prompt</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Import a specific prompt without variables
                      </div>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/prompts/import?template=true"
                  onClick={() => setShowImportDialog(false)}
                  className="block p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <FileCode className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Template</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Import a reusable template with variables like {`{{topic}}`}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowImportDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
