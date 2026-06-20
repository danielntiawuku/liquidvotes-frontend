'use client'

import { AuthGuard } from '@/components/shared/AuthGuard'
import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  Trophy,
  DollarSign,
  BarChart3,
  FileText,
  LifeBuoy,
  CreditCard,
} from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/organizations', label: 'Organizations', icon: Building2 },
  { href: '/admin/events', label: 'Events', icon: Trophy },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: DollarSign },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
  { href: '/admin/support', label: 'Support', icon: LifeBuoy },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen flex flex-col">
        <Navigation />

        <div className="flex-1 flex">

          {/* Sidebar */}
          <aside className="hidden md:block w-56 border-r border-border bg-card/50 flex-shrink-0">
            <nav className="p-4 space-y-1 sticky top-16">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Mobile horizontal nav */}
          <div className="md:hidden border-b border-border bg-card/50 overflow-x-auto sticky top-16 z-30">
            <div className="flex gap-1 p-2 min-w-max">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>

        <Footer />
      </div>
    </AuthGuard>
  )
}