-- Complete Stripe Setup Script
-- Run this in Supabase SQL Editor to set up everything at once

-- Step 1: Create tables (if they don't exist)
-- Note: This will fail if tables already exist, which is fine
DO $$ 
BEGIN
  -- Create subscription_plans table
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscription_plans') THEN
    CREATE TABLE subscription_plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      description TEXT,
      price_monthly INTEGER NOT NULL,
      price_yearly INTEGER,
      stripe_price_id_monthly TEXT,
      stripe_price_id_yearly TEXT,
      features JSONB NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Step 2: Seed plans (delete and re-insert to ensure clean state)
DELETE FROM subscription_plans WHERE name IN ('explorer', 'researcher', 'strategist', 'free');

-- Explorer Plan: $29/month
INSERT INTO subscription_plans (name, display_name, description, price_monthly, features, is_active)
VALUES (
  'explorer',
  'Explorer',
  'Break free from predictable AI - discover what your AI can really create',
  2900,
  '{
    "monthly_prompts": 50,
    "overage_rate": 0.75,
    "verbalized_sampling": {
      "enabled": true,
      "patterns": ["broad_spectrum"]
    },
    "advanced_enhancements": false,
    "framework_library": {
      "included": true,
      "count": 5,
      "description": "Core frameworks"
    },
    "template_library": {
      "access": "view",
      "create": false,
      "share": false
    },
    "export_options": ["text"],
    "analytics_dashboard": "basic",
    "collaboration": false,
    "api_access": false,
    "support": "community",
    "onboarding": "self-service",
    "custom_branding": false,
    "sso_integration": false,
    "usage_analytics": "personal"
  }'::jsonb,
  true
) ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Researcher Plan: $79/month
INSERT INTO subscription_plans (name, display_name, description, price_monthly, features, is_active)
VALUES (
  'researcher',
  'Researcher',
  'Harness Stanford''s breakthrough research - systematic creative AI for professionals',
  7900,
  '{
    "monthly_prompts": 150,
    "overage_rate": 0.75,
    "verbalized_sampling": {
      "enabled": true,
      "patterns": ["broad_spectrum", "rarity_hunt", "balanced_categories"]
    },
    "advanced_enhancements": true,
    "framework_library": {
      "included": true,
      "count": 15,
      "description": "All frameworks"
    },
    "template_library": {
      "access": "full",
      "create": true,
      "share": true
    },
    "export_options": ["text", "json", "markdown"],
    "analytics_dashboard": "performance",
    "collaboration": false,
    "api_access": false,
    "support": "email",
    "onboarding": "guided",
    "custom_branding": false,
    "sso_integration": false,
    "usage_analytics": "personal"
  }'::jsonb,
  true
) ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Strategist Plan: $299/month
INSERT INTO subscription_plans (name, display_name, description, price_monthly, features, is_active)
VALUES (
  'strategist',
  'Strategist',
  'Command enterprise-grade AI creativity - asymmetric advantages at scale',
  29900,
  '{
    "monthly_prompts": 500,
    "overage_rate": 0.50,
    "verbalized_sampling": {
      "enabled": true,
      "patterns": ["all"]
    },
    "advanced_enhancements": true,
    "framework_library": {
      "included": true,
      "count": -1,
      "description": "Unlimited frameworks"
    },
    "template_library": {
      "access": "unlimited",
      "create": true,
      "share": true
    },
    "export_options": ["text", "json", "markdown", "csv"],
    "analytics_dashboard": "full",
    "collaboration": true,
    "api_access": true,
    "support": "priority",
    "onboarding": "custom",
    "custom_branding": true,
    "sso_integration": true,
    "usage_analytics": "team"
  }'::jsonb,
  true
) ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Step 3: Update with Stripe Price IDs (from your actual Stripe account)
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1STshaAjII6lIBnkmV4yR35n'
WHERE name = 'explorer';

UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1STsiuAjII6lIBnkTVHhA54U'
WHERE name = 'researcher';

UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1STslRAjII6lIBnkWxwAXEWJ'
WHERE name = 'strategist';

-- Step 4: Verify everything
SELECT 
  name, 
  display_name, 
  price_monthly / 100.0 as price_dollars,
  stripe_price_id_monthly,
  CASE 
    WHEN stripe_price_id_monthly IS NOT NULL THEN '✅ Configured'
    ELSE '❌ Missing Price ID'
  END as status
FROM subscription_plans
WHERE name IN ('explorer', 'researcher', 'strategist')
ORDER BY price_monthly;

