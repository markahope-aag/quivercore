-- Update Stripe Overage Price IDs in Database
-- Based on actual overage products found in Stripe test account

-- Explorer Plan Overage ($0.75 per prompt)
UPDATE subscription_plans
SET stripe_price_id_overage = 'price_1STsfkAjII6lIBnkpdiBfQRl'
WHERE name = 'explorer';

-- Researcher Plan Overage ($0.75 per prompt)
UPDATE subscription_plans
SET stripe_price_id_overage = 'price_1STskXAjII6lIBnkTfNDe7TH'
WHERE name = 'researcher';

-- Strategist Plan Overage ($0.50 per prompt)
UPDATE subscription_plans
SET stripe_price_id_overage = 'price_1STsn1AjII6lIBnk60vPpusj'
WHERE name = 'strategist';

-- Verify the updates
SELECT 
  name, 
  display_name, 
  price_monthly / 100.0 as subscription_price_dollars,
  stripe_price_id_monthly as subscription_price_id,
  stripe_price_id_overage as overage_price_id,
  CASE 
    WHEN stripe_price_id_monthly IS NOT NULL AND stripe_price_id_overage IS NOT NULL 
    THEN '✅ Complete'
    WHEN stripe_price_id_monthly IS NOT NULL 
    THEN '⚠️ Missing Overage'
    ELSE '❌ Missing'
  END as status
FROM subscription_plans
WHERE name IN ('explorer', 'researcher', 'strategist')
ORDER BY price_monthly;

