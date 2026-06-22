'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, BarChart3, Lock } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-24 sm:pt-32 sm:pb-32">
      {/* Background gradient accent - using Deep Navy and Indigo */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-8">
            {/* Badge */}
            <div className="w-fit">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                <Zap size={16} className="text-secondary" />
                <span className="text-sm font-semibold text-secondary">Modern Voting Platform</span>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-balance leading-tight text-primary">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Award Recognition
                </span>
                {' '}Made Simple
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl text-balance leading-relaxed">
                Host, manage, and conduct transparent voting events with real-time analytics, secure payments, and comprehensive award management.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" asChild className="gap-2 bg-secondary hover:bg-secondary/90 text-white shadow-lg hover:shadow-xl transition-all">
                <Link href="/voter/assistant">
                  Cast Your Vote
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 border-2 border-primary text-primary hover:bg-primary/5">
                <Link href="/signup">
                  Host an Event
                </Link>
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
                <BarChart3 size={16} className="text-secondary" />
                <span className="text-sm font-medium text-foreground">Real-time Analytics</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
                <Lock size={16} className="text-accent" />
                <span className="text-sm font-medium text-foreground">Bank-level Security</span>
              </div>
            </div>
          </div>

          {/* Right Visual - Hero Images */}
          <div className="relative hidden lg:block">
            <div className="relative h-96 w-full">
              {/* Image Grid */}
              <div className="absolute inset-0 grid grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border bg-card">
                  <Image
                    src="/hero-voting.png"
                    alt="Voting interface"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent"></div>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border bg-card mt-8">
                  <Image
                    src="/hero-events.png"
                    alt="Event management dashboard"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 pt-16 border-t border-border">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-secondary">10K+</div>
            <p className="text-sm text-muted-foreground">Events Hosted</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-secondary">1M+</div>
            <p className="text-sm text-muted-foreground">Total Votes Cast</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-secondary">99.9%</div>
            <p className="text-sm text-muted-foreground">Uptime Guarantee</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-secondary">$50M+</div>
            <p className="text-sm text-muted-foreground">Votes Processed</p>
          </div>
        </div>
      </div>
    </section>
  )
}