import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/utils/admin'
import { EnhancementTestRunner } from '@/components/admin/EnhancementTestRunner'

export default async function AdminTestingPage() {
  // Check if user is admin
  const adminStatus = await isAdmin()

  if (!adminStatus) {
    redirect('/')
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-700">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Enhancement Testing
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Test and validate advanced enhancements, combinations, and prompt quality
        </p>
      </div>

      <EnhancementTestRunner />
    </div>
  )
}
