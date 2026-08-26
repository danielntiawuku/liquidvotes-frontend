'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { nomineesApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import { Save, ArrowLeft, Loader2, CheckCircle, User } from 'lucide-react'
import Link from 'next/link'

interface Nominee {
  id: string
  name: string
  code: string
  bio: string | null
  photoUrl: string | null
  status: 'pending' | 'approved' | 'rejected'
  isWinner: boolean
  category: {
    id: string
    name: string
    event: {
      id: string
      name: string
    }
  }
}

const statusColor = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
} as const

export default function EditNomineePage() {
  const params = useParams()
  const router = useRouter()
  const nomineeId = params.id as string

  const [nominee, setNominee] = useState<Nominee | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    bio: '',
    photoUrl: '',
  })

  useWarmUp()

  useEffect(() => {
    const fetchNominee = async () => {
      try {
        const response = await nomineesApi.getById(nomineeId)
        const n = response.data.nominee
        setNominee(n)
        setForm({
          name: n.name || '',
          bio: n.bio || '',
          photoUrl: n.photoUrl || '',
        })
      } catch {
        setError('Failed to load nominee details.')
      } finally {
        setLoading(false)
      }
    }

    fetchNominee()
  }, [nomineeId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await nomineesApi.update(nomineeId, {
        name: form.name,
        bio: form.bio || null,
        photoUrl: form.photoUrl || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update nominee.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!nominee) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Nominee not found.</p>
          <Link href="/organizer/nominees">
            <Button variant="outline" className="mt-4">Back to Nominees</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/organizer/nominees">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Nominee</h1>
            <p className="text-muted-foreground mt-1">
              Update details for <span className="font-medium text-foreground">{nominee.name}</span>
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">

        {/* Nominee Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center text-primary text-3xl font-bold shadow-md overflow-hidden">
                  {form.photoUrl ? (
                    <img src={form.photoUrl} alt={nominee.name} className="w-full h-full object-cover" />
                  ) : (
                    nominee.name.charAt(0)
                  )}
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">{nominee.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-gradient-to-r from-primary/10 to-secondary/10 text-primary px-2 py-0.5 rounded-md font-bold">
                    {nominee.code}
                  </code>
                  <Badge variant={statusColor[nominee.status]} className="capitalize text-xs">
                    {nominee.status}
                  </Badge>
                  {nominee.isWinner && (
                    <Badge className="gap-1 bg-gradient-to-r from-yellow-400 to-amber-300 text-yellow-900 text-xs border-0">
                      🏆 Winner
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {nominee.category.name} · {nominee.category.event.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              Nominee Details
            </CardTitle>
            <CardDescription>
              Update the nominee&apos;s name and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Name
              </label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nominee name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Bio / Description
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="Tell voters about this nominee..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Photo URL
              </label>
              <Input
                name="photoUrl"
                value={form.photoUrl}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste a link to the nominee&apos;s photo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
