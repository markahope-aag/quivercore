'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge-v2'
import { Plus, Zap, ToggleLeft, ToggleRight } from 'lucide-react'

interface FeatureFlag {
  id: string
  flag_key: string
  name: string
  description: string
  is_enabled: boolean
  rollout_percentage: number
  created_at: string
}

export function FeatureFlagManagement() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState({
    flagKey: '',
    name: '',
    description: '',
    isEnabled: true,
    rolloutPercentage: 100,
  })

  useEffect(() => {
    fetchFlags()
  }, [])

  const fetchFlags = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/feature-flags')
      if (response.ok) {
        const data = await response.json()
        setFlags(data.featureFlags || [])
      }
    } catch (error) {
      console.error('Failed to fetch feature flags:', error)
    } finally {
      setLoading(false)
    }
  }

  const createFlag = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowCreate(false)
        setFormData({
          flagKey: '',
          name: '',
          description: '',
          isEnabled: true,
          rolloutPercentage: 100,
        })
        fetchFlags()
      }
    } catch (error) {
      console.error('Failed to create feature flag:', error)
    }
  }

  const toggleFlag = async (flagId: string, currentState: boolean) => {
    try {
      await fetch('/api/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: flagId,
          is_enabled: !currentState,
        }),
      })
      fetchFlags()
    } catch (error) {
      console.error('Failed to toggle feature flag:', error)
    }
  }

  if (loading && flags.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading feature flags...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>Control feature rollouts and A/B testing</CardDescription>
            </div>
            <Button onClick={() => setShowCreate(!showCreate)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Flag
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Create Form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Feature Flag</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createFlag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Flag Key</label>
                <input
                  type="text"
                  value={formData.flagKey}
                  onChange={(e) => setFormData({...formData, flagKey: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                  placeholder="new_feature_enabled"
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="New Feature"
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description of the feature..."
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rollout Percentage: {formData.rolloutPercentage}%
                </label>
                <input
                  type="range"
                  value={formData.rolloutPercentage}
                  onChange={(e) => setFormData({...formData, rolloutPercentage: parseInt(e.target.value)})}
                  min="0"
                  max="100"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Percentage of users who will see this feature
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Flag</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Flags List */}
      <Card>
        <CardHeader>
          <CardTitle>All Feature Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flags.map((flag) => (
              <div
                key={flag.id}
                className="flex items-start justify-between border-b border-slate-200 pb-4 last:border-0 dark:border-slate-700"
              >
                <div className="flex items-start gap-3 flex-1">
                  <Zap className={`h-5 w-5 mt-0.5 ${flag.is_enabled ? 'text-green-600' : 'text-slate-400'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{flag.name}</p>
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {flag.flag_key}
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {flag.is_enabled ? (
                        <Badge variant="default">Enabled</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                      <Badge variant="outline">{flag.rollout_percentage}% rollout</Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFlag(flag.id, flag.is_enabled)}
                >
                  {flag.is_enabled ? (
                    <ToggleRight className="h-6 w-6 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-slate-400" />
                  )}
                </Button>
              </div>
            ))}
            {flags.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No feature flags created yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
