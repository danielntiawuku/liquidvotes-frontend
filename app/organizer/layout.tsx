'use client'

import { AuthGuard } from '@/components/shared/AuthGuard'
import { Navigation } from '@/components/shared/Navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Trophy,
  Users,
  Wallet,
  UserCircle,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { href: '/organizer/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/organizer/events', label: 'Manage Events', icon: Trophy },
  { href: '/organizer/nominees', label: 'Nominees', icon: Users },
  { href: '/organizer/settlements', label: 'Settlements', icon: Wallet },
  { href: '/organizer/profile', label: 'Profile', icon: UserCircle },
]

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <AuthGuard requiredRole="organizer">
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Navigation />

        {/* Mobile horizontal nav — sits below global nav, above content */}
        <div className="md:hidden border-b border-border/60 bg-card overflow-x-auto sticky top-16 z-30 flex-shrink-0">
          <div className="flex gap-1.5 p-3 min-w-max">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                    isActive ? 'text-white shadow-sm' : 'text-muted-foreground bg-muted/50'
                  }`}
                  style={
                    isActive
                      ? { backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }
                      : undefined
                  }
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex-1 flex min-h-0">

          {/* Desktop sidebar */}
          <aside className="hidden md:flex md:flex-col w-60 bg-card border-r border-border/60 flex-shrink-0">
            <div className="p-5 sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-3 mb-3">
                Workspace
              </p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        isActive
                          ? 'text-white shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      }`}
                      style={
                        isActive
                          ? { backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }
                          : undefined
                      }
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Upsell card */}
              <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent border border-primary/10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-2">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs font-semibold text-foreground mb-1">Grow your events</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Upgrade your plan for lower fees and advanced analytics.
                </p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}