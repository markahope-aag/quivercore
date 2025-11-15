import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopNav } from '@/components/top-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="flex-1 container py-6">
        {children}
      </main>
    </div>
  )
}

