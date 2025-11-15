-- Update Stripe Price IDs in Database
-- Replace the price_XXX values with your actual Stripe Price IDs

-- Step 1: Get your Price IDs from Stripe Dashboard
-- Go to: https://dashboard.stripe.com/test/products
-- Click on each product and copy the Price ID (starts with price_...)

-- Step 2: Update each plan with its corresponding Price ID

-- Explorer Plan ($29/month)
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_REPLACE_WITH_EXPLORER_PRICE_ID'
WHERE name = 'explorer';

-- Researcher Plan ($79/month)
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_REPLACE_WITH_RESEARCHER_PRICE_ID'
WHERE name = 'researcher';

-- Strategist Plan ($299/month)
UPDATE subscription_plans
SET stripe_price_id_monthly = 'price_REPLACE_WITH_STRATEGIST_PRICE_ID'
WHERE name = 'strategist';

-- Verify the updates
SELECT name, display_name, price_monthly, stripe_price_id_monthly
FROM subscription_plans
WHERE name IN ('explorer', 'researcher', 'strategist');

