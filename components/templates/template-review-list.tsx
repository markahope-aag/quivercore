'use client'

import { Star } from 'lucide-react'
import type { TemplateComment } from '@/lib/types/templates'
import { format } from 'date-fns'

interface TemplateReviewListProps {
  comments: TemplateComment[]
}

export function TemplateReviewList({ comments }: TemplateReviewListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        No reviews yet. Be the first to review this template!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <div
          key={comment.id}
          className="border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {comment.userName.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">{comment.userName}</span>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < comment.rating
                        ? 'text-yellow-500 fill-current'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {format(comment.createdAt, 'MMM d, yyyy')}
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
        </div>
      ))}
    </div>
  )
}

