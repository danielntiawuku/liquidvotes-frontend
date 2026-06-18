'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { nomineesApi } from '@/lib/api'
import { ArrowLeft, ArrowRight, Loader2, Trophy, Calendar } from 'lucide-react'

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
    }
  }
}

export default function NomineePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = use(params)
  const [nominee, setNominee] = useState<Nominee | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchNominee = async () => {
      try {
        const response = await nomineesApi.getByCode(code)
        setNominee(response.data.nominee)
      } catch {
        setError('This nominee is not available for voting right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchNominee()
  }, [code])

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Back */}
      <Link
        href={`/awards/${event.id}/${category.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to {category.name}
      </Link>

      <Card className="overflow-hidden">

        {/* Photo or avatar */}
        <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
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

        <CardContent className="p-6">

          {/* Name + badges */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{nominee.name}</h1>
            {nominee.isWinner && (
              <Badge className="gap-1 bg-yellow-400 text-yellow-900">
                <Trophy className="w-3 h-3" />
                Winner
              </Badge>
            )}
          </div>

          <p className="text-sm text-primary font-medium mb-1">{category.name}</p>
          <p className="text-sm text-muted-foreground mb-4">{event.name}</p>

          {/* Code */}
          <code className="inline-block bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-lg text-sm tracking-wider mb-4">
            {nominee.code}
          </code>

          {/* Bio */}
          {nominee.bio && (
            <p className="text-foreground mb-6 leading-relaxed">{nominee.bio}</p>
          )}

          {/* Event details */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg mb-6">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              Voting ends {new Date(event.endDate).toLocaleDateString()}
            </div>
            <span className="text-sm font-medium text-foreground">
              {event.currency} {Number(event.votePrice).toFixed(2)}/vote
            </span>
          </div>

          {/* Vote button */}
          <Link href={`/voter/checkout?code=${nominee.code}`}>
            <Button className="w-full h-12 text-base gap-2">
              Vote for {nominee.name.split(' ')[0]}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}