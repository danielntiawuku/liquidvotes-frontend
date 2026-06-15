'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminApi } from '@/lib/api'
import {
  BarChart3,
  Users,
  TrendingUp,
  Trophy,
  Loader2,
  Building2,
  AlertCircle,
  DollarSign,
} from 'lucide-react'

interface Dashboard {
  totalOrganizations: number
  totalVoters: number
  totalEvents: number
  totalNominees: number
  totalVotes: number
  totalRevenue: number
  totalPlatformFees: number
  pendingTickets: number
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await adminApi.getDashboard()
        setDashboard(response.data.dashboard)
      } catch {
        setError('Failed to load dashboard.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const kpis = [
    {
      label: 'Total Revenue',
      value: `GHS ${(dashboard?.totalRevenue ?? 0).toFixed(2)}`,
      icon: DollarSign,
      sub: 'All transactions',
    },
    {
      label: 'Platform Fees',
      value: `GHS ${(dashboard?.totalPlatformFees ?? 0).toFixed(2)}`,
      icon: TrendingUp,
      sub: 'Net earnings',
    },
    {
      label: 'Organizations',
      value: dashboard?.totalOrganizations ?? 0,
      icon: Building2,
      sub: 'Registered organizers',
    },
    {
      label: 'Total Votes',
      value: (dashboard?.totalVotes ?? 0).toLocaleString(),
      icon: BarChart3,
      sub: 'All time',
    },
    {
      label: 'Total Events',
      value: dashboard?.totalEvents ?? 0,
      icon: Trophy,
      sub: 'Created on platform',
    },
    {
      label: 'Total Nominees',
      value: dashboard?.totalNominees ?? 0,
      icon: Users,
      sub: 'Across all events',
    },
    {
      label: 'Voters',
      value: dashboard?.totalVoters ?? 0,
      icon: Users,
      sub: 'Registered accounts',
    },
    {
      label: 'Open Tickets',
      value: dashboard?.pendingTickets ?? 0,
      icon: AlertCircle,
      sub: 'Awaiting response',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and key metrics</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
                </div>
                <kpi.icon className="w-8 h-8 text-primary/20 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          
        ))}
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-sm transition">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Manage organizer accounts, subscriptions and event access.
            </p>
            
            <a
              href="/admin/organizations"
              className="text-sm text-primary hover:underline font-medium"
            >
              View all organizations
            </a>

          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              View all transactions, platform fees and payment records.
            </p>
            
              <a href="/admin/payments"
              className="text-sm text-primary hover:underline font-medium"
            >
              View all payments
            </a>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {dashboard?.pendingTickets
                ? `${dashboard.pendingTickets} ticket${dashboard.pendingTickets > 1 ? 's' : ''} waiting for response.`
                : 'No open tickets. All issues resolved.'}
            </p>

            <a
              href="/admin/support"
              className="text-sm text-primary hover:underline font-medium"
          >
              View support tickets
          </a>  
          </CardContent>
        </Card>
        </div>
      </div>
  )
}