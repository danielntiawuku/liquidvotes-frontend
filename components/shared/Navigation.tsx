'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  return (
    <nav className="bg-card border-b border-border/30 sticky top-0 z-50 backdrop-blur-lg bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-bold text-lg text-primary hover:text-primary/80 transition">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">AV</span>
            </div>
            <span>Awards</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/pricing" className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition">
              Pricing
            </Link>
            <Link href="/about" className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition">
              About
            </Link>
            <Link href="/awards" className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition">
              Awards
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild className="text-primary hover:bg-muted/50">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-secondary hover:bg-secondary/90 text-white shadow-md hover:shadow-lg transition-all">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted/50 rounded-lg transition"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} className="text-foreground" /> : <Menu size={24} className="text-foreground" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-border/30 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link href="/pricing" className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition">
              Pricing
            </Link>
            <Link href="/about" className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition">
              About
            </Link>
            <Link href="/awards" className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition">
              Awards
            </Link>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" asChild className="flex-1 border-primary text-primary">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="flex-1 bg-secondary hover:bg-secondary/90 text-white">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
