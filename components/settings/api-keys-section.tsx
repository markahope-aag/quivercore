'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Key, Eye, EyeOff, Trash2, Save, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface ApiKey {
  provider: string
  masked_key: string
  created_at: string
  updated_at: string
}

export function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [openaiKey, setOpenaiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [showOpenaiKey, setShowOpenaiKey] = useState(false)
  const [showAnthropicKey, setShowAnthropicKey] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/user/api-keys')
      if (response.ok) {
        const data = await response.json()
        setKeys(data.keys || [])
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveKey = async (provider: 'openai' | 'anthropic') => {
    const apiKey = provider === 'openai' ? openaiKey : anthropicKey

    if (!apiKey.trim()) {
      toast.error('Please enter an API key')
      return
    }

    setSaving(provider)
    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, api_key: apiKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save API key')
      }

      toast.success(data.message)

      // Clear input and refresh keys
      if (provider === 'openai') {
        setOpenaiKey('')
        setShowOpenaiKey(false)
      } else {
        setAnthropicKey('')
        setShowAnthropicKey(false)
      }

      await fetchKeys()
    } catch (error: any) {
      console.error('Failed to save API key:', error)
      toast.error(error.message || 'Failed to save API key')
    } finally {
      setSaving(null)
    }
  }

  const handleDeleteKey = async (provider: string) => {
    if (!confirm(`Are you sure you want to delete your ${provider} API key?`)) {
      return
    }

    try {
      const response = await fetch(`/api/user/api-keys?provider=${provider}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete API key')
      }

      toast.success(data.message)
      await fetchKeys()
    } catch (error: any) {
      console.error('Failed to delete API key:', error)
      toast.error(error.message || 'Failed to delete API key')
    }
  }

  const hasKey = (provider: string) => keys.some(k => k.provider === provider)
  const getKey = (provider: string) => keys.find(k => k.provider === provider)

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Key className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Why provide API keys?
              </p>
              <p className="text-blue-800 dark:text-blue-200 mb-2">
                To test prompts, QuiverCore needs to call AI services on your behalf. By providing your own API keys:
              </p>
              <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-1 ml-2">
                <li>You only pay for what you use (no markup)</li>
                <li>Your keys are encrypted and never shared</li>
                <li>You can test unlimited prompts at your API's cost</li>
                <li>You control which models you have access to</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OpenAI API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.282 9.821a5.985 5.985 0 00-.516-4.91 6.046 6.046 0 00-6.51-2.9A6.065 6.065 0 004.981 4.18a5.985 5.985 0 00-3.998 2.9 6.046 6.046 0 00.743 7.097 5.98 5.98 0 00.51 4.911 6.051 6.051 0 006.515 2.9A5.985 5.985 0 0013.26 24a6.056 6.056 0 005.772-4.206 5.99 5.99 0 003.997-2.9 6.056 6.056 0 00-.747-7.073zM13.26 22.43a4.476 4.476 0 01-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 00.392-.681v-6.737l2.02 1.168a.071.071 0 01.038.052v5.583a4.504 4.504 0 01-4.494 4.494zM3.6 18.304a4.47 4.47 0 01-.535-3.014l.142.085 4.783 2.759a.771.771 0 00.78 0l5.843-3.369v2.332a.08.08 0 01-.033.062L9.74 19.95a4.5 4.5 0 01-6.14-1.646zM2.34 7.896a4.485 4.485 0 012.366-1.973V11.6a.766.766 0 00.388.676l5.815 3.355-2.02 1.168a.076.076 0 01-.071 0l-4.83-2.786A4.504 4.504 0 012.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 01.071 0l4.83 2.791a4.494 4.494 0 01-.676 8.105v-5.678a.79.79 0 00-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 00-.785 0L9.409 9.23V6.897a.066.066 0 01.028-.061l4.83-2.787a4.5 4.5 0 016.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 01-.038-.057V6.075a4.5 4.5 0 017.375-3.453l-.142.08L8.704 5.46a.795.795 0 00-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
                </svg>
                OpenAI API Key
              </CardTitle>
              <CardDescription>
                For GPT-3.5, GPT-4, and other OpenAI models
              </CardDescription>
            </div>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              Get API Key
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasKey('openai') ? (
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {getKey('openai')?.masked_key}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Added {new Date(getKey('openai')!.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteKey('openai')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="openai-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="openai-key"
                    type={showOpenaiKey ? 'text' : 'password'}
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showOpenaiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                onClick={() => handleSaveKey('openai')}
                disabled={saving === 'openai'}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving === 'openai' ? 'Saving...' : 'Save OpenAI Key'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anthropic API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.47 12.55l-2.47-6.55h-2.39l-2.47 6.55H8.7l3.3-8.74h2.61l3.3 8.74h-1.44zm-7.8 0l-2.47-6.55H4.81l-2.47 6.55H.9l3.3-8.74h2.61l3.3 8.74H8.67zM21.09 18.05h2.61l-3.3-8.74h-1.44l-2.47 6.55h-1.44l3.3 8.74h2.61l-2.47-6.55h2.6z"/>
                </svg>
                Anthropic API Key
              </CardTitle>
              <CardDescription>
                For Claude 3 Opus, Sonnet, and Haiku models
              </CardDescription>
            </div>
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              Get API Key
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasKey('anthropic') ? (
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {getKey('anthropic')?.masked_key}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Added {new Date(getKey('anthropic')!.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteKey('anthropic')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="anthropic-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="anthropic-key"
                    type={showAnthropicKey ? 'text' : 'password'}
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showAnthropicKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                onClick={() => handleSaveKey('anthropic')}
                disabled={saving === 'anthropic'}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving === 'anthropic' ? 'Saving...' : 'Save Anthropic Key'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Note */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="pt-6">
          <div className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
            <Key className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white mb-1">Security & Privacy</p>
              <p>
                Your API keys are encrypted using AES-256-GCM encryption before being stored.
                They are only decrypted server-side when testing prompts and are never exposed to the client or logged.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
