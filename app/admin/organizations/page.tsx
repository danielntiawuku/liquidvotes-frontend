'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { adminApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import { Search, Loader2, Building2, Calendar } from 'lucide-react'

interface Organization {
  id: string
  name: string
  email: string
  organizationName: string | null
  organizationType: string | null
  location: string | null
  createdAt: string
  subscription: {
    plan: string
    isActive: boolean
  } | null
  _count: {
    events: number
  }
}

const planColor = {
  free: 'secondary',
  basic: 'secondary',
  pro: 'default',
  enterprise: 'default',
} as const

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Warm up the backend so the organizations list request finds a warm server.
  useWarmUp()

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await adminApi.getOrganizations()
        setOrganizations(response.data.organizations)
      } catch {
        setError('Failed to load organizations.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizations()
  }, [])

  const filtered = organizations.filter((org) => {
    const term = search.toLowerCase()
    return (
      org.name.toLowerCase().includes(term) ||
      org.email.toLowerCase().includes(term) ||
      (org.organizationName ?? '').toLowerCase().includes(term)
    )
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organizations</h1>
          <p className="text-muted-foreground mt-1">
            Manage all organizer accounts and subscriptions
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {organizations.length} total
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{organizations.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Organizations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {organizations.filter((o) => o.subscription?.isActive).length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Active Subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {organizations.reduce((s, o) => s + o._count.events, 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Total Events Created</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search organizations..."
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Organizations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Organization</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Events</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Joined</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((org) => (
                  <tr
                    key={org.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <Link
                              href={`/admin/organizations/${org.id}`}
                              className="font-medium text-foreground hover:text-primary hover:underline"
                            >
                              {org.organizationName ?? org.name}
                            </Link>
                          {org.organizationType && (
                            <p className="text-xs text-muted-foreground">{org.organizationType}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{org.email}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={planColor[org.subscription?.plan as keyof typeof planColor] ?? 'secondary'}
                        className="capitalize"
                      >
                        {org.subscription?.plan ?? 'free'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{org._count.events}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(org.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={org.subscription?.isActive ? 'default' : 'secondary'}
                      >
                        {org.subscription?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No organizations found.
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