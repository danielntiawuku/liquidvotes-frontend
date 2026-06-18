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
  Vote,
  Wallet,
  Sparkles,
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

  const stats = [
    {
      label: 'Total Events',
      value: dashboard?.totalEvents ?? 0,
      sub: 'All time',
      icon: Trophy,
      gradient: 'from-primary to-primary/60',
    },
    {
      label: 'Active Events',
      value: dashboard?.publishedEvents ?? 0,
      sub: 'Voting in progress',
      icon: Sparkles,
      gradient: 'from-secondary to-secondary/60',
    },
    {
      label: 'Total Votes',
      value: dashboard?.totalVotes.toLocaleString() ?? 0,
      sub: 'All time',
      icon: Vote,
      gradient: 'from-purple-500 to-fuchsia-400',
    },
    {
      label: 'Total Revenue',
      value: `GHS ${(dashboard?.totalRevenue ?? 0).toFixed(2)}`,
      sub: 'After platform fees',
      icon: Wallet,
      gradient: 'from-emerald-500 to-teal-400',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your voting events
          </p>
        </div>
        <Link href="/organizer/events/new">
          <Button
            size="lg"
            className="gap-2 shadow-md hover:shadow-lg transition-shadow"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
          >
            <Plus className="w-5 h-5" />
            New Event
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="relative overflow-hidden border-border/60 hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-sm`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Events list */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Your Events</CardTitle>
          <Link href="/organizer/events">
            <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!dashboard?.events.length ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-7 h-7 text-primary" />
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
          ) : (
            <div className="space-y-3">
              {dashboard.events.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-muted/30 transition-all"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center flex-shrink-0">
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

                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-foreground">
                        GHS {event.revenue.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">revenue</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/organizer/events/${event.id}`}>
                        <Button variant="outline" size="sm" className="rounded-lg">
                          Manage
                        </Button>
                      </Link>
                      <Link href={`/organizer/analytics?eventId=${event.id}`}>
                        <Button variant="ghost" size="sm" className="rounded-lg">
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