-- ============================================
-- Update ALL 9 Production (Live) Stripe Price IDs in Database
-- Run this in Supabase SQL Editor
-- ============================================

-- Monthly Prices (3)
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1SUFkfAZ6yhLwOTGN7L5YXHm'
WHERE name = 'explorer';

UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1SUFi4AZ6yhLwOTG0r1uE1Ye'
WHERE name = 'researcher';

UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_1SUFdZAZ6yhLwOTGU8XvfjLo'
WHERE name = 'strategist';

-- Annual Prices (3)
UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_1SUFUbAZ6yhLwOTGbiOtd2Gl'
WHERE name = 'explorer';

UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_1SUFVxAZ6yhLwOTGvoxZ04fr'
WHERE name = 'researcher';

UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_1SUFX6AZ6yhLwOTGWeyejbY6'
WHERE name = 'strategist';

-- Overage Prices (3)
UPDATE subscription_plans
SET stripe_price_id_overage = 'price_1SUFqXAZ6yhLwOTGT5NR2tTm'
WHERE name = 'explorer';

UPDATE subscription_plans
SET stripe_price_id_overage = 'price_1SUFgfAZ6yhLwOTGUVpsY9NN'
WHERE name = 'researcher';

UPDATE subscription_plans
SET stripe_price_id_overage = 'price_1SUFbpAZ6yhLwOTGV6oi1ghD'
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

