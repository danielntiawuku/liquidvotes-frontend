'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { authApi, organizerApi } from '@/lib/api'
import { useWarmUp } from '@/lib/hooks'
import { Save, Building2, Mail, Phone, Globe, MapPin, Camera, Loader2, CheckCircle } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  organizationName: string | null
  organizationType: string | null
  bio: string | null
  website: string | null
  location: string | null
  phone: string | null
  createdAt: string
}

export default function OrganizerProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [profile, setProfile] = useState({
    organizationName: '',
    name: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    bio: '',
    organizationType: '',
  })
  const [editingEmail, setEditingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSaved, setEmailSaved] = useState(false)

  // Warm up the backend so the profile request finds a warm server.
  useWarmUp()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authApi.me()
        const u = response.data.user
        setUser(u)
        setProfile({
          organizationName: u.organizationName ?? '',
          name: u.name ?? '',
          email: u.email ?? '',
          phone: u.phone ?? '',
          website: u.website ?? '',
          location: u.location ?? '',
          bio: u.bio ?? '',
          organizationType: u.organizationType ?? '',
        })
      } catch {
        setError('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const response = await organizerApi.updateProfile({
        name: profile.name,
        organizationName: profile.organizationName,
        organizationType: profile.organizationType,
        bio: profile.bio,
        website: profile.website,
        location: profile.location,
        phone: profile.phone,
      })
      setUser(response.data.user)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save profile.')
    } finally {
      setSaving(false)
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
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organization Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization details and public presence
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">

        {/* Avatar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-md">
                  {(profile.organizationName || profile.name).charAt(0).toUpperCase()}
                </div>
                <button className="absolute -bottom-2 -right-2 w-7 h-7 bg-background border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition">
                  <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">
                  {profile.organizationName || profile.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {profile.organizationType && (
                    <Badge variant="secondary">{profile.organizationType}</Badge>
                  )}
                  <Badge variant="default">Active</Badge>
                </div>
                {user?.createdAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since {new Date(user.createdAt).toLocaleDateString('en-GB', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-4 h-4" />
              Organization Details
            </CardTitle>
            <CardDescription>
              This information is shown publicly on your events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Organization Name
              </label>
              <Input
                name="organizationName"
                value={profile.organizationName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Organization Type
              </label>
              <Input
                name="organizationType"
                value={profile.organizationType}
                onChange={handleChange}
                placeholder="e.g. Non-Profit, Corporate, Educational"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Bio / Description
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="Tell voters about your organization..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="w-4 h-4" />
              Contact Information
            </CardTitle>
            <CardDescription>
              How voters and the platform can reach you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Contact Person
              </label>
              <Input
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              {editingEmail ? (
                <div className="space-y-3">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="New email address"
                  />
                  <Input
                    type="password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    placeholder="Confirm your password"
                  />
                  {emailError && (
                    <p className="text-xs text-destructive">{emailError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        setEmailSaving(true)
                        setEmailError('')
                        try {
                          const res = await authApi.updateEmail({
                            email: newEmail,
                            password: emailPassword,
                          })
                          const newUser = res.data.user
                          setUser(newUser)
                          setProfile((prev) => ({ ...prev, email: newUser.email }))
                          // Update stored token if a new one was returned
                          if (res.data.token) {
                            localStorage.setItem('token', res.data.token)
                          }
                          setEditingEmail(false)
                          setEmailSaved(true)
                          setTimeout(() => setEmailSaved(false), 3000)
                        } catch (err: any) {
                          setEmailError(err?.response?.data?.message || 'Failed to update email.')
                        } finally {
                          setEmailSaving(false)
                        }
                      }}
                      disabled={emailSaving || !newEmail || !emailPassword}
                    >
                      {emailSaving ? 'Saving...' : 'Confirm Change'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingEmail(false)
                        setNewEmail('')
                        setEmailPassword('')
                        setEmailError('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    value={profile.email}
                    disabled
                    className="opacity-60"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingEmail(true)
                      setNewEmail(profile.email)
                    }}
                  >
                    Change
                  </Button>
                  {emailSaved && (
                    <span className="text-xs text-green-600">✓ Updated</span>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Phone
              </label>
              <Input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="+233 XX XXX XXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Website
              </label>
              <Input
                name="website"
                value={profile.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Location
              </label>
              <Input
                name="location"
                value={profile.location}
                onChange={handleChange}
                placeholder="City, Country"
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Deactivate Account</p>
                <p className="text-xs text-muted-foreground">
                  Temporarily disable your account and all active events
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                Deactivate
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/30">
              <div>
                <p className="text-sm font-medium text-destructive">Delete Account</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}