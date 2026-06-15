'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { authApi } from '@/lib/api'

export default function SignupPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<'voter' | 'organizer'>('voter')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleTabChange = (value: string) => {
    setUserType(value as 'voter' | 'organizer')
    setError('')
    setFormData({ email: '', password: '', confirmPassword: '', name: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const response = await authApi.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: userType,
      })

      const { token, user } = response.data

      // Store token and user in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      // Redirect based on role
      if (user.role === 'organizer') router.push('/organizer/dashboard')
      else router.push('/voter/assistant')

    } catch (err: any) {
      const status = err?.response?.status
      if (status === 409) {
        setError('An account with this email already exists.')
      } else if (status === 422) {
        setError('Please check your details and try again.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const formFields = (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Error banner */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          {userType === 'organizer' ? 'Organization Name' : 'Full Name'}
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={userType === 'organizer' ? 'Your organization' : 'Your full name'}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </form>
  )

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Join the Awards Voting Platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={userType} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="voter">Voter</TabsTrigger>
              <TabsTrigger value="organizer">Organizer</TabsTrigger>
            </TabsList>
            <TabsContent value="voter">{formFields}</TabsContent>
            <TabsContent value="organizer">{formFields}</TabsContent>
          </Tabs>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}