'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { nomineesApi, paymentsApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import { ArrowLeft, Loader2, Trophy, Calendar, Minus, Plus, Lock, CheckCircle2 } from 'lucide-react'

interface Nominee {
  id: string
  name: string
  code: string
  bio: string | null
  photoUrl: string | null
  isWinner: boolean
  category: {
    id: string
    name: string
    event: {
      id: string
      name: string
      votePrice: string
      currency: string
      status: string
      endDate: string
      showLiveResults: 'full' | 'participants_only' | 'hidden'
    }
  }
}

interface LeaderboardEntry {
  id: string
  name: string
  code: string
  isWinner: boolean
  votes: number | null
}

export default function NomineePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = use(params)

  const [nominee, setNominee] = useState<Nominee | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [paying, setPaying] = useState(false)
  const [formError, setFormError] = useState('')
  const [resultsVisibility, setResultsVisibility] = useState<
    'full' | 'participants_only' | 'hidden'
  >('full')

  // Warm up the backend on page load so a sleeping Render instance has time
  // to boot before the nominee lookup + leaderboard requests arrive.
  useWarmUp()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const nomineeResponse = await nomineesApi.getByCode(code)
        const fetchedNominee = nomineeResponse.data.nominee
        setNominee(fetchedNominee)
        setResultsVisibility(fetchedNominee.category.event.showLiveResults || 'full')

        // Live leaderboard is only needed while voting is open — closed events
        // show the results-announced banner instead.
        if (fetchedNominee.category.event.status !== 'closed') {
          const leaderboardResponse = await nomineesApi.getLeaderboard(
            fetchedNominee.category.id
          )
          if (leaderboardResponse.data.visibility) {
            setResultsVisibility(leaderboardResponse.data.visibility)
          }
          setLeaderboard(leaderboardResponse.data.leaderboard)
        }
      } catch {
        setError('This nominee is not available for voting right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [code])

  const votePrice = nominee ? Number(nominee.category.event.votePrice) : 0
  const total = votePrice * quantity

  const handleVote = async () => {
    if (!name.trim()) {
      setFormError('Please enter your full name.')
      return
    }
    if (!email.trim()) {
      setFormError('Please enter your email to receive a receipt.')
      return
    }
    if (!nominee) return

    setPaying(true)
    setFormError('')

    try {
      const response = await paymentsApi.initiate({
        nomineeId: nominee.id,
        quantity,
        email: email.trim(),
      })

      window.location.href = response.data.authorizationUrl
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !nominee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <p className="text-destructive">{error || 'Nominee not found.'}</p>
        <Link href="/voter/assistant" className="text-primary hover:underline text-sm">
          Enter a different code
        </Link>
      </div>
    )
  }

  const { category } = nominee
  const { event } = category

  // Find this nominee's rank
  const myIndex = leaderboard.findIndex((n) => n.id === nominee.id)
  const myRank = myIndex >= 0 ? myIndex + 1 : null
  const myVotes = myIndex >= 0 ? leaderboard[myIndex].votes ?? 0 : 0
  const participantsOnly = resultsVisibility === 'participants_only'
  const resultsHidden = resultsVisibility === 'hidden'
  const isClosed = event.status === 'closed'

  // Top 3, plus this nominee if they're outside top 3
  const top3 = leaderboard.slice(0, 3)
  const showMeSeparately = myRank !== null && myRank > 3

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Back */}
      <Link
        href={`/awards/${event.id}/${category.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to {category.name}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

        {/* Left: Photo + bio */}
        <div>
          <Card className="overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              {nominee.photoUrl ? (
                <img
                  src={nominee.photoUrl}
                  alt={nominee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl">
                  {nominee.name.charAt(0)}
                </div>
              )}
            </div>
          </Card>

          <div className="mt-4">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-foreground">{nominee.name}</h1>
              {nominee.isWinner && (
                <Badge className="gap-1 bg-yellow-400 text-yellow-900">
                  <Trophy className="w-3 h-3" />
                  Winner
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Nominee Code: <span className="font-bold text-primary">{nominee.code}</span>
            </p>
          </div>

          {nominee.bio && (
            <p className="text-sm text-foreground mt-4 leading-relaxed">{nominee.bio}</p>
          )}

          {/* Results announced (voting closed) — replaces the live results card */}
          {isClosed ? (
            <Card className="mt-6 overflow-hidden border-amber-300/60 dark:border-amber-700/50">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-yellow-300" />
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Trophy className="w-5 h-5 text-amber-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {nominee.isWinner ? 'Winner Announced' : 'Results Announced'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Voting has closed for {event.name}
                    </p>
                  </div>
                </div>

                {nominee.isWinner ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{nominee.name}</span> is the winner of{' '}
                      <span className="font-semibold">{category.name}</span>.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Final results for this category have been published.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : !resultsHidden ? (
            <Card className="mt-6">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {category.name} — Live Results
                </h3>
                <div className="space-y-2">
                  {participantsOnly ? (
                    // Participants only — plain list, no rank badges, no counts
                    leaderboard.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No participants yet
                      </p>
                    ) : (
                      <>
                        {leaderboard.map((entry) => {
                          const isMe = entry.id === nominee.id
                          return (
                            <div
                              key={entry.id}
                              className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                                isMe ? 'bg-primary/10' : ''
                              }`}
                            >
                              <span className={isMe ? 'font-semibold text-primary' : 'text-foreground'}>
                                {entry.name}{isMe ? ' (this nominee)' : ''}
                              </span>
                            </div>
                          )
                        })}
                        <p className="text-xs text-muted-foreground text-center pt-1">
                          Vote counts are hidden
                        </p>
                      </>
                    )
                  ) : (
                    <>
                      {top3.map((entry, index) => {
                        const isMe = entry.id === nominee.id
                        return (
                          <div
                            key={entry.id}
                            className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                              isMe ? 'bg-primary/10' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                index === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-muted text-muted-foreground'
                              }`}>
                                {index + 1}
                              </span>
                              <span className={isMe ? 'font-semibold text-primary' : 'text-foreground'}>
                                {entry.name}{isMe ? ' (this nominee)' : ''}
                              </span>
                            </div>
                            <span className="font-medium text-foreground">
                              {(entry.votes ?? 0).toLocaleString()}
                            </span>
                          </div>
                        )
                      })}

                      {showMeSeparately && (
                        <>
                          <div className="text-center text-xs text-muted-foreground py-1">⋯</div>
                          <div className="flex items-center justify-between p-2 rounded-lg text-sm bg-primary/10">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-muted text-muted-foreground">
                                {myRank}
                              </span>
                              <span className="font-semibold text-primary">
                                {nominee.name} (this nominee)
                              </span>
                            </div>
                            <span className="font-medium text-foreground">
                              {myVotes.toLocaleString()}
                            </span>
                          </div>
                        </>
                      )}

                      {leaderboard.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No votes yet — be the first!
                        </p>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Right: Vote form */}
        <div>
          {isClosed ? (
            <Card className="border-border/60">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-1">Voting Closed</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Voting for {event.name} has ended. Thanks for participating!
                </p>
                <Link href={`/results?eventId=${event.id}&category=${category.id}`}>
                  <Button variant="outline" className="w-full gap-2 rounded-lg">
                    <Trophy className="w-4 h-4" />
                    View Results
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Vote for {nominee.name}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {category.name} · {event.name}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setFormError('')
                }}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email for receipt
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setFormError('')
                }}
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Number of votes ({event.currency} {votePrice.toFixed(2)} per vote)
              </label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  min={1}
                  max={10000}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.min(10000, q + 1))}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                {[10, 50, 100, 500].map((q) => (
                  <Button
                    key={q}
                    type="button"
                    variant={quantity === q ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setQuantity(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground">Total Amount</p>
              <p className="text-2xl font-bold text-primary">
                {event.currency} {total.toFixed(2)}
              </p>
            </div>

            {formError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            )}

            <Button
              onClick={handleVote}
              disabled={paying}
              className="w-full h-12 text-base gap-2"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting to payment...
                </>
              ) : (
                'Vote'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" />
              Voting ends {new Date(event.endDate).toLocaleDateString()} · Secured by Paystack
            </p>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}