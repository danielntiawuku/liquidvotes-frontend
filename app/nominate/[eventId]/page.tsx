'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { nominationApi } from '@/lib/api'
import { Loader2, CheckCircle, Send, UserPlus, Info, Clock, Lock } from 'lucide-react'

interface EventInfo {
  id: string
  name: string
  description: string
  bannerUrl: string | null
  logoUrl: string | null
  votePrice: number
  currency: string
  autoApproveNominees: boolean
  nominationStartDate: string | null
  nominationEndDate: string | null
  categories: { id: string; name: string }[]
}

export default function NominatePage() {
  const params = useParams()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<EventInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    categoryId: '',
    name: '',
    bio: '',
    photoUrl: '',
    nomineeEmail: '',
    nomineePhone: '',
    nominatorName: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedNominee, setSubmittedNominee] = useState<any>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await nominationApi.getEvent(eventId)
        setEvent(response.data.event)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Event not found or nominations are closed.')
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [eventId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload: any = {
        categoryId: form.categoryId,
        name: form.name,
      }
      if (form.bio) payload.bio = form.bio
      if (form.photoUrl) payload.photoUrl = form.photoUrl
      if (form.nomineeEmail) payload.nomineeEmail = form.nomineeEmail
      if (form.nomineePhone) payload.nomineePhone = form.nomineePhone
      if (form.nominatorName) payload.nominatorName = form.nominatorName

      const response = await nominationApi.submit(eventId, payload)
      setSubmittedNominee(response.data.nominee)
      setSubmitted(true)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit nomination. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Info className="w-7 h-7 text-destructive" />
            </div>
            <p className="text-foreground font-medium mb-2">Nominations Unavailable</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (submitted && submittedNominee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Nomination Submitted!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {submittedNominee.status === 'approved'
                ? 'Your nominee has been approved and is now live for voting.'
                : 'Your nominee has been submitted and is pending review by the organizer.'}
            </p>
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-muted-foreground">Nominee Code</p>
              <p className="text-2xl font-bold text-primary tracking-wider">{submittedNominee.code}</p>
              <p className="text-sm text-foreground mt-1">{submittedNominee.name}</p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSubmitted(false)
                setSubmittedNominee(null)
                setForm({ categoryId: '', name: '', bio: '', photoUrl: '', nomineeEmail: '', nomineePhone: '', nominatorName: '' })
              }}
            >
              Nominate Another Person
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Nomination form
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Event Header */}
      {event?.bannerUrl && (
        <div className="w-full h-48 sm:h-64 overflow-hidden">
          <img src={event.bannerUrl} alt={event.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Event Info */}
        <div className="text-center mb-8">
          {event?.logoUrl && (
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 shadow-md">
              <img src={event.logoUrl} alt={event.name} className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            {event?.name}
          </h1>
          {event?.description && (
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              {event.description}
            </p>
          )}
          <div className="flex items-center justify-center gap-3 mt-4">
            <Badge variant="secondary" className="text-sm">
              {event?.currency} {event?.votePrice} per vote
            </Badge>
            {event?.autoApproveNominees && (
              <Badge className="text-sm bg-green-500/10 text-green-700 border-green-500/20">
                Auto-Approved
              </Badge>
            )}
          </div>

          {/* Nomination dates */}
          {(event?.nominationStartDate || event?.nominationEndDate) && (
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-1.5">
              <Clock className="w-3.5 h-3.5" />
              {event?.nominationStartDate && event?.nominationEndDate
                ? `Nominations: ${new Date(event.nominationStartDate).toLocaleDateString()} — ${new Date(event.nominationEndDate).toLocaleDateString()}`
                : event?.nominationStartDate
                  ? `Nominations open from ${new Date(event.nominationStartDate).toLocaleDateString()}`
                  : `Nominations close ${new Date(event.nominationEndDate!).toLocaleDateString()}`
              }
            </div>
          )}
        </div>

        {/* Check if nominations are closed */}
        {(() => {
          const now = new Date()
          const startDate = event?.nominationStartDate ? new Date(event.nominationStartDate) : null
          const endDate = event?.nominationEndDate ? new Date(event.nominationEndDate) : null

          if (startDate && now < startDate) {
            return (
              <Card className="shadow-lg border-border/60">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-7 h-7 text-amber-600" />
                  </div>
                  <p className="text-foreground font-medium mb-2">Nominations Not Yet Open</p>
                  <p className="text-sm text-muted-foreground">
                    Nominations will open on {startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </CardContent>
              </Card>
            )
          }

          if (endDate && now > endDate) {
            return (
              <Card className="shadow-lg border-border/60">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-7 h-7 text-destructive" />
                  </div>
                  <p className="text-foreground font-medium mb-2">Nominations Closed</p>
                  <p className="text-sm text-muted-foreground">
                    The nomination period ended on {endDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </CardContent>
              </Card>
            )
          }

          return null
        })()}

        {/* Nomination Form */}
        <Card className="shadow-lg border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Submit a Nomination
            </CardTitle>
            <CardDescription>
              Nominate yourself or someone else for this event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Error */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">Select a category...</option>
                  {event?.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Nominee Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nominee Name <span className="text-destructive">*</span>
                </label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Full name of the nominee"
                  className="rounded-lg"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Bio / Description
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary resize-none"
                  placeholder="Tell us about this nominee (optional)"
                />
              </div>

              {/* Photo URL */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Photo URL
                </label>
                <Input
                  name="photoUrl"
                  value={form.photoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                  className="rounded-lg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste a link to the nominee&apos;s photo (optional)
                </p>
              </div>

              {/* Contact Info (optional) */}
              <div className="border-t border-border pt-5">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                  Optional Contact Info
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Your Name
                    </label>
                    <Input
                      name="nominatorName"
                      value={form.nominatorName}
                      onChange={handleChange}
                      placeholder="Who is nominating?"
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Nominee Email
                    </label>
                    <Input
                      name="nomineeEmail"
                      type="email"
                      value={form.nomineeEmail}
                      onChange={handleChange}
                      placeholder="nominee@email.com"
                      className="rounded-lg"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Nominee Phone
                  </label>
                  <Input
                    name="nomineePhone"
                    value={form.nomineePhone}
                    onChange={handleChange}
                    placeholder="+233 XX XXX XXXX"
                    className="rounded-lg"
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={submitting || !form.categoryId || !form.name}
                className="w-full rounded-lg py-2.5 shadow-md"
                style={{ backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Nomination
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Powered by LiquidVotes
        </p>
      </div>
    </div>
  )
}
