'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { eventsApi, nomineesApi } from '@/lib/api'
import { Search, Trash2, Loader2, Trophy, Code } from 'lucide-react'
import Link from 'next/link'

interface Nominee {
  id: string
  name: string
  code: string
  status: 'pending' | 'approved' | 'rejected'
  isWinner: boolean
  bio: string | null
  votes?: number
  category: {
    id: string
    name: string
    eventId: string
  }
}

interface Event {
  id: string
  name: string
  categories: {
    id: string
    name: string
    nominees: Nominee[]
  }[]
}

const statusColor = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
} as const

export default function NomineesManagementPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

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

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  const allNominees: (Nominee & { categoryName: string })[] = (
    selectedEvent?.categories ?? []
  ).flatMap((cat) =>
    cat.nominees.map((n) => ({ ...n, categoryName: cat.name }))
  )

  const filtered = allNominees.filter((n) => {
    const term = search.toLowerCase()
    return (
      n.name.toLowerCase().includes(term) ||
      n.code.toLowerCase().includes(term) ||
      n.categoryName.toLowerCase().includes(term)
    )
  })

  const handleDelete = async (nomineeId: string, categoryId: string) => {
    if (!confirm('Delete this nominee? This cannot be undone.')) return
    setDeletingId(nomineeId)
    try {
      await nomineesApi.delete(nomineeId)
      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedEventId
            ? {
                ...e,
                categories: e.categories.map((c) =>
                  c.id === categoryId
                    ? { ...c, nominees: c.nominees.filter((n) => n.id !== nomineeId) }
                    : c
                ),
              }
            : e
        )
      )
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete nominee.')
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
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nominees</h1>
          <p className="text-muted-foreground mt-1">
            View and manage nominees across your events
          </p>
        </div>
        {selectedEvent && (
          <Link href={`/organizer/events/${selectedEvent.id}/details`}>
            <Button className="gap-2">
              Add Nominees
            </Button>
          </Link>
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
          <p className="text-muted-foreground mb-2">No events found</p>
          <Link href="/organizer/events/new">
            <Button className="mt-2">Create an Event</Button>
          </Link>
        </div>
      )}

      {events.length > 0 && (
        <>
          {/* Event selector + Search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search nominees by name, code, or category..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-foreground">
                  {allNominees.length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Total Nominees</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {allNominees.filter((n) => n.status === 'approved').length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Approved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-500">
                  {allNominees.filter((n) => n.status === 'pending').length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Pending Approval</p>
              </CardContent>
            </Card>
          </div>

          {/* Nominees list */}
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {allNominees.length === 0
                ? 'No nominees yet. Add nominees through the event details page.'
                : 'No nominees match your search.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((nominee) => (
                <Card key={nominee.id} className="hover:shadow-sm transition">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          {nominee.name.charAt(0)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-foreground">{nominee.name}</p>
                            <code className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                              {nominee.code}
                            </code>
                            <Badge
                              variant={statusColor[nominee.status]}
                              className="capitalize text-xs"
                            >
                              {nominee.status}
                            </Badge>
                            {nominee.isWinner && (
                              <Badge className="gap-1 bg-yellow-400 text-yellow-900 text-xs">
                                <Trophy className="w-3 h-3" />
                                Winner
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {nominee.categoryName}
                            {nominee.bio && ` · ${nominee.bio.substring(0, 60)}${nominee.bio.length > 60 ? '...' : ''}`}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href={`/organizer/events/${selectedEventId}/details`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(nominee.id, nominee.category.id)}
                          disabled={deletingId === nominee.id}
                        >
                          {deletingId === nominee.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}