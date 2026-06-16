'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'voter' | 'organizer' | 'admin'
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem('user')
      if (stored) {
        try {
          setUser(JSON.parse(stored))
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }

    loadUser()

    window.addEventListener('auth-change', loadUser)
    window.addEventListener('storage', loadUser)

    return () => {
      window.removeEventListener('auth-change', loadUser)
      window.removeEventListener('storage', loadUser)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setDropdownOpen(false)
    window.dispatchEvent(new Event('auth-change'))
    router.push('/')
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'admin') return '/admin/dashboard'
    if (user.role === 'organizer') return '/organizer/dashboard'
    return '/voter/dashboard'
  }

  return (
    <nav className="bg-card border-b border-border/30 sticky top-0 z-50 backdrop-blur-lg bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-bold text-lg text-primary hover:text-primary/80 transition">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">LV</span>
            </div>
            <span>LiquidVotes</span>
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
            <Link href="/voter/assistant" className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition">
              Vote
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <p className="text-xs text-primary capitalize mt-0.5">{user.role}</p>
                    </div>
                    <Link
                      href={getDashboardLink()}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    {user.role === 'organizer' && (
                      <Link
                        href="/organizer/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted/50 transition w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-primary hover:bg-muted/50">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="bg-secondary hover:bg-secondary/90 text-white shadow-md hover:shadow-lg transition-all">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
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
            <Link href="/voter/assistant" className="block px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition">
              Vote
            </Link>

            {user ? (
              <div className="pt-2 border-t border-border space-y-2">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg transition"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {user.role === 'organizer' && (
                  <Link
                    href="/organizer/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg transition"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted/50 rounded-lg w-full transition"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button variant="outline" asChild className="flex-1 border-primary text-primary">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="flex-1 bg-secondary hover:bg-secondary/90 text-white">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </nav>
  )
}