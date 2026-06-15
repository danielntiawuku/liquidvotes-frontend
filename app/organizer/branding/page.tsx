'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function OrganizerBrandingPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-primary mb-2">Event Branding</h1>
          <p className="text-muted-foreground">Customize the look and feel of your events</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo & Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-foreground">Event Logo</label>
                <div className="mt-2 p-8 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <p className="text-muted-foreground">Drag and drop logo here or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-2">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-foreground">Primary Color</label>
                  <div className="mt-2 flex gap-2 items-center">
                    <div className="w-16 h-16 rounded-lg bg-secondary border-2 border-border cursor-pointer"></div>
                    <input 
                      type="text"
                      value="#4648d4"
                      className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground">Accent Color</label>
                  <div className="mt-2 flex gap-2 items-center">
                    <div className="w-16 h-16 rounded-lg bg-accent border-2 border-border cursor-pointer"></div>
                    <input 
                      type="text"
                      value="#10b981"
                      className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground">Email Banner</label>
                <div className="mt-2 p-8 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground">Upload email banner (recommended: 600x200px)</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground">Email Footer Text</label>
                <textarea 
                  className="w-full mt-2 px-4 py-2 rounded-lg border border-border text-foreground h-20 resize-none"
                  placeholder="Add custom footer text for emails..."
                ></textarea>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voting Page Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground">Page Title</label>
                <input 
                  type="text"
                  value="Cast Your Vote"
                  className="w-full mt-2 px-4 py-2 rounded-lg border border-border text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground">Welcome Message</label>
                <textarea 
                  className="w-full mt-2 px-4 py-2 rounded-lg border border-border text-foreground h-24 resize-none"
                  defaultValue="Thank you for participating in our voting event. Please carefully review each nominee and cast your votes."
                ></textarea>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button className="flex-1 bg-secondary hover:bg-secondary/90 text-white">Save Changes</Button>
            <Button variant="outline" className="flex-1 border-primary text-primary">Preview Event</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
