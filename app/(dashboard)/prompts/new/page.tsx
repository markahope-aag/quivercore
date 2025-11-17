'use client'

import { PromptForm } from '@/components/prompts/prompt-form'
import { FileText, FileCode, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

export default function NewPromptPage() {
  const searchParams = useSearchParams()
  const isTemplate = searchParams.get('template') === 'true'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="mb-8 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-12 dark:from-slate-900 dark:to-blue-950/30">
        <div className="flex items-center gap-3 mb-3">
          {isTemplate ? (
            <FileCode className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          ) : (
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          )}
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isTemplate ? 'Create New Template' : 'Create New Asset'}
          </h1>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          {isTemplate
            ? 'Create a reusable template with variables for customization'
            : 'Add a specific, ready-to-use prompt to your library'}
        </p>
      </div>

      {/* Template Info Banner */}
      {isTemplate && (
        <div className="max-w-4xl rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/20">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                Creating a Template with Variables
              </p>
              <p className="text-orange-800 dark:text-orange-200">
                Use <code className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/40 font-mono text-xs">
                  {`{{variable_name}}`}
                </code> syntax to create placeholders. For example: "Write a blog post about <code className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/40 font-mono text-xs">
                  {`{{topic}}`}
                </code> for <code className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/40 font-mono text-xs">
                  {`{{audience}}`}
                </code>" will create a template you can reuse with different topics and audiences.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="max-w-4xl">
        <PromptForm isTemplate={isTemplate} />
      </div>
    </motion.div>
  )
}

