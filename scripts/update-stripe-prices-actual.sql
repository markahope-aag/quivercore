-- Update Stripe Price IDs in Database
-- Based on actual products found in Stripe test account

-- Explorer Plan ($29/month)
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1STshaAjII6lIBnkmV4yR35n'
WHERE name = 'explorer';

-- Researcher Plan ($79/month)
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1STsiuAjII6lIBnkTVHhA54U'
WHERE name = 'researcher';

-- Strategist Plan ($299/month)
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1STslRAjII6lIBnkWxwAXEWJ'
WHERE name = 'strategist';

-- Verify the updates
SELECT 
  name, 
  display_name, 
  price_monthly, 
  stripe_price_id_monthly,
  CASE 
    WHEN stripe_price_id_monthly IS NOT NULL THEN '✅ Configured'
    ELSE '❌ Missing'
  END as status
FROM subscription_plans
WHERE name IN ('explorer', 'researcher', 'strategist')
ORDER BY price_monthly;

