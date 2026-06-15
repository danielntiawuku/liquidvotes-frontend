'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">Get in touch with our support team</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 flex gap-4">
                <Mail className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email</h3>
                  <p className="text-muted-foreground">support@awards.com</p>
                  <p className="text-sm text-muted-foreground">Response time: 2 hours</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex gap-4">
                <Phone className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                  <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  <p className="text-sm text-muted-foreground">Mon-Fri, 9am-6pm EST</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex gap-4">
                <MapPin className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Office</h3>
                  <p className="text-muted-foreground">123 Tech Street</p>
                  <p className="text-muted-foreground">San Francisco, CA 94105</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex gap-4">
                <Clock className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Live Chat</h3>
                  <p className="text-muted-foreground">Available 24/7</p>
                  <Button asChild variant="link" className="p-0 mt-1 h-auto">
                    <Link href="#">Start chat</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardContent className="p-8">
              <form className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground">Name</label>
                  <input 
                    type="text"
                    className="w-full mt-2 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground">Email</label>
                  <input 
                    type="email"
                    className="w-full mt-2 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground">Subject</label>
                  <input 
                    type="text"
                    className="w-full mt-2 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground">Message</label>
                  <textarea 
                    className="w-full mt-2 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary h-32 resize-none"
                    placeholder="Tell us more..."
                  ></textarea>
                </div>
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-white">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
