'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Sparkles, FileText, Search, Layout, Settings, Book } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    name: 'Prompt Builder',
    description: 'Create prompts with advanced frameworks',
    icon: Sparkles,
    href: '/builder',
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    name: 'Prompt Library',
    description: 'Browse and manage your prompts',
    icon: FileText,
    href: '/prompts',
    color: 'text-green-600 dark:text-green-400',
  },
  {
    name: 'Search',
    description: 'Find prompts by content or tags',
    icon: Search,
    href: '/search',
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    name: 'Templates',
    description: 'Browse template library',
    icon: Layout,
    href: '/prompts?template=true',
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
        <div className="space-y-2">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.name}
                href={feature.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className={`${feature.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{feature.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

