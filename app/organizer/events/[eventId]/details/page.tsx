'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/shared/ImageUpload'
import { eventsApi, categoriesApi, nomineesApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Save,
  CheckCircle,
  XCircle,
  Sparkles,
} from 'lucide-react'

type NomineeFormState = Record<string, { name: string; bio: string; photoUrl: string | null }>

interface Nominee {
  id: string
  name: string
  code: string
  status: string
  bio: string | null
  photoUrl: string | null
}

interface Category {
  id: string
  name: string
  status: string
  nominees: Nominee[]
}

interface Event {
  id: string
  name: string
  description: string
  status: string
  startDate: string
  endDate: string
  votePrice: string
  currency: string
  codePrefix: string
  bannerUrl: string | null
  autoApproveNominees: boolean
  categories: Category[]
}

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = use(params)
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Settings form
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    votePrice: '',
    startDate: '',
    endDate: '',
    bannerUrl: null as string | null,
    autoApproveNominees: false,
  })

  // Add category
  const [newCategory, setNewCategory] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)

  // Add nominee
  const [newNominee, setNewNominee] = useState<NomineeFormState>({})
  const [addingNominee, setAddingNominee] = useState<string | null>(null)

  // Moderating nominee
  const [moderatingId, setModeratingId] = useState<string | null>(null)

  // Warm up the backend so the event + categories + nominees requests find a warm server.
  useWarmUp()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventsApi.getById(eventId)
        const e = response.data.event
        setEvent(e)
        setForm({
          name: e.name,
          description: e.description,
          votePrice: e.votePrice,
          startDate: e.startDate.split('T')[0],
          endDate: e.endDate.split('T')[0],
          bannerUrl: e.bannerUrl ?? null,
          autoApproveNominees: e.autoApproveNominees ?? false,
        })
      } catch {
        setError('Failed to load event.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await eventsApi.update(eventId, {
        name: form.name,
        description: form.description,
        votePrice: Number(form.votePrice),
        startDate: form.startDate,
        endDate: form.endDate,
        bannerUrl: form.bannerUrl ?? undefined,
        autoApproveNominees: form.autoApproveNominees,
      })
      setEvent((prev: Event | null) =>
        prev
          ? { ...prev, bannerUrl: form.bannerUrl, autoApproveNominees: form.autoApproveNominees }
          : prev
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    setAddingCategory(true)
    try {
      const response = await categoriesApi.create(eventId, { name: newCategory.trim() })
      setEvent((prev: Event | null) =>
        prev
          ? { ...prev, categories: [...prev.categories, { ...response.data.category, nominees: [] }] }
          : prev
      )
      setNewCategory('')
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add category.')
    } finally {
      setAddingCategory(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Delete this category and all its nominees?')) return
    try {
      await categoriesApi.delete(eventId, categoryId)
      setEvent((prev: Event | null) =>
        prev
          ? { ...prev, categories: prev.categories.filter((c) => c.id !== categoryId) }
          : prev
      )
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete category.')
    }
  }

  const handleAddNominee = async (categoryId: string) => {
    const nominee = newNominee[categoryId]
    if (!nominee?.name?.trim()) return

    setAddingNominee(categoryId)
    try {
      const response = await nomineesApi.create(eventId, categoryId, {
        name: nominee.name.trim(),
        bio: nominee.bio?.trim() || undefined,
        photoUrl: nominee.photoUrl ?? undefined,
      })
      setEvent((prev: Event | null) =>
        prev
          ? {
              ...prev,
              categories: prev.categories.map((c) =>
                c.id === categoryId
                  ? { ...c, nominees: [...c.nominees, response.data.nominee] }
                  : c
              ),
            }
          : prev
      )
      setNewNominee((prev: NomineeFormState) => ({
        ...prev,
        [categoryId]: { name: '', bio: '', photoUrl: null },
      }))
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add nominee.')
    } finally {
      setAddingNominee(null)
    }
  }

  const handleDeleteNominee = async (nomineeId: string, categoryId: string) => {
    if (!confirm('Delete this nominee?')) return
    try {
      await nomineesApi.delete(nomineeId)
      setEvent((prev: Event | null) =>
        prev
          ? {
              ...prev,
              categories: prev.categories.map((c) =>
                c.id === categoryId
                  ? { ...c, nominees: c.nominees.filter((n) => n.id !== nomineeId) }
                  : c
              ),
            }
          : prev
      )
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete nominee.')
    }
  }

  const handleModerateNominee = async (
    nomineeId: string,
    categoryId: string,
    status: 'approved' | 'rejected'
  ) => {
    setModeratingId(nomineeId)
    try {
      await nomineesApi.update(nomineeId, { status })
      setEvent((prev: Event | null) =>
        prev
          ? {
              ...prev,
              categories: prev.categories.map((c) =>
                c.id === categoryId
                  ? {
                      ...c,
                      nominees: c.nominees.map((n) =>
                        n.id === nomineeId ? { ...n, status } : n
                      ),
                    }
                  : c
              ),
            }
          : prev
      )
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update nominee status.')
    } finally {
      setModeratingId(null)
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/organizer/events/${eventId}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{event.name}</h1>
          <p className="text-sm text-muted-foreground">Event Settings & Nominees</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Event settings */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Event Settings</CardTitle>
            <CardDescription>Update your event details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Cover image */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Event Cover Image
              </label>
              <div className="max-w-sm">
                <ImageUpload
                  value={form.bannerUrl}
                  onChange={(url) => setForm((p) => ({ ...p, bannerUrl: url }))}
                  folder="events"
                  label="Upload event image"
                  hint="Helps voters recognize the event quickly"
                  aspectRatio="video"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Event Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                disabled={event.status === 'closed'}
                className="rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                disabled={event.status === 'closed'}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Vote Price ({event.currency})
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.votePrice}
                  onChange={(e) => setForm((p) => ({ ...p, votePrice: e.target.value }))}
                  disabled={event.status === 'closed'}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                  disabled={event.status === 'closed'}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  disabled={event.status === 'closed'}
                  className="rounded-lg"
                />
              </div>
            </div>

            {/* Auto-approve toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/60">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-approve nominees</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    New nominees you add will be approved automatically instead of needing manual review.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setForm((p) => ({ ...p, autoApproveNominees: !p.autoApproveNominees }))}
                disabled={event.status === 'closed'}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  form.autoApproveNominees ? 'bg-primary' : 'bg-muted-foreground/30'
                } disabled:opacity-50`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    form.autoApproveNominees ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {event.status !== 'closed' && (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 shadow-md"
                style={{ backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Categories & Nominees */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Categories & Nominees</CardTitle>
            <CardDescription>
              Manage voting categories, add nominees, and approve who appears on the public page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Add category */}
            {event.status !== 'closed' && (
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category name (e.g. Best Developer)"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  className="rounded-lg"
                />
                <Button
                  onClick={handleAddCategory}
                  disabled={addingCategory || !newCategory.trim()}
                  className="gap-2 flex-shrink-0 shadow-md"
                  style={{ backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                >
                  {addingCategory ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add
                </Button>
              </div>
            )}

            {/* Categories list */}
            {event.categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No categories yet. Add one above.
              </p>
            ) : (
              <div className="space-y-4">
                {event.categories.map((category) => (
                  <div key={category.id} className="border border-border/60 rounded-2xl p-4">

                    {/* Category header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{category.name}</h3>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {category.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {category.nominees.length} nominees
                        </span>
                      </div>
                      {event.status !== 'closed' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive rounded-full"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    {/* Nominees */}
                    <div className="space-y-2 mb-4">
                      {category.nominees.map((nominee) => (
                        <div
                          key={nominee.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 flex-wrap gap-2"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {nominee.photoUrl ? (
                                <img
                                  src={nominee.photoUrl}
                                  alt={nominee.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-bold text-primary">
                                  {nominee.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <code className="text-xs bg-gradient-to-r from-primary/10 to-secondary/10 text-primary px-2 py-0.5 rounded-md font-bold">
                              {nominee.code}
                            </code>
                            <span className="text-sm text-foreground">{nominee.name}</span>
                            <Badge
                              variant={
                                nominee.status === 'approved'
                                  ? 'default'
                                  : nominee.status === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="text-xs capitalize"
                            >
                              {nominee.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1">
                            {event.status !== 'closed' && nominee.status !== 'approved' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-emerald-600 hover:text-emerald-600 rounded-full"
                                onClick={() => handleModerateNominee(nominee.id, category.id, 'approved')}
                                disabled={moderatingId === nominee.id}
                                title="Approve"
                              >
                                {moderatingId === nominee.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            )}
                            {event.status !== 'closed' && nominee.status !== 'rejected' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-amber-600 hover:text-amber-600 rounded-full"
                                onClick={() => handleModerateNominee(nominee.id, category.id, 'rejected')}
                                disabled={moderatingId === nominee.id}
                                title="Reject"
                              >
                                {moderatingId === nominee.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            )}
                            {event.status !== 'closed' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive rounded-full"
                                onClick={() => handleDeleteNominee(nominee.id, category.id)}
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add nominee form */}
                    {event.status !== 'closed' && (
                      <div className="border border-dashed border-border/60 rounded-xl p-3 space-y-3">
                        <div className="flex gap-3">
                          <div className="w-20 flex-shrink-0">
                            <ImageUpload
                              value={newNominee[category.id]?.photoUrl ?? null}
                              onChange={(url) =>
                                setNewNominee((prev: NomineeFormState) => ({
                                  ...prev,
                                  [category.id]: {
                                    name: prev[category.id]?.name ?? '',
                                    bio: prev[category.id]?.bio ?? '',
                                    photoUrl: url,
                                  },
                                }))
                              }
                              folder="nominees"
                              label=""
                              hint=""
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Input
                              value={newNominee[category.id]?.name ?? ''}
                              onChange={(e) =>
                                setNewNominee((prev: NomineeFormState) => ({
                                  ...prev,
                                  [category.id]: {
                                    ...prev[category.id],
                                    name: e.target.value,
                                    bio: prev[category.id]?.bio ?? '',
                                    photoUrl: prev[category.id]?.photoUrl ?? null,
                                  },
                                }))
                              }
                              placeholder="Nominee name"
                              className="text-sm rounded-lg"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddNominee(category.id)}
                            />
                            <Input
                              value={newNominee[category.id]?.bio ?? ''}
                              onChange={(e) =>
                                setNewNominee((prev: NomineeFormState) => ({
                                  ...prev,
                                  [category.id]: {
                                    ...prev[category.id],
                                    name: prev[category.id]?.name ?? '',
                                    bio: e.target.value,
                                    photoUrl: prev[category.id]?.photoUrl ?? null,
                                  },
                                }))
                              }
                              placeholder="Short bio (optional)"
                              className="text-sm rounded-lg"
                            />
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddNominee(category.id)}
                          disabled={
                            addingNominee === category.id ||
                            !newNominee[category.id]?.name?.trim()
                          }
                          className="gap-1 w-full shadow-sm"
                          style={{ backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                        >
                          {addingNominee === category.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          Add Nominee
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}