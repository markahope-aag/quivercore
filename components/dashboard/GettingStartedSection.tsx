'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Sparkles, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export function GettingStartedSection() {
  const [totalPrompts, setTotalPrompts] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) throw new Error('Failed to load stats')
        const data = await response.json()
        setTotalPrompts(data.totalPrompts || 0)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  // Only show for new users (< 3 prompts)
  if (loading || totalPrompts === null || totalPrompts >= 3) {
    return null
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Welcome to QuiverCore!
        </CardTitle>
        <CardDescription>Get started in 3 simple steps</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-white">Choose Your Domain</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Select from Marketing, Technical Writing, Creative Content, and more.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-white">Pick a Framework</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Role-Based, Chain-of-Thought, Few-Shot, and 7 other proven frameworks.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-white">Apply Enhancements</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Use Verbalized Sampling and advanced enhancements for creative outputs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Link href="/builder">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Create Your First Prompt
            </Button>
          </Link>
          <Link href="/prompts?template=true">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Browse Templates
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

