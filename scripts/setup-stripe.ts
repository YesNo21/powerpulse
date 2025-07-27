#!/usr/bin/env tsx

import Stripe from 'stripe'
import * as dotenv from 'dotenv'
import { STRIPE_CONFIG } from '../src/lib/stripe/config'

// Load environment variables
dotenv.config({ path: '.env.local' })

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})

async function setupStripeProducts() {
  // Check if we're in live mode
  const isLiveMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')
  if (isLiveMode) {
    console.log('⚠️  WARNING: You are using LIVE Stripe keys!')
    console.log('⚠️  This will create real products and prices in your live Stripe account.')
    console.log('⚠️  Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
  console.log('🚀 Setting up Stripe products and prices...\n')

  try {
    // Step 1: Create or retrieve the product
    let product: Stripe.Product
    const existingProducts = await stripe.products.list({ limit: 100 })
    const existingProduct = existingProducts.data.find(
      p => p.metadata.type === 'subscription' && p.metadata.category === 'coaching'
    )

    if (existingProduct) {
      console.log('✓ Product already exists:', existingProduct.id)
      product = existingProduct
    } else {
      product = await stripe.products.create({
        name: STRIPE_CONFIG.products.powerPulse.name,
        description: STRIPE_CONFIG.products.powerPulse.description,
        metadata: STRIPE_CONFIG.products.powerPulse.metadata,
        default_price_data: {
          currency: 'usd',
          unit_amount: 1499,
          recurring: {
            interval: 'month',
          },
        },
      })
      console.log('✓ Created product:', product.id)
    }

    // Step 2: Create prices
    const prices = []

    // Monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      ...STRIPE_CONFIG.prices.monthly,
    })
    prices.push({ type: 'monthly', id: monthlyPrice.id })
    console.log('✓ Created monthly price:', monthlyPrice.id)

    // Yearly price
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      ...STRIPE_CONFIG.prices.yearly,
    })
    prices.push({ type: 'yearly', id: yearlyPrice.id })
    console.log('✓ Created yearly price:', yearlyPrice.id)

    // Lifetime price (one-time)
    const lifetimePrice = await stripe.prices.create({
      product: product.id,
      nickname: STRIPE_CONFIG.prices.lifetime.nickname,
      unit_amount: STRIPE_CONFIG.prices.lifetime.unit_amount,
      currency: STRIPE_CONFIG.prices.lifetime.currency,
      metadata: STRIPE_CONFIG.prices.lifetime.metadata,
    })
    prices.push({ type: 'lifetime', id: lifetimePrice.id })
    console.log('✓ Created lifetime price:', lifetimePrice.id)

    // Step 3: Create customer portal configuration
    const portalConfigs = await stripe.billingPortal.configurations.list({ limit: 1 })
    let portalConfig

    if (portalConfigs.data.length > 0) {
      console.log('✓ Customer portal already configured')
      portalConfig = portalConfigs.data[0]
    } else {
      portalConfig = await stripe.billingPortal.configurations.create({
        business_profile: STRIPE_CONFIG.portal.business_profile,
        features: STRIPE_CONFIG.portal.features,
      })
      console.log('✓ Created customer portal configuration')
    }

    // Step 4: Create webhook endpoint (if not exists)
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pulse.powerhub.dev'}/api/webhook/stripe`
    const existingWebhooks = await stripe.webhookEndpoints.list({ limit: 100 })
    const existingWebhook = existingWebhooks.data.find(w => w.url === webhookUrl)

    if (existingWebhook) {
      console.log('✓ Webhook already exists:', existingWebhook.id)
    } else {
      const webhook = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: STRIPE_CONFIG.webhookEvents as Stripe.WebhookEndpointCreateParams.EnabledEvent[],
      })
      console.log('✓ Created webhook endpoint:', webhook.id)
      console.log('⚠️  IMPORTANT: Save this webhook signing secret:')
      console.log('   ', webhook.secret)
    }

    // Step 5: Create coupons for promotions
    const coupons = [
      {
        id: 'LAUNCH50',
        percent_off: 50,
        duration: 'repeating',
        duration_in_months: 3,
        metadata: { campaign: 'launch' },
      },
      {
        id: 'WELCOME30',
        percent_off: 30,
        duration: 'once',
        metadata: { campaign: 'welcome' },
      },
      {
        id: 'FRIEND20',
        percent_off: 20,
        duration: 'forever',
        metadata: { campaign: 'referral' },
      },
    ]

    for (const couponData of coupons) {
      try {
        const coupon = await stripe.coupons.create(couponData)
        console.log(`✓ Created coupon: ${coupon.id}`)
      } catch (error: any) {
        if (error.code === 'resource_already_exists') {
          console.log(`✓ Coupon already exists: ${couponData.id}`)
        } else {
          throw error
        }
      }
    }

    // Print environment variables to add
    console.log('\n📝 Add these to your .env.local file:\n')
    console.log(`STRIPE_PRODUCT_ID="${product.id}"`)
    prices.forEach(price => {
      console.log(`STRIPE_PRICE_${price.type.toUpperCase()}_ID="${price.id}"`)
    })
    console.log(`STRIPE_PORTAL_CONFIG_ID="${portalConfig.id}"`)
    console.log('\n✅ Stripe setup complete!')

  } catch (error) {
    console.error('❌ Error setting up Stripe:', error)
    process.exit(1)
  }
}

// Run the setup
setupStripeProducts()