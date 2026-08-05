'use client'

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { eventsApi, organizerApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import { Trophy, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Nominee {
  id: string
  name: string
  code: string
  votes: number
  isWinner: boolean
}

interface Category {
  id: string
  name: string
  status: 'voting' | 'closed' | 'winner_published'
  nominees: Nominee[]
}

interface Event {
  id: string
  name: string
}

const statusConfig = {
  voting: {
    label: 'Voting Open',
    color: 'default' as const,
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  closed: {
    label: 'Voting Closed',
    color: 'secondary' as const,
    icon: <Lock className="w-3.5 h-3.5" />,
  },
  winner_published: {
    label: 'Winner Published',
    color: 'default' as const,
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
}

function WinnersContent() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [closing, setClosing] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Warm up the backend so the events + leaderboard requests find a warm server.
  useWarmUp()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getMine()
        const eventsData = response.data.events
        setEvents(eventsData)
        if (eventsData.length > 0) {
          setSelectedEventId(eventsData[0].id)
        }
      } catch {
        setError('Failed to load events.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  useEffect(() => {
    if (!selectedEventId) return

    const fetchData = async () => {
      setLoadingCategories(true)
      try {
        const [analyticsRes, eventRes] = await Promise.all([
          organizerApi.getAnalytics(selectedEventId),
          eventsApi.getById(selectedEventId),
        ])

        const leaderboard = analyticsRes.data.analytics.leaderboard
        const eventCategories = eventRes.data.event.categories

        const merged: Category[] = eventCategories.map((cat: any) => {
          const lb = leaderboard.find((l: any) => l.categoryId === cat.id)
          return {
            id: cat.id,
            name: cat.name,
            status: cat.status,
            nominees: lb
              ? lb.nominees.map((n: any) => ({
                  id: n.id,
                  name: n.name,
                  code: n.code,
                  votes: n.votes,
                  isWinner: n.isWinner,
                }))
              : cat.nominees.map((n: any) => ({
                  id: n.id,
                  name: n.name,
                  code: n.code,
                  votes: 0,
                  isWinner: n.isWinner,
                })),
          }
        })

        setCategories(merged)
      } catch {
        setError('Failed to load categories.')
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchData()
  }, [selectedEventId])

  const selectWinner = (categoryId: string, nomineeId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              nominees: cat.nominees.map((n) => ({
                ...n,
                isWinner: n.id === nomineeId,
              })),
            }
          : cat
      )
    )
  }

  const handlePublishWinner = async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    const winner = category?.nominees.find((n) => n.isWinner)
    if (!winner) return

    setPublishing(categoryId)
    try {
      await organizerApi.publishWinners(selectedEventId, {
        categoryId,
        nomineeId: winner.id,
      })
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, status: 'winner_published' } : cat
        )
      )
      setConfirming(null)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to publish winner.')
    } finally {
      setPublishing(null)
    }
  }

  const handleCloseVoting = async (categoryId: string) => {
    setClosing(categoryId)
    try {
      await eventsApi.close(selectedEventId)
      setCategories((prev) =>
        prev.map((cat) =>
          cat.status === 'voting' ? { ...cat, status: 'closed' } : cat
        )
      )
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to close voting.')
    } finally {
      setClosing(null)
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
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Winner Management</h1>
          <p className="text-muted-foreground mt-1">
            Close voting, select winners, and publish results
          </p>
        </div>
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

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {/* No events */}
      {events.length === 0 && (
        <div className="text-center py-20">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No events found.</p>
          <Link href="/organizer/events/new">
            <Button>Create an Event</Button>
          </Link>
        </div>
      )}

      {/* Loading categories */}
      {loadingCategories && (
        <div className="flex items-center justify-center min-h-[30vh]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Summary + Categories */}
      {!loadingCategories && categories.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-foreground">{categories.length}</div>
                <p className="text-sm text-muted-foreground mt-1">Total Categories</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-500">
                  {categories.filter((c) => c.status === 'closed').length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Awaiting Winner</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-500">
                  {categories.filter((c) => c.status === 'winner_published').length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Winners Published</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {categories.map((category) => {
              const sorted = [...category.nominees].sort((a, b) => b.votes - a.votes)
              const selectedWinner = category.nominees.find((n) => n.isWinner)
              const config = statusConfig[category.status]

              return (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {sorted.reduce((sum, n) => sum + n.votes, 0).toLocaleString()} total votes
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.color} className="gap-1">
                          {config.icon}
                          {config.label}
                        </Badge>
                        {category.status === 'voting' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => handleCloseVoting(category.id)}
                            disabled={closing === category.id}
                          >
                            {closing === category.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                            Close Voting
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {sorted.map((nominee, index) => {
                        const topVotes = sorted[0]?.votes ?? 0
                        const percentage = topVotes > 0 ? (nominee.votes / topVotes) * 100 : 0

                        return (
                          <div
                            key={nominee.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                              nominee.isWinner
                                ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20'
                                : 'border-border bg-muted/20'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              index === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-foreground">{nominee.name}</p>
                                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{nominee.code}</code>
                                </div>
                                <span className="text-sm font-bold text-foreground ml-2">
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
                            {nominee.isWinner ? (
                              <Badge className="gap-1 bg-yellow-400 text-yellow-900 flex-shrink-0">
                                <Trophy className="w-3 h-3" />
                                Winner
                              </Badge>
                            ) : category.status === 'closed' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-shrink-0"
                                onClick={() => selectWinner(category.id, nominee.id)}
                              >
                                Select
                              </Button>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>

                    {category.status === 'closed' && selectedWinner && (
                      confirming === category.id ? (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 rounded-lg">
                          <p className="text-sm flex-1 text-foreground">
                            Publish <strong>{selectedWinner.name}</strong> as winner of {category.name}? This cannot be undone.
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handlePublishWinner(category.id)}
                            disabled={publishing === category.id}
                          >
                            {publishing === category.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setConfirming(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full gap-2" onClick={() => setConfirming(category.id)}>
                          <Trophy className="w-4 h-4" />
                          Publish Winner
                        </Button>
                      )
                    )}

                    {category.status === 'winner_published' && selectedWinner && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-300 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <p className="text-sm text-foreground">
                          <strong>{selectedWinner.name}</strong> has been published as the winner.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {!loadingCategories && categories.length === 0 && events.length > 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No categories found for this event.</p>
          <Link href={`/organizer/events/${selectedEventId}/details`}>
            <Button variant="outline" className="mt-4">Add Categories</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default function WinnersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <WinnersContent />
    </Suspense>
  )
}