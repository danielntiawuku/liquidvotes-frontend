import { z } from 'zod'

export const eventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  pricePerVote: z.number().positive('Price must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  votingMethod: z.enum(['single', 'multiple', 'weighted']),
  allowInternational: z.boolean(),
  nominationStartDate: z.string().optional(),
  nominationEndDate: z.string().optional(),
})

export type EventFormData = z.infer<typeof eventSchema>

export const nomineeSchema = z.object({
  name: z.string().min(2, 'Name required'),
  category: z.string().min(1, 'Category required'),
  description: z.string().optional(),
})

export const voteSchema = z.object({
  nomineeId: z.string(),
  quantity: z.number().min(1),
})

export const paymentSchema = z.object({
  method: z.enum(['card', 'mobile', 'bank']),
  amount: z.number().min(0),
})