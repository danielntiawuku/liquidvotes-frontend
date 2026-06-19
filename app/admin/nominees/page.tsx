'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { adminApi } from '@/lib/api'
import { Search, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface Nominee {
  id: string
  name: string
  code: string
  status: 'pending' | 'approved' | 'rejected'
  category: {
    event: {
      name: string
      organizerId: string
    }
  }
  _count: {
    votes: number
  }
}

const statusColor = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
} as const

export default function AdminNomineesPage() {
  const [nominees, setNominees] = useState<Nominee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [moderatingId, setModeratingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchNominees = async () => {
      try {
        const response = await adminApi.getAllNominees()
        setNominees(response.data.nominees)
      } catch {
        setError('Failed to load nominees.')
      } finally {
        setLoading(false)
      }
    }

    fetchNominees()
  }, [])

  const handleModerate = async (id: string, status: 'approved' | 'rejected') => {
    setModeratingId(id)
    try {
      await adminApi.moderateNominee(id, { status })
      setNominees((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status } : n))
      )
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update nominee status.')
    } finally {
      setModeratingId(null)
    }
  }

  const filtered = nominees.filter((n) => {
    const matchesSearch =
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.code.toLowerCase().includes(search.toLowerCase()) ||
      n.category.event.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || n.status === filter
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nominee Management</h1>
          <p className="text-muted-foreground mt-1">Review, approve, and moderate nominees</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{nominees.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Nominees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {nominees.filter((n) => n.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {nominees.filter((n) => n.status === 'approved').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {nominees.filter((n) => n.status === 'rejected').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nominees, codes, events..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Nominees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Nominee</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Code</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Event</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Votes</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((nominee) => (
                  <tr key={nominee.id} className="border-b border-border/50 hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-medium text-foreground">{nominee.name}</td>
                    <td className="py-3 px-4">
                      <code className="bg-muted px-2 py-0.5 rounded text-xs">{nominee.code}</code>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{nominee.category.event.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{nominee._count.votes.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={statusColor[nominee.status]} className="capitalize">
                        {nominee.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {nominee.status !== 'approved' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-600"
                            onClick={() => handleModerate(nominee.id, 'approved')}
                            disabled={moderatingId === nominee.id}
                          >
                            {moderatingId === nominee.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                        {nominee.status !== 'rejected' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleModerate(nominee.id, 'rejected')}
                            disabled={moderatingId === nominee.id}
                          >
                            {moderatingId === nominee.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No nominees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}