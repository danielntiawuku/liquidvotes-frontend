'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Mail, Clock } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-primary mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">Manage how you receive updates and alerts</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Event Updates', desc: 'Receive updates about your events', enabled: true },
                { name: 'Voting Activity', desc: 'Get notified when new votes come in', enabled: true },
                { name: 'Weekly Digest', desc: 'Summary of your account activity', enabled: false },
                { name: 'Marketing Emails', desc: 'News about new features and promotions', enabled: false }
              ].map((notif) => (
                <div key={notif.name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">{notif.name}</p>
                    <p className="text-sm text-muted-foreground">{notif.desc}</p>
                  </div>
                  <input 
                    type="checkbox"
                    defaultChecked={notif.enabled}
                    className="w-5 h-5 rounded accent-secondary"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In-App Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Critical Alerts', desc: 'System errors and security alerts', enabled: true },
                { name: 'Payment Reminders', desc: 'Billing and subscription notifications', enabled: true },
                { name: 'Event Reminders', desc: 'Reminders about upcoming events', enabled: true }
              ].map((notif) => (
                <div key={notif.name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">{notif.name}</p>
                    <p className="text-sm text-muted-foreground">{notif.desc}</p>
                  </div>
                  <input 
                    type="checkbox"
                    defaultChecked={notif.enabled}
                    className="w-5 h-5 rounded accent-secondary"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Frequency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground">Email Digest</label>
                <select className="w-full mt-2 px-4 py-2 rounded-lg border border-border text-foreground">
                  <option>Instant</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Never</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Quiet Hours</label>
                <div className="flex gap-2 mt-2">
                  <input 
                    type="time"
                    className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground"
                    defaultValue="22:00"
                  />
                  <span className="flex items-center text-muted-foreground">to</span>
                  <input 
                    type="time"
                    className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground"
                    defaultValue="08:00"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">You won&apos;t receive notifications during these hours</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: 'Event Update', message: 'Annual Awards 2024 has 150 new votes', time: '2 hours ago' },
                { type: 'Payment', message: 'Your Professional plan has been renewed', time: '1 day ago' },
                { type: 'System', message: 'Security update available for your account', time: '3 days ago' }
              ].map((notif, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <Bell className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{notif.type}</p>
                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Button className="bg-secondary hover:bg-secondary/90 text-white w-full">Save Preferences</Button>
        </div>
      </div>
    </div>
  )
}
