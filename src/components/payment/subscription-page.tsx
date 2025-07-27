'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentForm } from './payment-form';
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/subscription-service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function SubscriptionPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSuccess = async (paymentIntent: any) => {
    setIsProcessing(true);
    
    // You can add additional logic here, such as:
    // - Showing a success message
    // - Redirecting to a dashboard
    // - Tracking analytics
    
    router.push('/dashboard?subscribed=true');
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment error:', error);
    // Handle error (show toast, etc.)
  };

  if (selectedPlan) {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);
    if (!plan) return null;

    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedPlan(null)}
            disabled={isProcessing}
          >
            ← Back to plans
          </Button>
        </div>
        <div className="flex justify-center">
          <PaymentForm
            priceId={plan.priceId}
            amount={plan.amount}
            planName={plan.name}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground">
          Select the plan that best fits your fitness journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card 
            key={plan.id} 
            className={cn(
              "relative",
              plan.id === 'pro' && "border-primary shadow-lg"
            )}
          >
            {plan.id === 'pro' && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">
                  ${(plan.amount / 100).toFixed(0)}
                </span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.id === 'pro' ? 'default' : 'outline'}
                onClick={() => setSelectedPlan(plan.id)}
              >
                Get Started
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}