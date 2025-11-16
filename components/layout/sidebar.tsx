/**
 * Professional Sidebar Navigation
 * Enterprise-grade sidebar with proper navigation and user menu
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  CreditCard,
  Settings,
  LogOut,
  User,
  Shield,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

const navigation = [
  { name: 'Prompt Builder', href: '/builder', icon: Sparkles },
  { name: 'Prompt Library', href: '/prompts', icon: FileText },
]

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = React.useState<any>(null)
  const [isAdmin, setIsAdmin] = React.useState(false)

  React.useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Check if user is admin
      if (user) {
        const { data } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', user.id)
          .single()

        setIsAdmin(!!data)
      }
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
        <Link href="/prompts" className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 opacity-20"></div>
            {/* Inner icon */}
            <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-blue-500 shadow-sm">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <span className="text-lg font-semibold text-slate-900 dark:text-white">QuiverCore</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col">
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  'hover:scale-[1.02]',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Navigation */}
        <nav className="space-y-1 border-t border-slate-200 px-3 py-4 dark:border-slate-800">
          {/* Admin Link - Only show for admin users */}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
                'hover:scale-[1.02]',
                pathname === '/admin' || pathname?.startsWith('/admin/')
                  ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'
                  : 'text-slate-700 hover:bg-red-50 hover:text-red-700 dark:text-slate-300 dark:hover:bg-red-950 dark:hover:text-red-400'
              )}
              aria-current={pathname === '/admin' || pathname?.startsWith('/admin/') ? 'page' : undefined}
            >
              <Shield
                className={cn(
                  'h-5 w-5 transition-colors',
                  pathname === '/admin' || pathname?.startsWith('/admin/')
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400'
                )}
              />
              Admin Panel
              <Badge variant="destructive" className="ml-auto text-xs">ADMIN</Badge>
            </Link>
          )}

          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                  'hover:scale-[1.02]',
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User Menu */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3"
              aria-label="User menu"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-sm font-medium text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Free Plan</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

