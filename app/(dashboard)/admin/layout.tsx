import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/utils/admin'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is admin
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-700">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Admin Panel
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Manage your application, users, and revenue
        </p>
      </div>

      <AdminNav />

      <div className="mt-6">{children}</div>
    </div>
  )
}
