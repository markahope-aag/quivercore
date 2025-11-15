/**
 * Test script to verify Stripe connection
 * 
 * Run with: npx tsx scripts/test-stripe-connection.ts
 * 
 * This script tests:
 * 1. Stripe API key configuration
 * 2. Ability to create a test customer
 * 3. Ability to list products/prices
 */

import Stripe from 'stripe'

async function testStripeConnection() {
  console.log('🧪 Testing Stripe Connection...\n')

  // Check environment variables
  const secretKey = process.env.STRIPE_SECRET_KEY
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!secretKey) {
    console.error('❌ STRIPE_SECRET_KEY is not set in environment variables')
    console.log('   Add it to your .env.local file:')
    console.log('   STRIPE_SECRET_KEY=sk_test_...')
    process.exit(1)
  }

  if (!publishableKey) {
    console.error('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
    console.log('   Add it to your .env.local file:')
    console.log('   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...')
    process.exit(1)
  }

  if (!secretKey.startsWith('sk_test_')) {
    console.warn('⚠️  Warning: Secret key does not start with sk_test_')
    console.warn('   Make sure you are using TEST mode keys, not LIVE keys!')
  }

  console.log('✅ Environment variables found')
  console.log(`   Secret Key: ${secretKey.substring(0, 12)}...`)
  console.log(`   Publishable Key: ${publishableKey.substring(0, 12)}...\n`)

  // Initialize Stripe
  const stripe = new Stripe(secretKey, {
    apiVersion: '2025-10-29.clover',
  })

  try {
    // Test 1: Create a test customer
    console.log('📝 Test 1: Creating test customer...')
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test Customer',
      metadata: {
        test: 'true',
      },
    })
    console.log(`✅ Customer created: ${customer.id}`)

    // Test 2: List products
    console.log('\n📦 Test 2: Listing products...')
    const products = await stripe.products.list({ limit: 10 })
    console.log(`✅ Found ${products.data.length} products:`)
    products.data.forEach((product) => {
      console.log(`   - ${product.name} (${product.id})`)
    })

    // Test 3: List prices
    console.log('\n💰 Test 3: Listing prices...')
    const prices = await stripe.prices.list({ limit: 10 })
    console.log(`✅ Found ${prices.data.length} prices:`)
    prices.data.forEach((price) => {
      const amount = price.unit_amount ? price.unit_amount / 100 : 0
      const currency = price.currency.toUpperCase()
      const interval = price.recurring?.interval || 'one-time'
      console.log(
        `   - ${currency} ${amount}/${interval} (${price.id}) - Product: ${price.product}`
      )
    })

    // Test 4: Check for our subscription plans
    console.log('\n🔍 Test 4: Checking for subscription plan prices...')
    const subscriptionPrices = prices.data.filter(
      (p) => p.recurring && p.recurring.interval === 'month'
    )
    console.log(`✅ Found ${subscriptionPrices.length} monthly subscription prices:`)
    subscriptionPrices.forEach((price) => {
      const amount = price.unit_amount ? price.unit_amount / 100 : 0
      console.log(`   - $${amount}/month (${price.id})`)
    })

    // Cleanup: Delete test customer
    console.log('\n🧹 Cleaning up test customer...')
    await stripe.customers.del(customer.id)
    console.log('✅ Test customer deleted')

    console.log('\n✅ All tests passed! Stripe connection is working.')
    console.log('\n📋 Next Steps:')
    console.log('   1. Create products/prices in Stripe Dashboard')
    console.log('   2. Update database with price IDs')
    console.log('   3. Set up webhook forwarding (stripe listen)')
    console.log('   4. Test checkout flow')
  } catch (error: any) {
    console.error('\n❌ Error testing Stripe connection:')
    if (error.type === 'StripeAuthenticationError') {
      console.error('   Authentication failed. Check your STRIPE_SECRET_KEY.')
    } else if (error.type === 'StripeAPIError') {
      console.error(`   API Error: ${error.message}`)
    } else {
      console.error(`   Error: ${error.message}`)
    }
    process.exit(1)
  }
}

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

testStripeConnection()

