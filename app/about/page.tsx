'use client'

import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Target, Zap, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-4 text-center mb-20">
          <h1 className="text-6xl font-bold text-primary mb-4">About Awards</h1>
          <p className="text-xl text-muted-foreground">Transforming how organizations recognize excellence</p>
        </div>

        {/* Mission Section */}
        <div className="max-w-4xl mx-auto px-4 mb-20">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold text-primary mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground">To provide organizations with a secure, transparent, and user-friendly platform for recognizing and celebrating excellence and outstanding achievement.</p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="max-w-6xl mx-auto px-4 mb-20">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'Innovation', desc: 'Continuously improving our platform' },
              { icon: Award, title: 'Excellence', desc: 'Delivering the best possible experience' },
              { icon: Users, title: 'Community', desc: 'Building connections and trust' },
              { icon: Target, title: 'Transparency', desc: 'Operating with integrity and openness' }
            ].map((value) => (
              <Card key={value.title}>
                <CardContent className="p-6 text-center space-y-4">
                  <value.icon className="w-12 h-12 text-secondary mx-auto" />
                  <h3 className="text-xl font-bold text-foreground">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-6xl mx-auto px-4 mb-20">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { stat: '50,000+', label: 'Events Hosted' },
              { stat: '5M+', label: 'Total Votes' },
              { stat: '100,000+', label: 'Users' },
              { stat: '99.99%', label: 'Uptime' }
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="p-8 text-center">
                  <p className="text-4xl font-bold text-secondary mb-2">{item.stat}</p>
                  <p className="text-muted-foreground">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto px-4 mb-20 text-center">
          <h2 className="text-4xl font-bold text-primary mb-6">Trusted by Industry Leaders</h2>
          <p className="text-lg text-muted-foreground mb-8">Fortune 500 companies and organizations worldwide rely on our platform</p>
          <Button asChild className="bg-secondary hover:bg-secondary/90 text-white">
            <Link href="/contact">Get Started Today</Link>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
