'use client'

import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import { HeroSection } from '@/components/public/HeroSection'
import { PricingCards } from '@/components/public/PricingCards'

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <section className="py-20 px-4 bg-muted">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-primary">Flexible Plans for Every Organization</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">Choose the perfect plan to host, manage, and run your voting events</p>
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCards />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
