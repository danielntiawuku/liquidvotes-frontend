'use client'

import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, CreditCard } from 'lucide-react'

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-12">Billing & Subscription</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-2xl font-bold text-secondary mt-2">Professional</p>
              <p className="text-sm text-muted-foreground mt-2">$299/month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Billing Cycle</p>
              <p className="text-2xl font-bold text-secondary mt-2">Monthly</p>
              <p className="text-sm text-muted-foreground mt-2">Renews on Feb 15</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-2xl font-bold text-accent mt-2">Active</p>
              <Badge className="mt-2 bg-accent text-white">Verified</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Button asChild className="h-12 border-2 border-primary text-primary hover:bg-primary/5 text-base">
            <Link href="#">Upgrade Plan</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 border-primary text-primary hover:bg-primary/5 text-base">
            <Link href="#">Change Billing Cycle</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 text-destructive border-destructive hover:bg-destructive/5 text-base">
            <Link href="#">Cancel Subscription</Link>
          </Button>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Payment Method</CardTitle>
              <Button asChild variant="outline" className="border-primary text-primary">
                <Link href="#">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-muted rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-2">Visa</p>
              <p className="font-bold text-foreground">•••• •••• •••• 4242</p>
              <p className="text-sm text-muted-foreground mt-2">Expires 12/26</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: 'Feb 15, 2024', desc: 'Professional Plan', amount: '$299.00', status: 'paid' },
                  { date: 'Jan 15, 2024', desc: 'Professional Plan', amount: '$299.00', status: 'paid' },
                  { date: 'Dec 15, 2023', desc: 'Professional Plan', amount: '$299.00', status: 'paid' }
                ].map((invoice) => (
                  <tr key={invoice.date} className="border-b border-border hover:bg-muted">
                    <td className="px-6 py-4 text-foreground">{invoice.date}</td>
                    <td className="px-6 py-4 text-foreground">{invoice.desc}</td>
                    <td className="px-6 py-4 font-semibold text-secondary">{invoice.amount}</td>
                    <td className="px-6 py-4">
                      <Badge className="bg-accent text-white">{invoice.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-secondary hover:text-secondary/80 flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span className="text-sm">PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
