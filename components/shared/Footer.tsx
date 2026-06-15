'use client'

import Link from 'next/link'
import { Mail, Code2, MessageSquare } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border/30 mt-24 sm:mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Company */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-secondary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xs">AV</span>
              </div>
              <h3 className="font-bold text-foreground text-lg">Awards</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Modern platform for secure, transparent voting and recognition events with real-time analytics.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-6 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-accent transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-accent transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/awards" className="text-muted-foreground hover:text-accent transition">
                  Awards
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-6 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-accent transition">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-accent transition">
                  Support
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-accent transition">
                  Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-6 text-sm uppercase tracking-wider">Connect</h4>
            <div className="flex gap-4">
              <a href="mailto:support@awards.com" className="p-2 text-muted-foreground hover:text-accent hover:bg-muted/50 rounded-lg transition" aria-label="Email">
                <Mail size={20} />
              </a>
              <a href="#" className="p-2 text-muted-foreground hover:text-accent hover:bg-muted/50 rounded-lg transition" aria-label="GitHub">
                <Code2 size={20} />
              </a>
              <a href="#" className="p-2 text-muted-foreground hover:text-accent hover:bg-muted/50 rounded-lg transition" aria-label="Chat">
                <MessageSquare size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground gap-6">
          <p>&copy; 2024 Awards Voting Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-accent transition">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-accent transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
