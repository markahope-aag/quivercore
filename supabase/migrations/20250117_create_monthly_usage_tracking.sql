-- Create monthly usage tracking table for calendar-month billing
-- This table tracks usage limits that reset on the 1st of each month
--
-- Migration: 20250117_create_monthly_usage_tracking.sql
-- Created: 2025-01-17

-- Drop table if exists (for development - remove in production)
DROP TABLE IF EXISTS monthly_usage_tracking CASCADE;

-- Create monthly usage tracking table
CREATE TABLE monthly_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM' (e.g., '2025-01')

  -- Prompt usage (monthly limit)
  prompts_used INTEGER DEFAULT 0 NOT NULL,
  prompts_limit INTEGER NOT NULL,

  -- Storage usage
  storage_used INTEGER DEFAULT 0 NOT NULL, -- in MB or count
  storage_limit INTEGER NOT NULL,

  -- Overage tracking
  overage_prompts INTEGER DEFAULT 0 NOT NULL,
  overage_charges NUMERIC(10,2) DEFAULT 0 NOT NULL, -- in dollars

  -- Reset tracking
  reset_date TIMESTAMPTZ NOT NULL, -- Always 1st of month

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure one record per user per month
  UNIQUE(user_id, month_year)
);

-- Indexes for performance
CREATE INDEX idx_monthly_usage_user_month ON monthly_usage_tracking(user_id, month_year);
CREATE INDEX idx_monthly_usage_month ON monthly_usage_tracking(month_year);
CREATE INDEX idx_monthly_usage_reset ON monthly_usage_tracking(reset_date);

-- RLS Policies
ALTER TABLE monthly_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage
CREATE POLICY "Users can view their own monthly usage"
  ON monthly_usage_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only system can insert/update (via service role)
CREATE POLICY "System can manage monthly usage"
  ON monthly_usage_tracking
  FOR ALL
  USING (auth.role() = 'service_role');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_monthly_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_monthly_usage_updated_at
  BEFORE UPDATE ON monthly_usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_monthly_usage_updated_at();

-- Comments
COMMENT ON TABLE monthly_usage_tracking IS 'Tracks monthly usage limits that reset on the 1st of each month for calendar-month billing';
COMMENT ON COLUMN monthly_usage_tracking.month_year IS 'Month in YYYY-MM format (e.g., 2025-01)';
COMMENT ON COLUMN monthly_usage_tracking.prompts_used IS 'Number of AI-enhanced prompts created this month';
COMMENT ON COLUMN monthly_usage_tracking.prompts_limit IS 'Monthly limit based on subscription plan';
COMMENT ON COLUMN monthly_usage_tracking.overage_prompts IS 'Prompts created beyond monthly limit';
COMMENT ON COLUMN monthly_usage_tracking.overage_charges IS 'Total overage charges for this month in dollars';
COMMENT ON COLUMN monthly_usage_tracking.reset_date IS 'Date when usage resets (always 1st of month at 00:00 UTC)';
