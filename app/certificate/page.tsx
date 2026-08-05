'use client'

import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Share2 } from 'lucide-react'

export default function CertificatePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="min-h-[70vh] pt-20 pb-20 flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-2">Certificate of Achievement</h1>
          <p className="text-muted-foreground">Presented to the winner</p>
        </div>

        {/* Certificate */}
        <Card className="mb-12 overflow-hidden border-4 border-secondary">
          <CardContent className="p-12 text-center bg-gradient-to-b from-card to-muted">
            <div className="mb-8">
              <svg width="60" height="60" viewBox="0 0 60 60" className="mx-auto" fill="none">
                <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="2" className="text-secondary"/>
                <path d="M30 15L35 25H46L37 31L41 41L30 35L19 41L23 31L14 25H26L30 15Z" fill="currentColor" className="text-secondary"/>
              </svg>
            </div>
            
            <h2 className="text-5xl font-bold text-primary mb-4">Certificate</h2>
            <p className="text-lg text-muted-foreground mb-8">OF ACHIEVEMENT</p>
            
            <div className="my-12 py-8 border-t-2 border-b-2 border-secondary">
              <p className="text-sm text-muted-foreground mb-2">This certificate is proudly presented to</p>
              <h3 className="text-4xl font-bold text-foreground mb-2">Tech Leaders Inc.</h3>
              <p className="text-lg text-muted-foreground">For Excellence and Outstanding Achievement in</p>
              <p className="text-2xl font-bold text-secondary mt-2">Best Innovation Award</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-12 text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="font-semibold text-foreground">January 31, 2024</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Award ID</p>
                <p className="font-semibold text-foreground">AWARD-2024-001</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-8">This digital certificate is officially recognized and verified</p>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-secondary hover:bg-secondary/90 text-white gap-2">
            <Link href="#" className="flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Download Certificate
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-primary text-primary gap-2">
            <Link href="#" className="flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Certificate
            </Link>
          </Button>
        </div>
      </div>
      </section>

      <Footer />
    </div>
  )
}
