'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { adminApi } from '@/lib/api'
import { Search, Loader2, Trash2, UserCircle } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'voter' | 'organizer' | 'admin'
  createdAt: string
  _count: {
    votes: number
  }
}

const roleColor = {
  admin: 'default',
  organizer: 'default',
  voter: 'secondary',
} as const

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'voter' | 'organizer' | 'admin'>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminApi.getUsers()
        setUsers(response.data.users)
      } catch {
        setError('Failed to load users.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await adminApi.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete user.')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = users.filter((u) => {
    const term = search.toLowerCase()
    const matchesSearch =
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    const matchesFilter = filter === 'all' || u.role === filter
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
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">Manage all user accounts and permissions</p>
        </div>
        <div className="text-sm text-muted-foreground">{users.length} total</div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {users.filter((u) => u.role === 'organizer').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Organizers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {users.filter((u) => u.role === 'voter').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Voters</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {users.filter((u) => u.role === 'admin').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Admins</p>
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
            placeholder="Search users..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'voter', 'organizer', 'admin'] as const).map((f) => (
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
          <CardTitle className="text-base">All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">User</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Votes</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Joined</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <UserCircle className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={roleColor[user.role]}
                        className="capitalize"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {user._count.votes}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No users found.
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