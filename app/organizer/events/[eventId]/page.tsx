'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { eventsApi, organizerApi } from '@/lib/api'
import {
  Share2,
  BarChart3,
  Trophy,
  Loader2,
  ArrowLeft,
  TrendingUp,
  Calendar,
  Lock,
} from 'lucide-react'

interface Nominee {
  id: string
  name: string
  code: string
  status: string
  isWinner: boolean
  votes: number
}

interface Category {
  categoryId: string
  categoryName: string
  status: string
  nominees: Nominee[]
}

interface Event {
  id: string
  name: string
  description: string
  status: 'draft' | 'published' | 'closed'
  startDate: string
  endDate: string
  votePrice: string
  currency: string
  codePrefix: string
  categories: {
    id: string
    name: string
    status: string
    nominees: {
      id: string
      name: string
      code: string
      status: string
      isWinner: boolean
    }[]
  }[]
}

interface Analytics {
  totalRevenue: number
  totalVotes: number
  leaderboard: Category[]
}

const statusColor = {
  draft: 'secondary',
  published: 'default',
  closed: 'secondary',
} as const

export default function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = use(params)
  const [event, setEvent] = useState<Event | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [closing, setClosing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, analyticsRes] = await Promise.all([
          eventsApi.getById(eventId),
          organizerApi.getAnalytics(eventId),
        ])
        setEvent(eventRes.data.event)
        setAnalytics(analyticsRes.data.analytics)
      } catch {
        setError('Failed to load event.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId])

  const handlePublish = async () => {
    if (!confirm('Publish this event? Voters will be able to start voting.')) return
    setPublishing(true)
    try {
      await eventsApi.publish(eventId)
      setEvent((prev) => prev ? { ...prev, status: 'published' } : prev)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to publish event.')
    } finally {
      setPublishing(false)
    }
  }

  const handleClose = async () => {
    if (!confirm('Close voting for this event? This cannot be undone.')) return
    setClosing(true)
    try {
      await eventsApi.close(eventId)
      setEvent((prev) => prev ? { ...prev, status: 'closed' } : prev)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to close event.')
    } finally {
      setClosing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-destructive">{error || 'Event not found.'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <Link href="/organizer/events">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-foreground">{event.name}</h1>
              <Badge variant={statusColor[event.status]} className="capitalize">
                {event.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(event.startDate).toLocaleDateString()} —{' '}
              {new Date(event.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link href={`/organizer/share?eventId=${event.id}`}>
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </Link>
          <Link href={`/organizer/analytics?eventId=${event.id}`}>
            <Button variant="outline" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
          </Link>
          {event.status === 'draft' && (
            <Button onClick={handlePublish} disabled={publishing} className="gap-2">
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
              Publish Event
            </Button>
          )}
          {event.status === 'published' && (
            <Button
              onClick={handleClose}
              disabled={closing}
              variant="outline"
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Close Voting
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Votes</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {analytics?.totalVotes.toLocaleString() ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {event.currency} {analytics?.totalRevenue.toFixed(2) ?? '0.00'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Categories</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {event.categories.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Nominees</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {event.categories.reduce((s, c) => s + c.nominees.length, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="nominees">
        <TabsList className="mb-6">
          <TabsTrigger value="nominees">Nominees</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        {/* Nominees tab */}
        <TabsContent value="nominees" className="space-y-4">
          {event.categories.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No categories yet</p>
                <Link href={`/organizer/events/${event.id}/details`}>
                  <Button>Add Categories & Nominees</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            event.categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    <Badge variant="secondary" className="capitalize text-xs">
                      {category.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {category.nominees.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No nominees in this category.</p>
                  ) : (
                    <div className="space-y-2">
                      {category.nominees.map((nominee) => (
                        <div
                          key={nominee.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <code className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                              {nominee.code}
                            </code>
                            <span className="text-sm font-medium text-foreground">
                              {nominee.name}
                            </span>
                            {nominee.isWinner && (
                              <Trophy className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <Badge
                            variant={nominee.status === 'approved' ? 'default' : 'secondary'}
                            className="capitalize text-xs"
                          >
                            {nominee.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Leaderboard tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          {!analytics?.leaderboard.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No votes recorded yet.</p>
              </CardContent>
            </Card>
          ) : (
            analytics.leaderboard.map((category) => (
              <Card key={category.categoryId}>
                <CardHeader>
                  <CardTitle className="text-base">{category.categoryName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.nominees.map((nominee, index) => {
                      const topVotes = category.nominees[0]?.votes ?? 0
                      const percentage = topVotes > 0 ? (nominee.votes / topVotes) * 100 : 0
                      return (
                        <div key={nominee.id} className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            index === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-foreground">
                                {nominee.name}
                              </span>
                              <span className="text-sm font-bold text-foreground">
                                {nominee.votes.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Details tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Event Name</p>
                  <p className="font-medium text-foreground mt-1">{event.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium text-foreground mt-1 capitalize">{event.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vote Price</p>
                  <p className="font-medium text-foreground mt-1">
                    {event.currency} {Number(event.votePrice).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Code Prefix</p>
                  <code className="font-bold text-primary mt-1 block">{event.codePrefix}</code>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium text-foreground mt-1">
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium text-foreground mt-1">
                    {new Date(event.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-muted-foreground text-sm">Description</p>
                <p className="text-foreground text-sm mt-1">{event.description}</p>
              </div>
              <div className="pt-2">
                <Link href={`/organizer/events/${event.id}/details`}>
                  <Button variant="outline" className="gap-2">
                    Edit Event Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}