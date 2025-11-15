-- Subscription System Migration
-- Creates tables for subscription plans, user subscriptions, usage tracking, and billing history

-- 1. Subscription Plans Table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'starter', 'professional', 'enterprise'
  display_name TEXT NOT NULL, -- 'Starter', 'Professional', 'Enterprise'
  description TEXT,
  price_monthly INTEGER NOT NULL, -- in cents
  price_yearly INTEGER, -- in cents (NULL if yearly not available)
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB NOT NULL, -- Feature limits and capabilities
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Subscriptions Table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired'
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Usage Tracking Table
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'prompt_execution', 'prompt_created', 'api_call'
  count INTEGER DEFAULT 1,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL, -- Start of billing period
  period_end TIMESTAMP WITH TIME ZONE NOT NULL, -- End of billing period
  metadata JSONB, -- Additional context (prompt_id, model used, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Billing History Table
CREATE TABLE billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  stripe_invoice_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- 'paid', 'pending', 'failed', 'refunded', 'void'
  invoice_url TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);

CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(user_id, period_start, period_end);
CREATE INDEX idx_usage_tracking_metric_type ON usage_tracking(metric_type);
CREATE INDEX idx_usage_tracking_user_period_metric ON usage_tracking(user_id, period_start, period_end, metric_type);

CREATE INDEX idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX idx_billing_history_subscription_id ON billing_history(subscription_id);
CREATE INDEX idx_billing_history_stripe_invoice_id ON billing_history(stripe_invoice_id);

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read, admin write)
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view their own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage tracking"
  ON usage_tracking FOR INSERT
  WITH CHECK (true); -- Will be restricted by application logic

-- RLS Policies for billing_history
CREATE POLICY "Users can view their own billing history"
  ON billing_history FOR SELECT
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- Helper function to get current user subscription
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  plan_id UUID,
  plan_name TEXT,
  plan_display_name TEXT,
  status TEXT,
  features JSONB,
  current_period_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    us.id,
    us.plan_id,
    sp.name,
    sp.display_name,
    us.status,
    sp.features,
    us.current_period_end
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status IN ('active', 'trialing')
    AND (us.current_period_end IS NULL OR us.current_period_end > NOW())
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user usage for current period
CREATE OR REPLACE FUNCTION get_user_usage(
  p_user_id UUID,
  p_metric_type TEXT,
  p_period_start TIMESTAMP WITH TIME ZONE,
  p_period_end TIMESTAMP WITH TIME ZONE
)
RETURNS INTEGER AS $$
DECLARE
  total_count INTEGER;
BEGIN
  SELECT COALESCE(SUM(count), 0) INTO total_count
  FROM usage_tracking
  WHERE user_id = p_user_id
    AND metric_type = p_metric_type
    AND period_start = p_period_start
    AND period_end = p_period_end;
  
  RETURN total_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

