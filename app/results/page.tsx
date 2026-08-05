'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { eventsApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import {
  Trophy,
  Loader2,
  ArrowLeft,
  Award,
  Share2,
  Check,
  ExternalLink,
  Calendar,
} from 'lucide-react'

interface ResultsNominee {
  id: string
  name: string
  code: string
  isWinner: boolean
  votes: number
}

interface CategoryResults {
  categoryId: string
  categoryName: string
  winner: ResultsNominee | null
  ranking: ResultsNominee[]
}

interface ResultsPayload {
  success: boolean
  event: {
    id: string
    name: string
    description: string
    status: string
    currency: string
    votePrice: string
    startDate: string
    endDate: string
    organizer: {
      name: string
      organizationName: string | null
    }
  }
  results: CategoryResults[]
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const paramEventId = searchParams.get('eventId')
  const paramCategory = searchParams.get('category')

  const [events, setEvents] = useState<{ id: string; name: string }[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(paramEventId)
  const [payload, setPayload] = useState<ResultsPayload | null>(null)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingResults, setLoadingResults] = useState(false)
  const [error, setError] = useState('')
  const [copiedCategory, setCopiedCategory] = useState<string | null>(null)

  // Warm up the backend so the events + results requests find a warm server.
  useWarmUp()

  // Load the announced events (closed) so we can offer a picker and resolve a
  // sensible default when no eventId query param was supplied.
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getAll()
        const announced = response.data.events.filter(
          (e: any) => e.status === 'closed'
        )
        setEvents(announced)
        if (!paramEventId && announced.length > 0) {
          setSelectedEventId(announced[0].id)
        }
      } catch {
        setError('Failed to load announced results.')
      } finally {
        setLoadingEvents(false)
      }
    }

    fetchEvents()
  }, [paramEventId])

  // Fetch the real winners + vote counts for the selected event.
  useEffect(() => {
    if (!selectedEventId) return

    setLoadingResults(true)
    setError('')
    setPayload(null)

    eventsApi
      .getResults(selectedEventId)
      .then((res) => setPayload(res.data))
      .catch(() => {
        setError('Results have not been announced for this event yet.')
      })
      .finally(() => setLoadingResults(false))
  }, [selectedEventId])

  // If a specific category was linked to (e.g. from a nominee page), scroll to it.
  useEffect(() => {
    if (!paramCategory || !payload) return
    const el = document.getElementById(`cat-${paramCategory}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [paramCategory, payload])

  const handleShare = async (categoryName: string, winnerName: string) => {
    const url = window.location.href
    const text = `${winnerName} won ${categoryName} in ${payload?.event.name ?? ''}!`
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${payload?.event.name ?? ''} Results`,
          text,
          url,
        })
        return
      }
    } catch {
      return // user dismissed the share sheet
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`)
      setCopiedCategory(categoryName)
      setTimeout(() => setCopiedCategory(null), 2000)
    } catch {
      // clipboard unavailable — nothing more we can do
    }
  }

  if (loadingEvents) {
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Back */}
          <Link
            href="/awards"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Awards
          </Link>

          {/* No announced results at all */}
          {!error && events.length === 0 && (
            <div className="text-center py-20">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">No announced results yet</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Winners will appear here as soon as organizers close voting and publish
                results.
              </p>
            </div>
          )}

          {/* Load failed */}
          {error && !payload && (
            <div className="text-center py-20">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-destructive mb-4">{error}</p>
              {events.length > 0 && (
                <Button variant="outline" onClick={() => setSelectedEventId(events[0].id)}>
                  Browse announced results
                </Button>
              )}
            </div>
          )}

          {/* Results */}
          {payload && (
            <>
              {/* Hero */}
              <div className="text-center mb-10">
                <Trophy className="w-16 h-16 text-secondary mx-auto mb-4" />
                <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                  {payload.event.name}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {payload.event.organizer.organizationName ?? payload.event.organizer.name}
                  <span className="mx-2">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Results Announced
                  </span>
                </p>
                {payload.event.description && (
                  <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-3">
                    {payload.event.description}
                  </p>
                )}
              </div>

              {/* Event picker */}
              {events.length > 1 && (
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                  {events.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setSelectedEventId(e.id)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        selectedEventId === e.id
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {e.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Loading a different event */}
              {loadingResults && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}

              {/* Winner cards */}
              {!loadingResults && (
                <div className="space-y-8">
                  {payload.results.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No categories found for this event.</p>
                    </div>
                  ) : (
                    payload.results.map((category) => (
                      <Card
                        key={category.categoryId}
                        id={`cat-${category.categoryId}`}
                        className="overflow-hidden hover:shadow-xl transition"
                      >
                        <div className="h-1 bg-gradient-to-r from-secondary to-primary" />
                        <CardContent className="p-6 sm:p-8">
                          <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
                            <div>
                              <Badge className="mb-3 bg-secondary/10 text-secondary">
                                {category.categoryName}
                              </Badge>
                              {category.winner ? (
                                <div className="flex items-center gap-3 flex-wrap">
                                  <Trophy className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                                    {category.winner.name}
                                  </h2>
                                </div>
                              ) : (
                                <h2 className="text-2xl font-bold text-muted-foreground">
                                  No winner announced yet
                                </h2>
                              )}
                            </div>
                            {category.winner && (
                              <div className="text-right">
                                <div className="text-3xl font-bold text-secondary">
                                  {category.winner.votes.toLocaleString()}
                                </div>
                                <p className="text-sm text-muted-foreground">votes</p>
                              </div>
                            )}
                          </div>

                          {/* Full ranking */}
                          {category.ranking.length > 0 && (
                            <div className="space-y-1.5">
                              {category.ranking.map((nominee, idx) => (
                                <div
                                  key={nominee.id}
                                  className={`flex items-center gap-3 p-2 rounded-lg text-sm ${
                                    nominee.isWinner
                                      ? 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800/60'
                                      : ''
                                  }`}
                                >
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                    idx === 0
                                      ? 'bg-yellow-400 text-yellow-900'
                                      : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <span className={`flex-1 min-w-0 truncate ${
                                    nominee.isWinner ? 'font-semibold text-foreground' : 'text-foreground'
                                  }`}>
                                    {nominee.name}
                                  </span>
                                  {nominee.isWinner && (
                                    <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                  )}
                                  <span className="font-medium text-foreground flex-shrink-0">
                                    {nominee.votes.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          {category.winner && (
                            <div className="flex gap-3 mt-6 flex-wrap">
                              <Button asChild className="gap-2">
                                <Link href={`/voter/nominee/${category.winner.code}`}>
                                  <ExternalLink className="w-4 h-4" />
                                  View Winner Profile
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                className="gap-2"
                                onClick={() =>
                                  handleShare(category.categoryName, category.winner!.name)
                                }
                              >
                                {copiedCategory === category.categoryName ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Share2 className="w-4 h-4" />
                                    Share
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Footer CTA */}
              {!loadingResults && payload.results.length > 0 && (
                <div className="text-center mt-12">
                  <Button asChild variant="outline" className="border-primary text-primary">
                    <Link href="/awards">Browse more awards</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <Footer />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  )
}
