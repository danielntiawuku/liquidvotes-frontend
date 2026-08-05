'use client'

import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function FAQPage() {
  const faqs = [
    {
      q: 'How do I create a voting event?',
      a: 'Log in to your organizer account, click "Create Event", fill in the event details, add nominees, and configure your settings. Your event will be live once published.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit cards, digital wallets, and bank transfers. All payments are processed securely through industry-standard encryption.'
    },
    {
      q: 'Can I modify votes after submitting?',
      a: 'No, votes are final once submitted. However, you can contact our support team to discuss your situation.'
    },
    {
      q: 'How are results determined?',
      a: 'Results are calculated in real-time based on the total votes received. Our platform ensures transparent and accurate vote counting with audit trails.'
    },
    {
      q: 'Is there a limit to the number of nominees?',
      a: 'No, you can add unlimited nominees to your event. However, we recommend keeping the number manageable for a better voter experience.'
    },
    {
      q: 'How do I download the results?',
      a: 'Once voting is complete, you can download a comprehensive CSV or PDF report from your event dashboard.'
    }
  ]

  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">Find answers to common questions about our voting platform</p>
        </div>

        <div className="space-y-6 mb-12">
          {faqs.map((faq, idx) => (
            <Card key={idx} className="hover:shadow-lg transition">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-secondary/5 to-primary/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">Didn&apos;t find your answer?</h3>
            <p className="text-muted-foreground mb-6">Contact our support team and we&apos;ll help you right away</p>
            <Button asChild className="bg-secondary hover:bg-secondary/90 text-white">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
