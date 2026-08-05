'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { paymentsApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import { Check, Loader2, XCircle, Clock } from 'lucide-react'

interface Receipt {
  id: string
  reference: string
  amount: string
  currency: string
  method: string
  status: string
  voterEmail: string
  createdAt: string
  vote: {
    quantity: number
    nominee: {
      name: string
      code: string
      category: {
        name: string
        event: {
          name: string
        }
      }
    }
  } | null
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams.get('reference')

  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'success' | 'failed' | 'pending'>('pending')

  // Warm up the backend so the payment verification + receipt requests find a
  // warm server instead of hanging on a cold start.
  useWarmUp()

  const MAX_POLL_ATTEMPTS = 6

  // Returns true when the payment is still pending and we should keep checking.
  const verifyPayment = useCallback(async () => {
    if (!reference) return false
    try {
      const verifyResponse = await paymentsApi.verify(reference)
      setStatus(verifyResponse.data.status)

      if (verifyResponse.data.status === 'success') {
        const receiptResponse = await paymentsApi.getReceipt(reference)
        setReceipt(receiptResponse.data.payment)
        return false
      }

      // 'pending' (delayed MoMo/bank/other channels) → keep polling; anything
      // else (abandoned, failed, …) is a failure for display purposes.
      if (verifyResponse.data.status === 'pending') return true
      setStatus('failed')
      return false
    } catch {
      setStatus('failed')
      return false
    }
  }, [reference])

  useEffect(() => {
    if (!reference) {
      router.push('/voter/assistant')
      return
    }

    let cancelled = false
    let attempts = 0

    const poll = async () => {
      const shouldRetry = await verifyPayment()
      if (cancelled) return
      if (shouldRetry && attempts < MAX_POLL_ATTEMPTS) {
        attempts += 1
        setTimeout(poll, 5000)
      } else {
        setLoading(false)
      }
    }

    poll()

    return () => {
      cancelled = true
    }
  }, [reference, router, verifyPayment])

  const handleCheckAgain = async () => {
    setLoading(true)
    await verifyPayment()
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Confirming your payment...</p>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 mb-2">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Payment Confirming</h1>
        <p className="text-muted-foreground">
          Your payment is still being confirmed. This can take a few minutes for
          mobile money or bank transfers — we'll keep checking automatically.
        </p>
        <Button onClick={handleCheckAgain} variant="outline">
          Check payment status
        </Button>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-2">
          <XCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Payment Failed</h1>
        <p className="text-muted-foreground">
          Your payment could not be processed. You have not been charged.
        </p>
        <Button onClick={() => router.back()} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (!receipt || !receipt.vote) return null

  const { vote } = receipt

  return (
    <div className="max-w-lg mx-auto py-8 space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-2">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Thank You!</h1>
        <p className="text-muted-foreground">
          Your votes have been recorded successfully
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Receipt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Event</p>
              <p className="font-medium text-foreground mt-1">
                {vote.nominee.category.event.name}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium text-foreground mt-1">
                {vote.nominee.category.name}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Nominee</p>
              <p className="font-medium text-foreground mt-1">
                {vote.nominee.name}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Nominee Code</p>
              <code className="font-bold text-primary mt-1 block">
                {vote.nominee.code}
              </code>
            </div>
            <div>
              <p className="text-muted-foreground">Votes Cast</p>
              <p className="font-bold text-foreground mt-1">
                {vote.quantity} votes
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount Paid</p>
              <p className="font-bold text-primary mt-1">
                {receipt.currency} {Number(receipt.amount).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment Method</p>
              <p className="font-medium text-foreground mt-1 capitalize">
                {receipt.method.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium text-foreground mt-1">
                {new Date(receipt.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">Reference</p>
            <code className="text-xs text-muted-foreground">{receipt.reference}</code>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button asChild className="w-full">
          <Link href="/voter/assistant">Vote for Another Nominee</Link>
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        A receipt has been sent to {receipt.voterEmail}
      </p>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}