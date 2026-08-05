'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { eventsApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import { Search, Loader2, Trophy, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Event {
  id: string
  name: string
  description: string
  status: string
  startDate: string
  endDate: string
  votePrice: string
  currency: string
  organizer: {
    name: string
    organizationName: string | null
  }
  categories: {
    id: string
    name: string
  }[]
}

export default function AwardsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Warm up the backend on page load so a sleeping Render instance has time
  // to boot before the voter starts browsing awards.
  useWarmUp()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getAll()
        setEvents(response.data.events)
      } catch {
        setError('Failed to load events.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const filtered = events.filter((e) => {
    const term = search.toLowerCase()
    return (
      e.name.toLowerCase().includes(term) ||
      e.description.toLowerCase().includes(term) ||
      (e.organizer.organizationName ?? e.organizer.name).toLowerCase().includes(term)
    )
  })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Browse Awards</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover active voting events and support your favourite nominees
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-12">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, organizers..."
              className="pl-9 h-12"
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-20">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">
                {events.length === 0
                  ? 'No active events right now.'
                  : 'No events match your search.'}
              </p>
              <p className="text-sm text-muted-foreground">
                Check back soon or{' '}
                <Link href="/voter/assistant" className="text-primary hover:underline">
                  enter a nominee code
                </Link>{' '}
                to vote directly.
              </p>
            </div>
          )}

          {/* Events grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((event) => (
                <Link
                  key={event.id}
                  href={`/awards/${event.id}`}
                  className="flex flex-col p-6 border border-border rounded-xl hover:border-primary hover:shadow-sm transition bg-card"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="default" className="capitalize">
                      {event.status}
                    </Badge>
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {event.name}
                  </h3>

                  {/* Organizer */}
                  <p className="text-xs text-primary font-medium mb-2">
                    {event.organizer.organizationName ?? event.organizer.name}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Categories */}
                  {event.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {event.categories.slice(0, 3).map((cat) => (
                        <span
                          key={cat.id}
                          className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                        >
                          {cat.name}
                        </span>
                      ))}
                      {event.categories.length > 3 && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          +{event.categories.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Ends {new Date(event.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">
                        {event.currency} {Number(event.votePrice).toFixed(2)}/vote
                      </span>
                      <Button size="sm" className="gap-1 h-7 text-xs" tabIndex={-1}>
                        View
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}