# Stripe Payment Integration Setup

## Prerequisites
- Stripe account (https://dashboard.stripe.com)
- Stripe CLI installed (optional but recommended)
- Node.js environment for running setup scripts

## Step 1: Get Stripe API Keys

1. Log in to Stripe Dashboard
2. Navigate to Developers > API keys
3. Copy your keys:
   - **Test mode**: Use for development
   - **Live mode**: Use for production

Add to `.env.local`:
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # You'll get this after running setup
```

## Step 2: Run Stripe Setup Script

```bash
# Install dependencies if needed
pnpm install

# Run the setup script
pnpm tsx scripts/setup-stripe.ts
```

This script will:
- ✅ Create PowerPulse product
- ✅ Set up pricing ($14.99/month, $143.88/year, $299 lifetime)
- ✅ Configure customer portal
- ✅ Create webhook endpoint
- ✅ Generate promotional coupons
- ✅ Output environment variables to add

## Step 3: Configure Webhook Endpoint

### Local Development (using Stripe CLI):
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

### Production:
1. The setup script creates the webhook automatically
2. Copy the webhook signing secret to your environment
3. Ensure your domain is configured correctly

## Step 4: Test Payment Flow

### Test Cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

### Test the flow:
1. Complete the quiz
2. Click "Start My Transformation"
3. Enter test card details
4. Verify webhook is received
5. Check user subscription status updates

## Step 5: Subscription Management

### Customer Portal:
Users can manage subscriptions at:
```
/api/stripe/create-portal-session
```

Portal features:
- Update payment method
- Cancel subscription
- Download invoices
- Pause subscription
- Change billing address

### Admin Actions:

```javascript
// Cancel subscription immediately
await stripe.subscriptions.del('sub_xxx')

// Cancel at period end
await stripe.subscriptions.update('sub_xxx', {
  cancel_at_period_end: true
})

// Pause subscription
await stripe.subscriptions.update('sub_xxx', {
  pause_collection: {
    behavior: 'void'
  }
})

// Resume subscription
await stripe.subscriptions.update('sub_xxx', {
  pause_collection: null
})
```

## Step 6: Refund Policy Implementation

PowerPulse offers a 30-day money-back guarantee:

```javascript
// Process refund (within 30 days)
const charge = await stripe.charges.list({
  customer: customerId,
  limit: 1
})

if (charge.data.length > 0) {
  await stripe.refunds.create({
    charge: charge.data[0].id,
    reason: 'requested_by_customer'
  })
}
```

## Step 7: Production Checklist

Before going live:

- [ ] Switch to live API keys
- [ ] Update webhook endpoint to production URL
- [ ] Configure production webhook signing secret
- [ ] Test with real card
- [ ] Set up Stripe Radar rules for fraud prevention
- [ ] Configure tax settings if applicable
- [ ] Enable invoice emails in Stripe
- [ ] Set up payment retry rules
- [ ] Configure subscription lifecycle emails

## Webhook Events Handled

Our integration handles these events:

- `checkout.session.completed` - New subscription created
- `customer.subscription.updated` - Status changes
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_succeeded` - Renewal success
- `invoice.payment_failed` - Payment failure
- `customer.subscription.trial_will_end` - Trial ending (3 days)
- `charge.refunded` - Refund processed

## Monitoring

### Key Metrics:
- Conversion rate (quiz → payment)
- Churn rate
- Failed payment recovery
- Average subscription length
- Refund rate

### Stripe Dashboard:
- Monitor failed payments
- Track subscription metrics
- Review disputes
- Analyze revenue

## Troubleshooting

### Common Issues:

1. **Webhook not received**
   - Check endpoint URL
   - Verify signing secret
   - Check Stripe webhook logs

2. **Payment fails**
   - Check card decline codes
   - Verify amount and currency
   - Review Radar rules

3. **Subscription not updating**
   - Check webhook processing
   - Verify database updates
   - Review error logs

### Debug Mode:
```javascript
// Enable Stripe debug logging
const stripe = new Stripe(key, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
  telemetry: false,
  maxNetworkRetries: 2,
})
```

## Security Best Practices

1. **Never expose secret keys**
   - Use environment variables
   - Rotate keys regularly

2. **Validate webhooks**
   - Always verify signatures
   - Check event timing

3. **PCI Compliance**
   - Use Stripe Elements/Checkout
   - Never store card details

4. **Rate Limiting**
   - Implement on endpoints
   - Monitor for abuse

## Support

- Stripe Support: https://support.stripe.com
- API Reference: https://stripe.com/docs/api
- Testing Guide: https://stripe.com/docs/testing