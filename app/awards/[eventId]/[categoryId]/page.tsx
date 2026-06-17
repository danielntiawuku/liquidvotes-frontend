'use client'

import { useState, useEffect, use } from 'react'
import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { eventsApi } from '@/lib/api'
import { Loader2, ArrowLeft, ArrowRight, Trophy } from 'lucide-react'
import Link from 'next/link'

interface Nominee {
  id: string
  name: string
  code: string
  bio: string | null
  photoUrl: string | null
  status: string
}

interface Category {
  id: string
  name: string
  nominees: Nominee[]
}

interface Event {
  id: string
  name: string
  currency: string
  votePrice: string
  categories: Category[]
}

export default function CategoryNomineesPage({
  params,
}: {
  params: Promise<{ eventId: string; categoryId: string }>
}) {
  const { eventId, categoryId } = use(params)
  const [event, setEvent] = useState<Event | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventsApi.getById(eventId)
        const fetchedEvent = response.data.event
        const fetchedCategory = fetchedEvent.categories.find(
          (c: Category) => c.id === categoryId
        )

        if (!fetchedCategory) {
          setError('Category not found.')
          return
        }

        setEvent(fetchedEvent)
        setCategory(fetchedCategory)
      } catch {
        setError('Event not found or no longer available.')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId, categoryId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !event || !category) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-destructive">{error || 'Category not found.'}</p>
          <Link href={`/awards/${eventId}`} className="text-primary hover:underline text-sm">
            Back to Categories
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const approvedNominees = category.nominees.filter((n) => n.status === 'approved')

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Back */}
          <Link
            href={`/awards/${eventId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Categories
          </Link>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-1">{category.name}</h1>
            <p className="text-muted-foreground">
              {event.name} · {event.currency} {Number(event.votePrice).toFixed(2)} per vote
            </p>
          </div>

          {/* Nominees */}
          {approvedNominees.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No nominees available yet in this category.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {approvedNominees.map((nominee) => (
                <div
                  key={nominee.id}
                  className="flex flex-col p-5 border border-border rounded-xl hover:border-primary hover:shadow-sm transition bg-card"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mb-4">
                    {nominee.name.charAt(0)}
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">{nominee.name}</h3>

                  {nominee.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                      {nominee.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                    <code className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-bold">
                      {nominee.code}
                    </code>
                    <Link href={`/voter/checkout?code=${nominee.code}`}>
                      <Button size="sm" className="gap-1">
                        Vote
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}