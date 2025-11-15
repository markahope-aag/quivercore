import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

  // Group by category
  const categoryMap = new Map<string, { count: number; types: Set<string> }>()
  
  prompts?.forEach((prompt) => {
    if (prompt.category) {
      const existing = categoryMap.get(prompt.category) || { count: 0, types: new Set<string>() }
      existing.count++
      existing.types.add(prompt.type)
      categoryMap.set(prompt.category, existing)
    }
  })

  const categories = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      name: category,
      count: data.count,
      types: Array.from(data.types),
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          Browse prompts by category
        </p>
      </div>
      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No categories yet. Create prompts with categories to organize them.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.name} href={`/prompts?category=${encodeURIComponent(category.name)}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>
                    {category.count} prompt{category.count !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.types.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

