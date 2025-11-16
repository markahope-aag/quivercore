'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PromptList } from '@/components/prompts/prompt-list'
import { PromptFilters } from '@/components/prompts/prompt-filters'
import { PaginationControls } from '@/components/prompts/pagination-controls'
import { motion } from 'framer-motion'
import { FileText, Plus } from 'lucide-react'
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

  useEffect(() => {
    async function fetchPrompts() {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const favorite = searchParams.get('favorite') === 'true'
      const recent = searchParams.get('recent') === 'true'
      const showArchived = searchParams.get('archived') === 'true'
      const useCase = searchParams.get('use_case')
      const framework = searchParams.get('framework')
      const enhancementTechnique = searchParams.get('enhancement_technique')
      const tag = searchParams.get('tag')
      const searchQuery = searchParams.get('q')
      const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
      const limit = 20

      const offset = (page - 1) * limit

      let query = supabase
        .from('prompts')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      // Apply filters
      if (favorite) {
        query = query.eq('is_favorite', true)
      }

      // Filter by archived status (default: hide archived)
      if (showArchived) {
        query = query.eq('archived', true)
      } else {
        query = query.eq('archived', false)
      }

      if (useCase) {
        query = query.eq('use_case', useCase)
      }

      if (framework) {
        query = query.eq('framework', framework)
      }

      if (enhancementTechnique) {
        query = query.eq('enhancement_technique', enhancementTechnique)
      }

      if (tag) {
        query = query.contains('tags', [tag])
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      }

      // Ordering
      if (recent) {
        query = query.order('updated_at', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Pagination
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (!error && data) {
        setPrompts(data)
        setTotalPrompts(count || 0)
        setTotalPages(Math.ceil((count || 0) / limit))
        setCurrentPage(page)
      }

      setLoading(false)
    }

    fetchPrompts()
  }, [searchParams, router])

  const viewMode = (searchParams.get('view') as 'grid' | 'list') || 'grid'
  const searchQuery = searchParams.get('q')

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
          <Link href="/builder">
            <Button variant="default" className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600 hover:shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              New Prompt
            </Button>
          </Link>
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

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalPrompts={totalPrompts}
            limit={20}
            hasNextPage={currentPage < totalPages}
            hasPrevPage={currentPage > 1}
          />
        </>
      )}
    </motion.div>
  )
}
