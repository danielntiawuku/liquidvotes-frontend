'use client'

import Link from 'next/link'
import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
              <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-primary mb-3">Payment Failed</h1>
            <p className="text-lg text-muted-foreground">
              Your payment could not be processed. You have not been charged.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What could have gone wrong?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li>Insufficient funds in your payment account</li>
                <li>Card expired or card information entered incorrectly</li>
                <li>Your bank or mobile money provider blocked the transaction</li>
                <li>Temporary issue with the payment processor — try again shortly</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1 bg-secondary hover:bg-secondary/90 text-white">
              <Link href="/voter/assistant">Try Again</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-primary text-primary">
              <Link href="/voter/assistant">Return to Voting</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-primary text-primary">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
