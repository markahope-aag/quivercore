'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
import { Newspaper, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
// import Image from 'next/image' // Using img tag for now to avoid Next.js Image optimization issues

interface NewsItem {
  id: string
  title: string
  excerpt: string | null
  category: 'technology' | 'technique' | 'template' | 'update' | 'best_practice'
  image_url: string | null
  link_url: string | null
  published_at: string
  featured: boolean
  tags: string[] | null
}

const categoryLabels: Record<string, string> = {
  technology: 'New Technology',
  technique: 'New Technique',
  template: 'New Template',
  update: 'Product Update',
  best_practice: 'Best Practice',
}

const categoryColors: Record<string, string> = {
  technology: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  technique: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  template: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  update: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  best_practice: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
}

export function NewsAndUpdatesSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch('/api/dashboard/news?limit=5')
        if (!response.ok) throw new Error('Failed to fetch news')
        const data = await response.json()
        setNews(data.news || [])
      } catch (error) {
        console.error('Error fetching news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>News & Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500">Loading...</div>
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
          <Newspaper className="h-5 w-5" />
          News & Updates
        </CardTitle>
        <CardDescription>Latest updates and announcements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {item.image_url && (
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={categoryColors[item.category] || ''} variant="outline">
                      {categoryLabels[item.category] || item.category}
                    </Badge>
                    {item.featured && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-1 line-clamp-2">
                    {item.title}
                  </h4>
                  {item.excerpt && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                      {item.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                    </span>
                    {item.link_url && (
                      <Link href={item.link_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          Read More
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

