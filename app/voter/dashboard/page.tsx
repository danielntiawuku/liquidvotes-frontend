'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { authApi, paymentsApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Loader2, Ticket } from 'lucide-react'
import Link from 'next/link'

interface Transaction {
  id: string
  reference: string
  amount: string
  currency: string
  method: string
  status: string
  createdAt: string
  vote: {
    quantity: number
    nominee: {
      name: string
      code: string
      category: {
        name: string
        event: {
          id: string
          name: string
        }
      }
    }
  } | null
}

export default function VoterDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [memberSince, setMemberSince] = useState('—')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Warm up the backend on page load so a sleeping Render instance has time
  // to boot before the voting history request arrives.
  useWarmUp()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paymentsRes, meRes] = await Promise.all([
          paymentsApi.getMyTransactions(),
          authApi.me(),
        ])
        setTransactions(paymentsRes.data.payments ?? [])

        const createdAt = meRes.data?.user?.createdAt
        if (createdAt) {
          setMemberSince(
            new Date(createdAt).toLocaleDateString('en-GB', {
              month: 'short',
              year: 'numeric',
            })
          )
        }
      } catch {
        setError('Failed to load your voting history.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const successful = transactions.filter((t) => t.status === 'success' && t.vote)
  const eventNames = new Set<string>()
  let totalVotes = 0
  let totalSpent = 0
  let currency = 'GHS'

  successful.forEach((t) => {
    if (!t.vote) return
    eventNames.add(t.vote.nominee.category.event.name)
    totalVotes += t.vote.quantity
    totalSpent += Number(t.amount)
    currency = t.currency || currency
  })

  // Voting activity by month (based on successful payments)
  const byMonth = new Map<string, number>()
  successful.forEach((t) => {
    const key = new Date(t.createdAt).toLocaleDateString('en-GB', { month: 'short' })
    byMonth.set(key, (byMonth.get(key) ?? 0) + Number(t.amount))
  })
  const chartData = Array.from(byMonth.entries()).map(([month, spent]) => ({
    month,
    spent: Math.round(spent * 100) / 100,
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Your Voting Dashboard</h1>
        <p className="text-muted-foreground">Track your voting history and participation</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{eventNames.size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Votes Cast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalVotes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {currency} {totalSpent.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground">{memberSince}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voting Activity</CardTitle>
          <CardDescription>Your voting spend over time</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">
              No voting activity yet —{' '}
              <Link href="/voter/assistant" className="text-primary hover:underline">
                enter a nominee code
              </Link>{' '}
              to cast your first vote.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="spent" name={`Amount (${currency})`} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Voting History</CardTitle>
          <CardDescription>Your recent voting submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">No votes yet</p>
              <p className="text-sm text-muted-foreground">
                <Link href="/voter/assistant" className="text-primary hover:underline">
                  Enter a nominee code
                </Link>{' '}
                to cast your first vote.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      {item.vote?.nominee.category.event.name ?? 'Voting Event'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {item.vote
                        ? `${item.vote.nominee.name} · ${item.vote.nominee.category.name} · ${new Date(item.createdAt).toLocaleDateString()}`
                        : new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <Badge variant="outline">
                        {item.vote ? `${item.vote.quantity} votes` : '—'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">
                        {item.currency} {Number(item.amount).toFixed(2)}
                      </div>
                      <Badge
                        className={`mt-1 ${
                          item.status === 'success'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
