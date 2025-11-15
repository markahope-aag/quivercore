'use client'

import { useState, useEffect } from 'react'
import { usePromptBuilder } from '@/contexts/PromptBuilderContext'
import { getTemplates, searchTemplates, deleteTemplate, exportTemplate } from '@/lib/utils/storage'
import type { PromptTemplate } from '@/lib/types/prompt-builder'

export function TemplateLibrary() {
  const { loadTemplate } = usePromptBuilder()
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('')
  const [filteredTemplates, setFilteredTemplates] = useState<PromptTemplate[]>([])

  // Load templates on mount
  useEffect(() => {
    loadTemplatesFromStorage()
  }, [])

  // Filter templates when search query or domain changes
  useEffect(() => {
    filterTemplates()
  }, [searchQuery, selectedDomain, templates])

  const loadTemplatesFromStorage = () => {
    const loadedTemplates = getTemplates()
    setTemplates(loadedTemplates)
  }

  const filterTemplates = () => {
    let filtered = templates

    // Search filter
    if (searchQuery.trim()) {
      filtered = searchTemplates(searchQuery)
    }

    // Domain filter
    if (selectedDomain) {
      filtered = filtered.filter((t) => t.config.domain === selectedDomain)
    }

    setFilteredTemplates(filtered)
  }

  const handleLoadTemplate = (template: PromptTemplate) => {
    loadTemplate(template)
  }

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id)
      loadTemplatesFromStorage()
    }
  }

  const handleExportTemplate = (template: PromptTemplate) => {
    exportTemplate(template)
  }

  const uniqueDomains = Array.from(new Set(templates.map((t) => t.config.domain).filter(Boolean)))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Template Library</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Browse, search, and manage your saved prompt templates.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search templates
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="search"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
              placeholder="Search templates by name, description, or tags..."
            />
          </div>
        </div>

        <div className="sm:w-64">
          <label htmlFor="domain-filter" className="sr-only">
            Filter by domain
          </label>
          <select
            id="domain-filter"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          >
            <option value="">All Domains</option>
            {uniqueDomains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No templates found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {templates.length === 0
              ? 'Get started by creating and saving your first prompt template.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex-1 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {template.name}
                </h3>

                {template.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {template.description}
                  </p>
                )}

                <dl className="mt-4 space-y-2 text-sm">
                  {template.config.domain && (
                    <div>
                      <dt className="inline font-medium text-gray-500 dark:text-gray-400">
                        Domain:
                      </dt>
                      <dd className="inline ml-2 text-gray-900 dark:text-white">
                        {template.config.domain}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="inline font-medium text-gray-500 dark:text-gray-400">
                      Framework:
                    </dt>
                    <dd className="inline ml-2 text-gray-900 dark:text-white">
                      {template.config.framework}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-gray-500 dark:text-gray-400">
                      VS Enabled:
                    </dt>
                    <dd className="inline ml-2 text-gray-900 dark:text-white">
                      {template.vsEnhancement.enabled ? 'Yes' : 'No'}
                    </dd>
                  </div>
                </dl>

                {template.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Created: {new Date(template.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleLoadTemplate(template)}
                    className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleExportTemplate(template)}
                    className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-500"
                    title="Export template"
                  >
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
                    title="Delete template"
                  >
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Showing {filteredTemplates.length} of {templates.length} templates
          </span>
          {(searchQuery || selectedDomain) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedDomain('')
              }}
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
