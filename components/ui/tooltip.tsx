'use client'

import * as React from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  children?: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center cursor-help"
      >
        {children || <Info className="h-4 w-4 text-muted-foreground" />}
      </div>
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 w-64 p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg',
            side === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-2',
            side === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-2',
            side === 'left' && 'right-full top-1/2 -translate-y-1/2 mr-2',
            side === 'right' && 'left-full top-1/2 -translate-y-1/2 ml-2',
            className
          )}
        >
          {content}
          <div
            className={cn(
              'absolute w-2 h-2 bg-gray-900 rotate-45',
              side === 'top' && 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
              side === 'bottom' && 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
              side === 'left' && 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
              side === 'right' && 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2'
            )}
          />
        </div>
      )}
    </div>
  )
}

