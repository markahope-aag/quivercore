'use client'

import { PromptForm } from '@/components/prompts/prompt-form'
import { FileText } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NewPromptPage() {
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
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create New Prompt
          </h1>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Add a new prompt, email template, or snippet to your library
        </p>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <PromptForm />
      </div>
    </motion.div>
  )
}

