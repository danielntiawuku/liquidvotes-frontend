'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { authApi } from '@/lib/api'

interface AuthGuardProps {
  children: ReactNode
  requiredRole?: 'voter' | 'organizer' | 'admin'
}

interface User {
  id: string
  name: string
  email: string
  role: 'voter' | 'organizer' | 'admin'
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          router.push('/login')
          return
        }

        const response = await authApi.me()
        const user: User = response.data.user

        if (!user) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/login')
          return
        }

        // If a role is required, check it matches
        if (requiredRole && user.role !== requiredRole) {
          // Redirect to their correct dashboard instead of a blank denial
          if (user.role === 'admin') router.push('/admin/dashboard')
          else if (user.role === 'organizer') router.push('/organizer/dashboard')
          else router.push('/voter/dashboard')
          return
        }

        // Save fresh user data to localStorage
        localStorage.setItem('user', JSON.stringify(user))
        setIsAuthorized(true)
      } catch (error) {
        // Token invalid or expired
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      }
    }

    checkAuth()
  }, [router, requiredRole])

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}