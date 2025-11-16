-- Add overage price ID to subscription_plans table
-- This allows tracking Stripe price IDs for prompt overages

ALTER TABLE subscription_plans
ADD COLUMN IF NOT EXISTS stripe_price_id_overage TEXT;

-- Add comment
COMMENT ON COLUMN subscription_plans.stripe_price_id_overage IS 'Stripe Price ID for prompt overages (per prompt beyond monthly limit)';

