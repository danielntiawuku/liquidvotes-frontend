'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { organizerApi } from '@/lib/api'
import {
  Plus,
  BarChart3,
  TrendingUp,
  Trophy,
  Loader2,
  ArrowRight,
  Calendar,
} from 'lucide-react'

interface Event {
  id: string
  name: string
  status: 'draft' | 'published' | 'closed'
  startDate: string
  endDate: string
  votePrice: string
  revenue: number
  categoriesCount: number
  nomineesCount: number
}

interface Dashboard {
  totalEvents: number
  publishedEvents: number
  totalRevenue: number
  totalVotes: number
  events: Event[]
}

const statusColor = {
  draft: 'secondary',
  published: 'default',
  closed: 'secondary',
} as const

export default function OrganizerDashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await organizerApi.getDashboard()
        setDashboard(response.data.dashboard)
      } catch {
        setError('Failed to load dashboard. Please refresh.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Event Management</h1>
          <p className="text-muted-foreground">
            Create and manage your voting events
          </p>
        </div>
        <Link href="/organizer/events/new">
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" />
            New Event
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Events</p>
          <p className="text-3xl font-bold">{dashboard?.totalEvents ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-2">All time</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Active Events</p>
          <p className="text-3xl font-bold">{dashboard?.publishedEvents ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-2">Voting in progress</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Votes</p>
          <p className="text-3xl font-bold">{dashboard?.totalVotes ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-2">All time</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
          <p className="text-3xl font-bold">
            GHS {(dashboard?.totalRevenue ?? 0).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">After platform fees</p>
        </Card>
      </div>

      {/* Events list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Events</CardTitle>
          <Link href="/organizer/events">
            <Button variant="outline" size="sm" className="gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!dashboard?.events.length ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No events yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Create your first voting event to get started
              </p>
              <Link href="/organizer/events/new">
                <Button>Create Event</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground truncate">
                          {event.name}
                        </p>
                        <Badge variant={statusColor[event.status]} className="capitalize text-xs">
                          {event.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(event.startDate).toLocaleDateString()} —{' '}
                          {new Date(event.endDate).toLocaleDateString()}
                        </span>
                        <span>{event.categoriesCount} categories</span>
                        <span>{event.nomineesCount} nominees</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-foreground">
                        GHS {event.revenue.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">revenue</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/organizer/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </Link>
                      <Link href={`/organizer/analytics?eventId=${event.id}`}>
                        <Button variant="ghost" size="sm">
                          <TrendingUp className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}