-- ============================================
-- Update ALL 9 Stripe Price IDs in Database
-- Run this in Supabase SQL Editor
-- ============================================

-- Monthly Prices (3)
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1STshaAjII6lIBnkmV4yR35n'
WHERE name = 'explorer';

UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1STsiuAjII6lIBnkTVHhA54U'
WHERE name = 'researcher';

UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1STslRAjII6lIBnkWxwAXEWJ'
WHERE name = 'strategist';

-- Annual Prices (3)
UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_1SUF2IAjII6lIBnkHoqsYg6i'
WHERE name = 'explorer';

UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_1SUF0YAjII6lIBnkrcwhrUFI'
WHERE name = 'researcher';

UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_1SUEyEAjII6lIBnkJFoir7pB'
WHERE name = 'strategist';

-- Overage Prices (3)
UPDATE subscription_plans
SET stripe_price_id_overage = 'price_1STsfkAjII6lIBnkpdiBfQRl'
WHERE name = 'explorer';

UPDATE subscription_plans
SET stripe_price_id_overage = 'price_1STskXAjII6lIBnkTfNDe7TH'
WHERE name = 'researcher';

UPDATE subscription_plans
SET stripe_price_id_overage = 'price_1STsn1AjII6lIBnk60vPpusj'
WHERE name = 'strategist';

-- Verify all updates
SELECT 
  name,
  display_name,
  stripe_price_id_monthly,
  stripe_price_id_yearly,
  stripe_price_id_overage,
  CASE 
    WHEN stripe_price_id_monthly IS NOT NULL 
     AND stripe_price_id_yearly IS NOT NULL 
     AND stripe_price_id_overage IS NOT NULL 
    THEN '✅ Complete'
    ELSE '⚠️ Missing some price IDs'
  END as status
FROM subscription_plans
WHERE name IN ('explorer', 'researcher', 'strategist')
ORDER BY price_monthly;

