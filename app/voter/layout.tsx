import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import { ReactNode } from 'react'

export default function VoterLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}