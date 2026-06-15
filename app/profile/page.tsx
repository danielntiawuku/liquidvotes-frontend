'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Lock, Bell, LogOut } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-12">Account Settings</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-4 space-y-2">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-secondary/10 text-secondary font-semibold">
                  Profile
                </button>
                <Link href="#" className="block w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
                  Security
                </Link>
                <Link href="#" className="block w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
                  Notifications
                </Link>
                <Link href="#" className="block w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
                  Billing
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-border">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold text-2xl">
                    JD
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">John Doe</h3>
                    <p className="text-sm text-muted-foreground">Voter Account</p>
                    <Badge className="mt-2 bg-accent text-white">Verified</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Email Address</label>
                    <input 
                      type="email" 
                      value="john.doe@example.com" 
                      className="w-full mt-2 px-4 py-2 rounded-lg border border-border bg-muted text-foreground"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Full Name</label>
                    <input 
                      type="text" 
                      value="John Doe" 
                      className="w-full mt-2 px-4 py-2 rounded-lg border border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground">Phone Number</label>
                    <input 
                      type="tel" 
                      value="+1 (555) 123-4567" 
                      className="w-full mt-2 px-4 py-2 rounded-lg border border-border text-foreground"
                    />
                  </div>
                </div>

                <Button className="bg-secondary hover:bg-secondary/90 text-white">Save Changes</Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted transition">
                  <Lock className="w-5 h-5 text-secondary" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Change Password</p>
                    <p className="text-xs text-muted-foreground">Update your security</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted transition">
                  <Bell className="w-5 h-5 text-secondary" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Notification Settings</p>
                    <p className="text-xs text-muted-foreground">Manage alerts and updates</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted transition">
                  <Mail className="w-5 h-5 text-secondary" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Email Preferences</p>
                    <p className="text-xs text-muted-foreground">Choose what you receive</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted transition text-destructive">
                  <LogOut className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Logout</p>
                    <p className="text-xs text-muted-foreground">Sign out of your account</p>
                  </div>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
