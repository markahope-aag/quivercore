'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Sparkles, FileText, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function GettingStartedSection() {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Welcome to QuiverCore! 🎉
        </CardTitle>
        <CardDescription>Get started in 3 simple steps</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-800">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Choose Your Use-Case
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Select from Marketing, Technical Writing, Creative Content, and more.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-800">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Pick a Framework
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Role-Based, Chain-of-Thought, Few-Shot, and 7 other proven frameworks.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-800">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Apply Enhancements
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Use Verbalized Sampling and advanced enhancements for creative outputs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/builder">
            <Button className="gap-2">
              Create Your First Asset
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
