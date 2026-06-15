'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-3">Payment Failed</h1>
          <p className="text-lg text-muted-foreground">We couldn&apos;t process your payment</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What Happened?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <p className="font-semibold text-destructive mb-2">Error Code: CARD_DECLINED</p>
              <p className="text-sm text-muted-foreground">Your card was declined by the payment processor. This could be due to:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-3 space-y-1">
                <li>Insufficient funds</li>
                <li>Card has expired</li>
                <li>Incorrect card information</li>
                <li>Card issuer fraud protection</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Event</p>
                <p className="font-semibold text-foreground">Annual Awards 2024</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-semibold text-secondary">$15.00</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="bg-destructive text-white">Failed</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transaction ID</p>
                <p className="font-semibold text-foreground">TXN-2024-001234</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 mb-8">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="font-semibold text-foreground mb-2">Try these solutions:</p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Check that your card details are correct</li>
              <li>Try a different payment method</li>
              <li>Contact your card issuer to check for fraud holds</li>
              <li>Wait a few minutes and try again</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1 bg-secondary hover:bg-secondary/90 text-white">
            <Link href="/voter/checkout">Try Again</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 border-primary text-primary">
            <Link href="/voter/assistant">Return to Voting</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 border-primary text-primary">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
