'use client'

import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, Smartphone, Shield } from 'lucide-react'

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-primary mb-2">Security Settings</h1>
          <p className="text-muted-foreground">Manage your account security and access</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <Lock className="w-6 h-6 text-secondary" />
                  <div>
                    <p className="font-semibold text-foreground">Password Management</p>
                    <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                  </div>
                </div>
                <Button className="bg-secondary hover:bg-secondary/90 text-white">Change Password</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <Smartphone className="w-6 h-6 text-secondary" />
                  <div>
                    <p className="font-semibold text-foreground">Status: Disabled</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                </div>
                <Button className="bg-secondary hover:bg-secondary/90 text-white">Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { device: 'Chrome on Windows', location: 'San Francisco, CA', lastActive: 'Now', current: true },
                { device: 'Safari on iPhone', location: 'San Francisco, CA', lastActive: '2 hours ago', current: false },
                { device: 'Chrome on Mac', location: 'New York, NY', lastActive: '3 days ago', current: false }
              ].map((session, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">{session.device}</p>
                    <p className="text-sm text-muted-foreground">{session.location} • Last active: {session.lastActive}</p>
                    {session.current && <Badge className="mt-2 bg-accent text-white">Current Session</Badge>}
                  </div>
                  {!session.current && (
                    <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/5">
                      Logout
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Applications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { app: 'API Integration', permission: 'Read/Write', connected: '6 months ago' },
                { app: 'Mobile App', permission: 'Read Only', connected: '2 months ago' }
              ].map((app, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">{app.app}</p>
                    <p className="text-sm text-muted-foreground">Permissions: {app.permission} • Connected: {app.connected}</p>
                  </div>
                  <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/5">
                    Disconnect
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">Permanently delete your account and all associated data. This action cannot be undone.</p>
              <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/5">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
