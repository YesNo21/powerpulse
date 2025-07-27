'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CreditCard, Calendar, CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api/client'
import { formatPrice } from '@/lib/stripe/config'
import { toast } from '@/hooks/use-toast'

export default function BillingPage() {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)
  
  // Get subscription data
  const { data: subscription, isLoading } = api.subscription.getStatus.useQuery()
  const createPortalSession = api.subscription.createPortalSession.useMutation()

  const handleManageSubscription = async () => {
    try {
      setIsLoadingPortal(true)
      const { url } = await createPortalSession.mutateAsync()
      window.location.href = url
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open billing portal. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingPortal(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
      case 'trialing':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Trial</Badge>
      case 'past_due':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Past Due</Badge>
      case 'canceled':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Canceled</Badge>
      case 'unpaid':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Unpaid</Badge>
      default:
        return <Badge variant="secondary">No Subscription</Badge>
    }
  }

  const getPlanName = (priceId?: string | null) => {
    if (!priceId) return 'Free'
    
    // Map price IDs to plan names (you'd get these from your Stripe dashboard)
    if (priceId.includes('monthly')) return 'Monthly'
    if (priceId.includes('yearly')) return 'Yearly'
    if (priceId.includes('lifetime')) return 'Lifetime'
    
    return 'Custom'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            {subscription?.status && getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscription?.status === 'active' || subscription?.status === 'trialing' ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="text-xl font-semibold">
                    {getPlanName(subscription.priceId)} Subscription
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-xl font-semibold">
                    {subscription.amount ? formatPrice(subscription.amount) : 'N/A'} 
                    {subscription.interval && `/${subscription.interval}`}
                  </p>
                </div>
              </div>

              {subscription.currentPeriodEnd && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {subscription.cancelAtPeriodEnd 
                      ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                      : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    }
                  </span>
                </div>
              )}

              {subscription.status === 'trialing' && subscription.trialEnd && (
                <div className="rounded-lg bg-blue-500/10 p-4 border border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <p className="text-sm">
                      Your trial ends on {new Date(subscription.trialEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {subscription.cancelAtPeriodEnd && (
                <div className="rounded-lg bg-orange-500/10 p-4 border border-orange-500/20">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <p className="text-sm">
                      Your subscription is set to cancel at the end of the current period
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You don't have an active subscription
              </p>
              <Button asChild>
                <a href="/quiz">Start Your Journey</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      {subscription?.paymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Your default payment method for subscription renewals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {subscription.paymentMethod.brand?.toUpperCase() || 'Card'} •••• {subscription.paymentMethod.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {subscription.paymentMethod.expMonth}/{subscription.paymentMethod.expYear}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription?.invoices && subscription.invoices.length > 0 ? (
            <div className="space-y-3">
              {subscription.invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {invoice.status === 'paid' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {formatPrice(invoice.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.created * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {invoice.invoicePdf && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={invoice.invoicePdf} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No billing history available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Manage Subscription Button */}
      {subscription?.status && subscription.status !== 'canceled' && (
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={handleManageSubscription}
              disabled={isLoadingPortal}
              className="w-full"
              variant="outline"
            >
              {isLoadingPortal ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Portal...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Update payment method, change plan, or cancel subscription
            </p>
          </CardContent>
        </Card>
      )}

      {/* Refund Policy */}
      <Card>
        <CardHeader>
          <CardTitle>30-Day Money Back Guarantee</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We offer a 30-day money-back guarantee on all new subscriptions. If you're not satisfied 
            with PowerPulse, contact our support team within 30 days of your first payment for a full refund.
          </p>
          {subscription?.refundEligibleUntil && new Date(subscription.refundEligibleUntil) > new Date() && (
            <div className="mt-4 rounded-lg bg-green-500/10 p-4 border border-green-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <p className="text-sm">
                  You're eligible for a refund until {new Date(subscription.refundEligibleUntil).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}