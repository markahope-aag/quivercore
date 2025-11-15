'use client'

import { useState, useEffect } from 'react'
import { usePromptBuilder } from '@/contexts/PromptBuilderContext'
import { exportPrompt, copyToClipboard, exportVSResponsesAsCSV } from '@/lib/utils/export'
import { parseVSResponse } from '@/lib/utils/api-client'
import type { ExportFormat } from '@/lib/utils/export'

export function PreviewExecuteStep() {
  const { state, generatePrompt, executePrompt, saveTemplate, setError } = usePromptBuilder()
  const [apiKey, setApiKey] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateTags, setTemplateTags] = useState('')
  const [copied, setCopied] = useState(false)

  // Generate prompt on mount and when config changes
  useEffect(() => {
    generatePrompt()
  }, [state.baseConfig, state.vsEnhancement])

  const handleExecute = async () => {
    if (!apiKey.trim()) {
      setError('execution', 'API key is required')
      return
    }

    if (!state.generatedPrompt) {
      setError('execution', 'No prompt generated')
      return
    }

    await executePrompt(apiKey)
  }

  const handleExport = (format: ExportFormat) => {
    if (!state.generatedPrompt) return

    const latestResult = state.executionResults[0]

    exportPrompt(format, {
      generatedPrompt: state.generatedPrompt,
      baseConfig: state.baseConfig,
      vsEnhancement: state.vsEnhancement,
      executionResult: latestResult,
    })
  }

  const handleCopy = async () => {
    if (!state.generatedPrompt) return

    const text = `${state.generatedPrompt.systemPrompt}\n\n---\n\n${state.generatedPrompt.finalPrompt}`
    const success = await copyToClipboard(text)

    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      setError('template', 'Template name is required')
      return
    }

    const tags = templateTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    saveTemplate(templateName, templateDescription, tags)
    setShowSaveDialog(false)
    setTemplateName('')
    setTemplateDescription('')
    setTemplateTags('')
  }

  if (!state.generatedPrompt) {
    return (
      <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          Complete the previous steps to generate a prompt preview.
        </p>
      </div>
    )
  }

  const latestResult = state.executionResults[0]
  const parsedVS = latestResult && state.vsEnhancement.enabled ? parseVSResponse(latestResult.response) : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preview & Execute</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Review your generated prompt, execute it with Claude, and export or save as a template.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-500"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>

        <div className="relative inline-block text-left">
          <button
            onClick={() => document.getElementById('export-menu')?.classList.toggle('hidden')}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            <svg
              className="h-4 w-4"
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
            Export
          </button>
          <div
            id="export-menu"
            className="absolute right-0 z-10 mt-2 hidden w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800"
          >
            <div className="py-1">
              <button
                onClick={() => handleExport('json')}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                JSON (Full Configuration)
              </button>
              <button
                onClick={() => handleExport('text')}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Text (Prompt Only)
              </button>
              <button
                onClick={() => handleExport('markdown')}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Markdown (Formatted)
              </button>
              {latestResult && state.vsEnhancement.enabled && (
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  CSV (VS Responses)
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowSaveDialog(true)}
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
          </svg>
          Save as Template
        </button>
      </div>

      {/* System Prompt Preview */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Prompt</h3>
        <div className="mt-2 rounded-md bg-gray-900 p-4">
          <pre className="overflow-x-auto text-sm text-gray-100">
            <code>{state.generatedPrompt.systemPrompt}</code>
          </pre>
        </div>
      </div>

      {/* User Prompt Preview */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Prompt</h3>
        <div className="mt-2 rounded-md bg-gray-900 p-4">
          <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-gray-100">
            <code>{state.generatedPrompt.finalPrompt}</code>
          </pre>
        </div>
      </div>

      {/* Metadata */}
      <div className="rounded-md border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Metadata</h4>
        <dl className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Domain:</dt>
            <dd className="text-gray-900 dark:text-white">{state.generatedPrompt.metadata.domain || 'N/A'}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Framework:</dt>
            <dd className="text-gray-900 dark:text-white">{state.generatedPrompt.metadata.framework}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">VS Enabled:</dt>
            <dd className="text-gray-900 dark:text-white">
              {state.generatedPrompt.metadata.vsEnabled ? 'Yes' : 'No'}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500 dark:text-gray-400">Generated:</dt>
            <dd className="text-gray-900 dark:text-white">
              {new Date(state.generatedPrompt.metadata.timestamp).toLocaleString()}
            </dd>
          </div>
        </dl>
      </div>

      {/* Execute Section */}
      <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-800 dark:bg-indigo-900/20">
        <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-300">
          Execute with Claude API
        </h3>
        <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-400">
          Execute your prompt using the Claude API to see the results.
        </p>

        <div className="mt-4">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Your Claude API key (stored locally, never sent to our servers)
          </p>
        </div>

        {state.errors.execution && (
          <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-400">{state.errors.execution}</p>
          </div>
        )}

        <button
          onClick={handleExecute}
          disabled={state.isExecuting || !apiKey.trim()}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state.isExecuting ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Executing...
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              Execute Prompt
            </>
          )}
        </button>
      </div>

      {/* Results Display */}
      {latestResult && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Latest Result</h3>

          {/* Result Metadata */}
          <div className="rounded-md border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
            <dl className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-500 dark:text-gray-400">Model:</dt>
                <dd className="text-gray-900 dark:text-white">{latestResult.model}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500 dark:text-gray-400">Timestamp:</dt>
                <dd className="text-gray-900 dark:text-white">
                  {new Date(latestResult.timestamp).toLocaleString()}
                </dd>
              </div>
              {latestResult.tokensUsed && (
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">Tokens:</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {latestResult.tokensUsed.total?.toLocaleString() || 'N/A'}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* VS Parsed Responses */}
          {parsedVS && parsedVS.responses.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white">VS Responses</h4>
              <div className="mt-2 space-y-3">
                {parsedVS.responses.map((response, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {response.content}
                        </p>
                        {response.rationale && (
                          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Rationale:</span> {response.rationale}
                          </p>
                        )}
                        {response.category && (
                          <span className="mt-2 inline-block rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                            {response.category}
                          </span>
                        )}
                      </div>
                      {response.probability !== undefined && (
                        <div className="ml-4 text-right">
                          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {(response.probability * 100).toFixed(1)}%
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">probability</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Response */}
          {(!parsedVS || parsedVS.responses.length === 0) && (
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Response</h4>
              <div className="mt-2 rounded-md bg-gray-900 p-4">
                <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-gray-100">
                  <code>{latestResult.response}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Template Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Save as Template</h3>

            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="templateName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Template Name *
                </label>
                <input
                  type="text"
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="My Awesome Prompt"
                />
              </div>

              <div>
                <label
                  htmlFor="templateDescription"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id="templateDescription"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Describe what this template does..."
                />
              </div>

              <div>
                <label
                  htmlFor="templateTags"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="templateTags"
                  value={templateTags}
                  onChange={(e) => setTemplateTags(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="writing, creative, blog"
                />
              </div>

              {state.errors.template && (
                <p className="text-sm text-red-600 dark:text-red-400">{state.errors.template}</p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
