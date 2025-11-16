-- Admin Features Migration
-- Adds tables and functions for comprehensive admin panel

-- 1. Promotional Codes Table
CREATE TABLE IF NOT EXISTS promotional_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL, -- 'percentage' or 'fixed_amount'
  discount_value INTEGER NOT NULL, -- percentage (0-100) or cents
  max_uses INTEGER, -- NULL = unlimited
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  plan_restrictions TEXT[], -- NULL = all plans, or specific plan names
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Promo Code Usage Tracking
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promotional_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  discount_applied INTEGER NOT NULL, -- in cents
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0, -- 0-100 for gradual rollouts
  enabled_for_plans TEXT[], -- NULL = all plans
  enabled_for_users UUID[], -- Specific user IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Email Campaigns Table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  target_audience JSONB, -- Filter criteria: {plan: 'professional', status: 'active'}
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent'
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Email Campaign Logs
CREATE TABLE IF NOT EXISTS email_campaign_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- 'sent', 'failed', 'bounced', 'opened', 'clicked'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE
);

-- 6. Error Tracking Table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  error_type TEXT NOT NULL, -- 'api_error', 'client_error', 'server_error'
  error_code TEXT,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  request_path TEXT,
  request_method TEXT,
  user_agent TEXT,
  metadata JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- 'user_update', 'subscription_modify', 'promo_create', etc.
  target_user_id UUID REFERENCES auth.users(id),
  target_resource_type TEXT, -- 'user', 'subscription', 'promo_code', etc.
  target_resource_id UUID,
  action_details JSONB, -- What changed
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. User Impersonation Sessions
CREATE TABLE IF NOT EXISTS impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  target_user_id UUID NOT NULL REFERENCES auth.users(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  reason TEXT
);

-- Create Indexes
CREATE INDEX idx_promo_codes_code ON promotional_codes(code);
CREATE INDEX idx_promo_codes_active ON promotional_codes(is_active, valid_until);
CREATE INDEX idx_promo_usage_code ON promo_code_usage(promo_code_id);
CREATE INDEX idx_promo_usage_user ON promo_code_usage(user_id);

CREATE INDEX idx_feature_flags_key ON feature_flags(flag_key);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);

CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaign_logs_campaign ON email_campaign_logs(campaign_id);
CREATE INDEX idx_email_campaign_logs_user ON email_campaign_logs(user_id);

CREATE INDEX idx_error_logs_user ON error_logs(user_id);
CREATE INDEX idx_error_logs_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX idx_error_logs_created ON error_logs(created_at DESC);

CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_user_id);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

CREATE INDEX idx_impersonation_admin ON impersonation_sessions(admin_user_id);
CREATE INDEX idx_impersonation_target ON impersonation_sessions(target_user_id);

-- Enable RLS
ALTER TABLE promotional_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE impersonation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin only for most tables)
CREATE POLICY "Admins can manage promo codes"
  ON promotional_codes FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view promo usage"
  ON promo_code_usage FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view active feature flags"
  ON feature_flags FOR SELECT
  USING (is_enabled = true);

CREATE POLICY "Admins can manage feature flags"
  ON feature_flags FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage email campaigns"
  ON email_campaigns FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view email logs"
  ON email_campaign_logs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can insert their own errors"
  ON error_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all errors"
  ON error_logs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update errors"
  ON error_logs FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can manage impersonation sessions"
  ON impersonation_sessions FOR ALL
  USING (is_admin(auth.uid()));

-- Function: Calculate MRR (Monthly Recurring Revenue)
CREATE OR REPLACE FUNCTION calculate_mrr()
RETURNS TABLE (
  mrr_cents INTEGER,
  active_subscriptions INTEGER,
  by_plan JSONB
) AS $$
DECLARE
  total_mrr INTEGER := 0;
  active_count INTEGER := 0;
  plan_breakdown JSONB := '{}'::jsonb;
