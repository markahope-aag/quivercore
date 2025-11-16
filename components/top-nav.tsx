'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'

export function TopNav() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgb(var(--legacy-grey))]/10 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
        {/* Logo/Brand */}
        <div className="mr-8">
          <Link href="/prompts" className="flex items-center space-x-3 group">
            <Image
              src="/logo.svg"
              alt="QuiverCore Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-bold text-xl text-[rgb(var(--graphite))] dark:text-white tracking-tight">
              QuiverCore
            </span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex items-center space-x-1 text-sm font-medium flex-1">
          <Link
            href="/prompts"
            className="px-4 py-2 rounded-sm transition-colors hover:bg-[rgb(var(--gold))]/10 text-[rgb(var(--legacy-grey))] hover:text-[rgb(var(--graphite))] dark:hover:text-white"
          >
            Prompts
          </Link>
          <Link
            href="/builder"
            className="px-4 py-2 rounded-sm transition-colors hover:bg-[rgb(var(--gold))]/10 text-[rgb(var(--legacy-grey))] hover:text-[rgb(var(--graphite))] dark:hover:text-white"
          >
            Builder
          </Link>
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-sm transition-colors hover:bg-[rgb(var(--gold))]/10 text-[rgb(var(--legacy-grey))] hover:text-[rgb(var(--graphite))] dark:hover:text-white"
          >
            Pricing
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <Link href="/prompts/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Prompt
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                <span className="sr-only">User menu</span>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium">U</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
