'use client'

/**
 * Framework Guide Modal
 * Comprehensive guide for selecting the right prompt engineering framework
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog-v2'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
import { FRAMEWORKS_DETAILED } from '@/lib/constants/frameworks-detailed'
import { cn } from '@/lib/utils'

interface FrameworkGuideModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectFramework?: (framework: string) => void
}

export function FrameworkGuideModal({
  open,
  onOpenChange,
  onSelectFramework,
}: FrameworkGuideModalProps) {
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)

  const handleFrameworkClick = (key: string) => {
    setSelectedFramework(key)
    if (onSelectFramework) {
      onSelectFramework(key)
      onOpenChange(false)
    }
  }

  const difficultyColors = {
    Beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-500/30',
    Intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-500/30',
    Advanced: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-500/30',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            Framework Guide
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Choose the right prompt engineering pattern for your use case. Click any framework to select it.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {Object.entries(FRAMEWORKS_DETAILED).map(([key, framework]) => {
            const IconComponent = framework.icon
            return (
              <div
                key={key}
                className={cn(
                  'border-2 rounded-lg p-4 cursor-pointer transition-all duration-200',
                  'hover:border-blue-300 hover:shadow-md',
                  'bg-white dark:bg-slate-800',
                  'border-slate-200 dark:border-slate-700',
                  selectedFramework === key && 'border-blue-500 ring-2 ring-blue-200'
                )}
                onClick={() => handleFrameworkClick(key)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white flex-1">
                    {framework.name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs border-2',
                      difficultyColors[framework.difficulty]
                    )}
                  >
                    {framework.difficulty}
                  </Badge>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {framework.description}
                </p>

                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Purpose:{' '}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {framework.purpose}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Best for:{' '}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {framework.bestFor.join(', ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Example:{' '}
                    </span>
                    <div className="mt-1">
                      <code className="text-xs bg-slate-100 dark:bg-slate-900 p-2 rounded block text-slate-800 dark:text-slate-200">
                        {framework.examples[0]}
                      </code>
                    </div>
                  </div>

                  {framework.worksWellWith.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Works well with:{' '}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {framework.worksWellWith.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

