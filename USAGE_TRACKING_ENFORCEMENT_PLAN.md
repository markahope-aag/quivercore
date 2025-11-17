# Usage Tracking & Enforcement Plan

## Executive Summary

This document outlines the comprehensive strategy for measuring, monitoring, and limiting feature usage across QuiverCore to enforce subscription plan limits and protect our value proposition.

## Current State

### What We Have
1. **Database Tables**:
   - `usage_tracking` table with fields: `user_id`, `metric_type`, `count`, `period_start`, `period_end`, `metadata`
   - Helper functions: `get_user_usage()`, `get_user_subscription()`

2. **Current Metric Types** (limited):
   - `prompt_execution` (not currently tracked)
   - `prompt_created` (not currently tracked)
   - `api_call` (not currently tracked)

3. **Subscription Features** (defined but not enforced):
   - `monthly_prompts`: Number of AI Prompt Builder uses per month
   - `verbalized_sampling`: VS patterns allowed
   - `framework_library`: Number of frameworks
   - `template_library`: Access level to templates
   - `advanced_enhancements`: Boolean flag
   - Storage limits: 100/250/500 prompts (display only, not enforced)

### What We DON'T Have
- ❌ No tracking when users use AI Prompt Builder
- ❌ No tracking when users use specific VS patterns
- ❌ No tracking when users use frameworks
- ❌ No tracking when users use enhancements
- ❌ No tracking when users access templates
- ❌ No enforcement preventing users from exceeding limits
- ❌ No UI showing usage meters/progress
- ❌ No upgrade prompts when limits are hit

---

## Feature Usage Tracking Strategy

### 1. Prompt Storage Limits
**What to Track**: Total number of prompts/templates stored by user

**Implementation**:
```sql
-- Add to existing query on prompt creation
SELECT COUNT(*) FROM prompts WHERE user_id = $1 AND is_archived = false
```

**Enforcement Point**: `app/api/prompts/route.ts` (POST)

**Limit Check**:
- Explorer: 100 prompts/templates
- Researcher: 250 prompts/templates
- Strategist: 500 prompts/templates

**User Experience**:
- Block creation when limit reached
- Show modal: "Storage Limit Reached - Upgrade to [next tier] to store more prompts"
- Display progress: "95/100 prompts used" in UI

---

### 2. AI Prompt Builder Usage
**What to Track**: Number of times user generates a prompt using the AI Prompt Builder

**Metric Type**: `prompt_builder_use`

**Current Limits**:
- Explorer: 50 uses/month
- Researcher: 100 uses/month
- Strategist: Unlimited (-1)

**Implementation Location**:
- `lib/contexts/PromptBuilderContext.tsx` or
- Backend API endpoint that handles prompt generation

**Enforcement Point**: Before generating the prompt

**User Experience**:
- Show usage meter: "45/50 AI Builder uses this month"
- When limit reached: "Monthly limit reached. Upgrade to get more uses."
- Reset monthly on billing cycle date

**Metadata to Track**:
```json
{
  "feature": "prompt_builder",
  "framework_used": "chain-of-thought",
  "enhancement_used": "verbalized_sampling",
  "vs_pattern": "broad_spectrum"
}
```

---

### 3. Verbalized Sampling Usage
**What to Track**: Which VS patterns user has access to and uses

**Available Patterns**:
- `broad_spectrum`: Full range from common to rare ideas
- `rarity_hunt`: Unconventional, low-probability options
- `balanced_categories`: Equal coverage across dimensions

**Current Limits**:
- Explorer: 0 patterns (not included)
- Researcher: 1 pattern
- Strategist: All 3 patterns

**Implementation**:
- Check plan features before allowing pattern selection in UI
- Disable unavailable patterns in dropdown/selector
- Track which pattern was used in `usage_tracking` metadata

**Enforcement Point**:
- `components/builder/VSEnhancementStep.tsx` - disable options
- Backend validation before processing

**User Experience**:
- Grey out unavailable patterns with lock icon
- Tooltip: "Upgrade to Strategist to unlock all VS patterns"

---

### 4. Framework Library Access
**What to Track**: Which frameworks user has access to

**Framework Count Limits**:
- Explorer: Not included (0 frameworks)
- Researcher: 5 frameworks
- Strategist: Unlimited (all 10 frameworks)

