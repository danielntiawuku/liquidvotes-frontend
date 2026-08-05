'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventSchema, type EventFormData } from '@/lib/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { eventsApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import { ChevronRight, Loader2 } from 'lucide-react'

type WizardStep = 'basic' | 'details' | 'settings' | 'review'

const stepFields: Record<WizardStep, (keyof EventFormData)[]> = {
  basic: ['name', 'description'],
  details: ['startDate', 'endDate'],
  settings: ['pricePerVote', 'currency', 'votingMethod', 'allowInternational'],
  review: [],
}

export default function CreateEventPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Warm up the backend so the create-event flow finds a warm server.
  useWarmUp()

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    watch,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      currency: 'GHS',
      votingMethod: 'single',
      allowInternational: false,
    },
  })

  const onSubmit = async (data: EventFormData) => {
    setLoading(true)
    setError('')

    try {
      const response = await eventsApi.create({
        name: data.name,
        description: data.description,
        votePrice: data.pricePerVote,
        startDate: data.startDate,
        endDate: data.endDate,
      })

      const eventId = response.data.event.id
      router.push(`/organizer/events/${eventId}/details`)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create event. Please try again.')
      setLoading(false)
    }
  }

  const onInvalid = () => {
    setError('Please check the highlighted fields before creating the event.')
  }

  const steps: { id: WizardStep; label: string; description: string }[] = [
    { id: 'basic', label: 'Basic Info', description: 'Event name and description' },
    { id: 'details', label: 'Event Details', description: 'Dates and categories' },
    { id: 'settings', label: 'Settings', description: 'Voting and payment options' },
    { id: 'review', label: 'Review', description: 'Confirm and create' },
  ]

  const goNext = async () => {
    // Validate only the current step's fields before advancing
    const fieldsToValidate = stepFields[currentStep]
    const isValid = fieldsToValidate.length === 0 || (await trigger(fieldsToValidate))

    if (!isValid) return

    const stepIndex = steps.findIndex((s) => s.id === currentStep)
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id)
      setError('')
    }
  }

  const goPrev = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep)
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id)
      setError('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* Progress */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={`flex flex-col items-center cursor-pointer transition ${
                  currentStep === step.id ? 'opacity-100' : 'opacity-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition ${
                  currentStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm font-medium">{step.label}</span>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 h-0.5 bg-muted" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <Card className="p-8 mb-8">

          {/* Step 1: Basic Info */}
          {currentStep === 'basic' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Event Name *</label>
                <Input
                  {...register('name')}
                  placeholder="e.g., Westside Awards 2026"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  {...register('description')}
                  placeholder="Describe your event and what it celebrates..."
                  className="w-full px-3 py-2 border border-input rounded-md min-h-24 bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={loading}
                />
                {errors.description && (
                  <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Event Details */}
          {currentStep === 'details' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Event Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date *</label>
                  <Input
                    {...register('startDate')}
                    type="date"
                    disabled={loading}
                  />
                  {errors.startDate && (
                    <p className="text-xs text-destructive mt-1">{errors.startDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date *</label>
                  <Input
                    {...register('endDate')}
                    type="date"
                    disabled={loading}
                  />
                  {errors.endDate && (
                    <p className="text-xs text-destructive mt-1">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Categories and nominees will be added after event creation on the event details page.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Settings */}
          {currentStep === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Event Settings</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price Per Vote *</label>
                  <Input
                    {...register('pricePerVote', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="1.00"
                    disabled={loading}
                  />
                  {errors.pricePerVote && (
                    <p className="text-xs text-destructive mt-1">{errors.pricePerVote.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Currency *</label>
                  <select
                    {...register('currency')}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    disabled={loading}
                  >
                    <option value="GHS">GHS — Ghanaian Cedi</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="NGN">NGN — Nigerian Naira</option>
                    <option value="KES">KES — Kenyan Shilling</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Voting Method *</label>
                <select
                  {...register('votingMethod')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  disabled={loading}
                >
                  <option value="single">Single Choice — one nominee per category</option>
                  <option value="multiple">Multiple Choice — vote for many nominees</option>
                  <option value="weighted">Weighted — buy as many votes as you want</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  {...register('allowInternational')}
                  type="checkbox"
                  disabled={loading}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm">Allow international voters</span>
              </label>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Review Event</h2>

              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Event Name</p>
                  <p className="font-medium">{watch('name') || '—'}</p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground">{watch('description') || '—'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                    <p className="font-medium">{watch('startDate') || '—'}</p>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">End Date</p>
                    <p className="font-medium">{watch('endDate') || '—'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Price Per Vote</p>
                    <p className="font-medium">
                      {watch('currency')} {watch('pricePerVote') || '—'}
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Voting Method</p>
                    <Badge variant="secondary" className="w-fit capitalize">
                      {watch('votingMethod') || '—'}
                    </Badge>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">International</p>
                    <Badge variant={watch('allowInternational') ? 'default' : 'outline'}>
                      {watch('allowInternational') ? 'Allowed' : 'Not allowed'}
                    </Badge>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  After creating the event you'll be taken to the details page to add categories and nominees.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={goPrev}
            disabled={currentStep === 'basic' || loading}
          >
            Previous
          </Button>

          {currentStep === 'review' ? (
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          ) : (
            <Button type="button" onClick={goNext} disabled={loading} className="gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}