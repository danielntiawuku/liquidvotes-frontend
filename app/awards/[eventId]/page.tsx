'use client'

import { useState, useEffect, use } from 'react'
import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import { Badge } from '@/components/ui/badge'
import { eventsApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import { Loader2, Trophy, ArrowLeft, ArrowRight, Users } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  status: string
  nominees: { id: string; status: string }[]
}

interface Event {
  id: string
  name: string
  description: string
  status: string
  currency: string
  votePrice: string
  organizer: {
    name: string
    organizationName: string | null
  }
  categories: Category[]
}

export default function EventCategoriesPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = use(params)
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Warm up the backend on page load so the event lookup finds a warm server.
  useWarmUp()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventsApi.getById(eventId)
        setEvent(response.data.event)
      } catch {
        setError('Event not found or no longer available.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-destructive">{error || 'Event not found.'}</p>
          <Link href="/awards" className="text-primary hover:underline text-sm">
            Back to Awards
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  // Only show categories that have at least one approved nominee
  const visibleCategories = event.categories.filter((c) =>
    c.nominees.some((n) => n.status === 'approved')
  )

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Back */}
          <Link
            href="/awards"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Awards
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold text-foreground">{event.name}</h1>
              <Badge variant="default" className="capitalize">{event.status}</Badge>
            </div>
            <p className="text-sm text-primary font-medium mb-3">
              {event.organizer.organizationName ?? event.organizer.name}
            </p>
            <p className="text-muted-foreground max-w-2xl">{event.description}</p>
            <p className="text-sm text-muted-foreground mt-3">
              {event.currency} {Number(event.votePrice).toFixed(2)} per vote
            </p>
          </div>

          {/* Categories */}
          {visibleCategories.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No categories available yet for this event.</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Select a category to vote
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {visibleCategories.map((category) => {
                  const approvedCount = category.nominees.filter(
                    (n) => n.status === 'approved'
                  ).length

                  return (
                    <Link
                      key={category.id}
                      href={`/awards/${event.id}/${category.id}`}
                      className="flex items-center justify-between p-5 border border-border rounded-xl hover:border-primary hover:shadow-sm transition bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{category.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Users className="w-3 h-3" />
                            {approvedCount} nominee{approvedCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}