BEGIN
  -- Calculate total MRR from active subscriptions
  SELECT
    COALESCE(SUM(
      CASE
        WHEN sp.stripe_price_id_monthly IS NOT NULL THEN sp.price_monthly
        WHEN sp.stripe_price_id_yearly IS NOT NULL THEN sp.price_yearly / 12
        ELSE 0
      END
    ), 0)::INTEGER,
    COUNT(*)::INTEGER
  INTO total_mrr, active_count
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.status IN ('active', 'trialing');

  -- Calculate breakdown by plan
  SELECT jsonb_object_agg(
    plan_name,
    jsonb_build_object(
      'count', plan_count,
      'mrr', plan_mrr
    )
  ) INTO plan_breakdown
  FROM (
    SELECT
      sp.display_name as plan_name,
      COUNT(*)::INTEGER as plan_count,
      COALESCE(SUM(
        CASE
          WHEN sp.stripe_price_id_monthly IS NOT NULL THEN sp.price_monthly
          WHEN sp.stripe_price_id_yearly IS NOT NULL THEN sp.price_yearly / 12
          ELSE 0
        END
      ), 0)::INTEGER as plan_mrr
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.status IN ('active', 'trialing')
    GROUP BY sp.display_name
  ) subq;

  RETURN QUERY SELECT total_mrr, active_count, COALESCE(plan_breakdown, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Calculate Churn Rate
CREATE OR REPLACE FUNCTION calculate_churn_rate(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  churn_rate NUMERIC,
  canceled_count INTEGER,
  total_active_start INTEGER
) AS $$
DECLARE
  period_start TIMESTAMP WITH TIME ZONE;
  canceled INTEGER := 0;
  active_at_start INTEGER := 0;
  rate NUMERIC := 0;
BEGIN
  period_start := NOW() - (days_back || ' days')::INTERVAL;

  -- Count subscriptions that were active at period start
  SELECT COUNT(*)::INTEGER INTO active_at_start
  FROM user_subscriptions
  WHERE created_at <= period_start
    AND (canceled_at IS NULL OR canceled_at > period_start)
    AND status IN ('active', 'trialing');

  -- Count subscriptions canceled during period
  SELECT COUNT(*)::INTEGER INTO canceled
  FROM user_subscriptions
  WHERE canceled_at >= period_start
    AND canceled_at <= NOW();

  -- Calculate churn rate
  IF active_at_start > 0 THEN
    rate := (canceled::NUMERIC / active_at_start::NUMERIC) * 100;
  END IF;

  RETURN QUERY SELECT rate, canceled, active_at_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get User Details (Enhanced)
CREATE OR REPLACE FUNCTION get_user_details(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  subscription_status TEXT,
  plan_name TEXT,
  subscription_end TIMESTAMP WITH TIME ZONE,
  total_prompts INTEGER,
  total_executions INTEGER,
  lifetime_value_cents INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    us.status,
    sp.display_name,
    us.current_period_end,
    (SELECT COUNT(*)::INTEGER FROM prompts WHERE user_id = p_user_id),
    (SELECT COALESCE(SUM(count), 0)::INTEGER FROM usage_tracking WHERE user_id = p_user_id AND metric_type = 'prompt_execution'),
    (SELECT COALESCE(SUM(amount), 0)::INTEGER FROM billing_history WHERE user_id = p_user_id AND status = 'paid')
  FROM auth.users u
  LEFT JOIN user_subscriptions us ON us.user_id = u.id AND us.status IN ('active', 'trialing')
  LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Failed Payments
CREATE OR REPLACE FUNCTION get_failed_payments(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  invoice_id TEXT,
  user_email TEXT,
  amount_cents INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  user_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bh.stripe_invoice_id,
    u.email,
    bh.amount,
    bh.created_at,
    bh.user_id
  FROM billing_history bh
  JOIN auth.users u ON bh.user_id = u.id
  WHERE bh.status = 'failed'
    AND bh.created_at >= NOW() - (days_back || ' days')::INTERVAL
  ORDER BY bh.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Log Admin Action
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action_type TEXT,
  p_target_user_id UUID,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_details JSONB,
  p_ip_address TEXT
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    admin_user_id,
    action_type,
    target_user_id,
    target_resource_type,
    target_resource_id,
    action_details,
    ip_address
  ) VALUES (
    p_admin_id,
    p_action_type,
    p_target_user_id,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if feature is enabled for user
CREATE OR REPLACE FUNCTION is_feature_enabled(p_flag_key TEXT, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  flag_record RECORD;
  user_plan TEXT;
  random_value INTEGER;
BEGIN
  -- Get feature flag
  SELECT * INTO flag_record
  FROM feature_flags
  WHERE flag_key = p_flag_key;

  -- If flag doesn't exist or is disabled, return false
  IF NOT FOUND OR NOT flag_record.is_enabled THEN
    RETURN false;
  END IF;

  -- Check if user is specifically enabled
  IF p_user_id = ANY(flag_record.enabled_for_users) THEN
    RETURN true;
  END IF;

  -- Check plan restrictions
  IF flag_record.enabled_for_plans IS NOT NULL THEN
    SELECT sp.name INTO user_plan
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = p_user_id
      AND us.status IN ('active', 'trialing')
    LIMIT 1;

    IF user_plan IS NULL OR NOT (user_plan = ANY(flag_record.enabled_for_plans)) THEN
      RETURN false;
    END IF;
  END IF;

  -- Check rollout percentage
  IF flag_record.rollout_percentage < 100 THEN
    -- Use user_id hash for consistent rollout
    random_value := (('x' || substring(p_user_id::text, 1, 8))::bit(32)::bigint % 100);
    IF random_value >= flag_record.rollout_percentage THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promotional_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();
