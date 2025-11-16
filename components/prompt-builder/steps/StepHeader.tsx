import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepHeaderProps {
  title: string
  description: string
  onNext?: () => void
  canProceed?: boolean
}

export function StepHeader({ title, description, onNext, canProceed }: StepHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
      {onNext && (
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 flex-shrink-0',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            canProceed
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600 hover:shadow-lg active:scale-[0.98]'
              : 'cursor-not-allowed opacity-50 bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
          )}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
