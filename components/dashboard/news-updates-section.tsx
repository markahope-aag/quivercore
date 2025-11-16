'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
import { Newspaper, ExternalLink, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface NewsItem {
  id: string
  title: string
  excerpt?: string
  category: 'technology' | 'technique' | 'template' | 'update' | 'best_practice'
  image_url?: string
  link_url?: string
  published_at: string
  featured?: boolean
  tags?: string[]
}

interface NewsAndUpdatesSectionProps {
  news: NewsItem[]
}

const categoryLabels: Record<string, string> = {
  technology: 'Technology',
  technique: 'Technique',
  template: 'Template',
  update: 'Update',
  best_practice: 'Best Practice',
}

const categoryColors: Record<string, string> = {
  technology: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  technique: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  template: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  update: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  best_practice: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
}

export function NewsAndUpdatesSection({ news }: NewsAndUpdatesSectionProps) {
  if (news.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <div>
              <CardTitle>News & Updates</CardTitle>
              <CardDescription>Latest from QuiverCore</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-start gap-3">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={categoryColors[item.category] || categoryColors.update}>
                      {categoryLabels[item.category] || item.category}
                    </Badge>
                    {item.featured && (
                      <Badge variant="outline" className="text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {item.title}
                  </h4>
                  {item.excerpt && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                      {item.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                      </span>
                    </div>
                    {item.link_url && (
                      <Link href={item.link_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="gap-1">
                          Read More
                          <ExternalLink className="h-3 w-3" />
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


