'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-v2'
import type { PromptTemplate } from '@/lib/types/templates'

interface RelatedTemplatesProps {
  templateIds: string[]
}

export function RelatedTemplates({ templateIds }: RelatedTemplatesProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTemplates() {
      try {
        // TODO: Fetch templates from API
        // For now, this is a placeholder
        setTemplates([])
      } catch (error) {
        console.error('Failed to load related templates:', error)
      } finally {
        setLoading(false)
      }
    }

    if (templateIds.length > 0) {
      loadTemplates()
    } else {
      setLoading(false)
    }
  }, [templateIds])

  if (loading) {
    return <div className="text-slate-500 dark:text-slate-400">Loading related templates...</div>
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-4 text-slate-500 dark:text-slate-400">
        No related templates found
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {templates.map(template => (
        <Link key={template.id} href={`/templates/${template.id}`}>
          <Card className="border-2 border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow dark:border-slate-600 dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-base text-slate-900 dark:text-white line-clamp-1">
                {template.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                {template.description}
              </p>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {template.quality.userRating.toFixed(1)}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

