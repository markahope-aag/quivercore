'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
import { Layout, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Template {
  id: string
  title: string
  description: string | null
  use_case: string | null
  framework: string | null
  tags: string[] | null
  usage_count: number
}

export function SuggestedTemplatesSection() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await fetch('/api/dashboard/suggested-templates')
        if (!response.ok) throw new Error('Failed to load templates')
        const data = await response.json()
        setTemplates(data.templates || [])
      } catch (error) {
        console.error('Error loading templates:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTemplates()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suggested Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (templates.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-green-600" />
          Suggested Templates
        </CardTitle>
        <CardDescription>Popular templates to get you started</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 transition-colors"
            >
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1">
                {template.title}
              </h4>
              {template.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                  {template.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mb-3">
                {template.use_case && (
                  <Badge variant="outline" className="text-xs">
                    {template.use_case}
                  </Badge>
                )}
                {template.framework && (
                  <Badge variant="outline" className="text-xs">
                    {template.framework}
                  </Badge>
                )}
              </div>
              <Link href={`/prompts/${template.id}`}>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  Use Template
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/prompts?template=true">
            <Button variant="outline" className="w-full">
              Browse All Templates
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

