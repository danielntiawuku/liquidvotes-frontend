'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { nomineesApi, paymentsApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import { ArrowRight, Minus, Plus, Loader2 } from 'lucide-react'

interface Nominee {
  id: string
  name: string
  code: string
  bio: string | null
  photoUrl: string | null
  category: {
    name: string
    event: {
      id: string
      name: string
      votePrice: string
      currency: string
    }
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code')

  const [nominee, setNominee] = useState<Nominee | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  // Warm up the backend on page load so a sleeping Render instance has time
  // to boot before the voter completes checkout.
  useWarmUp()

  useEffect(() => {
    if (!code) {
      router.push('/voter/assistant')
      return
    }

    const fetchNominee = async () => {
      try {
        const response = await nomineesApi.getByCode(code)
        setNominee(response.data.nominee)
      } catch {
        router.push('/voter/assistant')
      } finally {
        setLoading(false)
      }
    }

    fetchNominee()
  }, [code, router])

  const votePrice = nominee ? Number(nominee.category.event.votePrice) : 0
  const total = votePrice * quantity

  const handlePay = async () => {
    if (!email.trim()) {
      setError('Please enter your email to receive a receipt')
      return
    }

    if (!nominee) return

    setPaying(true)
    setError('')

    try {
      const response = await paymentsApi.initiate({
        nomineeId: nominee.id,
        quantity,
        method: 'card',
        email: email.trim(),
      })

      window.location.href = response.data.authorizationUrl
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Payment failed. Please try again.')
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

  if (!nominee) return null

  return (
    <div className="max-w-lg mx-auto space-y-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{nominee.name}</CardTitle>
          <CardDescription>
            {nominee.category.name} · {nominee.category.event.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nominee.bio && (
            <p className="text-sm text-muted-foreground">{nominee.bio}</p>
          )}
          <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
            Code: {nominee.code}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Votes</CardTitle>
          <CardDescription>
            {nominee.category.event.currency} {votePrice.toFixed(2)} per vote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">{quantity}</p>
              <p className="text-sm text-muted-foreground">votes</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity((q) => Math.min(10000, q + 1))}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap mb-6">
            {[10, 50, 100, 500].map((q) => (
              <Button
                key={q}
                variant={quantity === q ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQuantity(q)}
              >
                {q}
              </Button>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium text-foreground">Total Amount</p>
            <p className="text-2xl font-bold text-primary">
              {nominee.category.event.currency} {total.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receipt</CardTitle>
          <CardDescription>
            Enter your email to receive a payment receipt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            placeholder="your@email.com"
          />
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        onClick={handlePay}
        disabled={paying}
        className="w-full h-12 text-base gap-2"
      >
        {paying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirecting to payment...
          </>
        ) : (
          <>
            Pay {nominee.category.event.currency} {total.toFixed(2)}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Secured by Paystack · Your vote is anonymous
      </p>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}