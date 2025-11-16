'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Badge } from '@/components/ui/badge-v2'
import { Button } from '@/components/ui/button-v2'
import { Newspaper, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface NewsItem {
  id: string
  title: string
  excerpt: string | null
  category: string
  image_url: string | null
  link_url: string | null
  published_at: string
  featured: boolean
  tags: string[] | null
}

const categoryColors: Record<string, string> = {
  technology: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  technique: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  template: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  update: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  best_practice: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
}

const categoryLabels: Record<string, string> = {
  technology: 'Technology',
  technique: 'Technique',
  template: 'Template',
  update: 'Update',
  best_practice: 'Best Practice',
}

export function NewsAndUpdatesSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNews() {
      try {
        const response = await fetch('/api/dashboard/news?limit=5')
        if (!response.ok) throw new Error('Failed to load news')
        const data = await response.json()
        setNews(data.news || [])
      } catch (error) {
        console.error('Error loading news:', error)
        // If news_items table doesn't exist, just show empty state
        setNews([])
      } finally {
        setLoading(false)
      }
    }
    loadNews()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>News & Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (news.length === 0) {
    return null // Don't show section if no news
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-blue-600" />
          News & Updates
        </CardTitle>
        <CardDescription>Latest features, techniques, and templates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex items-start gap-3">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-16 h-16 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${categoryColors[item.category] || 'bg-slate-100 text-slate-800'}`}
                    >
                      {categoryLabels[item.category] || item.category}
                    </Badge>
                    {item.featured && (
                      <Badge variant="outline" className="text-xs">
                        Featured
                      </Badge>
                    )}
                    <span className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                  {item.excerpt && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {item.excerpt}
                    </p>
                  )}
                  {item.link_url && (
                    <Link href={item.link_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="mt-2">
                        Read More
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

