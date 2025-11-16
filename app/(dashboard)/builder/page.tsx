'use client'

import { useState } from 'react'
import { PromptBuilderProvider } from '@/contexts/PromptBuilderContext'
import { PromptBuilder } from '@/components/prompt-builder/PromptBuilder'
import { TemplateLibrary } from '@/components/prompt-builder/TemplateLibrary'
import { motion } from 'framer-motion'
import { Pencil, List, Check } from 'lucide-react'

export default function BuilderPage() {
  const [activeView, setActiveView] = useState<'builder' | 'templates'>('builder')

  return (
    <PromptBuilderProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Prompt Builder
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Create enhanced prompts with Verbalized Sampling and framework-based patterns
          </p>
        </div>

        {/* View Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveView('builder')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeView === 'builder'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Pencil className="h-5 w-5" />
                Prompt Builder
              </div>
            </button>
            <button
              onClick={() => setActiveView('templates')}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeView === 'templates'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Template Library
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="pb-12">
          {activeView === 'builder' ? <PromptBuilder /> : <TemplateLibrary />}
        </div>

        {/* Info Panel */}
        <div className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">
            About the Prompt Builder
          </h3>
          <div className="mt-4 space-y-3 text-sm text-blue-700 dark:text-blue-400">
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <strong>10 Framework Patterns:</strong> Choose from Role-Based, Few-Shot,
                Chain-of-Thought, Template/Fill-in, Constraint-Based, Iterative/Multi-Turn,
                Comparative, Generative, Analytical, and Transformation frameworks.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <strong>Verbalized Sampling:</strong> Generate diverse, probability-weighted
                responses using three distribution types: Broad Spectrum (mix of common to rare),
                Rarity Hunt (unconventional only), and Balanced Categories (equal coverage across
                dimensions).
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <strong>Save & Export:</strong> Save your prompts as reusable templates and export
                in JSON, Text, Markdown, or CSV formats for easy sharing and integration.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <strong>Claude API Integration:</strong> Execute prompts directly using the Claude
                API to test and validate your creations with built-in rate limiting and error
                handling.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </PromptBuilderProvider>
  )
}
