-- Update Stripe Annual Price IDs in Database
-- Run this in Supabase SQL Editor

-- Explorer Plan - Annual Price
UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_1SUF2IAjII6lIBnkHoqsYg6i'
WHERE name = 'explorer';

-- Researcher Plan - Annual Price
UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_1SUF0YAjII6lIBnkrcwhrUFI'
WHERE name = 'researcher';

-- Strategist Plan - Annual Price
UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_1SUEyEAjII6lIBnkJFoir7pB'
WHERE name = 'strategist';

-- Verify the updates
SELECT 
  name, 
  display_name, 
  price_monthly,
  price_yearly,
  stripe_price_id_monthly,
  stripe_price_id_yearly
FROM subscription_plans
WHERE name IN ('explorer', 'researcher', 'strategist');

