'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { eventsApi, categoriesApi, nomineesApi } from '@/lib/api'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Save,
  CheckCircle,
} from 'lucide-react'

interface Nominee {
  id: string
  name: string
  code: string
  status: string
  bio: string | null
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
  })

  // Add category
  const [newCategory, setNewCategory] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)

  // Add nominee
  const [newNominee, setNewNominee] = useState<Record<string, { name: string; bio: string }>>({})
  const [addingNominee, setAddingNominee] = useState<string | null>(null)

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
      })
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
      setEvent((prev) =>
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
      setEvent((prev) =>
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
      })
      setEvent((prev) =>
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
      setNewNominee((prev) => ({ ...prev, [categoryId]: { name: '', bio: '' } }))
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
      setEvent((prev) =>
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
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/organizer/events/${eventId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{event.name}</h1>
          <p className="text-sm text-muted-foreground">Event Settings & Nominees</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* Event settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Settings</CardTitle>
            <CardDescription>Update your event details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Event Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                disabled={event.status === 'closed'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                disabled={event.status === 'closed'}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none disabled:opacity-50"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
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
                  disabled={event.status !== 'draft'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                  disabled={event.status === 'closed'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  disabled={event.status === 'closed'}
                />
              </div>
            </div>
            {event.status !== 'closed' && (
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Categories & Nominees */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categories & Nominees</CardTitle>
            <CardDescription>
              Manage voting categories and add nominees with auto-generated codes
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
                />
                <Button
                  onClick={handleAddCategory}
                  disabled={addingCategory || !newCategory.trim()}
                  className="gap-2 flex-shrink-0"
                >
                  {addingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
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
                  <div key={category.id} className="border border-border rounded-lg p-4">

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
                      {event.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    {/* Nominees */}
                    <div className="space-y-2 mb-3">
                      {category.nominees.map((nominee) => (
                        <div
                          key={nominee.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
                              {nominee.code}
                            </code>
                            <span className="text-sm text-foreground">{nominee.name}</span>
                            <Badge
                              variant={nominee.status === 'approved' ? 'default' : 'secondary'}
                              className="text-xs capitalize"
                            >
                              {nominee.status}
                            </Badge>
                          </div>
                          {event.status !== 'closed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteNominee(nominee.id, category.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add nominee */}
                    {event.status !== 'closed' && (
                      <div className="flex gap-2">
                        <Input
                          value={newNominee[category.id]?.name ?? ''}
                          onChange={(e) =>
                            setNewNominee((prev) => ({
                              ...prev,
                              [category.id]: {
                                ...prev[category.id],
                                name: e.target.value,
                                bio: prev[category.id]?.bio ?? '',
                              },
                            }))
                          }
                          placeholder="Nominee name"
                          className="text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddNominee(category.id)}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddNominee(category.id)}
                          disabled={
                            addingNominee === category.id ||
                            !newNominee[category.id]?.name?.trim()
                          }
                          className="gap-1 flex-shrink-0"
                        >
                          {addingNominee === category.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          Add
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