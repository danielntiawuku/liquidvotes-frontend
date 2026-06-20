'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { adminApi } from '@/lib/api'
import {
  Search,
  Loader2,
  Trophy,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'

interface Event {
  id: string
  name: string
  status: 'draft' | 'pending_review' | 'published' | 'closed'
  startDate: string
  endDate: string
  votePrice: string
  currency: string
  rejectionReason: string | null
  organizer: {
    name: string
    organizationName: string | null
    email: string
  }
  _count: {
    categories: number
    payments: number
  }
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

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending_review' | 'published' | 'draft' | 'closed'>('pending_review')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const fetchEvents = async () => {
    try {
      const response = await adminApi.getAllEvents()
      setEvents(response.data.events)
    } catch {
      setError('Failed to load events.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this event? It will be published and all pending nominees will be auto-approved.')) return
    setProcessingId(id)
    try {
      await adminApi.approveEvent(id)
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'published' } : e))
      )
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to approve event.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      alert('Please provide a rejection reason of at least 5 characters.')
      return
    }
    setProcessingId(id)
    try {
      await adminApi.rejectEvent(id, rejectionReason.trim())
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, status: 'draft', rejectionReason: rejectionReason.trim() } : e
        )
      )
      setRejectingId(null)
      setRejectionReason('')
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reject event.')
    } finally {
      setProcessingId(null)
    }
  }

  const filtered = events.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.organizer.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.organizer.organizationName ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || e.status === filter
    return matchesSearch && matchesFilter
  })

  const pendingCount = events.filter((e) => e.status === 'pending_review').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Events</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve organizer events
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 text-yellow-900 border-0 text-sm px-3 py-1.5">
            <Clock className="w-3.5 h-3.5" />
            {pendingCount} pending review
          </Badge>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events or organizers..."
            className="pl-9 rounded-lg"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['pending_review', 'published', 'draft', 'closed', 'all'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="rounded-lg capitalize"
              style={
                filter === f
                  ? { backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }
                  : undefined
              }
            >
              {f === 'all' ? 'All' : statusLabel[f]}
            </Button>
          ))}
        </div>
      </div>

      {/* Events list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-primary" />
          </div>
          <p className="text-foreground font-medium">No events found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((event) => (
            <Card key={event.id} className="border-border/60">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{event.name}</h3>
                      <Badge variant={statusColor[event.status]} className="gap-1">
                        {event.status === 'pending_review' && <Clock className="w-3 h-3" />}
                        {statusLabel[event.status]}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground ml-12 mb-1">
                      by {event.organizer.organizationName ?? event.organizer.name} ({event.organizer.email})
                    </p>

                    <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1 ml-12">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(event.startDate).toLocaleDateString()} —{' '}
                      {new Date(event.endDate).toLocaleDateString()}
                    </p>

                    <div className="flex items-center gap-4 flex-wrap text-sm ml-12">
                      <span className="text-muted-foreground">
                        {event._count.categories} categories
                      </span>
                      <span className="text-muted-foreground">
                        {event.currency} {Number(event.votePrice).toFixed(2)}/vote
                      </span>
                    </div>

                    {event.status === 'draft' && event.rejectionReason && (
                      <div className="flex items-start gap-2 ml-12 mt-3 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 max-w-xl">
                        <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-destructive">Previously rejected: {event.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {event.status === 'pending_review' && (
                    <div className="flex flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
                      <Button
                        size="sm"
                        className="gap-2 shadow-md"
                        style={{ backgroundImage: 'linear-gradient(135deg, #10b981, #14b8a6)' }}
                        onClick={() => handleApprove(event.id)}
                        disabled={processingId === event.id}
                      >
                        {processingId === event.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => setRejectingId(rejectingId === event.id ? null : event.id)}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                {/* Reject reason input */}
                {rejectingId === event.id && (
                  <div className="mt-4 ml-0 sm:ml-12 p-4 rounded-xl bg-muted/30 border border-border/60">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Reason for rejection
                    </label>
                    <Input
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain what needs to change..."
                      className="rounded-lg mb-3"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(event.id)}
                        disabled={processingId === event.id}
                        className="gap-2"
                      >
                        {processingId === event.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Confirm Rejection
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRejectingId(null)
                          setRejectionReason('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
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