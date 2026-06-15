'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { eventsApi } from '@/lib/api'
import { Copy, Check, QrCode, Link, Share2, Loader2 } from 'lucide-react'

interface Nominee {
  id: string
  name: string
  code: string
  categoryName: string
}

interface Event {
  id: string
  name: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function ShareEventContent() {
  const searchParams = useSearchParams()
  const eventIdParam = searchParams.get('eventId')

  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>(eventIdParam || '')
  const [nominees, setNominees] = useState<Nominee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getMine()
        const eventsData = response.data.events
        setEvents(eventsData)
        if (!selectedEventId && eventsData.length > 0) {
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

    const fetchNominees = async () => {
      try {
        const response = await eventsApi.getById(selectedEventId)
        const event = response.data.event
        const flat: Nominee[] = event.categories.flatMap((cat: any) =>
          cat.nominees.map((n: any) => ({
            id: n.id,
            name: n.name,
            code: n.code,
            categoryName: cat.name,
          }))
        )
        setNominees(flat)
      } catch {
        setError('Failed to load nominees.')
      }
    }

    fetchNominees()
  }, [selectedEventId])

  const eventUrl = `${APP_URL}/voter/assistant`

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const copyEventUrl = async () => {
    await navigator.clipboard.writeText(eventUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const filtered = nominees.filter(
    (n) =>
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.code.toLowerCase().includes(search.toLowerCase()) ||
      n.categoryName.toLowerCase().includes(search.toLowerCase())
  )

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Share Event</h1>
          <p className="text-muted-foreground mt-1">
            Share your event link and nominee codes with voters
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

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {selectedEvent && (
        <p className="text-sm font-medium text-muted-foreground mb-6">
          Sharing: <span className="text-foreground">{selectedEvent.name}</span>
        </p>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Link className="w-4 h-4" />
            Event Voting Link
          </CardTitle>
          <CardDescription>
            Share this link so voters can enter nominee codes and start voting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={eventUrl} readOnly className="flex-1 bg-muted text-sm" />
            <Button onClick={copyEventUrl} variant="outline" className="gap-2 flex-shrink-0">
              {copiedUrl ? (
                <><Check className="w-4 h-4 text-green-600" />Copied!</>
              ) : (
                <><Copy className="w-4 h-4" />Copy</>
              )}
            </Button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Vote now at ${eventUrl}`)}`, '_blank')}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share on WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vote now at ${eventUrl}`)}`, '_blank')}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share on X
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <QrCode className="w-4 h-4" />
            Nominee Codes
          </CardTitle>
          <CardDescription>
            Each nominee has a unique code voters enter to cast their vote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nominees..."
            className="mb-4"
          />

          {nominees.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No nominees found for this event. Add nominees through the event details page.
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((nominee) => (
                <div
                  key={nominee.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {nominee.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{nominee.name}</p>
                      <p className="text-xs text-muted-foreground">{nominee.categoryName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <code className="bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-lg text-sm tracking-wider">
                      {nominee.code}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => copyToClipboard(nominee.code, nominee.id)}
                    >
                      {copiedId === nominee.id ? (
                        <><Check className="w-3.5 h-3.5 text-green-600" />Copied</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" />Copy</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => copyToClipboard(`Vote for ${nominee.name} using code ${nominee.code} at ${eventUrl}`, `msg-${nominee.id}`)}
                    >
                      {copiedId === `msg-${nominee.id}` ? (
                        <><Check className="w-3.5 h-3.5 text-green-600" />Copied</>
                      ) : (
                        <><Share2 className="w-3.5 h-3.5" />Share</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && nominees.length > 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No nominees match your search.
                </div>
              )}
            </div>
          )}

          {nominees.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  const allCodes = nominees.map((n) => `${n.name} (${n.categoryName}): ${n.code}`).join('\n')
                  copyToClipboard(allCodes, 'all')
                }}
              >
                {copiedId === 'all' ? (
                  <><Check className="w-4 h-4 text-green-600" />All Codes Copied!</>
                ) : (
                  <><Copy className="w-4 h-4" />Copy All Codes</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ShareEventPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ShareEventContent />
    </Suspense>
  )
}