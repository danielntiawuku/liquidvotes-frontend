'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  user: string
  email: string
  type: 'organizer' | 'voter'
  status: 'open' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  date: string
}

const mockTickets: Ticket[] = [
  { id: 'TK001', subject: 'Payment not reflecting after voting', user: 'Kofi Mensah', email: 'kofi@email.com', type: 'voter', status: 'open', priority: 'high', date: 'Jun 10, 2026' },
  { id: 'TK002', subject: 'Unable to publish event', user: 'Ama Events Ltd', email: 'ama@events.com', type: 'organizer', status: 'in_progress', priority: 'high', date: 'Jun 9, 2026' },
  { id: 'TK003', subject: 'Nominee code not working', user: 'Abena Darko', email: 'abena@email.com', type: 'voter', status: 'open', priority: 'medium', date: 'Jun 9, 2026' },
  { id: 'TK004', subject: 'How do I add more categories?', user: 'Ghana Tech Awards', email: 'info@gta.com', type: 'organizer', status: 'resolved', priority: 'low', date: 'Jun 8, 2026' },
  { id: 'TK005', subject: 'Duplicate votes showing on dashboard', user: 'Yaw Productions', email: 'yaw@prod.com', type: 'organizer', status: 'in_progress', priority: 'medium', date: 'Jun 8, 2026' },
  { id: 'TK006', subject: 'Refund request for failed payment', user: 'Kwame Asante', email: 'kwame@email.com', type: 'voter', status: 'open', priority: 'high', date: 'Jun 7, 2026' },
]

const statusIcon = {
  open: <AlertCircle className="w-3.5 h-3.5" />,
  in_progress: <Clock className="w-3.5 h-3.5" />,
  resolved: <CheckCircle className="w-3.5 h-3.5" />,
}

const statusColor = {
  open: 'destructive',
  in_progress: 'secondary',
  resolved: 'default',
} as const

const priorityColor = {
  low: 'secondary',
  medium: 'secondary',
  high: 'destructive',
} as const

export default function AdminSupportPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all')

  const filtered = mockTickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.user.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || t.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage and resolve user support requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{mockTickets.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {mockTickets.filter((t) => t.status === 'open').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {mockTickets.filter((t) => t.status === 'in_progress').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {mockTickets.filter((t) => t.status === 'resolved').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Resolved</p>
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
            placeholder="Search tickets, users, IDs..."
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
              {f.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Tickets */}
      <div className="space-y-3">
        {filtered.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-sm transition">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">{ticket.id}</code>
                      <Badge variant={priorityColor[ticket.priority]} className="text-xs">
                        {ticket.priority} priority
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {ticket.type}
                      </Badge>
                    </div>
                    <p className="font-medium text-foreground mt-1">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.user} · {ticket.email} · {ticket.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={statusColor[ticket.status]} className="gap-1 capitalize">
                    {statusIcon[ticket.status]}
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No tickets found.
          </div>
        )}
      </div>
    </div>
  )
}