'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary mb-4">Help Center</h1>
          <p className="text-lg text-muted-foreground">Everything you need to know about the Awards platform</p>
        </div>

        <div className="mb-12">
          <input 
            type="text"
            placeholder="Search for help..."
            className="w-full px-6 py-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>

        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="border-b border-border bg-transparent p-0 w-full justify-start rounded-none h-auto">
            <TabsTrigger value="getting-started" className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary">
              Getting Started
            </TabsTrigger>
            <TabsTrigger value="voting" className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary">
              Voting
            </TabsTrigger>
            <TabsTrigger value="organizers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary">
              For Organizers
            </TabsTrigger>
            <TabsTrigger value="billing" className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary">
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How do I create an account?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">To create an account, click the &quot;Sign Up&quot; button on the homepage and fill in your details. You can choose to sign up as a voter or organizer.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How do I reset my password?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Click &quot;Forgot Password&quot; on the login page and enter your email address. You&apos;ll receive a link to reset your password.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How do I vote in an event?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Log in to your account and enter the event code. You&apos;ll be able to see all categories and nominees, and cast your votes. Complete the payment to finalize your votes.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Can I change my votes after submitting?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No, votes are final once submitted. However, if you have a concern, please contact our support team.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">We accept all major credit cards, digital wallets, and bank transfers. All payments are processed securely.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How do I create an event?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Log in to your organizer account, click &quot;Create Event&quot;, and fill in your event details. Add nominees, configure settings, and publish when ready.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How do I view event analytics?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Go to your event dashboard and click &quot;Analytics&quot; to see real-time voting data, participant information, and detailed reports.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Can I edit an event after it starts?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">You can update certain event details, but core settings like nominees cannot be changed once voting has started.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What is included in each plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Visit our pricing page to see detailed information about features included in each plan.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Can I change my subscription plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time from your billing settings.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-12 bg-gradient-to-br from-secondary/5 to-primary/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">Still need help?</h3>
            <p className="text-muted-foreground mb-6">Our support team is available 24/7 to assist you</p>
            <Button asChild className="bg-secondary hover:bg-secondary/90 text-white">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
