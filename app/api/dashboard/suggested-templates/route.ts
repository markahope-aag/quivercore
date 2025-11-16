import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'
import { unstable_cache } from 'next/cache'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKey = 'dashboard-suggested-templates'
    
    const getTemplates = unstable_cache(
      async () => {
        // Get popular templates (by usage count or most recent)
        const { data: templates } = await supabase
          .from('prompts')
          .select('id, title, description, use_case, framework, tags, usage_count')
          .eq('is_template', true)
          .eq('archived', false)
          .order('usage_count', { ascending: false })
          .limit(6)

        return { templates: templates || [] }
      },
      [cacheKey],
      {
        revalidate: 600, // 10 minutes
        tags: ['dashboard-templates'],
      }
    )

    const result = await getTemplates()
    return NextResponse.json(result)
  } catch (error) {
    logger.error('Dashboard templates error', error)
    const appError = handleError(error)
    return NextResponse.json({ error: appError.message }, { status: appError.statusCode })
  }
}
