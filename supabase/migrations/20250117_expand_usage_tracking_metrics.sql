-- Expand usage_tracking metric types to support all feature tracking
-- This migration adds new metric types for comprehensive usage tracking

-- Drop existing constraint if it exists
ALTER TABLE usage_tracking
  DROP CONSTRAINT IF EXISTS usage_tracking_metric_type_check;

-- Add new comprehensive constraint with all metric types
ALTER TABLE usage_tracking
  ADD CONSTRAINT usage_tracking_metric_type_check
  CHECK (metric_type IN (
    -- Existing types
    'prompt_execution',      -- When a prompt is tested with AI
    'prompt_created',        -- When a new prompt is saved
    'api_call',              -- Generic API usage

    -- New types for tier enforcement
    'prompt_builder_use',    -- AI Prompt Builder generation (monthly limit)
    'storage_count',         -- Snapshot of current storage usage
    'template_accessed',     -- When user accesses curated template
    'export_used'            -- When export feature is used
  ));

-- Add index for fast monthly usage lookups (for prompt builder limit)
CREATE INDEX IF NOT EXISTS idx_usage_tracking_monthly_builder
  ON usage_tracking(user_id, metric_type, period_start, period_end)
  WHERE metric_type = 'prompt_builder_use';

-- Add index for storage tracking
CREATE INDEX IF NOT EXISTS idx_usage_tracking_storage
  ON usage_tracking(user_id, created_at)
  WHERE metric_type = 'storage_count';

-- Comment explaining the metric types
COMMENT ON COLUMN usage_tracking.metric_type IS
'Types of usage metrics tracked:
- prompt_execution: Prompt tested with AI model
- prompt_created: New prompt saved to database
- api_call: Generic API usage
- prompt_builder_use: AI Prompt Builder used (counted toward monthly limit)
- storage_count: Snapshot of storage usage
- template_accessed: Curated template accessed
- export_used: Export feature utilized';
