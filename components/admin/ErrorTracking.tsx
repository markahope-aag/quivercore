'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Badge } from '@/components/ui/badge-v2'
import { Button } from '@/components/ui/button-v2'
import { AlertCircle, XCircle, CheckCircle } from 'lucide-react'

interface ErrorLog {
  id: string
  error_type: string
  error_message: string
  error_code: string
  created_at: string
  resolved: boolean
  user_id: string | null
}

export function ErrorTracking() {
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showResolved, setShowResolved] = useState(false)
  const [countsByType, setCountsByType] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchErrors()
  }, [showResolved])

  const fetchErrors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        resolved: showResolved.toString(),
        limit: '50',
      })
      const response = await fetch(`/api/admin/errors?${params}`)
      if (response.ok) {
        const data = await response.json()
        setErrors(data.errors || [])
        setCountsByType(data.countsByType || {})
      }
    } catch (error) {
      console.error('Failed to fetch errors:', error)
    } finally {
      setLoading(false)
    }
  }

  const markResolved = async (errorId: string) => {
    try {
      await fetch('/api/admin/errors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorId, resolved: true }),
      })
      fetchErrors()
    } catch (error) {
      console.error('Failed to mark error as resolved:', error)
    }
  }

  if (loading && errors.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading errors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(countsByType).map(([type, count]) => (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{type.replace('_', ' ')}</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{count}</div>
              <p className="text-xs text-muted-foreground">unresolved</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={!showResolved ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowResolved(false)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Unresolved
            </Button>
            <Button
              variant={showResolved ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowResolved(true)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Resolved
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Errors List */}
      <Card>
        <CardHeader>
          <CardTitle>Error Logs</CardTitle>
          <CardDescription>Recent application errors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {errors.map((error) => (
              <div
                key={error.id}
                className="border-b border-slate-200 pb-4 last:border-0 dark:border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">{error.error_type}</Badge>
                      {error.error_code && (
                        <Badge variant="outline">{error.error_code}</Badge>
                      )}
                      {error.resolved && (
                        <Badge variant="secondary">Resolved</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-medium">{error.error_message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(error.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!error.resolved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markResolved(error.id)}
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {errors.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                {showResolved ? 'No resolved errors' : 'No unresolved errors'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
