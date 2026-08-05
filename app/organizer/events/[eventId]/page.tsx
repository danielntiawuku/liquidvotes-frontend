'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { eventsApi, organizerApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import {
  Share2,
  BarChart3,
  Trophy,
  Loader2,
  ArrowLeft,
  Send,
  Calendar,
  Lock,
  Unlock,
  Vote,
  Wallet,
  Tag,
  Clock,
  AlertCircle,
  Eye,
  Check,
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
  status: 'draft' | 'pending_review' | 'published' | 'closed'
  startDate: string
  endDate: string
  votePrice: string
  currency: string
  codePrefix: string
  rejectionReason: string | null
  showLiveResults: 'full' | 'participants_only' | 'hidden'
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
  pending_review: 'secondary',
  published: 'default',
  closed: 'secondary',
} as const

const statusLabel = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  published: 'Published',
  closed: 'Closed',
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
  const [submitting, setSubmitting] = useState(false)
  const [closing, setClosing] = useState(false)
  const [reopening, setReopening] = useState(false)
  const [error, setError] = useState('')
  const [savingResults, setSavingResults] = useState(false)
  // Staged (unsaved) visibility selection for the preview — null = no change
  const [stagedVisibility, setStagedVisibility] = useState<
    'full' | 'participants_only' | 'hidden' | null
  >(null)

  // Warm up the backend so the event + analytics requests find a warm server.
  useWarmUp()

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

  const handleSubmitForReview = async () => {
    if (!confirm('Submit this event for admin review? You won\'t be able to edit core details until it\'s reviewed.')) return
    setSubmitting(true)
    try {
      await eventsApi.submitForReview(eventId)
      setEvent((prev) => prev ? { ...prev, status: 'pending_review' } : prev)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit event for review.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = async () => {
    if (!confirm('Close voting for this event? You can reopen it at any time.')) return
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

  const handleReopen = async () => {
    if (!confirm('Reopen this event? Voting will resume immediately.')) return
    setReopening(true)
    try {
      await eventsApi.reopenEvent(eventId)
      setEvent((prev) => prev ? { ...prev, status: 'published' } : prev)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reopen event.')
    } finally {
      setReopening(false)
    }
  }

  // Selecting an option only stages it — nothing is saved until the user
  // confirms, so they can preview exactly what voters will see first.
  const handlePreviewVisibility = (value: 'full' | 'participants_only' | 'hidden') => {
    setStagedVisibility(value)
  }

  const handleSaveVisibility = async () => {
    if (!stagedVisibility) return
    setSavingResults(true)
    try {
      await eventsApi.update(eventId, { showLiveResults: stagedVisibility })
      setEvent((prev) => prev ? { ...prev, showLiveResults: stagedVisibility! } : prev)
      setStagedVisibility(null)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update live results setting.')
    } finally {
      setSavingResults(false)
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

  const stats = [
    { label: 'Total Votes', value: analytics?.totalVotes.toLocaleString() ?? 0, icon: Vote, gradient: 'from-purple-500 to-fuchsia-400' },
    { label: 'Revenue', value: `${event.currency} ${analytics?.totalRevenue.toFixed(2) ?? '0.00'}`, icon: Wallet, gradient: 'from-emerald-500 to-teal-400' },
    { label: 'Categories', value: event.categories.length, icon: Tag, gradient: 'from-primary to-primary/60' },
    { label: 'Nominees', value: event.categories.reduce((s, c) => s + c.nominees.length, 0), icon: Trophy, gradient: 'from-secondary to-secondary/60' },
  ]

  // Data for the voter preview — uses the real leaderboard (real nominees +
  // vote counts) so organizers see exactly what voters will see.
  const previewVisibility = stagedVisibility ?? event.showLiveResults
  const previewCategory =
    analytics?.leaderboard.find((c) => c.nominees.length > 0) ??
    analytics?.leaderboard[0] ??
    null
  const previewNominees = previewCategory?.nominees ?? []
  const previewSortedByVotes = [...previewNominees].sort((a, b) => b.votes - a.votes)
  const previewTop3 = previewSortedByVotes.slice(0, 3)
  const previewAlphabetical = [...previewNominees].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <Link href="/organizer/events">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">{event.name}</h1>
              <Badge variant={statusColor[event.status]} className="capitalize">
                {statusLabel[event.status]}
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
            <Button variant="outline" className="gap-2 rounded-lg">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </Link>
          <Link href={`/organizer/analytics?eventId=${event.id}`}>
            <Button variant="outline" className="gap-2 rounded-lg">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
          </Link>
          {event.status === 'draft' && (
            <Button
              onClick={handleSubmitForReview}
              disabled={submitting}
              className="gap-2 shadow-md"
              style={{ backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit for Review
            </Button>
          )}
          {event.status === 'published' && (
            <Button
              onClick={handleClose}
              disabled={closing}
              variant="outline"
              className="gap-2 rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Close Voting
            </Button>
          )}
          {event.status === 'closed' && (
            <Button
              onClick={handleReopen}
              disabled={reopening}
              className="gap-2 shadow-md"
              style={{ backgroundImage: 'linear-gradient(135deg, #10b981, #14b8a6)' }}
            >
              {reopening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
              Reopen Voting
            </Button>
          )}
        </div>
      </div>

      {/* Pending review banner */}
      {event.status === 'pending_review' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 mb-6">
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-400">
            This event is awaiting admin review. You'll be notified once it's approved or if changes are needed.
          </p>
        </div>
      )}

      {/* Rejection reason banner */}
      {event.status === 'draft' && event.rejectionReason && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Your event was not approved</p>
            <p className="text-sm text-destructive/90 mt-0.5">{event.rejectionReason}</p>
            <p className="text-xs text-muted-foreground mt-1.5">
              Make the necessary changes and submit for review again.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/60 hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-5">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="nominees">
        <TabsList className="mb-6 bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="nominees" className="rounded-lg">Nominees</TabsTrigger>
          <TabsTrigger value="leaderboard" className="rounded-lg">Leaderboard</TabsTrigger>
          <TabsTrigger value="details" className="rounded-lg">Details</TabsTrigger>
        </TabsList>

        {/* Nominees tab */}
        <TabsContent value="nominees" className="space-y-4">
          {event.categories.length === 0 ? (
            <Card className="border-border/60">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No categories yet</p>
                <Link href={`/organizer/events/${event.id}/details`}>
                  <Button
                    className="shadow-md"
                    style={{ backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                  >
                    Add Categories & Nominees
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            event.categories.map((category) => (
              <Card key={category.id} className="border-border/60">
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
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60"
                        >
                          <div className="flex items-center gap-3">
                            <code className="text-xs bg-gradient-to-r from-primary/10 to-secondary/10 text-primary px-2 py-0.5 rounded-md font-bold">
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
            <Card className="border-border/60">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No votes recorded yet.</p>
              </CardContent>
            </Card>
          ) : (
            analytics.leaderboard.map((category) => (
              <Card key={category.categoryId} className="border-border/60">
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
                            index === 0
                              ? 'bg-gradient-to-br from-yellow-400 to-amber-300 text-yellow-900 shadow-sm'
                              : 'bg-muted text-muted-foreground'
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
                                className="h-full rounded-full"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundImage: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                                }}
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
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Event Name</p>
                  <p className="font-medium text-foreground mt-1">{event.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium text-foreground mt-1">{statusLabel[event.status]}</p>
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
                  <Button variant="outline" className="gap-2 rounded-lg">
                    Edit Event Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Live results visibility */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Live Results Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Control what voters see on the public nominee pages while voting is live. Select an
                option to preview it before saving.
              </p>
              <p className="text-xs text-muted-foreground mb-4 bg-muted/50 border border-border/60 rounded-lg p-3">
                Note: Once voting closes, full results with vote counts are always public on the
                results page — this setting only applies while voting is live.
              </p>

              {/* Closed events show the Results Announced banner — no live results to control */}
              {event.status === 'closed' ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/60">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Voting is closed — full results with vote counts are now public on the results
                    page. This live-results setting will apply again when the event is reopened.
                  </p>
                </div>
              ) : (
              <>
              {/* Option cards — staging only, no save yet */}
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    value: 'full' as const,
                    title: 'Show Full Results',
                    desc: 'Voters see rankings with vote counts',
                  },
                  {
                    value: 'participants_only' as const,
                    title: 'Participants Only',
                    desc: 'Voters see the nominees, but no rank or vote counts',
                  },
                  {
                    value: 'hidden' as const,
                    title: 'Hide Live Results',
                    desc: 'No live results card shown to voters',
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={savingResults}
                    onClick={() => handlePreviewVisibility(option.value)}
                    className={`text-left p-4 rounded-xl border transition ${
                      previewVisibility === option.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/40 bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{option.title}</p>
                      {(event.showLiveResults === option.value ||
                        (stagedVisibility && stagedVisibility === option.value)) && (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{option.desc}</p>
                  </button>
                ))}
              </div>

              {/* Unsaved change indicator */}
              {stagedVisibility && stagedVisibility !== event.showLiveResults && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-400">
                    You have unsaved changes. Save to apply them to voters.
                  </p>
                </div>
              )}

              {/* Voter preview — only meaningful while voting is live (this branch is for non-closed events) */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Voter preview
                  </p>
                  <span className="text-xs text-muted-foreground">
                    · how the live results card looks on the nominee page
                  </span>
                </div>

                <div className="rounded-xl border-2 border-dashed border-border p-5 bg-muted/20">
                  {previewVisibility === 'hidden' ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Eye className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">No live results card</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Voters won't see any live results on the nominee pages.
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-sm mx-auto">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-foreground">
                          {previewCategory?.categoryName ?? 'Category'} — Live Results
                        </p>
                        {previewVisibility === 'participants_only' && (
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            Counts hidden
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {previewNominees.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-3">
                            {previewVisibility === 'participants_only'
                              ? 'No participants yet'
                              : 'No votes yet — be the first!'}
                          </p>
                        ) : previewVisibility === 'participants_only' ? (
                          <>
                            {previewAlphabetical.map((nominee) => (
                              <div
                                key={nominee.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60 text-sm"
                              >
                                <span className="text-foreground">{nominee.name}</span>
                              </div>
                            ))}
                            <p className="text-xs text-muted-foreground text-center pt-1">
                              Vote counts are hidden
                            </p>
                          </>
                        ) : (
                          <>
                            {previewTop3.map((nominee, index) => (
                              <div
                                key={nominee.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60 text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                    index === 0
                                      ? 'bg-yellow-400 text-yellow-900'
                                      : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {index + 1}
                                  </span>
                                  <span className="text-foreground">{nominee.name}</span>
                                </div>
                                <span className="font-medium text-foreground">
                                  {nominee.votes.toLocaleString()}
                                </span>
                              </div>
                            ))}
                            {previewSortedByVotes.length > 3 && (
                              <p className="text-center text-xs text-muted-foreground py-1">
                                ⋯
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Save / cancel actions */}
              <div className="flex items-center gap-3 mt-5">
                <Button
                  onClick={handleSaveVisibility}
                  disabled={!stagedVisibility || stagedVisibility === event.showLiveResults || savingResults}
                  className="gap-2"
                >
                  {savingResults ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {savingResults ? 'Saving…' : 'Save Changes'}
                </Button>
                {stagedVisibility && stagedVisibility !== event.showLiveResults && (
                  <Button
                    variant="ghost"
                    onClick={() => setStagedVisibility(null)}
                    disabled={savingResults}
                  >
                    Cancel
                  </Button>
                )}
                {!stagedVisibility && (
                  <p className="text-xs text-muted-foreground">
                    {event.showLiveResults === 'full'
                      ? 'Currently: Show Full Results'
                      : event.showLiveResults === 'participants_only'
                        ? 'Currently: Participants Only'
                        : 'Currently: Hide Live Results'}
                  </p>
                )}
              </div>
              </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}