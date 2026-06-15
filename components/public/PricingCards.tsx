'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export function PricingCards() {
  const plans = [
    {
      name: 'Starter',
      price: '$99',
      description: 'Perfect for small organizations',
      features: [
        'Up to 1,000 voters',
        '1 event',
        'Basic analytics',
        'Email support',
        'Standard categories',
      ],
    },
    {
      name: 'Professional',
      price: '$299',
      description: 'For growing organizations',
      features: [
        'Up to 10,000 voters',
        '5 events',
        'Advanced analytics',
        'Priority support',
        'Custom categories',
        'Nominee management',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large-scale events',
      features: [
        'Unlimited voters',
        'Unlimited events',
        'Real-time dashboards',
        'Dedicated support',
        'Custom integrations',
        'White-label options',
      ],
    },
  ]

  return (
    <>
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={`relative overflow-hidden transition-all hover:shadow-xl ${
            plan.highlighted 
              ? 'border-2 border-secondary shadow-2xl lg:scale-105 bg-gradient-to-br from-secondary/5 to-primary/5' 
              : 'hover:-translate-y-1'
          }`}
        >
          {plan.highlighted && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary to-secondary"></div>
          )}
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-xl font-bold text-foreground">{plan.name}</CardTitle>
              {plan.highlighted && (
                <Badge className="bg-secondary text-white hover:bg-secondary/90">Most Popular</Badge>
              )}
            </div>
            <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
            <div className="mt-6 space-y-1">
              <span className="text-4xl font-bold text-foreground">{plan.price}</span>
              {plan.price !== 'Custom' && <p className="text-sm text-muted-foreground">per month, billed annually</p>}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              className={`w-full font-semibold shadow-md hover:shadow-lg transition-all ${
                plan.highlighted 
                  ? 'bg-secondary hover:bg-secondary/90 text-white' 
                  : 'border-2 border-primary text-primary hover:bg-primary/5'
              }`}
              variant={plan.highlighted ? 'default' : 'outline'}
            >
              Get Started
            </Button>
            <div className="space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
