'use client'

import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-primary mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application settings</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-4 space-y-2">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-secondary/10 text-secondary font-semibold">
                  Account
                </button>
                <Link href="#" className="block w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
                  Organization
                </Link>
                <Link href="#" className="block w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
                  Billing
                </Link>
                <Link href="#" className="block w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
                  API Keys
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-foreground">Email Address</label>
                  <input 
                    type="email"
                    value="organizer@awards.com"
                    className="w-full mt-2 px-4 py-2 rounded-lg border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground">Full Name</label>
                  <input 
                    type="text"
                    value="Event Organizer"
                    className="w-full mt-2 px-4 py-2 rounded-lg border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground">Time Zone</label>
                  <select className="w-full mt-2 px-4 py-2 rounded-lg border border-border text-foreground">
                    <option>Eastern Time (ET)</option>
                    <option>Central Time (CT)</option>
                    <option>Mountain Time (MT)</option>
                    <option>Pacific Time (PT)</option>
                  </select>
                </div>
                <Button className="bg-secondary hover:bg-secondary/90 text-white">Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">Status: Disabled</p>
                    <p className="text-sm text-muted-foreground">Enhance your account security</p>
                  </div>
                  <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/5">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-destructive/20 rounded-lg">
                  <p className="font-semibold text-foreground mb-2">Delete Account</p>
                  <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data</p>
                  <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/5">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
