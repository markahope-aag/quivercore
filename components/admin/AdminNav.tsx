'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Tag,
  Mail,
  Zap,
  FlaskConical,
} from 'lucide-react'

const primaryNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/admin/revenue', label: 'Revenue', icon: DollarSign },
  { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
]

const secondaryNavItems = [
  { href: '/admin/email-management', label: 'Email', icon: Mail },
  { href: '/admin/promo-codes', label: 'Promo Codes', icon: Tag },
  { href: '/admin/feature-flags', label: 'Features', icon: Zap },
  { href: '/admin/errors', label: 'Errors', icon: AlertCircle },
  { href: '/admin/testing', label: 'Testing', icon: FlaskConical },
]

export function AdminNav() {
  const pathname = usePathname()

  const renderNavItems = (items: typeof primaryNavItems) => {
    return items.map((item) => {
      const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href)
      const Icon = item.icon

      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all',
            isActive
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'
          )}
        >
          <Icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      )
    })
  }

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="space-y-3">
        {/* Primary Navigation Row */}
        <div className="flex flex-wrap gap-2">
          {renderNavItems(primaryNavItems)}
        </div>

        {/* Secondary Navigation Row */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          {renderNavItems(secondaryNavItems)}
        </div>
      </div>
    </nav>
  )
}