**Available Frameworks**:
1. Role-Based Prompting
2. Few-Shot Learning
3. Chain-of-Thought
4. Template/Fill-in-the-Blank
5. Constraint-Based
6. Iterative/Multi-Turn
7. Comparative Analysis
8. Transformation
9. Analytical Decomposition
10. Generative Ideation

**Implementation**:
- Filter framework list based on plan in UI
- Track which framework was used in metadata
- Show "upgrade to unlock" for restricted frameworks

**Enforcement Point**:
- `components/builder/FrameworkConfigStep.tsx`
- Backend validation

**User Experience**:
- Show first 5 frameworks as available for Researcher
- Lock remaining 5 with upgrade prompt
- Strategist sees all unlocked

---

### 5. Advanced Enhancements
**What to Track**: Whether user has access to advanced enhancement features

**Current Limits**:
- Explorer: Not included (false)
- Researcher: Included (true)
- Strategist: Included (true)

**Implementation**:
- Hide/disable advanced enhancement options for Explorer plan
- Track enhancement usage in metadata

**Enforcement Point**:
- UI components for enhancements
- Backend validation

---

### 6. Template Library Access
**What to Track**: User's access level to community/curated templates

**Access Levels**:
- `none`: Cannot view or use templates
- `view`: Can view and copy templates (read-only)
- `full`: Can view, copy, and create templates
- `unlimited`: Full access + can share publicly

**Current Limits**:
- Explorer: `view` (can browse and copy)
- Researcher: `full` (can create own templates)
- Strategist: `unlimited` (can share publicly)

**Implementation**:
- Filter template actions based on access level
- Hide "Create Template" button for view-only users
- Hide "Share Publicly" for non-unlimited users

**Enforcement Point**:
- `app/(dashboard)/templates/page.tsx`
- Template creation API endpoint

---

## Database Schema Updates

### Expand `metric_type` enum:
```sql
-- Migration: Add new metric types
ALTER TABLE usage_tracking
  DROP CONSTRAINT IF EXISTS usage_tracking_metric_type_check;

ALTER TABLE usage_tracking
  ADD CONSTRAINT usage_tracking_metric_type_check
  CHECK (metric_type IN (
    'prompt_execution',      -- Existing: prompt tested
    'prompt_created',        -- Existing: new prompt saved
    'api_call',              -- Existing: API usage
    'prompt_builder_use',    -- NEW: AI Prompt Builder used
    'vs_pattern_use',        -- NEW: Verbalized Sampling pattern used
    'framework_use',         -- NEW: Framework selected
    'enhancement_use',       -- NEW: Enhancement applied
    'template_created',      -- NEW: Template created
    'template_accessed',     -- NEW: Template viewed/copied
    'export_used',           -- NEW: Export feature used
    'storage_count'          -- NEW: Current storage count snapshot
  ));
```

### Add Indexes for Performance:
```sql
-- Index for fast usage lookups
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_metric_period
  ON usage_tracking(user_id, metric_type, period_start, period_end);

-- Index for monthly aggregations
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at
  ON usage_tracking(created_at DESC);
```

---

## API Utilities for Usage Tracking

### 1. Track Usage Helper Function
**Location**: `lib/utils/usage-tracker.ts`

```typescript
interface TrackUsageParams {
  userId: string
  metricType: 'prompt_builder_use' | 'vs_pattern_use' | 'framework_use' | 'enhancement_use' | 'template_created' | 'template_accessed' | 'export_used'
  metadata?: Record<string, unknown>
}

export async function trackUsage({ userId, metricType, metadata }: TrackUsageParams) {
  const supabase = await createClient()

  // Get current billing period from user subscription
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('current_period_start, current_period_end')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (!subscription) {
    throw new Error('No active subscription found')
  }

  // Insert usage record
  await supabase.from('usage_tracking').insert({
    user_id: userId,
    metric_type: metricType,
    count: 1,
    period_start: subscription.current_period_start,
    period_end: subscription.current_period_end,
    metadata,
  })
}
```

### 2. Check Usage Limit Helper Function
**Location**: `lib/utils/usage-checker.ts`

