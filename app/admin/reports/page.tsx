'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import { BarChart3, TrendingUp, Trophy, Loader2, DollarSign } from 'lucide-react'

interface RevenueDay {
  [date: string]: number
}

interface TopEvent {
  id: string
  name: string
  organizer: string | null
  revenue: number
}

interface TopNominee {
  id: string
  name: string
  code: string
  event: string
  votes: number
}

interface Reports {
  revenueByDay: RevenueDay
  topEventsByRevenue: TopEvent[]
  topNomineesByVotes: TopNominee[]
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Reports | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Warm up the backend so the reports request finds a warm server.
  useWarmUp()

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await adminApi.getReports()
        setReports(response.data.reports)
      } catch {
        setError('Failed to load reports.')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
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

  const totalRevenue = Object.values(reports?.revenueByDay ?? {}).reduce(
    (s, v) => s + v, 0
  )
  const maxRevenue = Math.max(...Object.values(reports?.revenueByDay ?? { _: 0 }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">Platform analytics and performance data</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Platform Fees (30d)</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  GHS {totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Events</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {reports?.topEventsByRevenue.length ?? 0}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Nominees Tracked</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {reports?.topNomineesByVotes.length ?? 0}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">

        {/* Revenue by day */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Platform Fee Revenue — Last 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(reports?.revenueByDay ?? {}).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No revenue data in the last 30 days.
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(reports?.revenueByDay ?? {})
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, amount]) => {
                    const percentage = maxRevenue > 0 ? (amount / maxRevenue) * 100 : 0
                    return (
                      <div key={date} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-24 flex-shrink-0">
                          {new Date(date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground w-20 text-right flex-shrink-0">
                          GHS {amount.toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Top events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Top Events by Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!reports?.topEventsByRevenue.length ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No event data yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {reports.topEventsByRevenue.map((event, index) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        index === 0
                          ? 'bg-yellow-400 text-yellow-900'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {event.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.organizer ?? 'Unknown organizer'}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-foreground flex-shrink-0">
                        GHS {event.revenue.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top nominees */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Top Nominees by Votes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!reports?.topNomineesByVotes.length ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No vote data yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {reports.topNomineesByVotes.map((nominee, index) => (
                    <div
                      key={nominee.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        index === 0
                          ? 'bg-yellow-400 text-yellow-900'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {nominee.name}
                          </p>
                          <code className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded flex-shrink-0">
                            {nominee.code}
                          </code>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {nominee.event}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-foreground flex-shrink-0">
                        {nominee.votes.toLocaleString()} votes
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}