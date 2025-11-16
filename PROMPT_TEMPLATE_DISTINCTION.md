# Prompt vs Template Distinction

## Overview
QuiverCore distinguishes between **Prompts** and **Templates** based on the presence of variables, providing users with both specific ready-to-use prompts and flexible reusable templates.

## Definitions

### Prompts (Specific)
- **No variables**: Complete, ready to use as-is
- **Specific use case**: Crafted for a particular purpose
- **One-click execution**: Can be used immediately without customization
- **Example**: "Write a technical blog post about Next.js 15 App Router best practices for senior developers"

### Templates (Reusable)
- **Contains variables**: Uses `{{variable_name}}` syntax
- **Flexible**: Can be customized for different scenarios
- **Reusable pattern**: Same structure, different details each time
- **Example**: "Write a product description for {{product_name}} targeting {{audience}} with a {{tone}} tone"

## Database Schema

### New Fields

#### `source` field
```sql
source text NOT NULL DEFAULT 'user'
CHECK (source IN ('user', 'app', 'community', 'third-party'))
```

**Values:**
- `user` - Created by the user (default)
- `app` - Official QuiverCore templates
- `community` - Shared by community users
- `third-party` - Imported from external sources

#### `variables` field (existing)
```sql
variables jsonb
```
- Stores variable definitions and default values
- Automatically extracted from content using `{{variable_name}}` syntax
- When present and non-empty, indicates the item is a Template

## Detection Logic

```typescript
// Check if prompt is a template
const isTemplate = prompt.variables &&
                   Object.keys(prompt.variables).length > 0

// Check if prompt is specific
const isPrompt = !prompt.variables ||
                 Object.keys(prompt.variables).length === 0
```

## UI Components

### Add Prompt Menu
Now includes 4 options:
1. **Use Builder** - Create with AI frameworks & enhancements
2. **Create Prompt** - Write a specific, ready-to-use prompt
3. **Create Template** - Create a reusable template with variables
4. **Import Template** - Import from JSON or CSV format

### Create New Template Page
- Special header with orange FileCode icon
- Info banner explaining variable syntax
- Example usage shown to users
- Form accepts `isTemplate` prop

### Visual Indicators
- **Templates**: Orange FileCode icon
- **Prompts**: Green Edit3 icon
- Badge showing source (user/app/community/third-party)

## Variable Syntax

Users create variables using double curly braces:
```
{{variable_name}}
```

### Examples

**Template:**
```
Write a {{content_type}} about {{topic}} for {{target_audience}}
using a {{tone}} tone. Include {{key_points}}.
```

**Variables extracted:**
- content_type
- topic
- target_audience
- tone
- key_points

**Prompt (no variables):**
```
Write a technical blog post about Next.js 15 best practices for
senior developers. Include code examples and performance tips.
```

## Future Enhancements

### Filtering
- Filter by source (user/app/community/third-party)
- Separate tabs for Templates vs Prompts
- Search within templates

### Template Library
- Official QuiverCore templates (source: 'app')
- Community-shared templates (source: 'community')
- Import from popular sources (source: 'third-party')

### Variable Management
- Default values for variables
- Variable types (text, number, select)
- Validation rules
- Suggested values

## Migration

The migration file `20250117_add_prompt_source.sql` adds:
- `source` column with check constraint
- Index on source for efficient filtering
- Index for detecting templates (variables field)
- Default value 'user' for existing records
