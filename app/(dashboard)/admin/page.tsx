import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/utils/admin'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  // Check if user is admin
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect('/')
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-700">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Manage users, view analytics, and monitor system health
        </p>
      </div>

      <AdminDashboard />
    </div>
  )
}
