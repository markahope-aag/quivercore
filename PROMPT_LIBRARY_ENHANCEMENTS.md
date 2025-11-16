# Prompt Library Enhancement Plan

## Current State ✅

### Existing Features:
1. **Manual Prompt Creation** - `/prompts/new` page with PromptForm component
2. **Prompt Library** - `/prompts` page with filtering and search
3. **Database Schema** - Comprehensive prompt fields including:
   - Basic: title, description, content
   - Categorization: use_case, framework, enhancement_technique, tags
   - Metadata: usage_count, is_favorite, created_at, updated_at
   - NEW: archived, last_used_at (migration created)

4. **Search & Filter** - Server-side search by title/description/content, filter by use_case, framework, tags, favorites

## Enhancements Needed 🔧

### 1. Enhanced Prompt Display
**File**: `components/prompts/prompt-card.tsx`

Add to card display:
- Last used date with relative time ("Used 2 days ago")
- Usage count prominently displayed
- Preview of first 150 characters of content
- Visual indicators for framework type (icon + color)
- Tags displayed as chips
- Quick action buttons:
  - Copy to clipboard
  - Duplicate
  - Archive/Delete

### 2. Archive Functionality
**Files**:
- `app/api/prompts/[id]/route.ts` - Add PATCH endpoint for archiving
- `components/prompts/prompt-card.tsx` - Add archive button
- `components/prompts/prompt-filters.tsx` - Add "Show Archived" toggle

Implementation:
```typescript
// Archive endpoint
PATCH /api/prompts/[id]
Body: { archived: true }

// Filter UI
<Toggle> Show Archived </Toggle>
```

### 3. Last Used Tracking
**Files**:
- `app/api/prompts/[id]/use/route.ts` - New endpoint to track usage
- When user copies/uses a prompt, call this endpoint

Implementation:
```typescript
// Usage tracking endpoint
POST /api/prompts/[id]/use
Updates: {
  usage_count: increment,
  last_used_at: now()
}
```

### 4. Save from Prompt Builder
**File**: `components/prompt-builder/steps/PreviewExecuteStep.tsx`

Add "Save to Library" button after generating prompt:
- Pre-fills form with generated prompt
- Includes framework, enhancements used
- Suggested title based on target outcome
- Tags auto-generated from configuration

### 5. Enhanced Search
**File**: `app/(dashboard)/prompts/page.tsx`

Additional search capabilities:
- Search by context (use_case matches)
- Filter by date ranges (created, last_used)
- Sort options:
  - Most recent
  - Most used
  - Recently used
  - Alphabetical

### 6. Bulk Actions
**File**: `components/prompts/prompt-list.tsx`

Add checkbox selection for:
- Bulk archive
- Bulk delete
- Bulk tag editing
- Export selected prompts

## Database Migrations

### Migration: `20250115000000_add_prompt_archive_and_usage.sql`
✅ Created - adds `archived` and `last_used_at` fields

### Run Migration:
```bash
cd supabase
supabase db push
```

## API Endpoints to Create/Update

### 1. Archive Prompt
```typescript
// app/api/prompts/[id]/archive/route.ts
PATCH - Toggle archive status
```

### 2. Track Usage
```typescript
// app/api/prompts/[id]/use/route.ts
POST - Increment usage_count, update last_used_at
```

### 3. Duplicate Prompt
```typescript
// app/api/prompts/[id]/duplicate/route.ts
POST - Create copy of prompt
```

### 4. Bulk Operations
```typescript
// app/api/prompts/bulk/route.ts
POST - Archive/delete/tag multiple prompts
Body: { action: 'archive' | 'delete' | 'tag', prompt_ids: string[], tags?: string[] }
```

## UI Components to Enhance

### 1. Prompt Card
**Location**: `components/prompts/prompt-card.tsx`

Add:
- Content preview (first 150 chars)
- Last used indicator
- Framework badge with icon
- Quick copy button
- Archive button
- Duplicate button

### 2. Prompt Filters
**Location**: `components/prompts/prompt-filters.tsx`

Add:
- "Show Archived" toggle
- Date range filters
- Sort by dropdown (recent, most used, etc.)

### 3. Prompt Detail View
**Location**: `app/(dashboard)/prompts/[id]/page.tsx`

Enhance with:
- Full prompt content with syntax highlighting
- Usage statistics section
- Version history (if implemented)
- Related prompts suggestion
- "Use this prompt" button (tracks usage)

### 4. Save from Builder Dialog
**Location**: `components/prompt-builder/SaveToLibraryDialog.tsx` (NEW)

Features:
- Modal dialog with form
- Pre-filled from generated prompt
- Title, description, tags fields
- Category selection
- Save & view or Save & close options

## Implementation Priority

### Phase 1 (Core Functionality) - HIGH PRIORITY
1. ✅ Database migration (archived, last_used_at)
2. ✅ Update TypeScript types
3. Archive API endpoint
4. Enhanced prompt card display
5. "Show Archived" filter

### Phase 2 (Usage Tracking) - MEDIUM PRIORITY
1. Usage tracking API endpoint
2. "Last used" display on cards
3. Update when prompt is copied/used
4. Sort by "Recently Used"

### Phase 3 (Builder Integration) - MEDIUM PRIORITY
1. "Save to Library" button in PreviewExecuteStep
2. SaveToLibraryDialog component
3. Auto-generate metadata from builder config

### Phase 4 (Advanced Features) - LOWER PRIORITY
1. Bulk actions (select multiple prompts)
2. Duplicate prompt functionality
3. Export prompts (JSON, CSV)
4. Related prompts suggestions

## Example Code Snippets

### Archive Button in Prompt Card
```typescript
const handleArchive = async () => {
  const response = await fetch(`/api/prompts/${prompt.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ archived: !prompt.archived }),
  })
  if (response.ok) {
    toast.success(prompt.archived ? 'Unarchived' : 'Archived')
    router.refresh()
  }
}

<Button onClick={handleArchive} variant="outline" size="sm">
  {prompt.archived ? <ArchiveRestore /> : <Archive />}
  {prompt.archived ? 'Unarchive' : 'Archive'}
</Button>
```

### Usage Tracking on Copy
```typescript
const handleCopy = async () => {
  navigator.clipboard.writeText(prompt.content)

  // Track usage
  await fetch(`/api/prompts/${prompt.id}/use`, { method: 'POST' })

  toast.success('Copied to clipboard')
}
```

### Last Used Display
```typescript
import { formatDistanceToNow } from 'date-fns'

{prompt.last_used_at && (
  <p className="text-xs text-slate-500">
    Used {formatDistanceToNow(new Date(prompt.last_used_at), { addSuffix: true })}
  </p>
)}
```

## Next Steps

1. Run database migration
2. Implement archive API endpoint
3. Enhance prompt card component
4. Add "Show Archived" filter
5. Implement usage tracking
6. Add "Save to Library" to builder

This will transform QuiverCore into a powerful prompt management system!
