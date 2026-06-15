'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save } from 'lucide-react'

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    platformName: 'Awards Voting Platform',
    supportEmail: 'support@awards.com',
    platformFee: '5',
    minVotePrice: '1',
    maxVotePrice: '100',
    paystackPublicKey: '',
    paystackSecretKey: '',
    maintenanceMode: false,
    allowNewSignups: true,
    requireNomineeApproval: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    // TODO: call adminApi.saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Settings</h1>
          <p className="text-muted-foreground mt-1">Configure global platform behaviour</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      <div className="space-y-6">

        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic platform information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Platform Name
              </label>
              <Input
                name="platformName"
                value={settings.platformName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Support Email
              </label>
              <Input
                name="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Voting & Fees */}
        <Card>
          <CardHeader>
            <CardTitle>Voting & Fees</CardTitle>
            <CardDescription>Configure vote pricing and platform commission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Platform Fee (%)
              </label>
              <Input
                name="platformFee"
                type="number"
                min="0"
                max="100"
                value={settings.platformFee}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Percentage cut taken from each transaction
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Min Vote Price (₵)
                </label>
                <Input
                  name="minVotePrice"
                  type="number"
                  min="0"
                  value={settings.minVotePrice}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Max Vote Price (₵)
                </label>
                <Input
                  name="maxVotePrice"
                  type="number"
                  min="0"
                  value={settings.maxVotePrice}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paystack */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Gateway</CardTitle>
            <CardDescription>Paystack API credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Paystack Public Key
              </label>
              <Input
                name="paystackPublicKey"
                value={settings.paystackPublicKey}
                onChange={handleChange}
                placeholder="pk_live_xxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Paystack Secret Key
              </label>
              <Input
                name="paystackSecretKey"
                type="password"
                value={settings.paystackSecretKey}
                onChange={handleChange}
                placeholder="sk_live_xxxxxxxxxxxxxxxxxx"
              />
            </div>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card>
          <CardHeader>
            <CardTitle>Access Control</CardTitle>
            <CardDescription>Control platform availability and moderation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Disable public access to the platform</p>
              </div>
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                className="w-4 h-4 accent-primary"
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Allow New Signups</p>
                <p className="text-xs text-muted-foreground">Let new organizers and voters register</p>
              </div>
              <input
                type="checkbox"
                name="allowNewSignups"
                checked={settings.allowNewSignups}
                onChange={handleChange}
                className="w-4 h-4 accent-primary"
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Require Nominee Approval</p>
                <p className="text-xs text-muted-foreground">Nominees must be approved by admin before going live</p>
              </div>
              <input
                type="checkbox"
                name="requireNomineeApproval"
                checked={settings.requireNomineeApproval}
                onChange={handleChange}
                className="w-4 h-4 accent-primary"
              />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}