-- Seed Subscription Plans
-- Based on detailed pricing: Explorer ($29), Researcher ($79), Strategist ($299)

-- Delete existing plans if they exist (for re-seeding)
DELETE FROM subscription_plans WHERE name IN ('starter', 'professional', 'enterprise', 'explorer', 'researcher', 'strategist');

-- Explorer Plan: $29/month
INSERT INTO subscription_plans (name, display_name, description, price_monthly, features, is_active)
VALUES (
  'explorer',
  'Explorer',
  'Break free from predictable AI - discover what your AI can really create',
  2900, -- $29.00 in cents
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
);

-- Researcher Plan: $79/month
INSERT INTO subscription_plans (name, display_name, description, price_monthly, features, is_active)
VALUES (
  'researcher',
  'Researcher',
  'Harness Stanford''s breakthrough research - systematic creative AI for professionals',
  7900, -- $79.00 in cents
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
      "count": 10,
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
);

-- Strategist Plan: $299/month
INSERT INTO subscription_plans (name, display_name, description, price_monthly, features, is_active)
VALUES (
  'strategist',
  'Strategist',
  'Command enterprise-grade AI creativity - asymmetric advantages at scale',
  29900, -- $299.00 in cents
  '{
    "monthly_prompts": 500,
    "overage_rate": 0.50,
    "verbalized_sampling": {
      "enabled": true,
      "patterns": ["broad_spectrum", "rarity_hunt", "balanced_categories"]
    },
    "advanced_enhancements": true,
    "framework_library": {
      "included": true,
      "count": 10,
      "description": "All frameworks"
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
);

-- Free Plan (for users without subscription)
INSERT INTO subscription_plans (name, display_name, description, price_monthly, features, is_active)
VALUES (
  'free',
  'Free',
  'Limited free tier for new users',
  0,
  '{
    "monthly_prompts": 10,
    "overage_rate": null,
    "verbalized_sampling": {
      "enabled": false,
      "patterns": []
    },
    "advanced_enhancements": false,
    "framework_library": {
      "included": true,
      "count": 3,
      "description": "Basic frameworks"
    },
    "template_library": {
      "access": "none",
      "create": false,
      "share": false
    },
    "export_options": ["text"],
    "analytics_dashboard": "none",
    "collaboration": false,
    "api_access": false,
    "support": "community",
    "onboarding": "self-service",
    "custom_branding": false,
    "sso_integration": false,
    "usage_analytics": "none"
  }'::jsonb,
  true
);
