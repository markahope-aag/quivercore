'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button-v2'
import { Textarea } from '@/components/ui/textarea-v2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { toast } from 'sonner'

interface TemplateReviewFormProps {
  templateId: string
  onSubmit?: (review: { rating: number; comment: string }) => void
}

export function TemplateReviewForm({ templateId, onSubmit }: TemplateReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!rating || !comment.trim()) {
      toast.error('Please provide both a rating and comment')
      return
    }

    setIsSubmitting(true)

    try {
      // Call API to submit review
      const response = await fetch(`/api/templates/${templateId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      toast.success('Review submitted successfully')
      setRating(0)
      setComment('')
      
      if (onSubmit) {
        onSubmit({ rating, comment })
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
      toast.error('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="text-base text-slate-900 dark:text-white">Leave a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Rating
            </label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className={`h-8 w-8 transition-colors ${
                    i < rating
                      ? 'text-yellow-500 fill-current'
                      : 'text-slate-300 dark:text-slate-600'
                  } hover:text-yellow-400`}
                  disabled={isSubmitting}
                >
                  <Star className="h-full w-full" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Comment
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this template..."
              className="min-h-[100px] border-2 border-slate-200 focus:border-blue-500 dark:border-slate-600"
              disabled={isSubmitting}
            />
          </div>

          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={!rating || !comment.trim() || isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

