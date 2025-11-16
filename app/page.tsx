import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

export default async function Home() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      logger.warn('Auth error on home page', error)
      redirect('/login')
    }

    if (user) {
      redirect('/dashboard')
    } else {
      redirect('/login')
    }
  } catch (error: unknown) {
    logger.error('Home page error', error)
    redirect('/login')
  }
}
