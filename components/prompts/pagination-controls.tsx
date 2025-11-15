'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalPrompts: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalPrompts,
  limit,
  hasNextPage,
  hasPrevPage,
}: PaginationControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`/prompts?${params.toString()}`)
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <div className="text-sm text-muted-foreground">
        Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalPrompts)} of {totalPrompts} prompts
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrevPage}
          onClick={() => navigateToPage(currentPage - 1)}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }
            return (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => navigateToPage(pageNum)}
              >
                {pageNum}
              </Button>
            )
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => navigateToPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

