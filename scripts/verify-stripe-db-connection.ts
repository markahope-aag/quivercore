/**
 * Verify Stripe database connection
 * 
 * Run with: npx tsx scripts/verify-stripe-db-connection.ts
 * 
 * This script verifies:
 * 1. Database has subscription plans
 * 2. Price IDs are linked correctly
 * 3. Plans match Stripe products
 */

import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

async function verifyDatabaseConnection() {
  console.log('🔍 Verifying Stripe Database Connection...\n')

  // Check environment variables
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!stripeSecretKey) {
    console.error('❌ STRIPE_SECRET_KEY is not set')
    process.exit(1)
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase environment variables are not set')
    process.exit(1)
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-10-29.clover',
  })

  try {
    // Get plans from database using direct client
    console.log('📊 Fetching plans from database...')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // First check if table exists by trying to query it
    const { data: plans, error: dbError } = await supabase
      .from('subscription_plans')
      .select('*')
      .in('name', ['explorer', 'researcher', 'strategist'])
      .order('price_monthly', { ascending: true })

    if (dbError) {
      if (dbError.message.includes('relation') || dbError.message.includes('does not exist')) {
        console.error('❌ subscription_plans table does not exist!')
        console.error('\n📋 You need to run the migration first:')
        console.error('   1. Go to Supabase Dashboard → SQL Editor')
        console.error('   2. Run: supabase/migrations/20250115_create_subscription_system.sql')
        console.error('   3. Run: supabase/migrations/20250115_seed_subscription_plans.sql')
        process.exit(1)
      }
      console.error('❌ Database error:', dbError.message)
      console.error('   Code:', dbError.code)
      process.exit(1)
    }

    if (!plans || plans.length === 0) {
      console.error('❌ No subscription plans found in database')
      console.error('\n📋 You may need to seed the plans:')
      console.error('   Run: supabase/migrations/20250115_seed_subscription_plans.sql')
      process.exit(1)
    }

    console.log(`✅ Found ${plans.length} plans in database\n`)

    // Get prices from Stripe
    console.log('💰 Fetching prices from Stripe...')
    const prices = await stripe.prices.list({ limit: 100 })
    const monthlyPrices = prices.data.filter(
      (p) => p.recurring && p.recurring.interval === 'month'
    )

    console.log(`✅ Found ${monthlyPrices.length} monthly prices in Stripe\n`)

    // Verify each plan
    console.log('🔗 Verifying Price ID connections...\n')
    let allConnected = true

    for (const plan of plans) {
      const priceId = (plan as any).stripe_price_id_monthly
      const displayName = (plan as any).display_name || plan.name

      if (!priceId) {
        console.log(`❌ ${displayName}: No Price ID configured`)
        allConnected = false
        continue
      }

      // Find matching price in Stripe
      const stripePrice = monthlyPrices.find((p) => p.id === priceId)

      if (!stripePrice) {
        console.log(`❌ ${displayName}: Price ID ${priceId} not found in Stripe`)
        allConnected = false
        continue
      }

      // Verify amount matches
      const dbAmount = (plan as any).price_monthly / 100 // Convert from cents
      const stripeAmount = stripePrice.unit_amount ? stripePrice.unit_amount / 100 : 0

      if (dbAmount !== stripeAmount) {
        console.log(
          `⚠️  ${displayName}: Amount mismatch - DB: $${dbAmount}, Stripe: $${stripeAmount}`
        )
      } else {
        console.log(
          `✅ ${displayName}: Connected to ${priceId} ($${stripeAmount}/month)`
        )
      }
    }

    console.log('\n' + '='.repeat(50))
    if (allConnected) {
      console.log('✅ All plans are connected to Stripe!')
      console.log('\n📋 Next Steps:')
      console.log('   1. Set up webhook forwarding (stripe listen)')
      console.log('   2. Add webhook secret to .env.local')
      console.log('   3. Build pricing page UI')
    } else {
      console.log('⚠️  Some plans need configuration')
      console.log('   Run the SQL update script to fix missing Price IDs')
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

verifyDatabaseConnection()

