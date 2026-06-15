'use client'

import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import { PricingCards } from '@/components/public/PricingCards'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that best fits your organization&apos;s needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <PricingCards />
          </div>
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              All plans include 24/7 support and secure infrastructure
            </p>
            <p className="text-sm text-muted-foreground">
              Questions? <a href="mailto:support@example.com" className="text-primary hover:underline">Contact our sales team</a>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
