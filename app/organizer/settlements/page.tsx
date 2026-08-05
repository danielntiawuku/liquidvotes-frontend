'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { organizerApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import {
  Wallet,
  Loader2,
  CheckCircle,
  Clock,
  CreditCard,
  Phone,
  Building2,
  AlertCircle,
  ArrowDownToLine,
} from 'lucide-react'

interface PayoutAccount {
  payoutMethod: string | null
  mobileMoneyNumber: string | null
  mobileMoneyProvider: string | null
  bankAccountName: string | null
  bankAccountNumber: string | null
  bankCode: string | null
  bankName: string | null
}

interface Withdrawal {
  id: string
  amount: string
  currency: string
  status: string
  payoutMethod: string
  accountDetails: string
  note: string | null
  createdAt: string
}

interface Settlements {
  totalEarned: number
  totalWithdrawn: number
  pendingWithdrawals: number
  availableBalance: number
  currency: string
  payoutAccount: PayoutAccount
  withdrawals: Withdrawal[]
}

const statusColor = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
} as const

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<Settlements | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Payout account form
  const [method, setMethod] = useState<'mobile_money' | 'bank'>('mobile_money')
  const [mobileProvider, setMobileProvider] = useState<'MTN' | 'Vodafone' | 'AirtelTigo'>('MTN')
  const [mobileNumber, setMobileNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [savingAccount, setSavingAccount] = useState(false)
  const [savedAccount, setSavedAccount] = useState(false)
  const [accountError, setAccountError] = useState('')

  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawError, setWithdrawError] = useState('')
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)

  // Show/hide account form
  const [showAccountForm, setShowAccountForm] = useState(false)

  // Warm up the backend so the settlement data request finds a warm server.
  useWarmUp()

  const fetchSettlements = async () => {
    try {
      const response = await organizerApi.getSettlements()
      const data = response.data.settlements
      setSettlements(data)

      // Pre-fill form if account already exists
      if (data.payoutAccount?.payoutMethod) {
        setMethod(data.payoutAccount.payoutMethod as 'mobile_money' | 'bank')
        setMobileProvider(data.payoutAccount.mobileMoneyProvider ?? 'MTN')
        setMobileNumber(data.payoutAccount.mobileMoneyNumber ?? '')
        setBankName(data.payoutAccount.bankName ?? '')
        setBankAccountName(data.payoutAccount.bankAccountName ?? '')
        setBankAccountNumber(data.payoutAccount.bankAccountNumber ?? '')
      }
    } catch {
      setError('Failed to load settlement data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettlements()
  }, [])

  const handleSaveAccount = async () => {
    setAccountError('')
    setSavingAccount(true)
    try {
      await organizerApi.savePayoutAccount({
        payoutMethod: method,
        ...(method === 'mobile_money'
          ? { mobileMoneyNumber: mobileNumber, mobileMoneyProvider: mobileProvider }
          : { bankName, bankAccountName, bankAccountNumber }),
      })
      setSavedAccount(true)
      setShowAccountForm(false)
      setTimeout(() => setSavedAccount(false), 3000)
      await fetchSettlements()
    } catch (err: any) {
      setAccountError(err?.response?.data?.message || 'Failed to save account.')
    } finally {
      setSavingAccount(false)
    }
  }

  const handleWithdraw = async () => {
    setWithdrawError('')
    const amount = Number(withdrawAmount)
    if (!amount || amount <= 0) {
      setWithdrawError('Please enter a valid amount.')
      return
    }
    setWithdrawing(true)
    try {
      await organizerApi.requestWithdrawal(amount)
      setWithdrawSuccess(true)
      setWithdrawAmount('')
      setTimeout(() => setWithdrawSuccess(false), 4000)
      await fetchSettlements()
    } catch (err: any) {
      setWithdrawError(err?.response?.data?.message || 'Withdrawal request failed.')
    } finally {
      setWithdrawing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const hasPayoutAccount = !!settlements?.payoutAccount?.payoutMethod

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Settlements</h1>
        <p className="text-muted-foreground mt-1">
          Track your earnings and request payouts
        </p>
      </div>

      {/* Earnings summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {[
          {
            label: 'Total Earned',
            value: `GHS ${(settlements?.totalEarned ?? 0).toFixed(2)}`,
            icon: Wallet,
            gradient: 'from-emerald-500 to-teal-400',
          },
          {
            label: 'Available Balance',
            value: `GHS ${(settlements?.availableBalance ?? 0).toFixed(2)}`,
            icon: ArrowDownToLine,
            gradient: 'from-primary to-primary/60',
          },
          {
            label: 'Pending Withdrawal',
            value: `GHS ${(settlements?.pendingWithdrawals ?? 0).toFixed(2)}`,
            icon: Clock,
            gradient: 'from-amber-400 to-yellow-300',
          },
          {
            label: 'Total Withdrawn',
            value: `GHS ${(settlements?.totalWithdrawn ?? 0).toFixed(2)}`,
            icon: CheckCircle,
            gradient: 'from-secondary to-secondary/60',
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/60 hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-5">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-sm`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold text-foreground mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">

        {/* Payout account */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-base">Settlement Account</CardTitle>
                <CardDescription>
                  {hasPayoutAccount
                    ? 'Your payout account is linked'
                    : 'Link an account to request payouts'}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg gap-2"
                onClick={() => setShowAccountForm(!showAccountForm)}
              >
                {hasPayoutAccount ? 'Update Account' : 'Link Account'}
              </Button>
            </div>
          </CardHeader>

          {/* Current account preview */}
          {hasPayoutAccount && !showAccountForm && (
            <CardContent>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/60">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center flex-shrink-0">
                  {settlements?.payoutAccount?.payoutMethod === 'mobile_money' ? (
                    <Phone className="w-4 h-4 text-primary" />
                  ) : (
                    <Building2 className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  {settlements?.payoutAccount?.payoutMethod === 'mobile_money' ? (
                    <>
                      <p className="text-sm font-medium text-foreground">
                        {settlements.payoutAccount.mobileMoneyProvider} Mobile Money
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {settlements.payoutAccount.mobileMoneyNumber}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground">
                        {settlements?.payoutAccount?.bankName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {settlements?.payoutAccount?.bankAccountName} ·{' '}
                        {settlements?.payoutAccount?.bankAccountNumber}
                      </p>
                    </>
                  )}
                </div>
                <Badge variant="default" className="ml-auto">Linked</Badge>
              </div>
            </CardContent>
          )}

          {/* Account form */}
          {(showAccountForm || !hasPayoutAccount) && (
            <CardContent className="space-y-4">

              {/* Method toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMethod('mobile_money')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                    method === 'mobile_money'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  Mobile Money
                </button>
                <button
                  onClick={() => setMethod('bank')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                    method === 'bank'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Bank Account
                </button>
              </div>

              {/* Mobile money fields */}
              {method === 'mobile_money' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Provider
                    </label>
                    <div className="flex gap-2">
                      {(['MTN', 'Vodafone', 'AirtelTigo'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setMobileProvider(p)}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                            mobileProvider === p
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border text-muted-foreground hover:border-primary/30'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Mobile Money Number
                    </label>
                    <Input
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. 0244000000"
                      className="rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Bank fields */}
              {method === 'bank' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Bank Name
                    </label>
                    <Input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. GCB Bank, Ecobank"
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Account Name
                    </label>
                    <Input
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="Name on bank account"
                      className="rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Account Number
                    </label>
                    <Input
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="Account number"
                      className="rounded-lg"
                    />
                  </div>
                </div>
              )}

              {accountError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive">
                  {accountError}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveAccount}
                  disabled={savingAccount}
                  className="gap-2 shadow-md"
                  style={{ backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                >
                  {savingAccount ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : savedAccount ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  {savedAccount ? 'Saved!' : 'Save Account'}
                </Button>
                {hasPayoutAccount && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAccountForm(false)}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Withdrawal request */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Request Payout</CardTitle>
            <CardDescription>
              Withdrawals are processed within 1–2 business days
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {!hasPayoutAccount ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Link a payout account above before requesting a withdrawal.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Amount (GHS)
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                        GHS
                      </span>
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        value={withdrawAmount}
                        onChange={(e) => {
                          setWithdrawAmount(e.target.value)
                          setWithdrawError('')
                        }}
                        placeholder="0.00"
                        className="pl-12 rounded-lg"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg whitespace-nowrap"
                      onClick={() =>
                        setWithdrawAmount(
                          (settlements?.availableBalance ?? 0).toFixed(2)
                        )
                      }
                    >
                      Max
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Available: GHS {(settlements?.availableBalance ?? 0).toFixed(2)}
                  </p>
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2 flex-wrap">
                  {[50, 100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setWithdrawAmount(String(amt))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        withdrawAmount === String(amt)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      GHS {amt}
                    </button>
                  ))}
                </div>

                {withdrawError && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive">
                    {withdrawError}
                  </div>
                )}

                {withdrawSuccess && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Withdrawal request submitted! We'll process it within 1–2 business days.
                  </div>
                )}

                <Button
                  onClick={handleWithdraw}
                  disabled={withdrawing || !withdrawAmount}
                  className="w-full gap-2 shadow-md"
                  style={{ backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                >
                  {withdrawing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowDownToLine className="w-4 h-4" />
                  )}
                  {withdrawing ? 'Submitting...' : 'Request Payout'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Withdrawal history */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!settlements?.withdrawals.length ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <Wallet className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No withdrawals yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Account</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.withdrawals.map((w) => (
                      <tr key={w.id} className="border-b border-border/50 hover:bg-muted/20 transition">
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {w.currency} {Number(w.amount).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <p>{w.accountDetails}</p>
                          {w.note && (
                            <p className="text-xs text-muted-foreground/70 mt-0.5 max-w-[260px] truncate">
                              {w.note}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={statusColor[w.status as keyof typeof statusColor] ?? 'secondary'}
                            className="capitalize"
                          >
                            {w.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}