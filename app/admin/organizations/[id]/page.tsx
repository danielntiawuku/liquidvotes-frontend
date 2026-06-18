'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { adminApi } from '@/lib/api'
import {
  ArrowLeft,
  Loader2,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Save,
  CheckCircle,
  ShieldOff,
  ShieldCheck,
  Calendar,
  Trophy,
} from 'lucide-react'

interface Event {
  id: string
  name: string
  status: string
  votePrice: string
  currency: string
  startDate: string
  endDate: string
  _count: { categories: number; payments: number }
}

interface Payment {
  id: string
  reference: string
  amount: string
  currency: string
  platformFee: string
  organizerAmount: string
  createdAt: string
  event: { name: string }
}

interface Organization {
  id: string
  name: string
  email: string
  phone: string | null
  organizationName: string | null
  organizationType: string | null
  bio: string | null
  website: string | null
  location: string | null
  createdAt: string
  isSuspended: boolean
  platformFeeOverride: string | null
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise'
    isActive: boolean
  } | null
  events: Event[]
  payments: Payment[]
  totalRevenue: number
  totalPlatformFees: number
  totalPaidToOrganizer: number
}

const statusColor = {
  draft: 'secondary',
  published: 'default',
  closed: 'secondary',
} as const

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [plan, setPlan] = useState<'free' | 'basic' | 'pro' | 'enterprise'>('free')
  const [feeOverride, setFeeOverride] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [togglingSuspend, setTogglingSuspend] = useState(false)

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const response = await adminApi.getOrganization(id)
        const data = response.data.organization
        setOrg(data)
        setPlan(data.subscription?.plan ?? 'free')
        setFeeOverride(
          data.platformFeeOverride !== null ? String(data.platformFeeOverride) : ''
        )
      } catch {
        setError('Failed to load organization.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrg()
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const response = await adminApi.updateOrganization(id, {
        plan,
        platformFeeOverride: feeOverride.trim() === '' ? null : Number(feeOverride),
      })
      setOrg((prev) =>
        prev
          ? {
              ...prev,
              platformFeeOverride: response.data.organization.platformFeeOverride,
              subscription: prev.subscription
                ? { ...prev.subscription, plan }
                : { plan, isActive: true },
            }
          : prev
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleSuspend = async () => {
    if (!org) return
    const action = org.isSuspended ? 'reactivate' : 'suspend'
    if (!confirm(`Are you sure you want to ${action} this organization?`)) return

    setTogglingSuspend(true)
    try {
      const response = await adminApi.updateOrganization(id, {
        isSuspended: !org.isSuspended,
      })
      setOrg((prev) =>
        prev ? { ...prev, isSuspended: response.data.organization.isSuspended } : prev
      )
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update suspension status.')
    } finally {
      setTogglingSuspend(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !org) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (!org) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/organizations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">
              {org.organizationName ?? org.name}
            </h1>
            {org.isSuspended ? (
              <Badge variant="destructive">Suspended</Badge>
            ) : (
              <Badge variant="default">Active</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{org.email}</p>
        </div>
        <Button
          variant="outline"
          onClick={handleToggleSuspend}
          disabled={togglingSuspend}
          className={
            org.isSuspended
              ? 'gap-2 text-green-600 border-green-300 hover:bg-green-50'
              : 'gap-2 text-destructive border-destructive/30 hover:bg-destructive/10'
          }
        >
          {togglingSuspend ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : org.isSuspended ? (
            <ShieldCheck className="w-4 h-4" />
          ) : (
            <ShieldOff className="w-4 h-4" />
          )}
          {org.isSuspended ? 'Reactivate' : 'Suspend'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {/* Revenue summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              GHS {org.totalRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Platform Fees Earned</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              GHS {org.totalPlatformFees.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Paid to Organizer</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              GHS {org.totalPaidToOrganizer.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">

        {/* Profile info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Organization Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              {org.email}
            </div>
            {org.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                {org.phone}
              </div>
            )}
            {org.website && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="w-3.5 h-3.5" />
                {org.website}
              </div>
            )}
            {org.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                {org.location}
              </div>
            )}
            {org.organizationType && (
              <Badge variant="secondary" className="mt-1">{org.organizationType}</Badge>
            )}
            {org.bio && (
              <p className="text-muted-foreground pt-2 border-t border-border mt-3">
                {org.bio}
              </p>
            )}
            <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-3">
              Joined {new Date(org.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        {/* Plan + fee override */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan & Fees</CardTitle>
            <CardDescription>Manage subscription plan and platform fee</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Subscription Plan
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as typeof plan)}
                className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Platform Fee Override (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={feeOverride}
                onChange={(e) => setFeeOverride(e.target.value)}
                placeholder="Default: 5%"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to use the platform default of 5%
              </p>
            </div>
            <Button onClick={handleSave} disabled={saving} className="gap-2 w-full">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <CheckCircle className="w-4 h-4 text-green-300" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Events */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Events ({org.events.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {org.events.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">No events yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {org.events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{event.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.startDate).toLocaleDateString()} —{' '}
                        {new Date(event.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      {event._count.categories} categories
                    </span>
                    <Badge variant={statusColor[event.status as keyof typeof statusColor]} className="capitalize">
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {org.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Reference</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Event</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Fee</th>
                    <th className="text-left py-2 px-4 text-muted-foreground font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {org.payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border/50">
                      <td className="py-2 px-4">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded">
                          {payment.reference}
                        </code>
                      </td>
                      <td className="py-2 px-4 text-muted-foreground">{payment.event.name}</td>
                      <td className="py-2 px-4 font-medium text-foreground">
                        {payment.currency} {Number(payment.amount).toFixed(2)}
                      </td>
                      <td className="py-2 px-4 text-muted-foreground">
                        {payment.currency} {Number(payment.platformFee).toFixed(2)}
                      </td>
                      <td className="py-2 px-4 text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}