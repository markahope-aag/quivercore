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

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/revenue', label: 'Revenue', icon: DollarSign },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/admin/errors', label: 'Errors', icon: AlertCircle },
  { href: '/admin/emails', label: 'Emails', icon: Mail },
  { href: '/admin/promo-codes', label: 'Promo Codes', icon: Tag },
  { href: '/admin/feature-flags', label: 'Feature Flags', icon: Zap },
  { href: '/admin/testing', label: 'Testing', icon: FlaskConical },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-1 border-b border-slate-200 dark:border-slate-700">
      {navItems.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
