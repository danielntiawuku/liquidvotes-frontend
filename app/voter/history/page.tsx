'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { paymentsApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import { Loader2, Ticket, Trophy } from 'lucide-react'

interface Transaction {
  id: string
  reference: string
  amount: string
  currency: string
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
          status: string
        }
      }
    }
  } | null
}

export default function VoterHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Warm up the backend so the history request finds a warm server.
  useWarmUp()

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await paymentsApi.getMyTransactions()
        setTransactions(response.data.payments ?? [])
      } catch {
        setError('Failed to load your voting history.')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-2">Voting History</h1>
          <p className="text-muted-foreground mb-10">
            Every vote you&apos;ve cast, with its receipt details.
          </p>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-destructive mb-4">{error}</p>
            </div>
          )}

          {!loading && !error && transactions.length === 0 && (
            <div className="text-center py-20">
              <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">No votes yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Cast your first vote to see it here.
              </p>
              <Button asChild>
                <Link href="/voter/assistant">Enter a Nominee Code</Link>
              </Button>
            </div>
          )}

          {!loading && !error && transactions.length > 0 && (
            <div className="space-y-4">
              {transactions.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-foreground">
                            {item.vote?.nominee.category.event.name ?? 'Voting Event'}
                          </h3>
                          <Badge
                            variant={item.status === 'success' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.vote
                            ? `${item.vote.nominee.name} · ${item.vote.nominee.category.name}`
                            : '—'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(item.createdAt).toLocaleDateString()} · {item.reference}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-foreground">
                          {item.currency} {Number(item.amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.vote ? `${item.vote.quantity} votes` : '—'}
                        </p>
                        {item.status === 'success' &&
                          item.vote?.nominee.category.event.status === 'closed' && (
                            <Link
                              href={`/results?eventId=${item.vote.nominee.category.event.id}`}
                            >
                              <Button size="sm" variant="outline" className="mt-2 gap-1.5">
                                <Trophy className="w-3.5 h-3.5" />
                                View Results
                              </Button>
                            </Link>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
