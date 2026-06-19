'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { adminApi } from '@/lib/api'
import { Search, Loader2, Calendar } from 'lucide-react'

interface Subscription {
  id: string
  plan: 'free' | 'basic' | 'pro' | 'enterprise'
  isActive: boolean
  startDate: string
  endDate: string | null
  createdAt: string
  user: {
    name: string
    email: string
    organizationName: string | null
  }
}

const planColor = {
  free: 'secondary',
  basic: 'secondary',
  pro: 'default',
  enterprise: 'default',
} as const

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'free' | 'basic' | 'pro' | 'enterprise'>('all')

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await adminApi.getSubscriptions()
        setSubscriptions(response.data.subscriptions)
      } catch {
        setError('Failed to load subscriptions.')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [])

  const filtered = subscriptions.filter((s) => {
    const term = search.toLowerCase()
    const matchesSearch =
      (s.user.organizationName ?? s.user.name).toLowerCase().includes(term) ||
      s.user.email.toLowerCase().includes(term)
    const matchesFilter = filter === 'all' || s.plan === filter
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage organizer subscription plans
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {subscriptions.length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {subscriptions.filter((s) => s.isActive).length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {subscriptions.filter((s) => s.plan === 'pro' || s.plan === 'enterprise').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Paid Plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-muted-foreground">
              {subscriptions.filter((s) => s.plan === 'free').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Free Plans</p>
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
            placeholder="Search organizations..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'free', 'basic', 'pro', 'enterprise'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition capitalize border ${
                filter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-input hover:bg-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Organization</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Started</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Expires</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition"
                  >
                    <td className="py-3 px-4 font-medium text-foreground">
                      {sub.user.organizationName ?? sub.user.name}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {sub.user.email}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={planColor[sub.plan]}
                        className="capitalize"
                      >
                        {sub.plan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={sub.isActive ? 'default' : 'secondary'}>
                        {sub.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(sub.startDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {sub.endDate
                        ? new Date(sub.endDate).toLocaleDateString()
                        : 'Never'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No subscriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}