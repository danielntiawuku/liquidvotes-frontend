'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import { Search, Loader2, LifeBuoy, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  message: string
  email: string
  status: 'open' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  user: { name: string; email: string; role: string } | null
}

const statusColor = {
  open: 'destructive',
  in_progress: 'secondary',
  resolved: 'default',
} as const

const priorityColor = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
} as const

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Warm up the backend so the tickets request finds a warm server.
  useWarmUp()

  const fetchTickets = async () => {
    try {
      const response = await adminApi.getSupportTickets()
      setTickets(response.data.tickets)
    } catch {
      setError('Failed to load support tickets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const updateStatus = async (ticket: Ticket, status: 'open' | 'in_progress' | 'resolved') => {
    setUpdatingId(ticket.id)
    try {
      await adminApi.updateTicket(ticket.id, { status })
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status } : t))
      )
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update ticket.')
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = tickets.filter((t) => {
    const term = search.toLowerCase()
    const matchesSearch =
      t.subject.toLowerCase().includes(term) ||
      t.message.toLowerCase().includes(term) ||
      t.email.toLowerCase().includes(term) ||
      (t.user?.name ?? '').toLowerCase().includes(term)
    const matchesFilter = filter === 'all' || t.status === filter
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
        <p className="text-muted-foreground mt-1">
          Review and resolve user support requests
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Open</p>
            <p className="text-2xl font-bold text-destructive mt-1">
              {tickets.filter((t) => t.status === 'open').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {tickets.filter((t) => t.status === 'in_progress').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Resolved</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {tickets.filter((t) => t.status === 'resolved').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject, message, or email..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'open', 'in_progress', 'resolved'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <LifeBuoy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No tickets found.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((ticket) => (
                <div key={ticket.id} className="p-5 flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-foreground">{ticket.subject}</p>
                      <Badge variant={statusColor[ticket.status]} className="capitalize">
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={priorityColor[ticket.priority]} className="capitalize">
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {ticket.user?.name ?? 'Guest'} · {ticket.email} ·{' '}
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {ticket.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        disabled={updatingId === ticket.id}
                        onClick={() => updateStatus(ticket, 'in_progress')}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Start
                      </Button>
                    )}
                    {ticket.status === 'in_progress' && (
                      <Button
                        size="sm"
                        className="gap-1.5"
                        disabled={updatingId === ticket.id}
                        onClick={() => updateStatus(ticket, 'resolved')}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolve
                      </Button>
                    )}
                    {ticket.status === 'resolved' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-muted-foreground"
                        disabled={updatingId === ticket.id}
                        onClick={() => updateStatus(ticket, 'open')}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Reopen
                      </Button>
                    )}
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
