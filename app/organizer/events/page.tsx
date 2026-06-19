'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { eventsApi } from '@/lib/api'
import {
  Plus,
  Calendar,
  TrendingUp,
  Eye,
  Trash2,
  Loader2,
  Trophy,
  Share2,
} from 'lucide-react'

interface Event {
  id: string
  name: string
  status: 'draft' | 'published' | 'closed'
  startDate: string
  endDate: string
  votePrice: string
  currency: string
  codePrefix: string
  categoriesCount: number
  nomineesCount: number
  revenue: number
}

const statusColor = {
  draft: 'secondary',
  published: 'default',
  closed: 'secondary',
} as const

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getMine()
        setEvents(response.data.events)
      } catch {
        setError('Failed to load events.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) return

    setDeletingId(id)
    try {
      await eventsApi.delete(id)
      setEvents((prev) => prev.filter((e) => e.id !== id))
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete event.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Manage Events</h1>
          <p className="text-muted-foreground mt-1">All your voting events in one place</p>
        </div>
        <Link href="/organizer/events/new">
          <Button
            className="gap-2 shadow-md hover:shadow-lg transition-shadow"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
          >
            <Plus className="w-4 h-4" />
            New Event
          </Button>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && events.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-primary" />
          </div>
          <p className="text-foreground font-medium mb-1">No events yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first voting event to get started
          </p>
          <Link href="/organizer/events/new">
            <Button
              className="shadow-md"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
            >
              Create Event
            </Button>
          </Link>
        </div>
      )}

      {/* Events list */}
      <div className="space-y-4">
        {events.map((event) => (
          <Card
            key={event.id}
            className="border-border/60 hover:border-primary/30 hover:shadow-md transition-all overflow-hidden"
          >
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex-1 min-w-0">

                  {/* Name + status */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{event.name}</h3>
                    <Badge variant={statusColor[event.status]} className="capitalize">
                      {event.status}
                    </Badge>
                    <code className="text-xs bg-gradient-to-r from-primary/10 to-secondary/10 text-primary px-2 py-0.5 rounded-md font-bold">
                      {event.codePrefix}**
                    </code>
                  </div>

                  {/* Dates */}
                  <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1 ml-12">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(event.startDate).toLocaleDateString()} —{' '}
                    {new Date(event.endDate).toLocaleDateString()}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-6 flex-wrap text-sm ml-12">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {event.categoriesCount} categories
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {event.nomineesCount} nominees
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      {event.currency} {event.revenue.toFixed(2)} revenue
                    </div>
                    <div className="text-muted-foreground">
                      {event.currency} {Number(event.votePrice).toFixed(2)}/vote
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link href={`/organizer/events/${event.id}`}>
                    <Button size="sm" className="w-full gap-2 rounded-lg">
                      <Eye className="w-3.5 h-3.5" />
                      Manage
                    </Button>
                  </Link>
                  <Link href={`/organizer/share?eventId=${event.id}`}>
                    <Button size="sm" variant="outline" className="w-full gap-2 rounded-lg">
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </Button>
                  </Link>
                  {event.status === 'draft' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-2 rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
                    >
                      {deletingId === event.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}