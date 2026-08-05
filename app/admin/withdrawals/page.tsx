'use client'

import { useState, useEffect, Fragment } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { adminApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import {
  Search,
  Loader2,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  HandCoins,
  AlertCircle,
} from 'lucide-react'

interface Organizer {
  name: string
  email: string
  organizationName: string | null
  payoutMethod: string | null
  mobileMoneyProvider: string | null
  mobileMoneyNumber: string | null
  bankName: string | null
  bankCode: string | null
  bankAccountName: string | null
  bankAccountNumber: string | null
}

interface Withdrawal {
  id: string
  amount: string
  currency: string
  status: 'pending' | 'approved' | 'rejected'
  payoutMethod: string
  accountDetails: string
  note: string | null
  createdAt: string
  organizer: Organizer
}

interface Summary {
  totalPending: number
  pendingAmount: number
  totalApproved: number
  totalPaidOut: number
  totalRejected: number
}

const statusColor = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
} as const

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  // Manual payout / reject inline forms
  const [actionFor, setActionFor] = useState<{ id: string; kind: 'pay' | 'reject' } | null>(null)
  const [reference, setReference] = useState('')
  const [reason, setReason] = useState('')
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  // Warm up the backend so the withdrawals list request finds a warm server.
  useWarmUp()

  const fetchWithdrawals = async () => {
    try {
      const response = await adminApi.getWithdrawals()
      setWithdrawals(response.data.withdrawals)
      setSummary(response.data.summary)
    } catch {
      setError('Failed to load withdrawals.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const filtered = withdrawals.filter((w) => {
    const term = search.toLowerCase()
    const matchesSearch =
      w.organizer.name.toLowerCase().includes(term) ||
      w.organizer.email.toLowerCase().includes(term) ||
      w.accountDetails.toLowerCase().includes(term) ||
      (w.organizer.organizationName ?? '').toLowerCase().includes(term)
    const matchesFilter = filter === 'all' || w.status === filter
    return matchesSearch && matchesFilter
  })

  const handleApprove = async (w: Withdrawal) => {
    setSubmittingId(w.id)
    setActionError('')
    setActionSuccess('')
    try {
      await adminApi.approveWithdrawal(w.id)
      setActionSuccess(
        `Approved ${w.currency} ${Number(w.amount).toFixed(2)} — Paystack transfer initiated.`
      )
      await fetchWithdrawals()
    } catch (err: any) {
      // e.g. 422 "not possible" → admin should use Mark Paid; or 502 transfer failed
      setActionError(err?.response?.data?.message || 'Failed to approve withdrawal.')
    } finally {
      setSubmittingId(null)
    }
  }

  const handleMarkPaid = async (w: Withdrawal) => {
    if (!reference.trim()) {
      setActionError('Please enter the payment reference.')
      return
    }
    setSubmittingId(w.id)
    setActionError('')
    setActionSuccess('')
    try {
      await adminApi.markWithdrawalPaid(w.id, reference.trim())
      setActionSuccess(
        `Marked ${w.currency} ${Number(w.amount).toFixed(2)} as paid (ref: ${reference.trim()}).`
      )
      setActionFor(null)
      setReference('')
      await fetchWithdrawals()
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Failed to mark as paid.')
    } finally {
      setSubmittingId(null)
    }
  }

  const handleReject = async (w: Withdrawal) => {
    if (!reason.trim()) {
      setActionError('Please enter a reason for rejection.')
      return
    }
    setSubmittingId(w.id)
    setActionError('')
    setActionSuccess('')
    try {
      await adminApi.rejectWithdrawal(w.id, reason.trim())
      setActionSuccess(`Rejected ${w.currency} ${Number(w.amount).toFixed(2)}.`)
      setActionFor(null)
      setReason('')
      await fetchWithdrawals()
    } catch (err: any) {
      setActionError(err?.response?.data?.message || 'Failed to reject withdrawal.')
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Withdrawals</h1>
        <p className="text-muted-foreground mt-1">
          Process organizer payout requests — auto-transfer via Paystack or mark as paid manually
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {/* Flash messages */}
      {actionSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {actionError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending Requests</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {summary?.totalPending ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pending Amount</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              GHS {(summary?.pendingAmount ?? 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Paid Out</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              GHS {(summary?.totalPaidOut ?? 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {summary?.totalRejected ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by organizer, email, or account..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Organizer</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Payout Account</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Requested</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <Fragment key={w.id}>
                    <tr
                      className="border-b border-border/50 hover:bg-muted/30 transition"
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{w.organizer.name}</p>
                        <p className="text-xs text-muted-foreground">{w.organizer.email}</p>
                        {w.organizer.organizationName && (
                          <p className="text-xs text-muted-foreground">
                            {w.organizer.organizationName}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground max-w-[220px]">
                        <p className="truncate">{w.accountDetails}</p>
                        {w.note && (
                          <p className="text-xs text-muted-foreground/80 mt-0.5 truncate max-w-[220px]">
                            {w.note}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                        {w.currency} {Number(w.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={statusColor[w.status]}
                          className="capitalize"
                        >
                          {w.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {w.status === 'pending' && (
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="default"
                              className="gap-1.5"
                              disabled={submittingId === w.id}
                              onClick={() => handleApprove(w)}
                            >
                              {submittingId === w.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Send className="w-3.5 h-3.5" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5"
                              disabled={submittingId === w.id}
                              onClick={() => {
                                setActionFor({ id: w.id, kind: 'pay' })
                                setActionError('')
                              }}
                            >
                              <HandCoins className="w-3.5 h-3.5" />
                              Mark Paid
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1.5 text-destructive hover:text-destructive"
                              disabled={submittingId === w.id}
                              onClick={() => {
                                setActionFor({ id: w.id, kind: 'reject' })
                                setActionError('')
                              }}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Inline manual-pay form */}
                    {actionFor?.id === w.id && actionFor.kind === 'pay' && (
                      <tr className="border-b border-border/50 bg-primary/5">
                        <td colSpan={6} className="py-4 px-4">
                          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <HandCoins className="w-4 h-4" />
                              You're sending this money yourself (MoMo/bank). Enter the payment
                              reference:
                            </div>
                            <Input
                              value={reference}
                              onChange={(e) => setReference(e.target.value)}
                              placeholder="e.g. MoMo ref 0274… / bank slip no."
                              className="max-w-xs rounded-lg"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleMarkPaid(w)}
                                disabled={submittingId === w.id}
                                className="gap-1.5"
                              >
                                {submittingId === w.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                )}
                                Confirm Paid
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setActionFor(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Inline reject form */}
                    {actionFor?.id === w.id && actionFor.kind === 'reject' && (
                      <tr className="border-b border-border/50 bg-destructive/5">
                        <td colSpan={6} className="py-4 px-4">
                          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <XCircle className="w-4 h-4 text-destructive" />
                              Reason for rejection:
                            </div>
                            <Input
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              placeholder="e.g. invalid account number, contact organizer"
                              className="max-w-xs rounded-lg"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(w)}
                                disabled={submittingId === w.id}
                                className="gap-1.5"
                              >
                                {submittingId === w.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5" />
                                )}
                                Confirm Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setActionFor(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground">
                      <Wallet className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                      No withdrawals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/60 mt-6">
        <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">How payouts work</p>
          <p>
            <span className="font-medium">Approve</span> tries an automatic Paystack transfer from
            your GHS balance to the organizer's mobile money. If that's not possible (e.g. bank
            payouts without a Paystack bank code, or insufficient balance), the request stays
            pending — send the money yourself and use <span className="font-medium">Mark Paid</span>.
            All actions are recorded in the audit log.
          </p>
        </div>
      </div>
    </div>
  )
}
