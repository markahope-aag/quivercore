'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Sparkles, FileText, Search, Layout, Settings, Book } from 'lucide-react'
import Link from 'next/link'

const quickAccessItems = [
  {
    name: 'Prompt Builder',
    description: 'Create prompts with advanced frameworks',
    icon: Sparkles,
    href: '/builder',
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    name: 'Prompt Library',
    description: 'Browse and manage your prompts',
    icon: FileText,
    href: '/prompts',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    name: 'Search',
    description: 'Find prompts by content or tags',
    icon: Search,
    href: '/search',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    name: 'Templates',
    description: 'Browse template library',
    icon: Layout,
    href: '/prompts?is_template=true',
    color: 'text-orange-600 dark:text-orange-400',
  },
  {
    name: 'Settings',
    description: 'Manage account and preferences',
    icon: Settings,
    href: '/settings',
    color: 'text-slate-600 dark:text-slate-400',
  },
]

export function QuickAccessSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Access</CardTitle>
        <CardDescription>Fast navigation to key features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {quickAccessItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <Icon className={`h-5 w-5 ${item.color} group-hover:scale-110 transition-transform`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {item.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
