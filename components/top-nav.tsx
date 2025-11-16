'use client'

import Link from 'next/link'
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center">
        {/* Logo/Brand */}
        <div className="mr-8">
          <Link href="/prompts" className="flex items-center space-x-2">
            <span className="font-bold text-xl">QuiverCore</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
          <Link
            href="/prompts"
            className="transition-colors hover:text-foreground/80 text-foreground"
          >
            Prompts
          </Link>
          <Link
            href="/builder"
            className="transition-colors hover:text-foreground/80 text-foreground"
          >
            Builder
          </Link>
          <Link
            href="/pricing"
            className="transition-colors hover:text-foreground/80 text-foreground"
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
