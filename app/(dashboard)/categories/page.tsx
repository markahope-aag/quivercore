import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getTypeLabel, CATEGORIES_BY_TYPE } from '@/lib/constants/categories'
import { Folder, FolderOpen } from 'lucide-react'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: prompts } = await supabase
    .from('prompts')
    .select('category, type')
    .eq('user_id', user.id)

  // Group by type, then by category
  const typeMap = new Map<string, Map<string, number>>()
  
  prompts?.forEach((prompt) => {
    if (prompt.category && prompt.type) {
      if (!typeMap.has(prompt.type)) {
        typeMap.set(prompt.type, new Map())
      }
      const categoryMap = typeMap.get(prompt.type)!
      const current = categoryMap.get(prompt.category) || 0
      categoryMap.set(prompt.category, current + 1)
    }
  })

  const types = ['ai_prompt', 'email_template', 'snippet', 'other']

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          Browse prompts organized by type and category
        </p>
      </div>

      {types.map((type) => {
        const categoryMap = typeMap.get(type) || new Map()
        const predefinedCategories = CATEGORIES_BY_TYPE[type] || []
        const hasPrompts = categoryMap.size > 0

        return (
          <div key={type} className="space-y-4">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">{getTypeLabel(type)}</h2>
              {hasPrompts && (
                <Badge variant="secondary">
                  {Array.from(categoryMap.values()).reduce((a, b) => a + b, 0)} prompt{Array.from(categoryMap.values()).reduce((a, b) => a + b, 0) !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {hasPrompts ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {predefinedCategories.map((category) => {
                  const count = categoryMap.get(category) || 0
                  if (count === 0) return null
                  
                  return (
                    <Link 
                      key={category} 
                      href={`/prompts?type=${type}&category=${encodeURIComponent(category)}`}
                    >
                      <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{category}</CardTitle>
                          <CardDescription>
                            {count} prompt{count !== 1 ? 's' : ''}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  )
                })}
                
                {/* Show custom categories that aren't in predefined list */}
                {Array.from(categoryMap.entries())
                  .filter(([cat]) => !predefinedCategories.includes(cat))
                  .map(([category, count]) => (
                    <Link 
                      key={category} 
                      href={`/prompts?type=${type}&category=${encodeURIComponent(category)}`}
                    >
                      <Card className="hover:bg-accent transition-colors cursor-pointer h-full border-dashed">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{category}</CardTitle>
                          <CardDescription>
                            {count} prompt{count !== 1 ? 's' : ''}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-6 text-center text-muted-foreground text-sm">
                  No prompts in this category yet
                </CardContent>
              </Card>
            )}
          </div>
        )
      })}
    </div>
  )
}

