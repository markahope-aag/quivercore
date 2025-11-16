'use client'

/**
 * Test Panel Component
 *
 * Functional testing interface - focused solely on execution:
 * - Template variables input
 * - Model selection
 * - Execute/test functionality with user-provided API keys
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button-v2'
import { Input } from '@/components/ui/input-v2'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-v2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Prompt } from '@/lib/types/database'
import { TestTube, Loader2, Key, X, Eye, EyeOff, Settings as SettingsIcon } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface TestPanelProps {
  prompt: Prompt
}

export function TestPanel({ prompt }: TestPanelProps) {
  const [variables, setVariables] = useState<Record<string, string>>(
    prompt.variables ? Object.keys(prompt.variables).reduce((acc, key) => {
      acc[key] = ''
      return acc
    }, {} as Record<string, string>) : {}
  )
  const [model, setModel] = useState('gpt-3.5-turbo')
  const [response, setResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [checkingApiKey, setCheckingApiKey] = useState(true)
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [sessionApiKey, setSessionApiKey] = useState('')
  const [showSessionApiKey, setShowSessionApiKey] = useState(false)

  useEffect(() => {
    checkForApiKeys()
  }, [])

  // Check if user has saved API keys
  const checkForApiKeys = async () => {
    try {
      const response = await fetch('/api/user/api-keys')
      if (response.ok) {
        const data = await response.json()
        const provider = model.startsWith('claude-') ? 'anthropic' : 'openai'
        setHasApiKey(data.keys.some((k: any) => k.provider === provider))
      }
    } catch (error) {
      console.error('Failed to check API keys:', error)
    } finally {
      setCheckingApiKey(false)
    }
  }

  // Re-check when model changes
  useEffect(() => {
    if (!checkingApiKey) {
      checkForApiKeys()
    }
  }, [model])

  const handleTest = async () => {
    // Check if we need an API key
    const provider = model.startsWith('claude-') ? 'anthropic' : 'openai'

    if (!hasApiKey && !sessionApiKey) {
      setShowApiKeyInput(true)
      setError(`Please provide your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key to test with this model.`)
      return
    }

    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch(`/api/prompts/${prompt.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variables,
          model,
          session_api_key: sessionApiKey || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to test prompt')
      }

      const data = await res.json()
      setResponse(data.response)
      toast.success('Prompt tested successfully')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      toast.error(err.message || 'Failed to test prompt')
    } finally {
      setIsLoading(false)
    }
  }

  const provider = model.startsWith('claude-') ? 'anthropic' : 'openai'
  const providerName = provider === 'openai' ? 'OpenAI' : 'Anthropic'

  return (
    <div className="space-y-6">
      {/* API Key Status/Input */}
      {!hasApiKey && (
        <Card className="border-2 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Key className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  {providerName} API Key Required
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                  To test prompts, you need to provide your own API key. You can either:
                </p>
                <div className="flex gap-2">
                  <Link href="/settings">
                    <Button size="sm" variant="outline" className="gap-2">
                      <SettingsIcon className="h-4 w-4" />
                      Save in Settings
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    className="gap-2"
                  >
                    <Key className="h-4 w-4" />
                    {showApiKeyInput ? 'Hide' : 'Enter'} for This Session
                  </Button>
                </div>

                {showApiKeyInput && (
                  <div className="mt-4 space-y-3 p-4 rounded-lg bg-white dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700">
                    <div className="space-y-2">
                      <label htmlFor="session-api-key" className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                        {providerName} API Key (This Session Only)
                      </label>
                      <div className="relative">
                        <Input
                          id="session-api-key"
                          type={showSessionApiKey ? 'text' : 'password'}
                          value={sessionApiKey}
                          onChange={(e) => setSessionApiKey(e.target.value)}
                          placeholder={provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                          className="pr-10 font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSessionApiKey(!showSessionApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showSessionApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        This key will only be used for this test and won't be saved
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Variables */}
      {prompt.variables && Object.keys(prompt.variables).length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Template Variables</h4>
          {Object.keys(variables).map((key) => (
            <div key={key} className="space-y-2">
              <label htmlFor={`var-${key}`} className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {key}
              </label>
              <Input
                id={`var-${key}`}
                value={variables[key]}
                onChange={(e) =>
                  setVariables({ ...variables, [key]: e.target.value })
                }
                placeholder={`Enter value for ${key}`}
                className="h-12 border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600"
              />
            </div>
          ))}
        </div>
      )}

      {/* Model Selection */}
      <div className="space-y-2">
        <label htmlFor="model" className="text-sm font-medium text-slate-700 dark:text-slate-300">
          AI Model
        </label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger id="model" className="h-12 border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg border-blue-300 dark:bg-slate-800 dark:border-slate-600">
            <SelectItem value="gpt-3.5-turbo" className="hover:bg-blue-50 dark:hover:bg-blue-950">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="gpt-4" className="hover:bg-blue-50 dark:hover:bg-blue-950">GPT-4</SelectItem>
            <SelectItem value="gpt-4-turbo-preview" className="hover:bg-blue-50 dark:hover:bg-blue-950">GPT-4 Turbo</SelectItem>
            <SelectItem value="claude-3-5-sonnet-20241022" className="hover:bg-blue-50 dark:hover:bg-blue-950">Claude 3.5 Sonnet</SelectItem>
            <SelectItem value="claude-3-opus-20240229" className="hover:bg-blue-50 dark:hover:bg-blue-950">Claude 3 Opus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Execute Button */}
      <Button
        onClick={handleTest}
        disabled={isLoading || checkingApiKey}
        variant="default"
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:from-blue-700 hover:to-blue-600 hover:shadow-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testing...
          </>
        ) : (
          <>
            <TestTube className="mr-2 h-4 w-4" />
            Test Prompt
          </>
        )}
      </Button>

      {error && (
        <Card className="border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card className="border-2 border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 max-h-[600px] overflow-y-auto">
                {response}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
