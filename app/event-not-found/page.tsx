'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Download } from 'lucide-react'

export default function EventNotFoundPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <AlertCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-3">Event Not Found</h1>
          <p className="text-lg text-muted-foreground">The event you&apos;re looking for doesn&apos;t exist or has been removed</p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-6">You may have used an incorrect event code or the event is no longer available.</p>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Event Code Entered</p>
                <p className="text-lg font-semibold text-foreground">INVALID2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <p className="font-semibold text-foreground text-center">What you can do:</p>
          <div className="grid gap-3">
            <div className="p-4 border border-border rounded-lg hover:bg-muted transition">
              <p className="font-semibold text-foreground mb-1">Double-check the event code</p>
              <p className="text-sm text-muted-foreground">Make sure you&apos;ve entered the correct code provided by the organizer</p>
            </div>
            <div className="p-4 border border-border rounded-lg hover:bg-muted transition">
              <p className="font-semibold text-foreground mb-1">Browse available events</p>
              <p className="text-sm text-muted-foreground">Visit the awards discovery page to find active events</p>
            </div>
            <div className="p-4 border border-border rounded-lg hover:bg-muted transition">
              <p className="font-semibold text-foreground mb-1">Contact the organizer</p>
              <p className="text-sm text-muted-foreground">Reach out to the event organizer for clarification</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button asChild className="flex-1 bg-secondary hover:bg-secondary/90 text-white">
            <Link href="/voter/assistant">Try Another Event</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 border-primary text-primary">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