```typescript
interface CheckLimitParams {
  userId: string
  feature: 'prompt_builder' | 'storage' | 'vs_patterns' | 'frameworks'
}

interface CheckLimitResult {
  allowed: boolean
  current: number
  limit: number
  remaining: number
  upgradeRequired: boolean
  nextPlan?: string
}

export async function checkUsageLimit({ userId, feature }: CheckLimitParams): Promise<CheckLimitResult> {
  const supabase = await createClient()

  // Get user's subscription and plan features
  const { data } = await supabase.rpc('get_user_subscription', { p_user_id: userId })

  if (!data || data.length === 0) {
    throw new Error('No active subscription found')
  }

  const { features, current_period_start, current_period_end } = data[0]

  // Feature-specific logic
  switch (feature) {
    case 'prompt_builder': {
      const limit = features.monthly_prompts
      if (limit === -1) return { allowed: true, current: 0, limit: -1, remaining: -1, upgradeRequired: false }

      // Count usage in current period
      const { data: usage } = await supabase.rpc('get_user_usage', {
        p_user_id: userId,
        p_metric_type: 'prompt_builder_use',
        p_period_start: current_period_start,
        p_period_end: current_period_end,
      })

      const current = usage || 0
      const remaining = Math.max(0, limit - current)

      return {
        allowed: current < limit,
        current,
        limit,
        remaining,
        upgradeRequired: current >= limit,
        nextPlan: current >= limit ? getNextPlan(data[0].plan_name) : undefined,
      }
    }

    case 'storage': {
      // Count total prompts (not by period)
      const { count } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_archived', false)

      const current = count || 0
      const limit = getStorageLimit(data[0].plan_name)
      const remaining = Math.max(0, limit - current)

      return {
        allowed: current < limit,
        current,
        limit,
        remaining,
        upgradeRequired: current >= limit,
        nextPlan: current >= limit ? getNextPlan(data[0].plan_name) : undefined,
      }
    }

    case 'vs_patterns': {
      const allowedPatterns = features.verbalized_sampling?.patterns || []
      return {
        allowed: allowedPatterns.length > 0,
        current: allowedPatterns.length,
        limit: 3,
        remaining: 3 - allowedPatterns.length,
        upgradeRequired: allowedPatterns.length === 0,
      }
    }

    case 'frameworks': {
      const limit = features.framework_library?.count || 0
      return {
        allowed: limit > 0 || limit === -1,
        current: limit === -1 ? 10 : limit,
        limit: limit === -1 ? 10 : limit,
        remaining: limit === -1 ? 0 : Math.max(0, 10 - limit),
        upgradeRequired: limit === 0,
      }
    }
  }
}

function getStorageLimit(planName: string): number {
  switch (planName) {
    case 'explorer': return 100
    case 'researcher': return 250
    case 'strategist': return 500
    default: return 100
  }
}

function getNextPlan(currentPlan: string): string {
  switch (currentPlan) {
    case 'explorer': return 'researcher'
    case 'researcher': return 'strategist'
    default: return 'strategist'
  }
}
```

---

## UI Components for Usage Display

### 1. Usage Meter Component
**Location**: `components/usage/usage-meter.tsx`

```typescript
interface UsageMeterProps {
  current: number
  limit: number // -1 for unlimited
  feature: string
  upgradeLink?: string
}

export function UsageMeter({ current, limit, feature, upgradeLink }: UsageMeterProps) {
  if (limit === -1) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600">
        <Check className="h-4 w-4" />
        <span>Unlimited {feature}</span>
      </div>
    )
  }

  const percentage = Math.min(100, (current / limit) * 100)
  const isNearLimit = percentage >= 80
  const isAtLimit = current >= limit

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{feature}</span>
        <span className={cn(
          isAtLimit && "text-red-600 font-semibold",
          isNearLimit && !isAtLimit && "text-yellow-600",
        )}>
          {current} / {limit}
        </span>
      </div>

      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300",
            isAtLimit && "bg-red-500",
            isNearLimit && !isAtLimit && "bg-yellow-500",
            !isNearLimit && "bg-emerald-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isAtLimit && upgradeLink && (
        <Button asChild size="sm" variant="outline" className="w-full">
          <Link href={upgradeLink}>
            <ArrowUp className="mr-2 h-4 w-4" />
            Upgrade to get more
          </Link>
        </Button>
      )}
    </div>
  )
}
```

### 2. Feature Lock Component
**Location**: `components/usage/feature-lock.tsx`

