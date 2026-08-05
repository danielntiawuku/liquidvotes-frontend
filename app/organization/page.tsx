'use client'

import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit2 } from 'lucide-react'

export default function OrganizationPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-primary mb-2">Organization Settings</h1>
          <p className="text-muted-foreground">Manage your organization profile and preferences</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-4 space-y-2">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-secondary/10 text-secondary font-semibold">
                  Profile
                </button>
                <Link href="#" className="block w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
                  Branding
                </Link>
                <Link href="#" className="block w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted">
                  Members
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-border">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold text-2xl">
                    TC
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Tech Corp</h3>
                    <p className="text-sm text-muted-foreground">Organization ID: ORG-12345</p>
                    <Badge className="mt-2 bg-accent text-white">Verified</Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground">Organization Name</label>
                  <input 
                    type="text"
                    value="Tech Corp"
                    className="w-full mt-2 px-4 py-2 rounded-lg border border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground">Organization Email</label>
                  <input 
                    type="email"
                    value="contact@techcorp.com"
                    className="w-full mt-2 px-4 py-2 rounded-lg border border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground">Industry</label>
                  <select className="w-full mt-2 px-4 py-2 rounded-lg border border-border text-foreground">
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                    <option>Education</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground">Description</label>
                  <textarea 
                    className="w-full mt-2 px-4 py-2 rounded-lg border border-border text-foreground h-24 resize-none"
                    defaultValue="Leading technology solutions company"
                  ></textarea>
                </div>

                <Button className="bg-secondary hover:bg-secondary/90 text-white">Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-3xl font-bold text-secondary mt-2">12</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Votes</p>
                  <p className="text-3xl font-bold text-secondary mt-2">15,847</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-3xl font-bold text-secondary mt-2">8</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-3xl font-bold text-secondary mt-2">$47,541</p>
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
