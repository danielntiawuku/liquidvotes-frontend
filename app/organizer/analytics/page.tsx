'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { organizerApi, eventsApi } from '@/lib/api'
import { BarChart3, TrendingUp, Trophy, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Nominee {
  id: string
  name: string
  code: string
  votes: number
  isWinner: boolean
}

interface Category {
  categoryId: string
  categoryName: string
  status: string
  nominees: Nominee[]
}

interface Analytics {
  event: {
    id: string
    name: string
    status: string
    votePrice: string
    currency: string
  }
  totalRevenue: number
  totalVotes: number
  revenueByDay: Record<string, number>
  leaderboard: Category[]
}

interface OrganizerEvent {
  id: string
  name: string
}

export default function OrganizerAnalyticsPage() {
  const searchParams = useSearchParams()
  const eventIdParam = searchParams.get('eventId')

  const [events, setEvents] = useState<OrganizerEvent[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>(eventIdParam || '')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [error, setError] = useState('')

  // Load organizer events for the selector
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getMine()
        setEvents(response.data.events)
        if (!selectedEventId && response.data.events.length > 0) {
          setSelectedEventId(response.data.events[0].id)
        }
      } catch {
        setError('Failed to load events.')
      } finally {
        setEventsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Load analytics when event is selected
  useEffect(() => {
    if (!selectedEventId) return

    const fetchAnalytics = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await organizerApi.getAnalytics(selectedEventId)
        setAnalytics(response.data.analytics)
      } catch {
        setError('Failed to load analytics for this event.')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedEventId])

  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/organizer/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Event Analytics</h1>
          <p className="text-muted-foreground mt-1">Track voting progress and revenue</p>
        </div>

        {/* Event selector */}
        {events.length > 1 && (
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="border border-input bg-background rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* No events */}
      {events.length === 0 && (
        <div className="text-center py-20">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No events found. Create an event first.</p>
          <Link href="/organizer/events/new">
            <Button className="mt-4">Create Event</Button>
          </Link>
        </div>
      )}

      {/* Loading analytics */}
      {loading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {/* Analytics content */}
      {analytics && !loading && (
        <div className="space-y-6">

          {/* Event info */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-foreground">{analytics.event.name}</h2>
            <Badge className="capitalize">{analytics.event.status}</Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Votes</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {analytics.totalVotes.toLocaleString()}
                    </p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {analytics.event.currency} {analytics.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Vote Price</p>
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {analytics.event.currency} {Number(analytics.event.votePrice).toFixed(2)}
                    </p>
                  </div>
                  <Trophy className="w-10 h-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by day */}
          {Object.keys(analytics.revenueByDay).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue — Last 30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analytics.revenueByDay)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, amount]) => {
                      const max = Math.max(...Object.values(analytics.revenueByDay))
                      const percentage = max > 0 ? (amount / max) * 100 : 0
                      return (
                        <div key={date} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-24 flex-shrink-0">
                            {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-foreground w-16 text-right flex-shrink-0">
                            {analytics.event.currency} {amount.toFixed(2)}
                          </span>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard per category */}
          {analytics.leaderboard.map((category) => (
            <Card key={category.categoryId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{category.categoryName}</CardTitle>
                  <Badge variant="secondary" className="capitalize">
                    {category.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {category.nominees.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No nominees yet.</p>
                ) : (
                  <div className="space-y-3">
                    {category.nominees.map((nominee, index) => {
                      const topVotes = category.nominees[0].votes
                      const percentage = topVotes > 0 ? (nominee.votes / topVotes) * 100 : 0
                      return (
                        <div key={nominee.id} className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            index === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground truncate">
                                  {nominee.name}
                                </span>
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                  {nominee.code}
                                </code>
                                {nominee.isWinner && (
                                  <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                                )}
                              </div>
                              <span className="text-sm font-bold text-foreground ml-2 flex-shrink-0">
                                {nominee.votes.toLocaleString()} votes
                              </span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

        </div>
      )}
    </div>
  )
}