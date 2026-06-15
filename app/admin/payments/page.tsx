'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { adminApi } from '@/lib/api'
import { Search, Loader2 } from 'lucide-react'

interface Payment {
  id: string
  reference: string
  amount: string
  currency: string
  method: string
  status: 'pending' | 'success' | 'failed'
  voterEmail: string | null
  platformFee: string
  organizerAmount: string
  createdAt: string
  event: { name: string }
  vote: {
    nominee: { name: string; code: string }
  } | null
}

interface Summary {
  totalRevenue: number
  totalPlatformFees: number
  totalTransactions: number
}

const statusColor = {
  success: 'default',
  pending: 'secondary',
  failed: 'destructive',
} as const

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all')

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await adminApi.getPayments()
        setPayments(response.data.payments)
        setSummary(response.data.summary)
      } catch {
        setError('Failed to load payments.')
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const filtered = payments.filter((p) => {
    const term = search.toLowerCase()
    const matchesSearch =
      p.reference.toLowerCase().includes(term) ||
      p.event.name.toLowerCase().includes(term) ||
      (p.voterEmail ?? '').toLowerCase().includes(term) ||
      (p.vote?.nominee.name ?? '').toLowerCase().includes(term)
    const matchesFilter = filter === 'all' || p.status === filter
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
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Payment Management</h1>
        <p className="text-muted-foreground mt-1">Monitor all platform transactions</p>
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
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              GHS {(summary?.totalRevenue ?? 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Platform Fees</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              GHS {(summary?.totalPlatformFees ?? 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Successful</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {summary?.totalTransactions ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {payments.filter((p) => p.status === 'failed').length}
            </p>
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
            placeholder="Search by reference, event, email, nominee..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'success', 'pending', 'failed'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Reference</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Event</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Nominee</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Voter</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Fee</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Method</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition"
                  >
                    <td className="py-3 px-4">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">
                        {payment.reference}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-[150px] truncate">
                      {payment.event.name}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {payment.vote ? (
                        <span className="flex items-center gap-1">
                          <code className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            {payment.vote.nominee.code}
                          </code>
                          {payment.vote.nominee.name}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {payment.voterEmail ?? '—'}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      {payment.currency} {Number(payment.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {payment.currency} {Number(payment.platformFee).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground capitalize">
                      {payment.method.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusColor[payment.status]} className="capitalize">
                        {payment.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                      No payments found.
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