```typescript
interface FeatureLockProps {
  locked: boolean
  featureName: string
  requiredPlan: string
  children: React.ReactNode
}

export function FeatureLock({ locked, featureName, requiredPlan, children }: FeatureLockProps) {
  if (!locked) return <>{children}</>

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative opacity-50 pointer-events-none">
          {children}
          <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-slate-400" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Upgrade to {requiredPlan} to unlock {featureName}</p>
      </TooltipContent>
    </Tooltip>
  )
}
```

---

## Enforcement Points (Where to Add Checks)

### 1. Prompt Storage
**File**: `app/api/prompts/route.ts`
**Before**: Inserting new prompt
**Check**: `checkUsageLimit({ userId, feature: 'storage' })`
**Action**: If `!allowed`, return 403 with upgrade message

### 2. AI Prompt Builder
**File**: `app/api/builder/generate/route.ts` (or similar)
**Before**: Generating prompt
**Check**: `checkUsageLimit({ userId, feature: 'prompt_builder' })`
**Action**: If `!allowed`, return 403
**Track**: `trackUsage({ userId, metricType: 'prompt_builder_use', metadata })`

### 3. Verbalized Sampling
**File**: `components/builder/VSEnhancementStep.tsx`
**On Load**: Check available patterns from subscription
**Display**: Only show patterns user has access to
**Track**: When pattern is used, track in metadata

### 4. Framework Library
**File**: `components/builder/FrameworkConfigStep.tsx`
**On Load**: Filter frameworks based on plan
**Display**: Lock unavailable frameworks
**Track**: When framework is selected

### 5. Template Creation
**File**: `app/api/templates/route.ts`
**Before**: Creating template
**Check**: `features.template_library.create === true`
**Action**: If false, return 403

---

## Implementation Priority (Recommended Order)

### Phase 1: Critical Limits (Week 1)
1. ✅ Storage limit enforcement (prevents database abuse)
2. ✅ AI Prompt Builder usage tracking and limits (protects core value prop)
3. ✅ Create `usage-tracker.ts` and `usage-checker.ts` utilities
4. ✅ Add migration for new metric types

### Phase 2: Feature Access (Week 2)
1. ✅ Verbalized Sampling pattern restrictions
2. ✅ Framework Library access control
3. ✅ Template Library access levels
4. ✅ Create `UsageMeter` and `FeatureLock` components

### Phase 3: UI/UX Polish (Week 3)
1. ✅ Add usage meters to dashboard
2. ✅ Add upgrade prompts when limits hit
3. ✅ Add "X/100 prompts used" indicators
4. ✅ Create analytics dashboard for users to see usage history

### Phase 4: Storage Add-ons (Future)
1. ⏳ Design storage add-on pricing
2. ⏳ Create purchase flow
3. ⏳ Track add-on storage separately

---

## Testing Checklist

- [ ] Explorer user cannot create 101st prompt
- [ ] Explorer user sees upgrade modal at storage limit
- [ ] Researcher user can use 100 AI Builder generations
- [ ] Researcher cannot use 101st AI Builder generation
- [ ] Strategist has unlimited AI Builder uses
- [ ] Explorer cannot access VS patterns (all locked)
- [ ] Researcher can access 1 VS pattern
- [ ] Strategist can access all 3 VS patterns
- [ ] Researcher can access only 5 frameworks
- [ ] Strategist can access all 10 frameworks
- [ ] Usage resets properly on billing cycle
- [ ] Usage meters display correctly on dashboard
- [ ] Upgrade links work from limit modals

---

## Monitoring & Analytics

### Admin Dashboard Metrics
1. **Usage by Feature**: Chart showing which features are used most
2. **Limit Hit Rate**: How often users hit limits (conversion opportunity)
3. **Upgrade Attribution**: Did user upgrade after hitting limit?
4. **Storage Distribution**: How many users at 80%+ capacity?
5. **Feature Adoption**: Which VS patterns/frameworks most popular?

### User Alerts
1. **80% Warning**: "You've used 80/100 prompts. Upgrade soon!"
2. **Limit Hit**: "Storage limit reached. Upgrade to continue."
3. **Monthly Reset**: "Your AI Builder uses have reset for this month."

---

## Summary

This comprehensive plan ensures:
- ✅ All subscription features are properly enforced
- ✅ Users cannot abuse unlimited features
- ✅ Clear upgrade paths when limits are hit
- ✅ Detailed tracking for business analytics
- ✅ Scalable architecture for future features

**Next Steps**: Prioritize Phase 1 implementation (storage + AI Builder limits) as these protect the most critical value propositions.
