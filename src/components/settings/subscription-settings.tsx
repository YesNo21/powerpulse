'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow, addDays } from 'date-fns'
import { toast } from 'sonner'
import { api } from '@/lib/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { useSubscription } from '@/hooks/use-subscription'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Download,
  Receipt,
  Shield,
  Zap,
  Star,
  TrendingUp,
  Gift,
  RefreshCw,
  Pause,
  Play,
} from 'lucide-react'

interface Invoice {
  id: string
  amount: number
  currency: string
  status: string
  created: Date
  invoicePdf?: string
}

export function SubscriptionSettings() {
  const router = useRouter()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  
  // Fetch subscription data
  const { subscription, isLoading: subLoading } = useSubscription()
  const { data: billingHistory, isLoading: historyLoading } = api.subscription.getBillingHistory.useQuery()
  
  // Mutations
  const cancelSubscription = api.subscription.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success('Subscription cancelled successfully')
      setShowCancelDialog(false)
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel subscription')
    },
  })
  
  const pauseSubscription = api.subscription.pauseSubscription.useMutation({
    onSuccess: () => {
      toast.success('Subscription paused successfully')
      setShowPauseDialog(false)
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to pause subscription')
    },
  })
  
  const resumeSubscription = api.subscription.resumeSubscription.useMutation({
    onSuccess: () => {
      toast.success('Subscription resumed successfully')
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to resume subscription')
    },
  })
  
  const updatePaymentMethod = api.subscription.createPaymentUpdateSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create payment update session')
    },
  })

  const openCustomerPortal = api.subscription.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to open billing portal')
    },
  })

  if (subLoading || historyLoading) {
    return <Loading />
  }

  const isActive = subscription?.status === 'active'
  const isPaused = subscription?.status === 'paused'
  const isCancelled = subscription?.status === 'cancelled'
  const refundEligible = subscription?.refundEligibleUntil && new Date(subscription.refundEligibleUntil) > new Date()

  const planBenefits = [
    { icon: Zap, text: 'Daily personalized audio coaching' },
    { icon: Star, text: 'AI-powered content adaptation' },
    { icon: TrendingUp, text: 'Progress tracking & analytics' },
    { icon: Gift, text: 'Achievement system & rewards' },
    { icon: Shield, text: '30-day money-back guarantee' },
  ]

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Your PowerPulse subscription details
              </CardDescription>
            </div>
            <Badge 
              variant={isActive ? 'success' : isPaused ? 'warning' : 'destructive'}
              className="flex items-center gap-1"
            >
              {isActive ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </>
              ) : isPaused ? (
                <>
                  <Pause className="h-3 w-3" />
                  Paused
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Cancelled
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Details */}
          <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div>
              <h3 className="font-semibold text-lg">PowerPulse Pro</h3>
              <p className="text-white/60">Unlimited daily coaching sessions</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">$14.99</p>
              <p className="text-sm text-white/60">per month</p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white/60">Included Benefits</h4>
            <div className="space-y-2">
              {planBenefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <benefit.icon className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Refund Eligibility */}
          {refundEligible && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-500">
                    Money-Back Guarantee Active
                  </p>
                  <p className="text-sm text-white/60 mt-1">
                    You're eligible for a full refund until{' '}
                    {format(new Date(subscription.refundEligibleUntil!), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Billing */}
          {isActive && subscription?.currentPeriodEnd && (
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-white/60" />
                <span className="text-sm text-white/60">Next billing date</span>
              </div>
              <span className="text-sm font-medium">
                {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription?.paymentMethod ? (
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-white/60" />
                <div>
                  <p className="font-medium">
                    {subscription.paymentMethod.brand?.toUpperCase()} •••• {subscription.paymentMethod.last4}
                  </p>
                  <p className="text-sm text-white/60">
                    Expires {subscription.paymentMethod.expMonth}/{subscription.paymentMethod.expYear}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updatePaymentMethod.mutate()}
                disabled={updatePaymentMethod.isLoading}
                className="border-white/10 hover:bg-white/5"
              >
                Update
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-500">
                No payment method on file
              </p>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => openCustomerPortal.mutate()}
            disabled={openCustomerPortal.isLoading}
            className="w-full border-white/10 hover:bg-white/5"
          >
            {openCustomerPortal.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Manage Billing in Stripe Portal
          </Button>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Your payment history and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {billingHistory && billingHistory.invoices.length > 0 ? (
            <div className="space-y-3">
              {billingHistory.invoices.map((invoice: Invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 text-white/60" />
                    <div>
                      <p className="font-medium">
                        ${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                      </p>
                      <p className="text-sm text-white/60">
                        {format(new Date(invoice.created), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={invoice.status === 'paid' ? 'success' : 'secondary'}
                      className="text-xs"
                    >
                      {invoice.status}
                    </Badge>
                    {invoice.invoicePdf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(invoice.invoicePdf, '_blank')}
                        className="hover:bg-white/5"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No billing history available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Actions */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>
            Pause, resume, or cancel your subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isActive && (
            <>
              {/* Pause Subscription */}
              <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 hover:bg-white/5"
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Subscription
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-white/10">
                  <DialogHeader>
                    <DialogTitle>Pause Your Subscription?</DialogTitle>
                    <DialogDescription>
                      You can pause your subscription for up to 3 months. Your progress will be saved, 
                      and you can resume anytime.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm text-blue-500">
                        While paused, you won't receive daily audio sessions or be charged.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowPauseDialog(false)}
                      className="border-white/10 hover:bg-white/5"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => pauseSubscription.mutate()}
                      disabled={pauseSubscription.isLoading}
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      {pauseSubscription.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Pause Subscription
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Cancel Subscription */}
              <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full border-red-500/20 hover:bg-red-500/10 text-red-500"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Your Subscription?</AlertDialogTitle>
                    <AlertDialogDescription>
                      We're sorry to see you go. Your subscription will remain active until the end 
                      of your current billing period.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-sm text-yellow-500">
                        You'll continue to have access until{' '}
                        {subscription?.currentPeriodEnd && 
                          format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')
                        }
                      </p>
                    </div>
                    
                    {refundEligible && (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <p className="text-sm text-emerald-500 font-medium">
                          You're eligible for a full refund!
                        </p>
                        <p className="text-sm text-white/60 mt-1">
                          Since you're within the 30-day guarantee period, you'll receive a full refund.
                        </p>
                      </div>
                    )}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-white/10 hover:bg-white/5">
                      Keep Subscription
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => cancelSubscription.mutate({ reason: cancellationReason })}
                      disabled={cancelSubscription.isLoading}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {cancelSubscription.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Cancel Subscription
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {isPaused && (
            <Button
              onClick={() => resumeSubscription.mutate()}
              disabled={resumeSubscription.isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              {resumeSubscription.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Resume Subscription
            </Button>
          )}

          {isCancelled && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-500">
                    Subscription Cancelled
                  </p>
                  <p className="text-sm text-white/60 mt-1">
                    Your subscription has been cancelled and will end on{' '}
                    {subscription?.currentPeriodEnd && 
                      format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reactivate Option */}
          {isCancelled && subscription?.currentPeriodEnd && new Date(subscription.currentPeriodEnd) > new Date() && (
            <Button
              variant="outline"
              className="w-full border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-500"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reactivate Subscription
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}