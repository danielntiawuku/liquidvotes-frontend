'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { nomineesApi } from '@/lib/api'
import { ArrowRight, ShieldCheck } from 'lucide-react'

export default function AssistantPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setError('')

    try {
      await nomineesApi.getByCode(code.trim().toUpperCase())
      router.push(`/voter/nominee/${code.trim().toUpperCase()}`)
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 404) {
        setError(`No nominee found with code "${code.toUpperCase()}". Please check and try again.`)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col">

      {/* Chat area */}
      <div className="flex flex-col items-center justify-center px-4 py-16 min-h-[60vh]">

        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold shadow-md mb-2">
            V
          </div>
          <p className="font-semibold text-foreground text-lg">VoteBot</p>
          <p className="text-xs text-muted-foreground">
            {time ? `Today ${time}` : ''}
          </p>
        </div>

        {/* Bot message bubble */}
        <div className="max-w-lg w-full">
          <div className="bg-muted rounded-2xl rounded-tl-sm px-5 py-4 text-sm text-foreground leading-relaxed shadow-sm">
            <p>
              Hello there 👋 I've got you covered — no endless scrolling needed 😎
            </p>
            <p className="mt-3">
              Enter your <strong>nominee code</strong> to jump straight to the voting page.
              It's a short code like <strong>WA04</strong> — not a phone number or USSD code.
            </p>
          </div>
        </div>

        {/* Error message bubble */}
        {error && (
          <div className="max-w-lg w-full mt-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl rounded-tl-sm px-5 py-4 text-sm text-destructive leading-relaxed">
              {error}
            </div>
          </div>
        )}

        {/* Loading dots */}
        {loading && (
          <div className="max-w-lg w-full mt-4">
            <div className="bg-muted rounded-2xl rounded-tl-sm px-5 py-4 text-sm text-muted-foreground">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce [animation-delay:150ms]">.</span>
                <span className="animate-bounce [animation-delay:300ms]">.</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-border px-4 py-6 bg-muted/30">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-3">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError('')
            }}
            placeholder="Enter nominee code (e.g. WA04, WA05)"
            className="flex-1 rounded-full px-5 h-12 text-sm"
            maxLength={20}
            disabled={loading}
            autoFocus
          />
          <Button
            type="submit"
            disabled={loading || !code.trim()}
            className="rounded-full h-12 px-6 gap-2"
          >
            Vote <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
        <div className="flex items-center justify-center mt-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-primary" />
            Your vote is protected by our Vote Promise
          </p>
        </div>
      </div>

    </div>
  )
}